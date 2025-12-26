# backend/api/routes/files.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid
from pathlib import Path
import zipfile
from io import BytesIO

from config.database import get_db
from api.models.user import User
from api.models.project import Project
from api.models.file import ProjectFile, FileType
from api.schemas.fileSchema import FileUploadResponse, FileResponse
from api.middleware.authMiddleware import get_current_active_user

router = APIRouter(prefix="/projects", tags=["Files"])

# Configuración de directorios
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

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

@router.post("/{project_id}/files", response_model=FileUploadResponse)
async def upload_file(
    project_id: int,
    file: UploadFile = FastAPIFile(...),
    file_type: FileType = FileType.OTHER,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a file to a project"""
    # Verify project ownership
    project = verify_project_ownership(project_id, current_user.id, db)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create project directory
    project_dir = UPLOAD_DIR / f"project_{project_id}"
    project_dir.mkdir(exist_ok=True)
    
    # Save file
    file_path = project_dir / unique_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create database record
    new_file = ProjectFile(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=file_type,
        file_size=file_size,
        mime_type=file.content_type,
        project_id=project_id,
        user_id=current_user.id
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return new_file

@router.get("/{project_id}/files", response_model=List[FileResponse])
async def get_project_files(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all files for a project"""
    # Verify project ownership
    verify_project_ownership(project_id, current_user.id, db)
    
    files = db.query(ProjectFile).filter(
        ProjectFile.project_id == project_id
    ).all()
    
    return files

@router.get("/{project_id}/files/{file_id}/download")
async def download_file(
    project_id: int,
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download a specific file"""
    # Verify project ownership
    verify_project_ownership(project_id, current_user.id, db)
    
    # Get file
    file_record = db.query(ProjectFile).filter(
        ProjectFile.id == file_id,
        ProjectFile.project_id == project_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if not os.path.exists(file_record.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FileResponse(
        path=file_record.file_path,
        filename=file_record.original_filename,
        media_type=file_record.mime_type
    )

@router.delete("/{project_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    project_id: int,
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a file"""
    # Verify project ownership
    verify_project_ownership(project_id, current_user.id, db)
    
    # Get file
    file_record = db.query(ProjectFile).filter(
        ProjectFile.id == file_id,
        ProjectFile.project_id == project_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Delete file from disk
    if os.path.exists(file_record.file_path):
        os.remove(file_record.file_path)
    
    # Delete from database
    db.delete(file_record)
    db.commit()
    
    return None

@router.get("/{project_id}/download")
async def download_project_zip(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download project as ZIP with all files"""
    # Verify project ownership
    project = verify_project_ownership(project_id, current_user.id, db)
    
    # Get all files
    files = db.query(ProjectFile).filter(
        ProjectFile.project_id == project_id
    ).all()
    
    # Create ZIP in memory
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add project info
        project_info = f"""Proyecto: {project.name}
Descripción: {project.description or 'Sin descripción'}
Estado: {project.status}
Creado: {project.created_at}
Total de archivos: {len(files)}
"""
        zip_file.writestr("project_info.txt", project_info)
        
        # Add all files
        for file_record in files:
            if os.path.exists(file_record.file_path):
                # Organize by file type
                folder = file_record.file_type.value
                arcname = f"{folder}/{file_record.original_filename}"
                zip_file.write(file_record.file_path, arcname)
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=project_{project_id}_{project.name}.zip"
        }
    )
