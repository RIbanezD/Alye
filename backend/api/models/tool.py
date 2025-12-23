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
