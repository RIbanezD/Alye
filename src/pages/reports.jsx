import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import NeonText from '../components/NeonText';

const Reports = () => {
  const toast = useToast();
  const [reportConfig, setReportConfig] = useState({
    projectName: '',
    client: '',
    assessmentType: 'web',
    severity: 'all',
    includeExecutiveSummary: true,
    includeTechnicalDetails: true,
    includeRemediation: true,
    format: 'pdf'
  });

  const [vulnerabilities] = useState([
    { id: 1, name: 'SQL Injection', severity: 'Critical', cvss: 9.8, status: 'Open' },
    { id: 2, name: 'XSS Reflected', severity: 'High', cvss: 7.3, status: 'Open' },
    { id: 3, name: 'CSRF Token Missing', severity: 'Medium', cvss: 5.4, status: 'Mitigated' },
    { id: 4, name: 'Information Disclosure', severity: 'Low', cvss: 3.1, status: 'Closed' },
    { id: 5, name: 'Weak Password Policy', severity: 'Medium', cvss: 4.9, status: 'Open' }
  ]);

  const [generating, setGenerating] = useState(false);

  const generateReport = () => {
    if (!reportConfig.projectName || !reportConfig.client) {
      toast.warning('Por favor completa el nombre del proyecto y cliente');
      return;
    }
    setGenerating(true);
    toast.info('Generando reporte...');
    setTimeout(() => {
      alert('Reporte generado exitosamente!');
      setGenerating(false);
      toast.success(`Reporte generado exitosamente en formato ${reportConfig.format.toUpperCase()}`);
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity) {
      case 'Critical': return 'bg-red-500/20 border-red-500';
      case 'High': return 'bg-orange-500/20 border-orange-500';
      case 'Medium': return 'bg-yellow-500/20 border-yellow-500';
      case 'Low': return 'bg-blue-500/20 border-blue-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const stats = {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
    high: vulnerabilities.filter(v => v.severity === 'High').length,
    medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
    low: vulnerabilities.filter(v => v.severity === 'Low').length,
    open: vulnerabilities.filter(v => v.status === 'Open').length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="Generador de Reportes de Auditoría" className="text-3xl md:text-4xl" />
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <h3 className="text-cyan-400 font-bold mb-4">Información del Proyecto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nombre del Proyecto</label>
                  <input
                    type="text"
                    value={reportConfig.projectName}
                    onChange={(e) => setReportConfig({...reportConfig, projectName: e.target.value})}
                    placeholder="Ej: Auditoría Q4 2024"
                    className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Cliente</label>
                  <input
                    type="text"
                    value={reportConfig.client}
                    onChange={(e) => setReportConfig({...reportConfig, client: e.target.value})}
                    placeholder="Ej: Empresa XYZ"
                    className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Assessment Config */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <h3 className="text-cyan-400 font-bold mb-4">Configuración de Evaluación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Tipo de Evaluación</label>
                  <select 
                    value={reportConfig.assessmentType}
                    onChange={(e) => setReportConfig({...reportConfig, assessmentType: e.target.value})}
                    className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="web">Aplicación Web</option>
                    <option value="mobile">Aplicación Móvil</option>
                    <option value="network">Red e Infraestructura</option>
                    <option value="api">API</option>
                    <option value="cloud">Cloud Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Filtro de Severidad</label>
                  <select 
                    value={reportConfig.severity}
                    onChange={(e) => setReportConfig({...reportConfig, severity: e.target.value})}
                    className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">Todas</option>
                    <option value="critical">Solo Críticas</option>
                    <option value="high">Alta o Superior</option>
                    <option value="medium">Media o Superior</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeExecutiveSummary}
                    onChange={(e) => setReportConfig({...reportConfig, includeExecutiveSummary: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300 text-sm">Incluir Resumen Ejecutivo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeTechnicalDetails}
                    onChange={(e) => setReportConfig({...reportConfig, includeTechnicalDetails: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300 text-sm">Incluir Detalles Técnicos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeRemediation}
  onChange={(e) => setReportConfig({...reportConfig, includeRemediation: e.target.checked})}
className="w-4 h-4"
/>
<span className="text-gray-300 text-sm">Incluir Recomendaciones de Remediación</span>
</label>
</div>
</div>
        {/* Vulnerabilities List */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
          <h3 className="text-cyan-400 font-bold mb-4">Vulnerabilidades Detectadas</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} className={`p-4 rounded border-2 ${getSeverityBg(vuln.severity)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{vuln.name}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      CVSS: <span className="text-cyan-400 font-mono">{vuln.cvss}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity}
                    </div>
                    <div className={`text-xs mt-1 ${
                      vuln.status === 'Open' ? 'text-red-400' :
                      vuln.status === 'Mitigated' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {vuln.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {generating ? 'GENERANDO REPORTE...' : 'GENERAR REPORTE'}
          </button>
          <div className="mt-4">
            <select 
              value={reportConfig.format}
              onChange={(e) => setReportConfig({...reportConfig, format: e.target.value})}
              className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Overview Stats */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
          <h3 className="text-cyan-400 font-bold mb-4">Resumen Estadístico</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total de Hallazgos:</span>
              <span className="text-white font-bold text-xl">{stats.total}</span>
            </div>
            <div className="h-px bg-gray-700"></div>
            <div className="flex justify-between items-center">
              <span className="text-red-500">Críticas:</span>
              <span className="text-red-500 font-bold text-lg">{stats.critical}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-500">Altas:</span>
              <span className="text-orange-500 font-bold text-lg">{stats.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-500">Medias:</span>
              <span className="text-yellow-500 font-bold text-lg">{stats.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-500">Bajas:</span>
              <span className="text-blue-500 font-bold text-lg">{stats.low}</span>
            </div>
            <div className="h-px bg-gray-700"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Abiertas:</span>
              <span className="text-red-400 font-bold text-lg">{stats.open}</span>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
          <h3 className="text-purple-400 font-bold mb-4">Reportes Recientes</h3>
          <div className="space-y-2">
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="text-white font-bold text-sm">Audit-2024-Q4.pdf</div>
              <div className="text-gray-400 text-xs mt-1">15 Dic 2024</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="text-white font-bold text-sm">WebApp-Security.pdf</div>
              <div className="text-gray-400 text-xs mt-1">10 Dic 2024</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="text-white font-bold text-sm">API-Pentest.pdf</div>
              <div className="text-gray-400 text-xs mt-1">05 Dic 2024</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-green-500/50">
          <h3 className="text-green-400 font-bold mb-4">Estado del Sistema</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Estado:</span>
              <span className="text-green-400 font-bold">OPERACIONAL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Último Ciclo:</span>
              <span className="text-green-400 font-bold">ESTABLE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Plantillas:</span>
              <span className="text-cyan-400 font-bold">12 Disponibles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style jsx>{`
    .neon-card {
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
    }
    .neon-card:hover {
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
    }
  `}</style>
</div>
);
};

export default Reports;