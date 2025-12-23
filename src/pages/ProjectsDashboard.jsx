import { useState, useEffect } from 'react';
import { projectService } from '../services/ProjectService';
import NeonHeader from '../components/NeonHeader';
import NeonText from '../components/NeonText';

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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando proyectos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>            
            <span className="text-4xl font-bold text-cyan-400 mb-2">
              <NeonHeader text="Proyectos" className="text-2xl md:text-3xl" />
            </span>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400 tracking-wide">
              <NeonText text="Gestiona tus proyectos de pentesting" className="text-xl md:text-2xl" />
            </h2>
          </div>
          <button
            onClick={openNewProjectModal}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Nuevo Proyecto
          </button>
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
      </div>
    </div>
  );
}
