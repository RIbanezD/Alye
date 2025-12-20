import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import NeonText from '../components/NeonText';

const RagAssistant = () => {
  const toast = useToast();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🔒 Sistema RAG de Seguridad iniciado. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('cve');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const databases = [
    { 
      id: 'cve', 
      name: 'CVE Database', 
      description: 'Vulnerabilidades conocidas',
      prompts: [
        '¿Cuáles son las CVEs más críticas de 2024?',
        'Buscar CVEs relacionadas con Apache',
        'Vulnerabilidades de autenticación en WordPress',
        'CVEs de escalación de privilegios en Linux',
        'Últimas vulnerabilidades de día cero'
      ]
    },
    { 
      id: 'owasp', 
      name: 'OWASP Top 10', 
      description: 'Riesgos de seguridad web',
      prompts: [
        '¿Qué es la inyección SQL y cómo prevenirla?',
        'Explica el Cross-Site Scripting (XSS)',
        'Mejores prácticas contra CSRF',
        '¿Cómo implementar autenticación segura?',
        'Controles de acceso según OWASP'
      ]
    },
    { 
      id: 'mitre', 
      name: 'MITRE ATT&CK', 
      description: 'Tácticas y técnicas de atacantes',
      prompts: [
        'Técnicas de persistencia en Windows',
        '¿Qué es la táctica de Lateral Movement?',
        'Métodos de exfiltración de datos',
        'Técnicas de evasión de defensa',
        'Privilege Escalation en sistemas Unix'
      ]
    },
    { 
      id: 'exploitdb', 
      name: 'Exploit Database', 
      description: 'Exploits públicos',
      prompts: [
        'Exploits para CMS WordPress',
        'Búsqueda de exploits de RCE',
        'Exploits recientes para servicios web',
        '¿Cómo funcionan los buffer overflow?',
        'Exploits de privilege escalation'
      ]
    },
    { 
      id: 'nist', 
      name: 'NIST NVD', 
      description: 'Nacional Vulnerability Database',
      prompts: [
        '¿Qué es el CVSS scoring?',
        'Vulnerabilidades en protocolos de red',
        'Debilidades comunes (CWE) más peligrosas',
        'Métricas de vulnerabilidad según NIST',
        'Vulnerabilidades en software empresarial'
      ]
    }
  ];

  const handleSendMessage = (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    // Simulación de respuesta del RAG
    setTimeout(() => {
      const currentDb = databases.find(db => db.id === selectedDatabase);
      const responses = [
        `🔍 Buscando en ${currentDb?.name}...\n\nEncontré 3 resultados relevantes relacionados con "${textToSend}":\n\n1. CVE-2023-12345: Vulnerabilidad crítica en el componente de autenticación\n2. CVE-2023-23456: Inyección SQL en módulo de búsqueda\n3. CVE-2023-34567: XSS reflejado en parámetro de usuario\n\n¿Quieres más detalles sobre alguna?`,
        
        `📚 Según la base de conocimiento de ${currentDb?.name}:\n\n"${textToSend}"\n\nLas mejores prácticas incluyen:\n• Validación de entrada en el servidor\n• Sanitización de datos del usuario\n• Uso de prepared statements\n• Implementación de CSP (Content Security Policy)\n• Actualización constante de dependencias\n\n¿Te gustaría profundizar en algún punto?`,
        
        `🎯 He analizado tu consulta sobre "${textToSend}".\n\nRecomendaciones basadas en ${currentDb?.name}:\n\n⚠️ Nivel de Riesgo: ALTO\n\n📋 Técnicas de Mitigación:\n1. Implementar WAF (Web Application Firewall)\n2. Realizar auditorías de código regulares\n3. Aplicar principio de mínimos privilegios\n4. Configurar headers de seguridad HTTP\n\n¿Necesitas ejemplos de implementación?`,
        
        `💡 Información recuperada de ${currentDb?.name}:\n\n"${textToSend}" está asociado con:\n\n• Tipo: Vulnerability\n• Categoría: Injection Attack\n• Vector: Network/Adjacent\n• Impacto: Confidencialidad + Integridad\n\nTe proporciono enlaces a documentación relevante y casos de uso reales. ¿Quieres ver ejemplos de exploits?`,
        
        `🔐 Análisis completo de "${textToSend}":\n\nBasado en ${currentDb?.name}, esta vulnerabilidad:\n\n✓ Afecta a: Aplicaciones web y APIs\n✓ CVSS Score: 8.5 (ALTO)\n✓ Complejidad de Ataque: BAJA\n✓ Privilegios Requeridos: NINGUNO\n\nMedidas correctivas urgentes:\n1. Actualizar a la última versión\n2. Aplicar parches de seguridad\n3. Implementar controles adicionales\n\n¿Necesitas un plan de remediación detallado?`
      ];

      const assistantMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '🔒 Chat limpiado. Sistema RAG de Seguridad reiniciado. ¿En qué puedo ayudarte?'
      }
    ]);
    setShowClearConfirm(false);
    toast.info('Chat limpiado exitosamente');
  };

  const handlePromptClick = (prompt) => {
    setInputMessage(prompt);
    toast.success('Prompt cargado');
  };

  const currentDatabase = databases.find(db => db.id === selectedDatabase);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="Asistente RAG de Seguridad" className="text-3xl md:text-4xl" />
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Bases de Datos */}
          <div className="lg:col-span-1 space-y-4">
            <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <h3 className="text-cyan-400 font-bold mb-4">Bases de Conocimiento</h3>
              <div className="space-y-2">
                {databases.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => setSelectedDatabase(db.id)}
                    className={`w-full text-left p-3 rounded transition-all ${
                      selectedDatabase === db.id
                        ? 'bg-cyan-500/20 border-2 border-cyan-500'
                        : 'bg-gray-900/50 border-2 border-gray-700 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-cyan-400">{db.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{db.description}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-3 bg-red-500/10 border-2 border-red-500/50 rounded">
                <div className="text-red-400 font-bold text-sm mb-1">⚠️ ALERTA</div>
                <div className="text-xs text-gray-300">LIMPIEZA REQUERIDA</div>
                <div className="text-xs text-gray-400 mt-2">Índice vectorial necesita optimización</div>
              </div>
            </div>

            {/* Prompts Sugeridos */}
            <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <h3 className="text-purple-400 font-bold mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Prompts Sugeridos
              </h3>
              <div className="text-xs text-gray-400 mb-3">
                {currentDatabase?.name}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentDatabase?.prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full text-left p-2 rounded bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-xs text-gray-300 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="neon-card rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 flex flex-col h-[700px]">
              {/* Header con botón de limpieza */}
              <div className="border-b-2 border-purple-500/50 p-4 flex justify-between items-center">
                <div>
                  <div className="text-cyan-400 font-bold">Chat Activo</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Base: {currentDatabase?.name}
                  </div>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="bg-red-600/20 hover:bg-red-600/30 border-2 border-red-500 text-red-400 font-bold px-4 py-2 rounded transition-all text-sm"
                >
                  🗑️ LIMPIAR CHAT
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-cyan-500/20 border-2 border-cyan-500/50'
                          : 'bg-purple-500/20 border-2 border-purple-500/50'
                      }`}
                    >
                      <div className="text-sm font-bold mb-1 text-cyan-400">
                        {message.role === 'user' ? 'TÚ' : '🤖 ASISTENTE RAG'}
                      </div>
                      <div className="text-gray-200 whitespace-pre-line">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-purple-500/20 border-2 border-purple-500/50 p-4 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t-2 border-purple-500/50 p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Pregunta sobre vulnerabilidades, CVEs, técnicas de ataque..."
                    className="flex-1 bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-3 focus:outline-none focus:border-cyan-500 resize-none"
                    rows="2"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ENVIAR
                  </button>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-cyan-500/50">
                <div className="text-gray-400 text-xs mb-1">Mensajes</div>
                <div className="text-2xl font-bold text-cyan-400">{messages.length}</div>
              </div>
              <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
                <div className="text-gray-400 text-xs mb-1">Base Activa</div>
                <div className="text-lg font-bold text-purple-400">{currentDatabase?.name.split(' ')[0]}</div>
              </div>
              <div className="neon-card p-4 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-green-500/50">
                <div className="text-gray-400 text-xs mb-1">Estado</div>
                <div className="text-lg font-bold text-green-400">OPERACIONAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Limpieza */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="neon-card p-8 rounded-lg backdrop-blur-sm bg-gray-800 border-2 border-red-500 max-w-md mx-4">
            <h3 className="text-2xl font-bold text-red-400 mb-4">⚠️ Confirmar Limpieza</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres limpiar el chat? Se perderán todos los mensajes de la conversación actual.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Limpiar Chat
              </button>
            </div>
          </div>
        </div>
      )}

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

export default RagAssistant;