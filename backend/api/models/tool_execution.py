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
