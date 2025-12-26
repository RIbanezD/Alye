import { useState, useEffect } from 'react';
import { llmService } from '../services/LLMService';

export default function LLMSettings() {
  const [config, setConfig] = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [groqModels, setGroqModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    loadConfig();
    loadModels();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await llmService.getConfig();
      setConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      
      const [ollamaData, groqData] = await Promise.all([
        llmService.getOllamaModels(),
        llmService.getGroqModels()
      ]);

      setOllamaModels(ollamaData.models || []);
      setGroqModels(groqData.models || []);
      
      if (ollamaData.models && ollamaData.models.length > 0) {
        setSelectedModel(ollamaData.models[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!selectedModel) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await llmService.testConnection(
        selectedProvider,
        selectedModel,
        'Hola, este es un mensaje de prueba. Responde brevemente.'
      );
      
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    setTestResult(null);
    
    if (provider === 'ollama' && ollamaModels.length > 0) {
      setSelectedModel(ollamaModels[0]);
    } else if (provider === 'groq' && groqModels.length > 0) {
      setSelectedModel(groqModels[0].id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Configuración de LLM</h1>
        <p className="text-gray-400 mb-8">Configura y prueba los modelos de lenguaje</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Ollama Card */}
          <div className={`bg-gray-900 border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedProvider === 'ollama' ? 'border-cyan-500' : 'border-gray-800 hover:border-gray-700'
          }`}
          onClick={() => handleProviderChange('ollama')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">Ollama</h2>
              <span className="text-xs bg-green-500 px-2 py-1 rounded-full">Local</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">URL:</span>
                <span className="text-white">{config?.ollama?.base_url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modelo por defecto:</span>
                <span className="text-white">{config?.ollama?.default_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modelos disponibles:</span>
                <span className="text-white">{ollamaModels.length}</span>
              </div>
            </div>

            {selectedProvider === 'ollama' && ollamaModels.length > 0 && (
              <div className="mt-4">
                <label className="block text-gray-300 mb-2">Seleccionar modelo:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {ollamaModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Groq Card */}
          <div className={`bg-gray-900 border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedProvider === 'groq' ? 'border-cyan-500' : 'border-gray-800 hover:border-gray-700'
          }`}
          onClick={() => handleProviderChange('groq')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">Groq</h2>
              <span className="text-xs bg-purple-500 px-2 py-1 rounded-full">Cloud</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">API Key:</span>
                <span className="text-white">
                  {config?.groq?.api_key_configured ? '✓ Configurada' : '✗ No configurada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modelo por defecto:</span>
                <span className="text-white">{config?.groq?.default_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modelos disponibles:</span>
                <span className="text-white">{groqModels.length}</span>
              </div>
            </div>

            {selectedProvider === 'groq' && groqModels.length > 0 && (
              <div className="mt-4">
                <label className="block text-gray-300 mb-2">Seleccionar modelo:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {groqModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.context_window.toLocaleString()} tokens)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Test Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Probar Conexión</h3>
          
          <button
            onClick={handleTest}
            disabled={testing || !selectedModel}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors mb-4"
          >
            {testing ? 'Probando...' : 'Probar Modelo'}
          </button>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {testResult.success ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold mb-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {testResult.message}
                  </p>
                  
                  {testResult.success && testResult.response && (
                    <div className="mt-3">
                      <p className="text-gray-300 text-sm mb-2">Respuesta del modelo:</p>
                      <div className="bg-gray-800 p-3 rounded text-white text-sm">
                        {testResult.response}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>Modelo: {testResult.model}</span>
                        {testResult.tokens_used && (
                          <span>Tokens: {testResult.tokens_used}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RAG Configuration */}
        {config?.rag && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Configuración RAG</h3>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Max Context Tokens</span>
                <span className="text-white font-semibold">{config.rag.max_context_tokens}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Temperature</span>
                <span className="text-white font-semibold">{config.rag.temperature}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Max Tokens</span>
                <span className="text-white font-semibold">{config.rag.max_tokens}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
