from pydantic import BaseModel, Field
from typing import Optional
from api.models.tool import ToolCategory

class ToolBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    category: ToolCategory
    command_template: Optional[str] = None
    parameters_schema: Optional[str] = None
    is_active: bool = True
    requires_api_key: bool = False

class ToolCreate(ToolBase):
    pass

class ToolUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ToolCategory] = None
    command_template: Optional[str] = None
    parameters_schema: Optional[str] = None
    is_active: Optional[bool] = None
    requires_api_key: Optional[bool] = None

class ToolResponse(ToolBase):
    id: int
    
    class Config:
        from_attributes = True
