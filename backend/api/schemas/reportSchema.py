from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from api.models.report import ReportFormat, ReportStatus

class ReportBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    format: ReportFormat
    include_conversations: bool = True
    include_tool_outputs: bool = True

class ReportCreate(ReportBase):
    project_id: int

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    file_path: Optional[str] = None
    status: Optional[ReportStatus] = None

class ReportResponse(ReportBase):
    id: int
    project_id: int
    user_id: int
    content: Optional[str]
    file_path: Optional[str]
    status: ReportStatus
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True
