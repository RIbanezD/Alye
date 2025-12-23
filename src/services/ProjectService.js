// frontend/src/services/ProjectService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ProjectService {
  async getProjects() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener proyectos');
    }

    return await response.json();
  }

  async getProject(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener proyecto');
    }

    return await response.json();
  }

  async createProject(projectData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear proyecto');
    }

    return await response.json();
  }

  async updateProject(projectId, projectData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar proyecto');
    }

    return await response.json();
  }

  async deleteProject(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar proyecto');
    }

    return true;
  }
}

export const projectService = new ProjectService();
