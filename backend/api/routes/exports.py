# backend/api/routes/exports.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import secrets
import zipfile
from io import BytesIO
from typing import Optional

from config.database import get_db
from api.models.user import User
from api.models.project import Project, ProjectStatus
from api.models.target import Target
from api.models.vulnerability import Vulnerability
from api.models.scan import Scan
from api.models.conversation import Conversation
from api.models.message import Message
from api.models.project_export import ProjectExport, ExportDuration
from api.schemas.exportSchema import ExportCreate, ExportResponse, ImportRequest
from api.middleware.authMiddleware import get_current_active_user

router = APIRouter(prefix="/exports", tags=["Exports"])

def generate_export_code():
    """Generate unique export code"""
    return f"ALYE-{secrets.token_urlsafe(8).upper()}"

def calculate_expiration(duration: ExportDuration) -> Optional[datetime]:
    """Calculate expiration date based on duration"""
    if duration == ExportDuration.NEVER:
        return None
    
    duration_map = {
        ExportDuration.ONE_DAY: timedelta(days=1),
        ExportDuration.ONE_WEEK: timedelta(weeks=1),
        ExportDuration.ONE_MONTH: timedelta(days=30)
    }
    
    return datetime.utcnow() + duration_map.get(duration, timedelta(days=1))

@router.post("/", response_model=ExportResponse)
async def create_export(
    export_data: ExportCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create export code for a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == export_data.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get all project data
    targets = db.query(Target).filter(Target.project_id == project.id).all()
    vulnerabilities = db.query(Vulnerability).join(Target).filter(
        Target.project_id == project.id
    ).all()
    scans = db.query(Scan).join(Target).filter(Target.project_id == project.id).all()
    conversations = db.query(Conversation).filter(Conversation.project_id == project.id).all()
    
    # Create snapshot
    snapshot = {
        "project": {
            "name": project.name,
            "description": project.description,
            "status": project.status.value,
            "created_at": project.created_at.isoformat(),
            "updated_at": project.updated_at.isoformat()
        },
        "targets": [
            {
                "name": t.name,
                "description": t.description,
                "ip_address": t.ip_address,
                "domain": t.domain,
                "url": t.url,
                "is_active": t.is_active,
                "created_at": t.created_at.isoformat()
            }
            for t in targets
        ],
        "vulnerabilities": [
            {
                "name": v.name,
                "description": v.description,
                "severity": v.severity.value,
                "cvss_score": v.cvss_score,
                "cve_id": v.cve_id,
                "cwe_id": v.cwe_id,
                "affected_component": v.affected_component,
                "proof_of_concept": v.proof_of_concept,
                "remediation": v.remediation,
                "references": v.references,
                "status": v.status.value,
                "target_name": next((t.name for t in targets if t.id == v.target_id), None),
                "created_at": v.created_at.isoformat()
            }
            for v in vulnerabilities
        ],
        "scans": [
            {
                "scan_type": s.scan_type,
                "status": s.status.value if hasattr(s.status, 'value') else s.status,
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                "raw_output": s.raw_output
            }
            for s in scans
        ],
        "conversations": [
            {
                "title": c.title,
                "llm_provider": c.llm_provider.value if hasattr(c.llm_provider, 'value') else c.llm_provider,
                "model_name": c.model_name,
                "created_at": c.created_at.isoformat()
            }
            for c in conversations
        ],
        "stats": {
            "total_targets": len(targets),
            "total_vulnerabilities": len(vulnerabilities),
            "critical_vulns": len([v for v in vulnerabilities if v.severity.value == 'critical']),
            "high_vulns": len([v for v in vulnerabilities if v.severity.value == 'high']),
            "medium_vulns": len([v for v in vulnerabilities if v.severity.value == 'medium']),
            "low_vulns": len([v for v in vulnerabilities if v.severity.value == 'low']),
            "total_scans": len(scans),
            "total_conversations": len(conversations)
        },
        "exported_at": datetime.utcnow().isoformat(),
        "exported_by": current_user.name
    }
    
    # Generate export code
    export_code = generate_export_code()

    # Calculate expiration
    expires_at = calculate_expiration(export_data.duration)
    
    # Create export record
    new_export = ProjectExport(
        export_code=export_code,
        project_snapshot=snapshot,
        duration=export_data.duration.value,
        expires_at=expires_at,
        project_id=project.id,
        user_id=current_user.id
    )
    
    db.add(new_export)
    db.commit()
    db.refresh(new_export)
    
    return {
        "export_code": export_code,
        "expires_at": new_export.expires_at,
        "project_name": project.name,
        "duration": new_export.duration
    }

@router.post("/import")
async def import_project(
    import_data: ImportRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Import a project using export code"""
    # Get export record
    export_record = db.query(ProjectExport).filter(
        ProjectExport.export_code == import_data.export_code,
        ProjectExport.is_active == True
    ).first()
    
    if not export_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Export code not found or expired"
        )
    
    # Check expiration
    if export_record.expires_at is not None:
        if export_record.expires_at < datetime.utcnow():
            export_record.is_active = False
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Export code has expired"
        )
    
    # Parse snapshot
    snapshot = export_record.project_snapshot
    
    # VALIDAR el status del proyecto
    project_data = snapshot.get('project', {})
    status_value = project_data.get('status', 'planning')
    
    # Validar que el status sea válido
    valid_statuses = ['planning', 'in_progress', 'completed', 'archived']
    if status_value not in valid_statuses:
        status_value = 'planning'  # Default si es inválido
    
    # Create new project
    new_project = Project(
        name=import_data.new_project_name,
        description=f"Importado de: {snapshot['project']['name']}\n\n{snapshot['project'].get('description', '')}",
        status=snapshot['project']['status'],
        user_id=current_user.id
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Create targets
    target_mapping = {}
    for target_data in snapshot.get('targets', []):
        new_target = Target(
            name=target_data['name'],
            description=target_data.get('description'),
            ip_address=target_data.get('ip_address'),
            domain=target_data.get('domain'),
            url=target_data.get('url'),
            is_active=target_data.get('is_active', True),
            project_id=new_project.id
        )
        db.add(new_target)
        db.flush()
        target_mapping[target_data['name']] = new_target.id
    
    # Create vulnerabilities
    for vuln_data in snapshot.get('vulnerabilities', []):
        target_id = target_mapping.get(vuln_data.get('target_name'))
        if target_id:
            new_vuln = Vulnerability(
                name=vuln_data['name'],
                description=vuln_data.get('description'),
                severity=vuln_data['severity'],
                cvss_score=vuln_data.get('cvss_score'),
                cve_id=vuln_data.get('cve_id'),
                cwe_id=vuln_data.get('cwe_id'),
                affected_component=vuln_data.get('affected_component'),
                proof_of_concept=vuln_data.get('proof_of_concept'),
                remediation=vuln_data.get('remediation'),
                references=vuln_data.get('references'),
                status=vuln_data.get('status', 'open'),
                target_id=target_id
            )
            db.add(new_vuln)
    
    db.commit()
    
    return {
        "message": "Project imported successfully",
        "project_id": new_project.id,
        "project_name": new_project.name,
        "imported_stats": snapshot.get('stats', {})
    }

@router.get("/validate/{export_code}")
async def validate_export_code(
    export_code: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Validate an export code and return project info"""
    export_record = db.query(ProjectExport).filter(
        ProjectExport.export_code == export_code,
        ProjectExport.is_active == True
    ).first()
    
    if not export_record:
        return {
            "valid": False,
            "message": "Export code not found"
        }
    
    if export_record.expires_at is not None:
        if export_record.expires_at < datetime.utcnow():
            return {
                "valid": False,
                "message": "Export code has expired"
            }
    
    snapshot = export_record.project_snapshot
    
    return {
        "valid": True,
        "project_name": snapshot['project']['name'],
        "stats": snapshot.get('stats', {}),
        "exported_at": snapshot.get('exported_at'),
        "exported_by": snapshot.get('exported_by'),
        "expires_at": export_record.expires_at.isoformat() if export_record.expires_at else "Nunca",
        "duration": export_record.duration
    }

@router.get("/{project_id}/download")
async def download_project_zip(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download project as ZIP with all data"""
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
    
    # Get all project data
    targets = db.query(Target).filter(Target.project_id == project_id).all()
    vulnerabilities = db.query(Vulnerability).join(Target).filter(
        Target.project_id == project_id
    ).all()
    scans = db.query(Scan).join(Target).filter(Target.project_id == project_id).all()
    conversations = db.query(Conversation).filter(Conversation.project_id == project_id).all()
    
    # Create ZIP in memory
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # README
        readme = f"""# {project.name}

{project.description or 'Sin descripción'}

## Información del Proyecto
- **Estado**: {project.status.value if hasattr(project.status, 'value') else project.status}
- **Creado**: {project.created_at}
- **Última actualización**: {project.updated_at}

## Estadísticas
- **Targets**: {len(targets)}
- **Vulnerabilidades**: {len(vulnerabilities)}
- **Scans**: {len(scans)}
- **Conversaciones**: {len(conversations)}

## Contenido del ZIP
- `project_info.json`: Información completa del proyecto
- `targets.json`: Lista de targets
- `vulnerabilities.json`: Lista de vulnerabilidades
- `scans.json`: Resultados de scans
- `conversations.json`: Historial de conversaciones

---
Exportado: {datetime.utcnow().isoformat()}
Usuario: {current_user.name}
"""
        zip_file.writestr("README.md", readme)
        
        # Project info JSON
        import json
        project_info = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status.value if hasattr(project.status, 'value') else project.status,
            "created_at": project.created_at.isoformat(),
            "updated_at": project.updated_at.isoformat()
        }
        zip_file.writestr("project_info.json", json.dumps(project_info, indent=2, ensure_ascii=False))
        
        # Targets JSON
        targets_data = [
            {
                "name": t.name,
                "description": t.description,
                "ip_address": t.ip_address,
                "domain": t.domain,
                "url": t.url,
                "is_active": t.is_active
            }
            for t in targets
        ]
        zip_file.writestr("targets.json", json.dumps(targets_data, indent=2, ensure_ascii=False))
        
        # Vulnerabilities JSON
        vulns_data = [
            {
                "name": v.name,
                "description": v.description,
                "severity": v.severity.value if hasattr(v.severity, 'value') else v.severity,
                "cvss_score": v.cvss_score,
                "cve_id": v.cve_id,
                "cwe_id": v.cwe_id,
                "status": v.status.value if hasattr(v.status, 'value') else v.status,
                "target_name": next((t.name for t in targets if t.id == v.target_id), None)
            }
            for v in vulnerabilities
        ]
        zip_file.writestr("vulnerabilities.json", json.dumps(vulns_data, indent=2, ensure_ascii=False))
        
        # Critical vulnerabilities report
        critical_vulns = [v for v in vulnerabilities if (v.severity.value if hasattr(v.severity, 'value') else v.severity) == 'critical']
        if critical_vulns:
            critical_report = "# Vulnerabilidades Críticas\n\n"
            for v in critical_vulns:
                critical_report += f"## {v.name}\n"
                critical_report += f"- **Severidad**: {v.severity.value if hasattr(v.severity, 'value') else v.severity}\n"
                critical_report += f"- **CVSS**: {v.cvss_score}\n"
                critical_report += f"- **CVE**: {v.cve_id or 'N/A'}\n"
                critical_report += f"- **Estado**: {v.status.value if hasattr(v.status, 'value') else v.status}\n\n"
                critical_report += f"{v.description}\n\n"
                if v.remediation:
                    critical_report += f"### Remediación\n{v.remediation}\n\n"
                critical_report += "---\n\n"
            
            zip_file.writestr("reports/CRITICAL_VULNERABILITIES.md", critical_report)
    
    zip_buffer.seek(0)
    
    # Return ZIP
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={project.name.replace(' ', '_')}_export.zip"
        }
    )
