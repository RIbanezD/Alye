# backend/api/utils/rag_context.py
from sqlalchemy.orm import Session
from typing import Dict, List
import json
from api.models.project import Project
from api.models.target import Target
from api.models.vulnerability import Vulnerability
from api.models.scan import Scan

class RAGContextBuilder:
    """Build context for RAG from project data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def build_project_context(self, project_id: int) -> str:
        """Build comprehensive context about a project"""
        
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return ""
        
        context_parts = []
        
        # Project info
        context_parts.append(f"PROYECTO ACTUAL:")
        context_parts.append(f"Nombre: {project.name}")
        context_parts.append(f"Descripción: {project.description or 'Sin descripción'}")
        context_parts.append(f"Estado: {project.status}")
        context_parts.append("")
        
        # Targets
        targets = self.db.query(Target).filter(Target.project_id == project_id).all()
        if targets:
            context_parts.append(f"OBJETIVOS ({len(targets)}):")
            for target in targets:
                context_parts.append(f"- {target.name}")
                if target.ip_address:
                    context_parts.append(f"  IP: {target.ip_address}")
                if target.domain:
                    context_parts.append(f"  Dominio: {target.domain}")
                if target.url:
                    context_parts.append(f"  URL: {target.url}")
            context_parts.append("")
        
        # Vulnerabilities summary
        vulnerabilities = self.db.query(Vulnerability).join(Target).filter(
            Target.project_id == project_id
        ).all()
        
        if vulnerabilities:
            vuln_by_severity = {
                'critical': [],
                'high': [],
                'medium': [],
                'low': [],
                'info': []
            }
            
            for vuln in vulnerabilities:
                vuln_by_severity[vuln.severity].append(vuln)
            
            context_parts.append(f"VULNERABILIDADES ENCONTRADAS ({len(vulnerabilities)}):")
            
            for severity in ['critical', 'high', 'medium', 'low', 'info']:
                vulns = vuln_by_severity[severity]
                if vulns:
                    context_parts.append(f"\n{severity.upper()} ({len(vulns)}):")
                    for vuln in vulns[:5]:  # Limit to 5 per severity
                        context_parts.append(f"- {vuln.name}")
                        if vuln.cve_id:
                            context_parts.append(f"  CVE: {vuln.cve_id}")
                        if vuln.cvss_score:
                            context_parts.append(f"  CVSS: {vuln.cvss_score}")
                        if vuln.description:
                            context_parts.append(f"  Descripción: {vuln.description[:100]}...")
            context_parts.append("")
        
        # Scans summary
        scans = self.db.query(Scan).join(Target).filter(
            Target.project_id == project_id
        ).order_by(Scan.created_at.desc()).limit(5).all()
        
        if scans:
            context_parts.append(f"ESCANEOS RECIENTES ({len(scans)}):")
            for scan in scans:
                context_parts.append(f"- {scan.name} ({scan.scan_type}) - {scan.status}")
            context_parts.append("")
        
        return "\n".join(context_parts)
    
    def build_conversation_history(self, messages: List) -> List[Dict[str, str]]:
        """Format conversation history for LLM"""
        
        formatted_messages = []
        
        for msg in messages[-10:]:  # Last 10 messages
            formatted_messages.append({
                "role": msg.role.value,
                "content": msg.content
            })
        
        return formatted_messages
    
    def create_system_prompt(self) -> str:
        """Create system prompt for the pentesting assistant"""
        
        return """Eres un asistente experto en pentesting y ciberseguridad. Tu rol es ayudar al usuario a:

1. Analizar vulnerabilidades encontradas
2. Sugerir vectores de ataque y técnicas de explotación
3. Recomendar herramientas y comandos específicos
4. Explicar conceptos de seguridad
5. Ayudar en la planificación de auditorías de seguridad
6. Proporcionar remediaciones para vulnerabilidades

INSTRUCCIONES IMPORTANTES:
- Siempre considera el contexto del proyecto actual
- Sé específico y técnico en tus respuestas
- Sugiere comandos y herramientas cuando sea apropiado
- Prioriza la ética y legalidad del pentesting
- Si no estás seguro, indícalo claramente
- Usa formato markdown para mejor legibilidad

Cuando se te proporcione contexto del proyecto, úsalo para dar respuestas más relevantes y específicas."""
