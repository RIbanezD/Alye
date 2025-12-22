# backend/config/tool_seeds.py
from sqlalchemy.orm import Session
from api.models.tool import Tool, ToolCategory
import logging

logger = logging.getLogger(__name__)

def seed_default_tools(db: Session):
    """Create default pentesting tools"""
    
    default_tools = [
        # OSINT Tools
        {
            "name": "theharvester",
            "display_name": "theHarvester",
            "description": "Email, subdomain and people names harvester",
            "category": ToolCategory.OSINT,
            "command_template": "theHarvester -d {domain} -b {source}",
            "parameters_schema": '{"domain": "string", "source": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
        {
            "name": "shodan",
            "display_name": "Shodan",
            "description": "Search engine for Internet-connected devices",
            "category": ToolCategory.OSINT,
            "command_template": "shodan search {query}",
            "parameters_schema": '{"query": "string"}',
            "is_active": True,
            "requires_api_key": True
        },
        {
            "name": "whois",
            "display_name": "WHOIS",
            "description": "Domain registration information lookup",
            "category": ToolCategory.OSINT,
            "command_template": "whois {domain}",
            "parameters_schema": '{"domain": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
        
        # Scanning Tools
        {
            "name": "nmap",
            "display_name": "Nmap",
            "description": "Network exploration and security auditing",
            "category": ToolCategory.SCANNING,
            "command_template": "nmap {flags} {target}",
            "parameters_schema": '{"flags": "string", "target": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
        {
            "name": "nikto",
            "display_name": "Nikto",
            "description": "Web server scanner",
            "category": ToolCategory.SCANNING,
            "command_template": "nikto -h {target}",
            "parameters_schema": '{"target": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
        {
            "name": "gobuster",
            "display_name": "Gobuster",
            "description": "Directory/file & DNS busting tool",
            "category": ToolCategory.SCANNING,
            "command_template": "gobuster dir -u {url} -w {wordlist}",
            "parameters_schema": '{"url": "string", "wordlist": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
        
        # Exploitation Tools
        {
            "name": "sqlmap",
            "display_name": "SQLMap",
            "description": "Automatic SQL injection and database takeover",
            "category": ToolCategory.EXPLOITATION,
            "command_template": "sqlmap -u {url} {flags}",
            "parameters_schema": '{"url": "string", "flags": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
        
        # Payload Generation
        {
            "name": "msfvenom",
            "display_name": "MSFvenom",
            "description": "Payload generator and encoder",
            "category": ToolCategory.PAYLOAD_GENERATION,
            "command_template": "msfvenom -p {payload} LHOST={lhost} LPORT={lport} -f {format}",
            "parameters_schema": '{"payload": "string", "lhost": "string", "lport": "integer", "format": "string"}',
            "is_active": True,
            "requires_api_key": False
        },
    ]
    
    for tool_data in default_tools:
        existing_tool = db.query(Tool).filter(Tool.name == tool_data["name"]).first()
        
        if not existing_tool:
            new_tool = Tool(**tool_data)
            db.add(new_tool)
            logger.info(f"✅ Created tool: {tool_data['display_name']}")
        else:
            logger.info(f"ℹ️  Tool already exists: {tool_data['display_name']}")
    
    try:
        db.commit()
    except Exception as e:
        logger.error(f"❌ Error seeding tools: {e}")
        db.rollback()
        raise
