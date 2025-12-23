from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from api.models.tool_execution import ExecutionStatus

class ToolExecutionBase(BaseModel):
    command: str
    parameters: Optional[str] = None

class ToolExecutionCreate(ToolExecutionBase):
    tool_id: int
    scan_id: Optional[int] = None

class ToolExecutionUpdate(BaseModel):
    output: Optional[str] = None
    error_output: Optional[str] = None
    exit_code: Optional[int] = None
    status: Optional[ExecutionStatus] = None

class ToolExecutionResponse(ToolExecutionBase):
    id: int
    tool_id: int
    scan_id: Optional[int]
    user_id: int
    output: Optional[str]
    error_output: Optional[str]
    exit_code: Optional[int]
    status: ExecutionStatus
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True
