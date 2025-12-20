import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import NeonText from '../components/NeonText';
  
const Providers = () => {
  const toast = useToast();

  const [providers, setProviders] = useState([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    model: '',
    apiKey: '',
    limit: '',
    status: 'Active'
  });

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.model || !newProvider.apiKey) {
      toast.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const provider = {
      id: providers.length + 1,
      name: newProvider.name,
      status: newProvider.status,
      model: newProvider.model,
      apiKey: '••••••••••••' + newProvider.apiKey.slice(-4),
      usage: 0,
      limit: parseInt(newProvider.limit) || 50000,
      cost: 0,
      latency: Math.floor(Math.random() * 1000) + 500,
      reliability: 99.0 + Math.random()
    };
    setProviders([...providers, provider]);
    setNewProvider({ name: '', model: '', apiKey: '', limit: '', status: 'Active' });
    setShowAddProvider(false);
    toast.success(`Provider ${newProvider.name} añadido exitosamente`);

  };

  const handleDeleteProvider = (id, name) => {
    setProviders(providers.filter(p => p.id !== id));
    toast.success(`Provider ${name} eliminado`);
  };

  const getStatusColor = (status) => {
      switch (status) {
        case 'Active': return 'text-green-500';
        case 'Standby': return 'text-yellow-500';
        case 'Inactive': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    const getStatusBg = (status) => {
      switch (status) {
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

      {/* Add Provider Form */}
      {showAddProvider && (
        <div className="mt-8 neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
          <h3 className="text-cyan-400 font-bold mb-4">Añadir Nuevo Provider</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre del Provider"
              value={newProvider.name}
              onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
              className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Modelo"
              value={newProvider.model}
              onChange={(e) => setNewProvider({...newProvider, model: e.target.value})}
              className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="password"
              placeholder="API Key"
              value={newProvider.apiKey}
              onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
              className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500 md:col-span-2"
            />
            <input
              type="number"
              placeholder="Límite de Tokens"
              value={newProvider.limit}
              onChange={(e) => setNewProvider({...newProvider, limit: e.target.value})}
              className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            />
            <select 
              value={newProvider.status}
              onChange={(e) => setNewProvider({...newProvider, status: e.target.value})}
              className="bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option>Active</option>
              <option>Standby</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => {
                setShowAddProvider(false);
                setNewProvider({ name: '', model: '', apiKey: '', limit: '', status: 'Active' });
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleAddProvider}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
            >
              Añadir Provider
            </button>
          </div>
        </div>
      )}

        {/* Add Provider Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddProvider(!showAddProvider)}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
          >
            AÑADIR PROVIDER
          </button>
        </div>

        {/* Actualiza los botones de acción de cada provider */}
        <div className="flex space-x-2 mt-4">
        <button 
          onClick={() => toast.info('Función en desarrollo')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors text-sm"
        >
          Configurar
        </button>
        <button 
          onClick={() => toast.info('Función en desarrollo')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors text-sm"
        >
          Estadísticas
        </button>
        <button 
            onClick={() => handleDeleteProvider(provider.id, provider.name)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm"
        >
          🗑️
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
