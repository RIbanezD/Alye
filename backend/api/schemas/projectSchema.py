# backend/api/schemas/projectSchema.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from api.models.project import ProjectStatus

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# backend/api/schemas/targetSchema.py
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


# backend/api/schemas/vulnerabilitySchema.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from api.models.vulnerability import SeverityLevel, VulnerabilityStatus

class VulnerabilityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = None
    severity: SeverityLevel
    cvss_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    cve_id: Optional[str] = Field(None, max_length=50)
    cwe_id: Optional[str] = Field(None, max_length=50)
    affected_component: Optional[str] = Field(None, max_length=200)
    proof_of_concept: Optional[str] = None
    remediation: Optional[str] = None
    references: Optional[str] = None
    status: VulnerabilityStatus = VulnerabilityStatus.OPEN

class VulnerabilityCreate(VulnerabilityBase):
    target_id: int
    scan_id: Optional[int] = None

class VulnerabilityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    cvss_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    cve_id: Optional[str] = None
    cwe_id: Optional[str] = None
    affected_component: Optional[str] = None
    proof_of_concept: Optional[str] = None
    remediation: Optional[str] = None
    references: Optional[str] = None
    status: Optional[VulnerabilityStatus] = None

class VulnerabilityResponse(VulnerabilityBase):
    id: int
    target_id: int
    scan_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# backend/api/schemas/scanSchema.py
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


# backend/api/schemas/toolSchema.py
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


# backend/api/schemas/toolExecutionSchema.py
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


# backend/api/schemas/conversationSchema.py
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


# backend/api/schemas/messageSchema.py
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


# backend/api/schemas/reportSchema.py
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


# backend/api/schemas/__init__.py
from .userSchema import UserCreate, UserResponse, Token, UserUpdate, PasswordChange, UserLogin
from .projectSchema import ProjectCreate, ProjectUpdate, ProjectResponse
from .targetSchema import TargetCreate, TargetUpdate, TargetResponse
from .vulnerabilitySchema import VulnerabilityCreate, VulnerabilityUpdate, VulnerabilityResponse
from .scanSchema import ScanCreate, ScanUpdate, ScanResponse
from .toolSchema import ToolCreate, ToolUpdate, ToolResponse
from .toolExecutionSchema import ToolExecutionCreate, ToolExecutionUpdate, ToolExecutionResponse
from .conversationSchema import ConversationCreate, ConversationUpdate, ConversationResponse
from .messageSchema import MessageCreate, MessageResponse
from .reportSchema import ReportCreate, ReportUpdate, ReportResponse

__all__ = [
    "UserCreate",
    "UserResponse",
    "Token",
    "UserUpdate",
    "PasswordChange",
    "UserLogin",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "TargetCreate",
    "TargetUpdate",
    "TargetResponse",
    "VulnerabilityCreate",
    "VulnerabilityUpdate",
    "VulnerabilityResponse",
    "ScanCreate",
    "ScanUpdate",
    "ScanResponse",
    "ToolCreate",
    "ToolUpdate",
    "ToolResponse",
    "ToolExecutionCreate",
    "ToolExecutionUpdate",
    "ToolExecutionResponse",
    "ConversationCreate",
    "ConversationUpdate",
    "ConversationResponse",
    "MessageCreate",
    "MessageResponse",
    "ReportCreate",
    "ReportUpdate",
    "ReportResponse",
]
