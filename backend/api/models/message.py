from sqlalchemy import Column, Integer, Text, DateTime, String, ForeignKey, Enum as SQLEnum
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
