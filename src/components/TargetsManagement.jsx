import { useState, useEffect } from 'react';
import { targetService } from '../services/TargetService';

export default function TargetsManagement({ projectId }) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ip_address: '',
    domain: '',
    url: '',
    is_active: true
  });

  useEffect(() => {
    if (projectId) {
      loadTargets();
    }
  }, [projectId]);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const data = await targetService.getTargetsByProject(projectId);
      setTargets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = { ...formData, project_id: parseInt(projectId) };
      
      if (editingTarget) {
        await targetService.updateTarget(editingTarget.id, formData);
      } else {
        await targetService.createTarget(dataToSend);
      }
      
      setShowModal(false);
      setEditingTarget(null);
      resetForm();
      loadTargets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (target) => {
    setEditingTarget(target);
    setFormData({
      name: target.name,
      description: target.description || '',
      ip_address: target.ip_address || '',
      domain: target.domain || '',
      url: target.url || '',
      is_active: target.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (targetId) => {
    if (!confirm('¿Estás seguro de eliminar este objetivo?')) return;
    
    try {
      await targetService.deleteTarget(targetId);
      loadTargets();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ip_address: '',
      domain: '',
      url: '',
      is_active: true
    });
  };

  const openNewTargetModal = () => {
    setEditingTarget(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando objetivos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Objetivos</h1>
            <p className="text-gray-400">Gestiona los objetivos del proyecto</p>
          </div>
          <button
            onClick={openNewTargetModal}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Nuevo Objetivo
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {targets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No hay objetivos definidos</p>
            <button
              onClick={openNewTargetModal}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Agregar primer objetivo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target) => (
              <div
                key={target.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-cyan-400">{target.name}</h3>
                  <span className={`${target.is_active ? 'bg-green-500' : 'bg-gray-500'} text-xs px-2 py-1 rounded-full text-white`}>
                    {target.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <p className="text-gray-400 mb-4 text-sm">
                  {target.description || 'Sin descripción'}
                </p>
                
                <div className="space-y-2 mb-4 text-sm">
                  {target.ip_address && (
                    <div className="flex items-center text-gray-300">
                      <span className="text-cyan-400 mr-2">IP:</span>
                      {target.ip_address}
                    </div>
                  )}
                  {target.domain && (
                    <div className="flex items-center text-gray-300">
                      <span className="text-cyan-400 mr-2">Dominio:</span>
                      {target.domain}
                    </div>
                  )}
                  {target.url && (
                    <div className="flex items-center text-gray-300">
                      <span className="text-cyan-400 mr-2">URL:</span>
                      <a href={target.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 truncate">
                        {target.url}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(target)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(target.id)}
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
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                {editingTarget ? 'Editar Objetivo' : 'Nuevo Objetivo'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Servidor Web Principal"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-20"
                    placeholder="Descripción del objetivo..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Dirección IP</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Dominio</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-gray-300">
                    Objetivo activo
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
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
                  {editingTarget ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}