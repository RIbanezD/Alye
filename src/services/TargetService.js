// frontend/src/services/TargetService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class TargetService {
  async getTargetsByProject(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/targets/project/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener objetivos');
    }

    return await response.json();
  }

  async getTarget(targetId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/targets/${targetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener objetivo');
    }

    return await response.json();
  }

  async createTarget(targetData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/targets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(targetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear objetivo');
    }

    return await response.json();
  }

  async updateTarget(targetId, targetData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/targets/${targetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(targetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar objetivo');
    }

    return await response.json();
  }

  async deleteTarget(targetId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/targets/${targetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar objetivo');
    }

    return true;
  }
}

export const targetService = new TargetService();
