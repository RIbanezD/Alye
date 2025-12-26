// src/services/FileService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class FileService {
  async getProjectFiles(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects/${projectId}/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener archivos');
    }

    return await response.json();
  }

  async uploadFile(projectId, file, fileType) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    const response = await fetch(`${API_URL}/projects/${projectId}/files?file_type=${fileType}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al subir archivo');
    }

    return await response.json();
  }

  async deleteFile(projectId, fileId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar archivo');
    }

    return true;
  }

  async downloadProjectZip(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/projects/${projectId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar proyecto');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const fileService = new FileService();
