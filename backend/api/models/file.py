from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class FileType(enum.Enum):
    LOG = "log"
    REPORT = "report"
    CREDENTIALS = "credentials"
    SCREENSHOT = "screenshot"
    EXPLOIT = "exploit"
    OTHER = "other"

class ProjectFile(Base):
    __tablename__ = "project_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(SQLEnum(FileType), nullable=False)
    file_size = Column(Integer)  # Size in bytes
    mime_type = Column(String(100))
    
    # Relationships
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="files")
    user = relationship("User")
