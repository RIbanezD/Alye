const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ExportService {
  async createExport(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/exports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear exportación');
    }

    return await response.json();
  }

  async validateExportCode(exportCode) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/exports/validate/${exportCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al validar código');
    }

    return await response.json();
  }

  async importProject(exportCode, newProjectName) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/exports/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        export_code: exportCode,
        new_project_name: newProjectName
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al importar proyecto');
    }

    return await response.json();
  }
}

export const exportService = new ExportService();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class VulnerabilityService {
  async getVulnerabilitiesByTarget(targetId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/vulnerabilities/target/${targetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener vulnerabilidades');
    }

    return await response.json();
  }

  async getVulnerabilitiesByProject(projectId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/vulnerabilities/project/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener vulnerabilidades');
    }

    return await response.json();
  }

  async getVulnerability(vulnId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener vulnerabilidad');
    }

    return await response.json();
  }

  async createVulnerability(vulnData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/vulnerabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vulnData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear vulnerabilidad');
    }

    return await response.json();
  }

  async updateVulnerability(vulnId, vulnData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vulnData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar vulnerabilidad');
    }

    return await response.json();
  }

  async deleteVulnerability(vulnId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar vulnerabilidad');
    }

    return true;
  }
}

export const vulnerabilityService = new VulnerabilityService();
