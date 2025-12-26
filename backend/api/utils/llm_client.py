# backend/api/utils/llm_client.py
import httpx
from typing import List, Dict, Optional
from config.llm_config import llm_settings
from api.models.conversation import LLMProvider

class LLMClient:
    """Unified client for Ollama and Groq"""
    
    def __init__(self, provider: LLMProvider, model_name: str):
        self.provider = provider
        self.model_name = model_name
        
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict:
        """Generate a response from the LLM"""
        
        if self.provider == LLMProvider.OLLAMA:
            return await self._ollama_generate(messages, temperature, max_tokens)
        elif self.provider == LLMProvider.GROQ:
            return await self._groq_generate(messages, temperature, max_tokens)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    async def _ollama_generate(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float],
        max_tokens: Optional[int]
    ) -> Dict:
        """Generate response using Ollama"""
        
        url = f"{llm_settings.OLLAMA_BASE_URL}/api/chat"
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature or llm_settings.TEMPERATURE,
                "num_predict": max_tokens or llm_settings.MAX_TOKENS
            }
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            return {
                "content": data["message"]["content"],
                "model": self.model_name,
                "provider": "ollama",
                "tokens_used": data.get("eval_count", 0)
            }
    
    async def _groq_generate(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float],
        max_tokens: Optional[int]
    ) -> Dict:
        """Generate response using Groq"""
        
        if not llm_settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not configured")
        
        url = f"{llm_settings.GROQ_BASE_URL}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {llm_settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature or llm_settings.TEMPERATURE,
            "max_tokens": max_tokens or llm_settings.MAX_TOKENS
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=headers, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            return {
                "content": data["choices"][0]["message"]["content"],
                "model": self.model_name,
                "provider": "groq",
                "tokens_used": data["usage"]["total_tokens"]
            }
    
    async def test_connection(self) -> bool:
        """Test if the LLM provider is available"""
        try:
            test_messages = [{"role": "user", "content": "Hello"}]
            await self.generate_response(test_messages, max_tokens=10)
            return True
        except Exception:
            return False
