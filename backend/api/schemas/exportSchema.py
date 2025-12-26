from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from api.models.project_export import ExportDuration


class ExportCreate(BaseModel):
    project_id: int
    duration: ExportDuration = ExportDuration.ONE_DAY

class ExportResponse(BaseModel):
    export_code: str
    expires_at: Optional[datetime]  # Puede ser None si es "never"
    project_name: str
    duration: str
    
    class Config:
        from_attributes = True
    
class ImportRequest(BaseModel):
    export_code: str
    new_project_name: str
