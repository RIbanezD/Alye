import { useState, useEffect } from 'react';
import { projectService } from '../services/ProjectService';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import NeonHeader from '../components/NeonHeader';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTargets: 0,
    totalVulnerabilities: 0,
    criticalVulns: 0,
    highVulns: 0,
    mediumVulns: 0,
    lowVulns: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const projects = await projectService.getProjects();
      
      // Calcular estadísticas mejoradas
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'in_progress').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const planningProjects = projects.filter(p => p.status === 'planning').length;
      
      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        planningProjects,
        totalTargets: 0,
        totalVulnerabilities: 0,
        criticalVulns: 0,
        highVulns: 0,
        mediumVulns: 0,
        lowVulns: 0
      });
      
      // Ordenar por fecha de actualización más reciente
      const sortedProjects = projects.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );
      setRecentProjects(sortedProjects.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className={`bg-gray-900 border-2 ${color} rounded-lg p-6 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-gray-400 text-sm">{title}</p>
        </div>
      </div>
      {description && (
        <p className="text-gray-500 text-xs mt-2">{description}</p>
      )}
    </div>
  );

  const VulnBar = ({ severity, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400 capitalize">{severity}</span>
          <span className="text-white font-semibold">{count}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      
      <div className="bg-gray-900 border-b border-gray-800 p-2">
        <Link to="/" className="bg-gray-900 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
        ← Volver al menú principal
      </Link>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div>
            <NeonHeader text="DASHBOARD" className="text-3xl md:text-3xl mb-2" />
            <p className="text-gray-400">
              Bienvenido, <span className="text-cyan-400 font-semibold">{user?.name}</span>
            </p>
          </div>
          <UserMenu />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Proyectos"
            value={stats.totalProjects}
            icon="📁"
            color="border-cyan-500/50 hover:border-cyan-500"
            description="Todos los proyectos"
          />
          
          <StatCard
            title="En Progreso"
            value={stats.activeProjects}
            icon="⚡"
            color="border-yellow-500/50 hover:border-yellow-500"
            description="Proyectos activos"
          />
          
          <StatCard
            title="Completados"
            value={stats.completedProjects}
            icon="✓"
            color="border-green-500/50 hover:border-green-500"
            description="Proyectos finalizados"
          />
          
          <StatCard
            title="Vulnerabilidades"
            value={stats.totalVulnerabilities}
            icon="🔒"
            color="border-red-500/50 hover:border-red-500"
            description="Total encontradas"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Vulnerabilities Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Vulnerabilidades por Severidad
            </h3>
            
            {stats.totalVulnerabilities === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No hay vulnerabilidades registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                <VulnBar 
                  severity="críticas" 
                  count={stats.criticalVulns} 
                  total={stats.totalVulnerabilities}
                  color="bg-red-600"
                />
                <VulnBar 
                  severity="altas" 
                  count={stats.highVulns} 
                  total={stats.totalVulnerabilities}
                  color="bg-orange-500"
                />
                <VulnBar 
                  severity="medias" 
                  count={stats.mediumVulns} 
                  total={stats.totalVulnerabilities}
                  color="bg-yellow-500"
                />
                <VulnBar 
                  severity="bajas" 
                  count={stats.lowVulns} 
                  total={stats.totalVulnerabilities}
                  color="bg-blue-500"
                />
              </div>
            )}
          </div>

          {/* Project Status Pie Chart (Simple) */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Estado de Proyectos
            </h3>
            
            {stats.totalProjects === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No hay proyectos aún</p>
                <a 
                  href="/projects"
                  className="inline-block mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Crear Primer Proyecto
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Planificación</span>
                  </div>
                  <span className="text-white font-semibold">
                    {stats.totalProjects - stats.activeProjects - stats.completedProjects}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-300">En Progreso</span>
                  </div>
                  <span className="text-white font-semibold">{stats.activeProjects}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Completados</span>
                  </div>
                  <span className="text-white font-semibold">{stats.completedProjects}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Proyectos Recientes
            </h3>
            <a 
              href="/projects"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              Ver todos →
            </a>
          </div>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No tienes proyectos aún</p>
              <a 
                href="/projects"
                className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Crear Primer Proyecto
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <a
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-cyan-500 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{project.name}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {project.description || 'Sin descripción'}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'in_progress' 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          : project.status === 'completed'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      }`}>
                        {project.status === 'in_progress' ? 'En Progreso' : 
                         project.status === 'completed' ? 'Completado' : 'Planificación'}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <a
            href="/projects"
            className="bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
          >
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-xl font-bold text-white mb-2">Proyectos</h3>
            <p className="text-gray-200 text-sm">Gestiona tus proyectos de pentesting</p>
          </a>

          <a
            href="/providers"
            className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
          >
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">Providers LLM</h3>
            <p className="text-gray-200 text-sm">Configura tu asistente de IA</p>
          </a>

          <a
            href="/osint"
            className="bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/50"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">OSINT</h3>
            <p className="text-gray-200 text-sm">Herramientas de reconocimiento</p>
          </a>
        </div>
      </div>
    </div>
  );
}