from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base
from enum import Enum

class ExportDuration(str, Enum):
    ONE_DAY = "1_day"
    ONE_WEEK = "1_week"
    ONE_MONTH = "1_month"
    NEVER = "never"

class ProjectExport(Base):
    __tablename__ = "project_exports"
    
    id = Column(Integer, primary_key=True, index=True)
    export_code = Column(String(100), unique=True, nullable=False, index=True)
    project_snapshot = Column(JSON, nullable=False)  # JSON string con snapshot del proyecto
    
    # Expiration & TimeStamps
    duration = Column(String(20), default=ExportDuration.ONE_DAY.value)

    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="exports")
    user = relationship("User", back_populates="exports")
