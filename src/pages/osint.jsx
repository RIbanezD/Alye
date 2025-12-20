import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import NeonText from '../components/NeonText';

const Osint = () => {
  const toast = useToast();
  const [targetDomain, setTargetDomain] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTool, setActiveTool] = useState('domain');

  const tools = [
    { id: 'domain', name: 'Información de Dominio', icon: '🌐' },
    { id: 'subdomain', name: 'Subdominios', icon: '🔍' },
    { id: 'dns', name: 'Registros DNS', icon: '📡' },
    { id: 'whois', name: 'WHOIS', icon: '📋' },
    { id: 'ports', name: 'Escaneo de Puertos', icon: '🔌' },
    { id: 'ssl', name: 'Certificados SSL', icon: '🔐' }
  ];

  const startScan = () => {
    if (!targetDomain.trim()) {
      toast.warning('Por favor ingresa un dominio');
      return;
    }

    setIsScanning(true);
    toast.info(`Iniciando escaneo de ${targetDomain}...`);

    setTimeout(() => {
      const mockResults = {
        domain: {
          name: targetDomain,
          ip: '192.168.1.100',
          registrar: 'GoDaddy LLC',
          created: '2020-03-15',
          expires: '2025-03-15',
          status: 'Active'
        },
        subdomains: [
          { name: `www.${targetDomain}`, ip: '192.168.1.101', status: 'Active' },
          { name: `mail.${targetDomain}`, ip: '192.168.1.102', status: 'Active' },
          { name: `api.${targetDomain}`, ip: '192.168.1.103', status: 'Active' },
          { name: `dev.${targetDomain}`, ip: '192.168.1.104', status: 'Vulnerable' },
          { name: `admin.${targetDomain}`, ip: '192.168.1.105', status: 'Hidden' }
        ],
        dns: [
          { type: 'A', value: '192.168.1.100' },
          { type: 'MX', value: 'mail.example.com' },
          { type: 'NS', value: 'ns1.provider.com' },
          { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all' }
        ],
        ports: [
          { port: 22, service: 'SSH', status: 'Open', risk: 'Medium' },
          { port: 80, service: 'HTTP', status: 'Open', risk: 'Low' },
          { port: 443, service: 'HTTPS', status: 'Open', risk: 'Low' },
          { port: 3306, service: 'MySQL', status: 'Filtered', risk: 'High' },
          { port: 8080, service: 'HTTP-Proxy', status: 'Open', risk: 'Medium' }
        ],
        ssl: {
          issuer: 'Let\'s Encrypt',
          valid_from: '2024-01-01',
          valid_to: '2024-12-31',
          grade: 'A+',
          vulnerabilities: []
        },
        technologies: [
          { name: 'Nginx', version: '1.18.0', category: 'Web Server' },
          { name: 'PHP', version: '7.4.3', category: 'Language' },
          { name: 'WordPress', version: '6.2', category: 'CMS' },
          { name: 'jQuery', version: '3.6.0', category: 'JavaScript' }
        ]
      };

      setScanResults(mockResults);
      setIsScanning(false);
      toast.success('Escaneo completado exitosamente');
    }, 2500);
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'High':
      case 'Vulnerable':
        return 'text-red-500';
      case 'Medium':
      case 'Hidden':
        return 'text-yellow-500';
      case 'Low':
      case 'Active':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="OSINT & Reconocimiento IA" className="text-3xl md:text-4xl" />
        </h1>

        {/* Search Bar */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 mb-8">
          <div className="flex space-x-4">
            <input
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              placeholder="Ingresa dominio objetivo (ejemplo: example.com)"
              className="flex-1 bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-3 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && startScan()}
            />
            <button
              onClick={startScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? 'ESCANEANDO...' : 'INICIAR SCAN'}
            </button>
          </div>

          {/* Tools */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`px-4 py-2 rounded transition-all ${
                  activeTool === tool.id
                    ? 'bg-cyan-500/30 border-2 border-cyan-500'
                    : 'bg-gray-900/50 border-2 border-gray-700 hover:border-cyan-500/50'
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                <span className="text-sm">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {scanResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Info */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
              <h3 className="text-cyan-400 font-bold mb-4 flex items-center">
                <span className="mr-2">🌐</span> Información del Dominio
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Dominio:</span>
                  <span className="text-white font-bold">{scanResults.domain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Principal:</span>
                  <span className="text-pink-400 font-mono">{scanResults.domain.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Registrador:</span>
                  <span className="text-white">{scanResults.domain.registrar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Creado:</span>
                  <span className="text-white">{scanResults.domain.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expira:</span>
                  <span className="text-white">{scanResults.domain.expires}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado:</span>
                  <span className="text-green-400 font-bold">{scanResults.domain.status}</span>
                </div>
              </div>
            </div>

            {/* SSL Certificate */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-green-500/50">
              <h3 className="text-green-400 font-bold mb-4 flex items-center">
                <span className="mr-2">🔐</span> Certificado SSL
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Emisor:</span>
                  <span className="text-white">{scanResults.ssl.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Válido Desde:</span>
                  <span className="text-white">{scanResults.ssl.valid_from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Válido Hasta:</span>
                  <span className="text-white">{scanResults.ssl.valid_to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Calificación:</span>
                  <span className="text-green-400 font-bold text-xl">{scanResults.ssl.grade}</span>
                </div>
              </div>
            </div>

            {/* Subdomains */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <h3 className="text-purple-400 font-bold mb-4 flex items-center">
                <span className="mr-2">🔍</span> Subdominios Encontrados
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scanResults.subdomains.map((sub, idx) => (
                  <div key={idx} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-mono text-sm">{sub.name}</span>
                      <span className={`text-xs font-bold ${getRiskColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{sub.ip}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Ports */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-yellow-500/50">
              <h3 className="text-yellow-400 font-bold mb-4 flex items-center">
                <span className="mr-2">🔌</span> Puertos Abiertos
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scanResults.ports.map((port, idx) => (
                  <div key={idx} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-cyan-400 font-bold">{port.port}</span>
                        <span className="text-gray-400 text-sm ml-2">/ {port.service}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white">{port.status}</span>
                        <span className={`text-xs font-bold ${getRiskColor(port.risk)}`}>
                          {port.risk}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="lg:col-span-2 neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-pink-500/50">
              <h3 className="text-pink-400 font-bold mb-4 flex items-center">
                <span className="mr-2">⚙️</span> Tecnologías Detectadas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scanResults.technologies.map((tech, idx) => (
                  <div key={idx} className="bg-gray-900/50 p-4 rounded border border-gray-700 text-center">
                    <div className="text-cyan-400 font-bold">{tech.name}</div>
                    <div className="text-gray-400 text-sm mt-1">{tech.version}</div>
                    <div className="text-gray-500 text-xs mt-2">{tech.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

export default Osint;