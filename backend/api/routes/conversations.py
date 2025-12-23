# backend/api/routes/conversations.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from api.models.user import User
from api.models.project import Project
from api.models.conversation import Conversation
from api.models.message import Message, MessageRole
from api.schemas.conversationSchema import ConversationCreate, ConversationUpdate, ConversationResponse
from api.schemas.messageSchema import MessageCreate, MessageResponse
from api.middleware.authMiddleware import get_current_active_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

def verify_project_ownership(project_id: int, user_id: int, db: Session):
    """Verify that the user owns the project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    return project

@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_data: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    # Verify project ownership
    verify_project_ownership(conv_data.project_id, current_user.id, db)
    
    new_conversation = Conversation(
        title=conv_data.title or "Nueva conversación",
        llm_provider=conv_data.llm_provider,
        model_name=conv_data.model_name,
        project_id=conv_data.project_id,
        user_id=current_user.id
    )
    
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    
    return new_conversation

@router.get("/project/{project_id}", response_model=List[ConversationResponse])
async def get_conversations_by_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for a project"""
    # Verify project ownership
    verify_project_ownership(project_id, current_user.id, db)
    
    conversations = db.query(Conversation).filter(
        Conversation.project_id == project_id,
        Conversation.is_active == True
    ).all()
    
    return conversations

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation"""
    conversation = db.query(Conversation).join(Project).filter(
        Conversation.id == conversation_id,
        Project.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation

@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    conv_data: ConversationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a conversation"""
    conversation = db.query(Conversation).join(Project).filter(
        Conversation.id == conversation_id,
        Project.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Update fields
    for field, value in conv_data.dict(exclude_unset=True).items():
        setattr(conversation, field, value)
    
    db.commit()
    db.refresh(conversation)
    
    return conversation

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete (archive) a conversation"""
    conversation = db.query(Conversation).join(Project).filter(
        Conversation.id == conversation_id,
        Project.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Mark as inactive instead of deleting
    conversation.is_active = False
    db.commit()
    
    return None

# Messages endpoints
@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a conversation"""
    # Verify conversation ownership
    conversation = db.query(Conversation).join(Project).filter(
        Conversation.id == conversation_id,
        Project.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    return messages

@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a message to a conversation"""
    # Verify conversation ownership
    conversation = db.query(Conversation).join(Project).filter(
        Conversation.id == conversation_id,
        Project.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    new_message = Message(
        role=MessageRole.USER,
        content=message_data.content,
        context_data=message_data.context_data,
        conversation_id=conversation_id
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # TODO: Here you'll integrate with Ollama/Groq to get the AI response
    # For now, we just return the user message
    
    return new_message
