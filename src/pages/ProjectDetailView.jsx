import { useState, useEffect } from 'react';
import { projectService } from '../services/ProjectService';
import TargetsManagement from '../components/TargetsManagement';
import VulnerabilitiesView from '../components/VulnerabilitiesView';
import ChatAssistant from '../components/ChatAssistant';

export default function ProjectDetailView({ projectId }) {
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('targets');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [llmConfig, setLlmConfig] = useState({
    provider: 'ollama',
    model: 'llama2'
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProject(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'targets', label: 'Objetivos', icon: '🎯' },
    { id: 'vulnerabilities', label: 'Vulnerabilidades', icon: '🔒' },
    { id: 'chat', label: 'Asistente IA', icon: '🤖' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando proyecto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header del Proyecto */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">{project?.name}</h1>
              <p className="text-gray-400 mt-2">{project?.description || 'Sin descripción'}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
                Estado: <span className="text-cyan-400 font-semibold capitalize">{project?.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-0">
        {activeTab === 'targets' && (
          <TargetsManagement projectId={projectId} />
        )}
        
        {activeTab === 'vulnerabilities' && (
          <VulnerabilitiesView projectId={projectId} />
        )}
        
        {activeTab === 'chat' && (
          <div>
            {/* Config Panel para LLM */}
            <div className="bg-gray-900 border-b border-gray-800 p-4">
              <div className="max-w-7xl mx-auto flex items-center gap-4">
                <label className="text-gray-300">Proveedor:</label>
                <select
                  value={llmConfig.provider}
                  onChange={(e) => setLlmConfig({ ...llmConfig, provider: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="groq">Groq (Cloud)</option>
                </select>

                <label className="text-gray-300 ml-4">Modelo:</label>
                <select
                  value={llmConfig.model}
                  onChange={(e) => setLlmConfig({ ...llmConfig, model: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {llmConfig.provider === 'ollama' ? (
                    <>
                      <option value="llama2">Llama 2</option>
                      <option value="llama3">Llama 3</option>
                      <option value="mistral">Mistral</option>
                      <option value="codellama">CodeLlama</option>
                    </>
                  ) : (
                    <>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      <option value="llama3-70b-8192">Llama 3 70B</option>
                      <option value="llama3-8b-8192">Llama 3 8B</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <ChatAssistant
              projectId={projectId}
              llmProvider={llmConfig.provider}
              modelName={llmConfig.model}
            />
          </div>
        )}
      </div>
    </div>
  );
}
