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

