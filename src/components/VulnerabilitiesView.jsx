import { useState, useEffect } from 'react';
import { vulnerabilityService } from '../services/VulnerabilityService';
import { targetService } from '../services/TargetService';

const severityColors = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  info: 'bg-gray-500'
};

const severityLabels = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  info: 'Info'
};

export default function VulnerabilitiesView({ projectId }) {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVuln, setEditingVuln] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium',
    cvss_score: '',
    cve_id: '',
    cwe_id: '',
    affected_component: '',
    proof_of_concept: '',
    remediation: '',
    references: '',
    status: 'open',
    target_id: ''
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vulnsData, targetsData] = await Promise.all([
        vulnerabilityService.getVulnerabilitiesByProject(projectId),
        targetService.getTargetsByProject(projectId)
      ]);
      setVulnerabilities(vulnsData);
      setTargets(targetsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.target_id) {
      setError('Nombre y objetivo son requeridos');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        target_id: parseInt(formData.target_id),
        cvss_score: formData.cvss_score ? parseFloat(formData.cvss_score) : null
      };

      if (editingVuln) {
        await vulnerabilityService.updateVulnerability(editingVuln.id, formData);
      } else {
        await vulnerabilityService.createVulnerability(dataToSend);
      }

      setShowModal(false);
      setEditingVuln(null);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (vuln) => {
    setEditingVuln(vuln);
    setFormData({
      name: vuln.name,
      description: vuln.description || '',
      severity: vuln.severity,
      cvss_score: vuln.cvss_score || '',
      cve_id: vuln.cve_id || '',
      cwe_id: vuln.cwe_id || '',
      affected_component: vuln.affected_component || '',
      proof_of_concept: vuln.proof_of_concept || '',
      remediation: vuln.remediation || '',
      references: vuln.references || '',
      status: vuln.status,
      target_id: vuln.target_id
    });
    setShowModal(true);
  };

  const handleDelete = async (vulnId) => {
    if (!confirm('¿Estás seguro de eliminar esta vulnerabilidad?')) return;

    try {
      await vulnerabilityService.deleteVulnerability(vulnId);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      severity: 'medium',
      cvss_score: '',
      cve_id: '',
      cwe_id: '',
      affected_component: '',
      proof_of_concept: '',
      remediation: '',
      references: '',
      status: 'open',
      target_id: ''
    });
  };

  const openNewVulnModal = () => {
    setEditingVuln(null);
    resetForm();
    setShowModal(true);
  };

  const filteredVulns = selectedSeverity === 'all'
    ? vulnerabilities
    : vulnerabilities.filter(v => v.severity === selectedSeverity);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando vulnerabilidades...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Vulnerabilidades</h1>
            <p className="text-gray-400">Gestiona las vulnerabilidades encontradas</p>
          </div>
          <button
            onClick={openNewVulnModal}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Nueva Vulnerabilidad
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedSeverity('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedSeverity === 'all' ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            Todas ({vulnerabilities.length})
          </button>
          <button
            onClick={() => setSelectedSeverity('critical')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedSeverity === 'critical' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            Críticas ({vulnerabilities.filter(v => v.severity === 'critical').length})
          </button>
          <button
            onClick={() => setSelectedSeverity('high')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedSeverity === 'high' ? 'bg-orange-500' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            Altas ({vulnerabilities.filter(v => v.severity === 'high').length})
          </button>
          <button
            onClick={() => setSelectedSeverity('medium')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedSeverity === 'medium' ? 'bg-yellow-500' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            Medias ({vulnerabilities.filter(v => v.severity === 'medium').length})
          </button>
          <button
            onClick={() => setSelectedSeverity('low')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedSeverity === 'low' ? 'bg-blue-500' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            Bajas ({vulnerabilities.filter(v => v.severity === 'low').length})
          </button>
        </div>

        {filteredVulns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No hay vulnerabilidades registradas</p>
            <button
              onClick={openNewVulnModal}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Registrar primera vulnerabilidad
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVulns.map((vuln) => (
              <div
                key={vuln.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-cyan-400">{vuln.name}</h3>
                      <span className={`${severityColors[vuln.severity]} text-xs px-3 py-1 rounded-full text-white font-semibold`}>
                        {severityLabels[vuln.severity]}
                      </span>
                      {vuln.cvss_score && (
                        <span className="text-sm text-gray-400">
                          CVSS: {vuln.cvss_score}
                        </span>
                      )}
                    </div>
                    {(vuln.cve_id || vuln.cwe_id) && (
                      <div className="flex gap-3 text-sm text-gray-400">
                        {vuln.cve_id && <span>CVE: {vuln.cve_id}</span>}
                        {vuln.cwe_id && <span>CWE: {vuln.cwe_id}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 mb-4">{vuln.description || 'Sin descripción'}</p>

                {vuln.affected_component && (
                  <div className="mb-2 text-sm">
                    <span className="text-cyan-400">Componente afectado:</span>
                    <span className="text-gray-300 ml-2">{vuln.affected_component}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(vuln)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => handleDelete(vuln.id)}
                    className="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
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
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                {editingVuln ? 'Editar Vulnerabilidad' : 'Nueva Vulnerabilidad'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="SQL Injection en login"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Objetivo *</label>
                    <select
                      value={formData.target_id}
                      onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Seleccionar objetivo</option>
                      {targets.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Severidad *</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="critical">Crítica</option>
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Baja</option>
                      <option value="info">Info</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">CVSS Score (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.cvss_score}
                      onChange={(e) => setFormData({ ...formData, cvss_score: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="7.5"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">CVE ID</label>
                    <input
                      type="text"
                      value={formData.cve_id}
                      onChange={(e) => setFormData({ ...formData, cve_id: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="CVE-2024-1234"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">CWE ID</label>
                    <input
                      type="text"
                      value={formData.cwe_id}
                      onChange={(e) => setFormData({ ...formData, cwe_id: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="CWE-89"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Componente Afectado</label>
                    <input
                      type="text"
                      value={formData.affected_component}
                      onChange={(e) => setFormData({ ...formData, affected_component: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="/api/login"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
                      placeholder="Descripción detallada de la vulnerabilidad..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Proof of Concept</label>
                    <textarea
                      value={formData.proof_of_concept}
                      onChange={(e) => setFormData({ ...formData, proof_of_concept: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-32 font-mono text-sm"
                      placeholder="Pasos para reproducir o código de explotación..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Remediación</label>
                    <textarea
                      value={formData.remediation}
                      onChange={(e) => setFormData({ ...formData, remediation: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
                      placeholder="Cómo solucionar la vulnerabilidad..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Referencias</label>
                    <textarea
                      value={formData.references}
                      onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-20"
                      placeholder="URLs de referencia (una por línea)"
                    />
                  </div>
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
                  {editingVuln ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
