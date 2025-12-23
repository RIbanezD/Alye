// frontend/src/services/ConversationService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ConversationService {
  async getConversationsByProject(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations/project/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener conversaciones');
    }

    return await response.json();
  }

  async getConversation(conversationId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener conversación');
    }

    return await response.json();
  }

  async createConversation(convData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(convData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear conversación');
    }

    return await response.json();
  }

  async updateConversation(conversationId, convData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(convData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar conversación');
    }

    return await response.json();
  }

  async deleteConversation(conversationId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar conversación');
    }

    return true;
  }

  async getMessages(conversationId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener mensajes');
    }

    return await response.json();
  }

  async sendMessage(conversationId, messageData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al enviar mensaje');
    }

    return await response.json();
  }
}

export const conversationService = new ConversationService();
