import { useState, useEffect, useRef } from 'react';
import { conversationService } from '../services/ConversationService';

export default function ChatAssistant({ projectId, llmProvider, modelName }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      loadConversations();
    }
  }, [projectId]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await conversationService.getConversationsByProject(projectId);
      setConversations(data);
      
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getMessages(activeConversation.id);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await conversationService.createConversation({
        project_id: projectId,
        llm_provider: llmProvider || 'ollama',
        model_name: modelName || 'llama2',
        title: `Conversación ${conversations.length + 1}`
      });
      
      setConversations([...conversations, newConv]);
      setActiveConversation(newConv);
      setMessages([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversation) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await conversationService.sendMessage(activeConversation.id, {
        content: inputMessage
      });

      await loadMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async (convId) => {
    if (!confirm('¿Eliminar esta conversación?')) return;

    try {
      await conversationService.deleteConversation(convId);
      const updatedConvs = conversations.filter(c => c.id !== convId);
      setConversations(updatedConvs);
      
      if (activeConversation?.id === convId) {
        setActiveConversation(updatedConvs[0] || null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar - Conversaciones */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={createNewConversation}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            + Nueva Conversación
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                activeConversation?.id === conv.id ? 'bg-gray-800 border-l-4 border-cyan-500' : ''
              }`}
              onClick={() => setActiveConversation(conv)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {conv.title || 'Sin título'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="text-gray-500 hover:text-red-500 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <h2 className="text-xl font-bold text-cyan-400">
            {activeConversation?.title || 'Asistente IA'}
          </h2>
          {activeConversation && (
            <p className="text-sm text-gray-400">
              {activeConversation.llm_provider} - {activeConversation.model_name}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 m-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeConversation ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-xl mb-4">
                  Selecciona o crea una conversación
                </p>
                <button
                  onClick={createNewConversation}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Iniciar nueva conversación
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg">
                Comienza la conversación escribiendo un mensaje
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">AI</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeConversation && (
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
                rows="3"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 rounded-lg transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
