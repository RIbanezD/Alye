# backend/api/models/project.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class ProjectStatus(enum.Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.PLANNING)
    
    # Owner
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    targets = relationship("Target", back_populates="project", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")


# backend/api/models/target.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class Target(Base):
    __tablename__ = "targets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Target details
    ip_address = Column(String(45))  # IPv4 o IPv6
    domain = Column(String(255))
    url = Column(String(500))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Project relationship
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="targets")
    vulnerabilities = relationship("Vulnerability", back_populates="target", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="target", cascade="all, delete-orphan")


# backend/api/models/vulnerability.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class SeverityLevel(enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class VulnerabilityStatus(enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    description = Column(Text)
    
    # Classification
    severity = Column(SQLEnum(SeverityLevel), nullable=False)
    cvss_score = Column(Float)  # 0.0 - 10.0
    cve_id = Column(String(50))  # e.g., CVE-2024-1234
    cwe_id = Column(String(50))  # e.g., CWE-79
    
    # Details
    affected_component = Column(String(200))
    proof_of_concept = Column(Text)
    remediation = Column(Text)
    references = Column(Text)  # JSON string con URLs
    
    # Status
    status = Column(SQLEnum(VulnerabilityStatus), default=VulnerabilityStatus.OPEN)
    
    # Relationships
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    scan_id = Column(Integer, ForeignKey("scans.id"))  # Optional: si fue encontrada por un scan
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    target = relationship("Target", back_populates="vulnerabilities")
    scan = relationship("Scan", back_populates="vulnerabilities")


# backend/api/models/scan.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class ScanType(enum.Enum):
    PORT_SCAN = "port_scan"
    VULN_SCAN = "vuln_scan"
    WEB_SCAN = "web_scan"
    OSINT = "osint"
    CUSTOM = "custom"

class ScanStatus(enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    scan_type = Column(SQLEnum(ScanType), nullable=False)
    status = Column(SQLEnum(ScanStatus), default=ScanStatus.QUEUED)
    
    # Configuration
    parameters = Column(Text)  # JSON string con parámetros del scan
    
    # Results
    raw_output = Column(Text)
    summary = Column(Text)
    
    # Relationships
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    target = relationship("Target", back_populates="scans")
    user = relationship("User", back_populates="scans")
    vulnerabilities = relationship("Vulnerability", back_populates="scan")
    tool_executions = relationship("ToolExecution", back_populates="scan", cascade="all, delete-orphan")


# backend/api/models/tool.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from config.database import Base

class ToolCategory(enum.Enum):
    OSINT = "osint"
    SCANNING = "scanning"
    EXPLOITATION = "exploitation"
    POST_EXPLOITATION = "post_exploitation"
    PAYLOAD_GENERATION = "payload_generation"
    REPORTING = "reporting"
    OTHER = "other"

class Tool(Base):
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    display_name = Column(String(100))
    description = Column(Text)
    category = Column(SQLEnum(ToolCategory), nullable=False)
    
    # Configuration
    command_template = Column(Text)  # Template del comando
    parameters_schema = Column(Text)  # JSON schema para validación
    
    # Status
    is_active = Column(Boolean, default=True)
    requires_api_key = Column(Boolean, default=False)
    
    # Relationships
    executions = relationship("ToolExecution", back_populates="tool")


# backend/api/models/tool_execution.py
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class ExecutionStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"

class ToolExecution(Base):
    __tablename__ = "tool_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Command executed
    command = Column(Text, nullable=False)
    parameters = Column(Text)  # JSON string
    
    # Results
    output = Column(Text)
    error_output = Column(Text)
    exit_code = Column(Integer)
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING)
    
    # Relationships
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    tool = relationship("Tool", back_populates="executions")
    scan = relationship("Scan", back_populates="tool_executions")
    user = relationship("User", back_populates="tool_executions")


# backend/api/models/conversation.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class LLMProvider(enum.Enum):
    OLLAMA = "ollama"
    GROQ = "groq"

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    
    # LLM Configuration
    llm_provider = Column(SQLEnum(LLMProvider), nullable=False)
    model_name = Column(String(100))  # e.g., "llama2", "mixtral-8x7b"
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


# backend/api/models/message.py
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class MessageRole(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    
    # Context information (JSON string)
    context_data = Column(Text)  # Contexto que se le dio al modelo
    
    # Metadata
    tokens_used = Column(Integer)
    model_used = Column(String(100))
    
    # Relationships
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


# backend/api/models/report.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class ReportFormat(enum.Enum):
    PDF = "pdf"
    HTML = "html"
    MARKDOWN = "markdown"
    JSON = "json"

class ReportStatus(enum.Enum):
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    
    # Configuration
    format = Column(SQLEnum(ReportFormat), nullable=False)
    include_conversations = Column(Boolean, default=True)
    include_tool_outputs = Column(Boolean, default=True)
    
    # Content
    content = Column(Text)  # Generated report content
    file_path = Column(String(500))  # Path to generated file
    
    # Status
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.GENERATING)
    
    # Relationships
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    project = relationship("Project", back_populates="reports")
    user = relationship("User", back_populates="reports")


# backend/api/models/__init__.py
from .user import User, UserRole
from .project import Project, ProjectStatus
from .target import Target
from .vulnerability import Vulnerability, SeverityLevel, VulnerabilityStatus
from .scan import Scan, ScanType, ScanStatus
from .tool import Tool, ToolCategory
from .tool_execution import ToolExecution, ExecutionStatus
from .conversation import Conversation, LLMProvider
from .message import Message, MessageRole
from .report import Report, ReportFormat, ReportStatus

__all__ = [
    "User",
    "UserRole",
    "Project",
    "ProjectStatus",
    "Target",
    "Vulnerability",
    "SeverityLevel",
    "VulnerabilityStatus",
    "Scan",
    "ScanType",
    "ScanStatus",
    "Tool",
    "ToolCategory",
    "ToolExecution",
    "ExecutionStatus",
    "Conversation",
    "LLMProvider",
    "Message",
    "MessageRole",
    "Report",
    "ReportFormat",
    "ReportStatus",
]
