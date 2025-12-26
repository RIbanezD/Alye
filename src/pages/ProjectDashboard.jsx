import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/ProjectService';
import { targetService } from '../services/TargetService';
import { vulnerabilityService } from '../services/VulnerabilityService';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import NeonHeader from '../components/NeonHeader';

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [targets, setTargets] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalVulnerabilities: 0,
    criticalVulns: 0,
    highVulns: 0,
    mediumVulns: 0,
    lowVulns: 0,
    totalTargets: 0,
    totalScans: 0,
    cves: [],
    domains: [],
    ports: [],
    hosts: []
  });
  const [activityHistory, setActivityHistory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [exportDuration, setExportDuration] = useState('1_day');
  const [chartType, setChartType] = useState('vulnerabilities');
  const [chartStyle, setChartStyle] = useState('bar');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const chartRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);

      const targetsData = await targetService.getTargetsByProject(projectId);
      setTargets(targetsData);
      
      const vulnerabilitiesData = await vulnerabilityService.getVulnerabilitiesByProject(projectId);
      setVulnerabilities(vulnerabilitiesData);

      // Procesar datos para gráficas
      const cveMap = {};
      const domainMap = {};
      const portMap = {};
      const hostMap = {};

      vulnerabilitiesData.forEach(v => {
        if (v.cve_id) {
          cveMap[v.cve_id] = (cveMap[v.cve_id] || 0) + 1;
        }
      });

      targetsData.forEach(t => {
        if (t.domain) {
          domainMap[t.domain] = vulnerabilitiesData.filter(v => v.target_id === t.id).length;
        }
        if (t.ip_address) {
          hostMap[t.name || t.ip_address] = t.ip_address;
        }
      });

      setStats({
        totalFiles: 0,
        totalVulnerabilities: vulnerabilitiesData.length,
        criticalVulns: vulnerabilitiesData.filter(v => v.severity === 'critical').length,
        highVulns: vulnerabilitiesData.filter(v => v.severity === 'high').length,
        mediumVulns: vulnerabilitiesData.filter(v => v.severity === 'medium').length,
        lowVulns: vulnerabilitiesData.filter(v => v.severity === 'low').length,
        totalTargets: targetsData.length,
        totalScans: 0,
        cves: Object.entries(cveMap).map(([id, count]) => ({ id, count })),
        domains: Object.entries(domainMap).map(([name, vulns]) => ({ name, vulns })),
        ports: [
          { port: 80, status: 'open', service: 'HTTP' },
          { port: 443, status: 'open', service: 'HTTPS' },
          { port: 22, status: 'open', service: 'SSH' }
        ],
        hosts: Object.entries(hostMap).map(([name, ip]) => ({ name, ip }))
      });

      setActivityHistory([
        { 
          id: 1, 
          type: 'vulnerability', 
          action: 'Vulnerabilidad crítica detectada', 
          description: 'SQL Injection en endpoint /api/users',
          details: {
            severity: 'Critical',
            cvss: '9.8',
            target: '192.168.1.100',
            cve: 'CVE-2024-1234',
            port: '443',
            service: 'HTTPS',
            vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
          },
          timestamp: new Date().toISOString() 
        },
        { 
          id: 2, 
          type: 'target', 
          action: 'Nuevo target agregado', 
          description: 'Servidor web principal',
          details: {
            ip: '192.168.1.100',
            domain: 'example.com',
            ports: ['80', '443', '8080'],
            os: 'Linux Ubuntu 22.04',
            services: ['nginx', 'php-fpm', 'mysql']
          },
          timestamp: new Date().toISOString() 
        },
        { 
          id: 3, 
          type: 'scan', 
          action: 'Escaneo completado', 
          description: 'Nmap full port scan',
          details: {
            scanType: 'Full Port Scan',
            range: '192.168.1.0/24',
            portsFound: 127,
            hostsAlive: 12,
            duration: '2m 35s',
            command: 'nmap -p- -sV -O 192.168.1.0/24'
          },
          timestamp: new Date().toISOString() 
        }
      ]);

    } catch (err) {
      showToast('Error al cargar datos del proyecto', 'error');
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateExportCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/exports/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: parseInt(projectId),
          duration: exportDuration
        })
      });

      if (!response.ok) throw new Error('Error al generar código');

      const data = await response.json();
      setExportCode(data.export_code);
      setShowExportModal(true);
      showToast('Código generado exitosamente', 'success');
    } catch (err) {
      showToast('Error al generar código de exportación', 'error');
    }
  };

  const downloadProjectZip = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/exports/${projectId}/download`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al generar el ZIP');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_export.zip`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('✅ Proyecto descargado exitosamente', 'success');
    } catch (err) {
      showToast('❌ Error al descargar el proyecto', 'error');
      console.error('Error downloading ZIP:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    switch(chartType) {
      case 'vulnerabilities':
        return [
          { label: 'Críticas', value: stats.criticalVulns, color: '#DC2626' },
          { label: 'Altas', value: stats.highVulns, color: '#F97316' },
          { label: 'Medias', value: stats.mediumVulns, color: '#EAB308' },
          { label: 'Bajas', value: stats.lowVulns, color: '#3B82F6' }
        ];
      case 'cves':
        return stats.cves.slice(0, 10).map(cve => ({
          label: cve.id,
          value: cve.count,
          color: '#8B5CF6'
        }));
      case 'domains':
        return stats.domains.map(d => ({
          label: d.name,
          value: d.vulns,
          color: '#10B981'
        }));
      case 'ports':
        return stats.ports.map((p, idx) => ({
          label: `${p.port} (${p.service})`,
          value: 1,
          color: ['#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'][idx % 4]
        }));
      case 'hosts':
        return stats.hosts.map((h, idx) => ({
          label: h.name,
          value: 1,
          color: ['#14B8A6', '#F43F5E', '#A855F7', '#3B82F6'][idx % 4]
        }));
      default:
        return [];
    }
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;
      
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`${project.name} - ${getChartTitle()}`, 20, 40);
      
      if (chartStyle === 'bar') {
        drawBarChartOnCanvas(ctx, canvas.width, canvas.height);
      } else {
        drawPieChartOnCanvas(ctx, canvas.width, canvas.height);
      }
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${project.name}_${chartType}_chart.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Gráfica descargada exitosamente', 'success');
      });
    } catch (err) {
      showToast('Error al descargar gráfica', 'error');
    }
  };

  const drawBarChartOnCanvas = (ctx, width, height) => {
    const data = getChartData();
    const maxValue = Math.max(...data.map(d => d.value));
    const barHeight = 40;
    const spacing = 20;
    const startY = 80;
    const chartWidth = width - 200;
    
    data.forEach((item, idx) => {
      const y = startY + (idx * (barHeight + spacing));
      const barWidth = (item.value / maxValue) * chartWidth;
      
      ctx.fillStyle = '#D1D5DB';
      ctx.font = '14px Arial';
      ctx.fillText(item.label, 20, y + barHeight / 2 + 5);
      
      ctx.fillStyle = item.color;
      ctx.fillRect(150, y, barWidth, barHeight);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(item.value.toString(), 150 + barWidth + 10, y + barHeight / 2 + 5);
    });
  };

  const drawPieChartOnCanvas = (ctx, width, height) => {
    const data = getChartData();
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    let currentAngle = 0;
    
    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.fillStyle = item.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
      const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), labelX, labelY);
      
      currentAngle += sliceAngle;
    });
    
    let legendY = 80;
    data.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(20, legendY, 15, 15);
      
      ctx.fillStyle = '#D1D5DB';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      const percentage = ((item.value / total) * 100).toFixed(1);
      ctx.fillText(`${item.label} (${percentage}%)`, 40, legendY + 12);
      
      legendY += 25;
    });
  };

  const getChartTitle = () => {
    const titles = {
      vulnerabilities: 'Vulnerabilidades por Severidad',
      cves: 'CVEs Encontrados',
      domains: 'Dominios Escaneados',
      ports: 'Puertos Abiertos',
      hosts: 'Hosts Detectados'
    };
    return titles[chartType] || 'Datos';
  };

  const renderBarChart = () => {
    const data = getChartData();
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div ref={chartRef} className="space-y-4 p-6 bg-gray-800 rounded-lg">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{item.label}</span>
              <span className="text-white font-bold">{item.value}</span>
            </div>
            <div className="h-8 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = () => {
    const data = getChartData();
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
      return <div className="text-center text-gray-400 py-12">No hay datos disponibles</div>;
    }
    
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    return (
      <div ref={chartRef} className="p-6 bg-gray-800 rounded-lg">
        <svg width="100%" height="300" viewBox="0 0 200 200" className="mx-auto">
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            currentAngle += angle;
            
            return <path key={idx} d={path} fill={item.color} />;
          })}
        </svg>
        <div className="mt-4 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 text-sm">{item.label}</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-xl">Proyecto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-semibold animate-pulse`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <NeonHeader text={project.name} className="text-2xl md:text-  3xl mb-2" />
              <p className="text-gray-400">{project.description || 'Sin descripción'}</p>
            </div>
            <UserMenu />
          </div>

          {/* Métricas superiores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Vulnerabilidades</p>
                  <p className="text-2xl font-bold text-white">{stats.totalVulnerabilities}</p>
                </div>
                <span className="text-3xl">🔒</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-red-800 rounded-lg p-4 hover:border-red-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Críticas</p>
                  <p className="text-2xl font-bold text-red-400">{stats.criticalVulns}</p>
                </div>
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Objetivos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTargets}</p>
                </div>
                <span className="text-3xl">🎯</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Estado</p>
                  <p className={`text-lg font-bold ${
                    project.status === 'in_progress' ? 'text-yellow-400' :
                    project.status === 'completed' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {project.status === 'in_progress' ? 'En Progreso' :
                     project.status === 'completed' ? 'Completado' : 'Planificación'}
                  </p>
                </div>
                <span className="text-3xl">
                  {project.status === 'in_progress' ? '⚡' :
                   project.status === 'completed' ? '✓' : '📋'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Charts Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold text-cyan-400">📊 {getChartTitle()}</h3>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="vulnerabilities">Vulnerabilidades</option>
                <option value="cves">CVEs</option>
                <option value="domains">Dominios</option>
                <option value="ports">Puertos</option>
                <option value="hosts">Hostnames</option>
              </select>

              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setChartStyle('bar')}
                  className={`px-4 py-2 rounded ${
                    chartStyle === 'bar' 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  } transition-colors`}
                >
                  📊 Barras
                </button>
                <button
                  onClick={() => setChartStyle('pie')}
                  className={`px-4 py-2 rounded ${
                    chartStyle === 'pie' 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  } transition-colors`}
                >
                  🥧 Circular
                </button>
              </div>

              <button
                onClick={downloadChart}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                📥 Descargar PNG
              </button>
            </div>
          </div>

          {chartStyle === 'bar' ? renderBarChart() : renderPieChart()}
        </div>

        {/* Activity History */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-6">📋 Historial de Modificaciones</h3>
          
          {activityHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityHistory.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className="flex items-start gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500 transition-all cursor-pointer transform hover:scale-[1.01]"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'vulnerability' ? 'bg-red-500/20' :
                    activity.type === 'target' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    <span className="text-xl">
                      {activity.type === 'vulnerability' ? '🔒' :
                       activity.type === 'target' ? '🎯' : '🔍'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-white font-semibold">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                  
                  <span className="text-cyan-400 text-xl">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/projects"
            className="bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
          >
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-xl font-bold text-white mb-2">Todos los Proyectos</h3>
            <p className="text-gray-200 text-sm">Ver lista completa</p>
          </Link>

          <button
            onClick={downloadProjectZip}
            className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 text-left"
          >
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">Descargar ZIP</h3>
            <p className="text-gray-200 text-sm">Proyecto completo con archivos</p>
          </button>

          <button
            onClick={() => setShowDurationModal(true)}
            className="bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 text-left"
          >
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-xl font-bold text-white mb-2">Exportar Proyecto</h3>
            <p className="text-gray-200 text-sm">Generar código para compartir</p>
          </button>
        </div>
      </div>

      {/* Modal de Duración */}
      {showDurationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border-2 border-orange-500 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Duración del Código</h2>
            
            <p className="text-gray-300 mb-6">
              Selecciona por cuánto tiempo será válido el código de exportación:
            </p>

            <div className="space-y-3 mb-6">
              {[
                { value: '1_day', label: '1 Día', desc: 'Expira en 24 horas' },
                { value: '1_week', label: '1 Semana', desc: 'Expira en 7 días' },
                { value: '1_month', label: '1 Mes', desc: 'Expira en 30 días' },
                { value: 'never', label: 'Nunca Expira', desc: 'Código permanente' }
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 border border-gray-700 hover:border-orange-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={option.value}
                    checked={exportDuration === option.value}
                    onChange={(e) => setExportDuration(e.target.value)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <div>
                    <p className="text-white font-semibold">{option.label}</p>
                    <p className="text-gray-400 text-sm">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDurationModal(false);
                  generateExportCode();
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Generar Código
              </button>
              <button
                onClick={() => setShowDurationModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportación */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Código de Exportación</h2>
            
            <p className="text-gray-300 mb-4">
              Comparte este código con otros usuarios para que puedan importar una copia de este proyecto:
            </p>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-cyan-400 font-mono text-lg text-center">{exportCode}</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-4">
              <p className="text-blue-400 text-xs">
                ℹ️ Duración: {
                  exportDuration === '1_day' ? '24 horas' :
                  exportDuration === '1_week' ? '7 días' :
                  exportDuration === '1_month' ? '30 días' :
                  'Nunca expira'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportCode);
                  showToast('✅ Código copiado al portapapeles', 'success');
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Copiar Código
              </button>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportDuration('1_day');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Actividad */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedActivity(null)}>
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">{selectedActivity.action}</h2>
                <p className="text-gray-400">{selectedActivity.description}</p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-white text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  🕐 Fecha y Hora
                </p>
                <p className="text-white font-semibold">
                  {new Date(selectedActivity.timestamp).toLocaleString('es-ES', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  📌 Tipo de Evento
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedActivity.type === 'vulnerability' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                  selectedActivity.type === 'target' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                  'bg-green-500/20 text-green-400 border border-green-500/50'
                }`}>
                  {selectedActivity.type === 'vulnerability' ? '🔒 Vulnerabilidad' :
                   selectedActivity.type === 'target' ? '🎯 Target' : '🔍 Escaneo'}
                </span>
              </div>

              {selectedActivity.details && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                    📋 Detalles Completos
                  </p>
                  <div className="space-y-3">
                    {Object.entries(selectedActivity.details).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 pb-2 border-b border-gray-700 last:border-0">
                        <span className="text-gray-400 capitalize text-sm">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white font-semibold text-sm break-all">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                ⚠️ <strong>Nota:</strong> Esta información es de solo lectura y no puede ser modificada.
              </p>
            </div>

            <button
              onClick={() => setSelectedActivity(null)}
              className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}