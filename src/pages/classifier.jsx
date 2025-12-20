import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import NeonText from '../components/NeonText';

const Classifier = () => {
  const toast  = useToast();
  const [inputPrompt, setInputPrompt] = useState('');
  const [classificationResult, setClassificationResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const promptCategories = [
    { 
      id: 'injection', 
      name: 'Prompt Injection', 
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      description: 'Intento de manipular el comportamiento del modelo'
    },
    { 
      id: 'jailbreak', 
      name: 'Jailbreak', 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500',
      description: 'Intento de evadir restricciones del sistema'
    },
    { 
      id: 'data_extraction', 
      name: 'Extracción de Datos', 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      description: 'Intento de extraer información sensible del contexto'
    },
    { 
      id: 'social_engineering', 
      name: 'Ingeniería Social', 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500',
      description: 'Manipulación mediante técnicas de persuasión'
    },
    { 
      id: 'legitimate', 
      name: 'Legítimo', 
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      description: 'Consulta normal sin intenciones maliciosas'
    }
  ];

  const analyzePrompt = () => {
    if (!inputPrompt.trim()) {
      toast.warning('Por favor, ingresa un prompt para analizar.');
      return;
    }

    setIsAnalyzing(true);
    toast.info('Analizando prompt...');

    setTimeout(() => {
      // Lógica simple de clasificación (simulada)
      const keywords = {
        injection: ['ignore', 'forget', 'disregard', 'instructions', 'system prompt'],
        jailbreak: ['DAN', 'pretend', 'roleplay', 'bypass', 'unrestricted'],
        data_extraction: ['previous', 'context', 'history', 'reveal', 'show me'],
        social_engineering: ['urgent', 'trust me', 'confidential', 'private']
      };

      let scores = {
        injection: 0,
        jailbreak: 0,
        data_extraction: 0,
        social_engineering: 0,
        legitimate: 100
      };

      const lowerPrompt = inputPrompt.toLowerCase();

      Object.keys(keywords).forEach(category => {
        keywords[category].forEach(keyword => {
          if (lowerPrompt.includes(keyword)) {
            scores[category] += 20;
            scores.legitimate -= 15;
          }
        });
      });

      // Normalizar scores
      const maxCategory = Object.keys(scores).reduce((a, b) => 
        scores[a] > scores[b] ? a : b
      );

      const category = promptCategories.find(c => c.id === maxCategory);

      setClassificationResult({
        category: category,
        confidence: Math.min(Math.max(scores[maxCategory], 30), 98),
        scores: scores,
        recommendation: getRecommendation(maxCategory),
        riskLevel: getRiskLevel(maxCategory)
      });

      setIsAnalyzing(false);
      toast.success(`Análisis completado: ${category.name}`);
    }, 1500);
  };

  const getRecommendation = (category) => {
    const recommendations = {
      injection: 'BLOQUEAR: Implementar filtros de contenido y validación de entrada.',
      jailbreak: 'ALERTAR: Monitorear y registrar este intento. Considerar bloqueo.',
      data_extraction: 'PRECAUCIÓN: Limitar acceso al contexto. Sanitizar respuestas.',
      social_engineering: 'REVISAR: Validar intención real. Aplicar políticas de moderación.',
      legitimate: 'PERMITIR: Procesar normalmente con las políticas estándar.'
    };
    return recommendations[category] || 'Análisis inconcluso.';
  };

  const getRiskLevel = (category) => {
    const risks = {
      injection: 'CRÍTICO',
      jailbreak: 'ALTO',
      data_extraction: 'MEDIO',
      social_engineering: 'MEDIO',
      legitimate: 'BAJO'
    };
    return risks[category] || 'DESCONOCIDO';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="Clasificador de Prompts" className="text-3xl md:text-4xl" />
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <label className="block text-cyan-400 font-bold mb-3">Prompt a Analizar</label>
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ingresa el prompt que deseas clasificar..."
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-3 h-40 focus:outline-none focus:border-cyan-500 font-mono text-sm"
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-gray-400 text-sm">
                  {inputPrompt.length} caracteres
                </span>
                <button
                  onClick={analyzePrompt}
                  disabled={isAnalyzing || !inputPrompt.trim()}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'ANALIZANDO...' : 'ANALIZAR'}
                </button>
              </div>
            </div>

            {/* Results */}
            {classificationResult && (
              <div className="space-y-4">
                {/* Main Classification */}
                <div className={`neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 ${classificationResult.category.borderColor}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-cyan-400 mb-2">Clasificación Principal</h3>
                      <div className={`text-3xl font-bold ${classificationResult.category.color}`}>
                        {classificationResult.category.name}
                      </div>
                      <div className="text-gray-400 text-sm mt-2">
                      {classificationResult.category.description}
                      </div>
                      </div>
                      <div className="text-right">
                      <div className="text-sm text-gray-400">Confianza</div>
                      <div className="text-3xl font-bold text-cyan-400">
                      {classificationResult.confidence}%
                      </div>
                      </div>
                  </div>
                   {/* Risk Level */}
              <div className="mt-4 p-3 bg-gray-900/50 rounded border-2 border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Nivel de Riesgo:</span>
                  <span className={`font-bold ${
                    classificationResult.riskLevel === 'CRÍTICO' ? 'text-red-500' :
                    classificationResult.riskLevel === 'ALTO' ? 'text-orange-500' :
                    classificationResult.riskLevel === 'MEDIO' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {classificationResult.riskLevel}
                  </span>
                </div>
              </div>
            </div>            {/* Recommendation */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-yellow-500/50">
              <h3 className="text-yellow-400 font-bold mb-3">📋 Recomendación</h3>
              <p className="text-gray-300">{classificationResult.recommendation}</p>
            </div>            {/* Detailed Scores */}
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <h3 className="text-cyan-400 font-bold mb-4">Puntuaciones Detalladas</h3>
              <div className="space-y-3">
                {Object.keys(classificationResult.scores).map((key) => {
                  const category = promptCategories.find(c => c.id === key);
                  const score = Math.max(0, Math.min(100, classificationResult.scores[key]));
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className={category.color}>{category.name}</span>
                        <span className="text-gray-400">{score.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.bgColor.replace('/20', '')}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>      {/* Info Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
          <h3 className="text-cyan-400 font-bold mb-3">📊 Estadísticas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Tasa de Transferencia:</span>
              <span className="text-pink-400 font-bold">4.3 GB/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Prompts Analizados:</span>
              <span className="text-green-400 font-bold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Precisión:</span>
              <span className="text-cyan-400 font-bold">94.2%</span>
            </div>
          </div>
        </div>        <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
          <h3 className="text-purple-400 font-bold mb-3">🔍 Categorías</h3>
          <div className="space-y-2">
            {promptCategories.map((cat) => (
              <div key={cat.id} className={`p-2 rounded ${cat.bgColor} border ${cat.borderColor}`}>
                <div className={`font-bold text-sm ${cat.color}`}>{cat.name}</div>
                <div className="text-xs text-gray-400 mt-1">{cat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>  <style jsx>{`
    .neon-card {
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
    }
    .neon-card:hover {
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
    }
  `}</style>
</div>
);
};export default Classifier;
