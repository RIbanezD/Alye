# backend/api/routes/projects.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from api.models.user import User
from api.models.project import Project
from api.schemas.projectSchema import ProjectCreate, ProjectUpdate, ProjectResponse
from api.middleware.authMiddleware import get_current_active_user
import zipfile
import io
import json

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/{project_id}/export/zip")
async def export_project_zip(
    project_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Genera un archivo ZIP con toda la información del proyecto"""
    
    # Obtener proyecto
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Obtener datos relacionados
    targets = db.query(Target).filter(Target.project_id == project_id).all()
    vulnerabilities = db.query(Vulnerability).filter(Vulnerability.project_id == project_id).all()
    scans = db.query(Scan).filter(Scan.project_id == project_id).all()
    conversations = db.query(Conversation).filter(Conversation.project_id == project_id).all()
    
    # Crear ZIP en memoria
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Archivo principal del proyecto
        project_data = {
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "created_at": str(project.created_at),
                "updated_at": str(project.updated_at)
            },
            "targets": [
                {
                    "name": t.name,
                    "type": t.type,
                    "ip_address": t.ip_address,
                    "domain": t.domain,
                    "description": t.description
                } for t in targets
            ],
            "vulnerabilities": [
                {
                    "title": v.title,
                    "description": v.description,
                    "severity": v.severity,
                    "cvss_score": v.cvss_score,
                    "status": v.status,
                    "cve_id": v.cve_id
                } for v in vulnerabilities
            ],
            "scans": [
                {
                    "scan_type": s.scan_type,
                    "status": s.status,
                    "started_at": str(s.started_at),
                    "completed_at": str(s.completed_at) if s.completed_at else None,
                    "results": s.results
                } for s in scans
            ]
        }
        
        # Agregar archivo JSON principal
        zip_file.writestr(
            "project_data.json",
            json.dumps(project_data, indent=2, ensure_ascii=False)
        )
        
        # Agregar README
        readme_content = f"""# {project.name}

{project.description or 'Sin descripción'}

## Información del Proyecto
- **Estado**: {project.status}
- **Creado**: {project.created_at}
- **Última actualización**: {project.updated_at}

## Estadísticas
- **Targets**: {len(targets)}
- **Vulnerabilidades**: {len(vulnerabilities)}
- **Scans**: {len(scans)}

## Contenido del ZIP
- `project_data.json`: Datos completos del proyecto en formato JSON
- `README.md`: Este archivo
- `targets/`: Información detallada de cada target
- `vulnerabilities/`: Detalles de vulnerabilidades encontradas

---
Generado por Alye Pentesting Assistant
"""
        zip_file.writestr("README.md", readme_content)
        
        # Agregar detalles de vulnerabilidades críticas
        if vulnerabilities:
            critical_vulns = [v for v in vulnerabilities if v.severity == 'critical']
            if critical_vulns:
                critical_report = "# Vulnerabilidades Críticas\n\n"
                for v in critical_vulns:
                    critical_report += f"## {v.title}\n"
                    critical_report += f"- **Severidad**: {v.severity}\n"
                    critical_report += f"- **CVSS**: {v.cvss_score}\n"
                    critical_report += f"- **Estado**: {v.status}\n"
                    critical_report += f"\n{v.description}\n\n---\n\n"
                
                zip_file.writestr("vulnerabilities/CRITICAL.md", critical_report)
    
    zip_buffer.seek(0)
    
    # Retornar ZIP
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={project.name.replace(' ', '_')}_export.zip"
        }
    )

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        user_id=current_user.id
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return new_project

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all projects for the current user"""
    projects = db.query(Project).filter(
        Project.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific project by ID"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update fields
    for field, value in project_data.dict(exclude_unset=True).items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    
    return None
