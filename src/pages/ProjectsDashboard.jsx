import { useState, useEffect } from 'react';
import { projectService } from '../services/ProjectService';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import NeonHeader from '../components/NeonHeader';
import NeonText from '../components/NeonText';
import Toast from '../components/Toast';
import { Link } from 'react-router-dom';

const statusColors = {
  planning: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  archived: 'bg-gray-500'
};

const statusLabels = {
  planning: 'Planificación',
  in_progress: 'En Progreso',
  completed: 'Completado',
  archived: 'Archivado'
};

export default function ProjectsDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', status: 'planning' });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status
    });
    setShowModal(true);
  };

  const handleDelete = async (projectId) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
    
    try {
      await projectService.deleteProject(projectId);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const openNewProjectModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'planning' });
    setShowModal(true);
  };

  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importProjectName, setImportProjectName] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateImportCode = async (code) => {
    if (!code.trim()) return;
  
    setIsValidating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/exports/validate/${code}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setValidationResult(data);
      
      if (data.valid) {
        setImportProjectName(`${data.project_name} (Copia)`);
      }
    } catch (err) {
      setValidationResult({
        valid: false,
        message: 'Error al validar el código'
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando proyectos...</div>
      </div>
    );
  }

  const handleImportProject = async () => {
    if (!importCode.trim()) {
      showToast('Por favor ingresa un código', 'error');
      return;
    }

    if (!importProjectName.trim()) {
      showToast('Por favor ingresa un nombre para el proyecto', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/projects/import/${importCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          export_code: importCode.trim(),
          new_project_name: importProjectName.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al importar');
      }

      const data = await response.json();
      showToast(`${data.message}`, 'success');
      setShowImportModal(false);
      setImportCode('');
      setImportProjectName('');
      setValidationResult(null);
      loadProjects(); // Recargar lista
    } catch (err) {
      showToast(`${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 border-b border-gray-800 p-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <NeonHeader text="PROYECTOS" className="text-3xl mb-2" />
                <p className="text-gray-400">Gestión y métricas de tus proyectos</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📥 Importar Proyecto
                </button>
                <button
                  onClick={openNewProjectModal}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  + Nuevo Proyecto
                </button>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No tienes proyectos aún</p>
            <button
              onClick={openNewProjectModal}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Crear tu primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-cyan-400">{project.name}</h3>
                  <span className={`${statusColors[project.status]} text-xs px-2 py-1 rounded-full text-white`}>
                    {statusLabels[project.status]}
                  </span>
                </div>
                
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {project.description || 'Sin descripción'}
                </p>
                
                <div className="text-sm text-gray-500 mb-4">
                  Creado: {new Date(project.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">

                  <a 
                    href={`/projects/${project.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-center"
                  >
                    Dashboard
                  </a>

                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="planning">Planificación</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingProject ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showImportModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Importar Proyecto</h2>
              
              <p className="text-gray-300 mb-4">
                Ingresa el código de exportación que recibiste:
              </p>

              <input
                type="text"
                value={importCode}
                onChange={(e) => {
                  const code = e.target.value.toUpperCase();
                  setImportCode(code);
                  if (code.length >= 10) {
                    validateImportCode(code);
                  } else {
                    setValidationResult(null);
                  }
                }}
                placeholder="ALYE-XXXXXXXX"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-center text-lg focus:outline-none focus:border-purple-500 mb-4"
              />

              {isValidating && (
                <div className="text-center py-2 text-blue-400">
                  🔄 Validando código...
                </div>
              )}

              {validationResult && !isValidating && (
                <div className={`rounded-lg p-3 mb-4 ${
                  validationResult.valid 
                    ? 'bg-green-500/10 border border-green-500/50' 
                    : 'bg-red-500/10 border border-red-500/50'
                }`}>
                  {validationResult.valid ? (
                    <div>
                      <p className="text-green-400 font-semibold mb-2">✅ Código válido</p>
                      <p className="text-gray-300 text-sm mb-1">
                        <strong>Proyecto:</strong> {validationResult.project_name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Exportado por: {validationResult.exported_by}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Expira: {validationResult.expires_at}
                      </p>
                      {validationResult.stats && (
                        <div className="mt-2 text-xs text-gray-400">
                          📊 {validationResult.stats.total_targets} targets, 
                          {validationResult.stats.total_vulnerabilities} vulnerabilidades
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-400">{validationResult.message}</p>
                  )}
                </div>
              )}

              {validationResult?.valid && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Nombre del nuevo proyecto</label>
                  <input
                    type="text"
                    value={importProjectName}
                    onChange={(e) => setImportProjectName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-4">
                <p className="text-blue-400 text-xs">
                  ℹ️ Se creará una copia del proyecto con todos sus datos en tu cuenta.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleImportProject}
                  disabled={!validationResult?.valid || !importProjectName.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Importar
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportCode('');
                    setImportProjectName('');
                    setValidationResult(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}