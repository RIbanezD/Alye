from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from api.models.message import MessageRole

class MessageBase(BaseModel):
    role: MessageRole
    content: str
    context_data: Optional[str] = None
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    context_data: Optional[str] = None

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
