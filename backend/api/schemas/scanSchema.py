from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from api.models.scan import ScanType, ScanStatus

class ScanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    scan_type: ScanType
    parameters: Optional[str] = None

class ScanCreate(ScanBase):
    target_id: int

class ScanUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ScanStatus] = None
    raw_output: Optional[str] = None
    summary: Optional[str] = None

class ScanResponse(ScanBase):
    id: int
    status: ScanStatus
    target_id: int
    user_id: int
    raw_output: Optional[str]
    summary: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True
