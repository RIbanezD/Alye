// frontend/src/services/LLMService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class LLMService {
  async testConnection(provider, modelName, message = 'Hello, this is a test.') {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/llm/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider,
        model_name: modelName,
        message
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al probar conexión');
    }

    return await response.json();
  }

  async getOllamaModels() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/llm/models/ollama`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener modelos de Ollama');
    }

    return await response.json();
  }

  async getGroqModels() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/llm/models/groq`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener modelos de Groq');
    }

    return await response.json();
  }

  async getConfig() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/llm/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener configuración');
    }

    return await response.json();
  }
}

export const llmService = new LLMService();
