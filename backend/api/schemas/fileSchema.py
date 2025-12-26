from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from api.models.file import FileType

class FileUploadResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: FileType
    file_size: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FileResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_type: FileType
    file_size: int
    mime_type: Optional[str]
    project_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
