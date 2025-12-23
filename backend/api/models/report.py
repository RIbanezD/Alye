from sqlalchemy import Column, Integer, Boolean, String, Text, DateTime, ForeignKey, Enum as SQLEnum
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
