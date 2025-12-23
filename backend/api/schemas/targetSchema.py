from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TargetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    ip_address: Optional[str] = Field(None, max_length=45)
    domain: Optional[str] = Field(None, max_length=255)
    url: Optional[str] = Field(None, max_length=500)
    is_active: bool = True

class TargetCreate(TargetBase):
    project_id: int

class TargetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    ip_address: Optional[str] = None
    domain: Optional[str] = None
    url: Optional[str] = None
    is_active: Optional[bool] = None

class TargetResponse(TargetBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
