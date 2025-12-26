# backend/api/routes/llm.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from api.models.user import User
from api.models.conversation import LLMProvider
from api.middleware.authMiddleware import get_current_active_user
from api.utils.llm_client import LLMClient
from config.llm_config import llm_settings

router = APIRouter(prefix="/llm", tags=["LLM"])

class LLMTestRequest(BaseModel):
    provider: LLMProvider
    model_name: str
    message: Optional[str] = "Hello, this is a test message."

class LLMTestResponse(BaseModel):
    success: bool
    message: str
    response: Optional[str] = None
    model: Optional[str] = None
    tokens_used: Optional[int] = None

@router.post("/test", response_model=LLMTestResponse)
async def test_llm_connection(
    test_data: LLMTestRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Test connection to LLM provider"""
    
    try:
        llm_client = LLMClient(test_data.provider, test_data.model_name)
        
        messages = [
            {"role": "user", "content": test_data.message}
        ]
        
        response = await llm_client.generate_response(messages, max_tokens=100)
        
        return LLMTestResponse(
            success=True,
            message=f"Successfully connected to {test_data.provider.value}",
            response=response["content"],
            model=response["model"],
            tokens_used=response.get("tokens_used")
        )
        
    except Exception as e:
        return LLMTestResponse(
            success=False,
            message=f"Failed to connect: {str(e)}"
        )

@router.get("/models/ollama")
async def get_ollama_models(
    current_user: User = Depends(get_current_active_user)
):
    """Get available Ollama models"""
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{llm_settings.OLLAMA_BASE_URL}/api/tags")
            response.raise_for_status()
            data = response.json()
            
            models = [model["name"] for model in data.get("models", [])]
            
            return {
                "success": True,
                "models": models,
                "count": len(models)
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to fetch models: {str(e)}",
            "models": []
        }

@router.get("/models/groq")
async def get_groq_models(
    current_user: User = Depends(get_current_active_user)
):
    """Get available Groq models"""
    
    # Groq models are predefined
    models = [
        {
            "id": "mixtral-8x7b-32768",
            "name": "Mixtral 8x7B",
            "context_window": 32768
        },
        {
            "id": "llama3-70b-8192",
            "name": "Llama 3 70B",
            "context_window": 8192
        },
        {
            "id": "llama3-8b-8192",
            "name": "Llama 3 8B",
            "context_window": 8192
        },
        {
            "id": "gemma-7b-it",
            "name": "Gemma 7B",
            "context_window": 8192
        }
    ]
    
    return {
        "success": True,
        "models": models,
        "count": len(models)
    }

@router.get("/config")
async def get_llm_config(
    current_user: User = Depends(get_current_active_user)
):
    """Get current LLM configuration"""
    
    return {
        "ollama": {
            "base_url": llm_settings.OLLAMA_BASE_URL,
            "default_model": llm_settings.OLLAMA_DEFAULT_MODEL
        },
        "groq": {
            "api_key_configured": bool(llm_settings.GROQ_API_KEY),
            "default_model": llm_settings.GROQ_DEFAULT_MODEL
        },
        "rag": {
            "max_context_tokens": llm_settings.MAX_CONTEXT_TOKENS,
            "temperature": llm_settings.TEMPERATURE,
            "max_tokens": llm_settings.MAX_TOKENS
        }
    }
