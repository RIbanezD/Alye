from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from api.models.conversation import LLMProvider

class ConversationBase(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    llm_provider: LLMProvider
    model_name: Optional[str] = Field(None, max_length=100)

class ConversationCreate(ConversationBase):
    project_id: int

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None

class ConversationResponse(ConversationBase):
    id: int
    project_id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
