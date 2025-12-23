# backend/api/routes/vulnerabilities.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from api.models.user import User
from api.models.project import Project
from api.models.target import Target
from api.models.vulnerability import Vulnerability
from api.schemas.vulnerabilitySchema import VulnerabilityCreate, VulnerabilityUpdate, VulnerabilityResponse
from api.middleware.authMiddleware import get_current_active_user

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerabilities"])

def verify_target_ownership(target_id: int, user_id: int, db: Session):
    """Verify that the user owns the target's project"""
    target = db.query(Target).join(Project).filter(
        Target.id == target_id,
        Project.user_id == user_id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found or access denied"
        )
    
    return target

@router.post("/", response_model=VulnerabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_vulnerability(
    vuln_data: VulnerabilityCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new vulnerability"""
    # Verify target ownership
    verify_target_ownership(vuln_data.target_id, current_user.id, db)
    
    new_vulnerability = Vulnerability(
        name=vuln_data.name,
        description=vuln_data.description,
        severity=vuln_data.severity,
        cvss_score=vuln_data.cvss_score,
        cve_id=vuln_data.cve_id,
        cwe_id=vuln_data.cwe_id,
        affected_component=vuln_data.affected_component,
        proof_of_concept=vuln_data.proof_of_concept,
        remediation=vuln_data.remediation,
        references=vuln_data.references,
        status=vuln_data.status,
        target_id=vuln_data.target_id,
        scan_id=vuln_data.scan_id
    )
    
    db.add(new_vulnerability)
    db.commit()
    db.refresh(new_vulnerability)
    
    return new_vulnerability

@router.get("/target/{target_id}", response_model=List[VulnerabilityResponse])
async def get_vulnerabilities_by_target(
    target_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all vulnerabilities for a specific target"""
    # Verify target ownership
    verify_target_ownership(target_id, current_user.id, db)
    
    vulnerabilities = db.query(Vulnerability).filter(
        Vulnerability.target_id == target_id
    ).all()
    
    return vulnerabilities

@router.get("/project/{project_id}", response_model=List[VulnerabilityResponse])
async def get_vulnerabilities_by_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all vulnerabilities for a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    vulnerabilities = db.query(Vulnerability).join(Target).filter(
        Target.project_id == project_id
    ).all()
    
    return vulnerabilities

@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
async def get_vulnerability(
    vuln_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific vulnerability"""
    vulnerability = db.query(Vulnerability).join(Target).join(Project).filter(
        Vulnerability.id == vuln_id,
        Project.user_id == current_user.id
    ).first()
    
    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    return vulnerability

@router.put("/{vuln_id}", response_model=VulnerabilityResponse)
async def update_vulnerability(
    vuln_id: int,
    vuln_data: VulnerabilityUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a vulnerability"""
    vulnerability = db.query(Vulnerability).join(Target).join(Project).filter(
        Vulnerability.id == vuln_id,
        Project.user_id == current_user.id
    ).first()
    
    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    # Update fields
    for field, value in vuln_data.dict(exclude_unset=True).items():
        setattr(vulnerability, field, value)
    
    db.commit()
    db.refresh(vulnerability)
    
    return vulnerability

@router.delete("/{vuln_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vulnerability(
    vuln_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a vulnerability"""
    vulnerability = db.query(Vulnerability).join(Target).join(Project).filter(
        Vulnerability.id == vuln_id,
        Project.user_id == current_user.id
    ).first()
    
    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    db.delete(vulnerability)
    db.commit()
    
    return None
