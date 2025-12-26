# backend/config/llm_config.py
from pydantic_settings import BaseSettings
from typing import Optional

class LLMSettings(BaseSettings):
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_DEFAULT_MODEL: str = "llama2"
    
    # Groq Configuration
    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_DEFAULT_MODEL: str = "mixtral-8x7b-32768"
    
    # RAG Configuration
    MAX_CONTEXT_TOKENS: int = 4000
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 2000
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

llm_settings = LLMSettings()