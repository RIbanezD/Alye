import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NeonText = ({ text, className = "" }) => {
  return (
    <span className={`flex flex-wrap ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="mx-1">&nbsp;</span>;
        
        const rand = Math.random();
        let animClass = "anim-steady";
        
        if (rand > 0.92) {
          animClass = "anim-critical";
        } else if (rand > 0.75) {
          animClass = "anim-flicker";
        }

        const randomDuration = (Math.random() * 2 + 3).toFixed(2) + "s";
        const randomDelay = (Math.random() * 4).toFixed(2) + "s";

        return (
          <span
            key={index}
            className={animClass}
            style={{
              animationDuration: randomDuration,
              animationDelay: randomDelay,
              display: "inline-block"
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

const Providers = () => {
  const [providers, setProviders] = useState([
    {
      id: 1,
      name: 'OpenAI GPT-4',
      status: 'Active',
      model: 'gpt-4-turbo',
      apiKey: '••••••••••••3kF2',
      usage: 75,
      limit: 100000,
      cost: 45.30,
      latency: 1200,
      reliability: 99.9
    },
    {
      id: 2,
      name: 'Anthropic Claude',
      status: 'Active',
      model: 'claude-3-opus',
      apiKey: '••••••••••••7mX9',
      usage: 60,
      limit: 50000,
      cost: 32.15,
      latency: 900,
      reliability: 99.8
    },
    {
      id: 3,
      name: 'Google PaLM 2',
      status: 'Standby',
      model: 'palm-2',
      apiKey: '••••••••••••1nQ4',
      usage: 20,
      limit: 75000,
      cost: 12.50,
      latency: 1500,
      reliability: 98.5
    },
    {
      id: 4,
      name: 'Cohere',
      status: 'Active',
      model: 'command',
      apiKey: '••••••••••••5pR8',
      usage: 40,
      limit: 60000,
      cost: 18.90,
      latency: 800,
      reliability: 99.2
    }
  ]);

  const [showAddProvider, setShowAddProvider] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-green-500';
      case 'Standby': return 'text-yellow-500';
      case 'Inactive': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500/20 border-green-500';
      case 'Standby': return 'bg-yellow-500/20 border-yellow-500';
      case 'Inactive': return 'bg-red-500/20 border-red-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const totalCost = providers.reduce((sum, p) => sum + p.cost, 0);
  const avgLatency = providers.reduce((sum, p) => sum + p.latency, 0) / providers.length;
  const avgReliability = providers.reduce((sum, p) => sum + p.reliability, 0) / providers.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="Gestión de Providers LLM" className="text-3xl md:text-4xl" />
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
            <div className="text-gray-400 text-sm mb-2">Providers Activos</div>
            <div className="text-3xl font-bold text-cyan-400">
              {providers.filter(p => p.status === 'Active').length}
            </div>
          </div>
          <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
            <div className="text-gray-400 text-sm mb-2">Costo Total (Mes)</div>
            <div className="text-3xl font-bold text-purple-400">
              ${totalCost.toFixed(2)}
            </div>
          </div>
          <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-green-500/50">
            <div className="text-gray-400 text-sm mb-2">Latencia Promedio</div>
            <div className="text-3xl font-bold text-green-400">
              {avgLatency.toFixed(0)}ms
            </div>
          </div>
          <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-pink-500/50">
            <div className="text-gray-400 text-sm mb-2">Confiabilidad Promedio</div>
            <div className="text-3xl font-bold text-pink-400">
              {avgReliability.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Add Provider Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddProvider(!showAddProvider)}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
          >
            + AÑADIR PROVIDER
          </button>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400">{provider.name}</h3>
                  <div className="text-sm text-gray-400 mt-1">{provider.model}</div>
                </div>
                <div className={`px-3 py-1 rounded border-2 ${getStatusBg(provider.status)}`}>
                  <span className={`font-bold text-sm ${getStatusColor(provider.status)}`}>
                    {provider.status}
                  </span>
                </div>
              </div>

              {/* API Key */}
              <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">API Key</div>
                <div className="text-sm font-mono text-white">{provider.apiKey}</div>
              </div>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Uso del Mes</span>
                  <span className="text-cyan-400">
                    {provider.usage.toFixed(0)}% ({(provider.limit * provider.usage / 100).toFixed(0)} / {provider.limit})
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${provider.usage}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Costo</div>
                  <div className="text-lg font-bold text-pink-400">${provider.cost}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Latencia</div>
                  <div className="text-lg font-bold text-yellow-400">{provider.latency}ms</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Uptime</div>
                  <div className="text-lg font-bold text-green-400">{provider.reliability}%</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors text-sm">
                  Configurar
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors text-sm">
                  Estadísticas
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Provider Form */}
        {showAddProvider && (
          <div className="mt-8 neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
            <h3 className="text-cyan-400 font-bold mb-4">Añadir Nuevo Provider</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre del Provider"
                className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Modelo"
                className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="password"
                placeholder="API Key"
                className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500 md:col-span-2"
              />
              <input
                type="number"
                placeholder="Límite de Tokens"
                className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
              />
              <select className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500">
                <option>Estado Inicial</option>
                <option>Active</option>
                <option>Standby</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowAddProvider(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded transition-colors"
              >
                Cancelar
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50">
                Añadir Provider
              </button>
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

export default Providers;
