# backend/api/routes/targets.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from api.models.user import User
from api.models.project import Project
from api.models.target import Target
from api.schemas.targetSchema import TargetCreate, TargetUpdate, TargetResponse
from api.middleware.authMiddleware import get_current_active_user

router = APIRouter(prefix="/targets", tags=["Targets"])

def verify_project_ownership(project_id: int, user_id: int, db: Session):
    """Verify that the user owns the project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    return project

@router.post("/", response_model=TargetResponse, status_code=status.HTTP_201_CREATED)
async def create_target(
    target_data: TargetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new target"""
    # Verify project ownership
    verify_project_ownership(target_data.project_id, current_user.id, db)
    
    new_target = Target(
        name=target_data.name,
        description=target_data.description,
        ip_address=target_data.ip_address,
        domain=target_data.domain,
        url=target_data.url,
        is_active=target_data.is_active,
        project_id=target_data.project_id
    )
    
    db.add(new_target)
    db.commit()
    db.refresh(new_target)
    
    return new_target

@router.get("/project/{project_id}", response_model=List[TargetResponse])
async def get_targets_by_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all targets for a specific project"""
    # Verify project ownership
    verify_project_ownership(project_id, current_user.id, db)
    
    targets = db.query(Target).filter(
        Target.project_id == project_id
    ).all()
    
    return targets

@router.get("/{target_id}", response_model=TargetResponse)
async def get_target(
    target_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific target by ID"""
    target = db.query(Target).join(Project).filter(
        Target.id == target_id,
        Project.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    return target

@router.put("/{target_id}", response_model=TargetResponse)
async def update_target(
    target_id: int,
    target_data: TargetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a target"""
    target = db.query(Target).join(Project).filter(
        Target.id == target_id,
        Project.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    # Update fields
    for field, value in target_data.dict(exclude_unset=True).items():
        setattr(target, field, value)
    
    db.commit()
    db.refresh(target)
    
    return target

@router.delete("/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_target(
    target_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a target"""
    target = db.query(Target).join(Project).filter(
        Target.id == target_id,
        Project.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    db.delete(target)
    db.commit()
    
    return None
