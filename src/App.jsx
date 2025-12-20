import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import PayloadGenerator from './pages/payloads';
import RagAssistant from './pages/rag';
import Classifier from './pages/classifier';
import Osint from './pages/osint';
import Reports from './pages/reports';
import Providers from './pages/providers';

function Home({ modules }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="text-center mb-12">
        <NeonHeader text="ASISTENTE DE PENTESTING - Alye" />
        <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 text-xs tracking-[0.5em] to-transparent mt-2 opacity-70"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {modules.map((module) => (
          <Link 
            to={`/${module.id}`} 
            key={module.id}
            className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 hover:border-cyan-500/80 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 block no-underline"
          >
            <h2 className="text-2xl font-bold mb-4 text-cyan-400 tracking-wide">
              <NeonText text={module.title} className="text-xl md:text-2xl" />
            </h2>
            <div className="border-t border-dotted border-gray-600 mb-4"></div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Estado:</span>
                <span className={`font-bold ${module.statusColor}`}>
                  {module.status}
                </span>
              </div>
              
              {module.metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="text-gray-400 mr-2">{metric.label}:</span>
                  <span className={`font-bold ${metric.valueColor}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Componente Placeholder para las páginas (luego crea archivos individuales)
const PagePlaceholder = ({ title }) => (
  <div className="min-h-screen bg-gray-900 text-white p-10">
    <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block">← Volver al menú principal</Link>
    <h1 className="text-3xl font-bold neon-text">
      <NeonText text={title} className="text-xl md:text-2xl" />
    </h1>
    <p className="mt-4 text-gray-400">Contenido del módulo en desarrollo...</p>
  </div>
);


const NeonText = ({ text, className = "" }) => {
  return (
    <span className={`flex flex-wrap ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="mx-1">&nbsp;</span>;

        // Lógica random para cada letra del título del módulo
        const rand = Math.random();
        let animClass = "anim-steady";
        
        if (rand > 0.92) {
          animClass = "anim-critical"; // Un poco menos frecuente para no distraer tanto
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

const NeonHeader = ({ text }) => {
  if (!text) return null;
  return (
    <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-wider uppercase flex flex-wrap justify-center">
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="mx-2">&nbsp;</span>;

        const rand = Math.random();
        let animClass = "anim-steady";
        
        if (rand > 0.85) {
          animClass = "anim-critical"; // 15% de probabilidad de fallo crítico
        } else if (rand > 0.6) {
          animClass = "anim-flicker"; // 25% de probabilidad de parpadeo rápido
        }

        // Variamos también la duración y el retraso para que no sea uniforme
        const randomDuration = (Math.random() * 3 + 2).toFixed(2) + "s";
        const randomDelay = (Math.random() * 5).toFixed(2) + "s";

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
    </h1>
  );
};

function App() {
  const [modules] = useState([
    {
      id: 'payloads',
      title: 'Generador de Payloads',
      status: 'OPERACIONAL',
      statusColor: 'text-green-400',
      metrics: [
        { label: 'Breve descripción', value: 'RSA', valueColor: 'text-pink-400' }
      ]
    },
    {
      id: 'rag',
      title: 'Asistente RAG',
      status: 'OPERACIONAL',
      statusColor: 'text-green-400',
      metrics: [
        { label: 'Alerta', value: 'LIMPIEZA REQUERIDA', valueColor: 'text-red-500' }
      ]
    },
    {
      id: 'classifier',
      title: 'Clasificador',
      status: 'OPERACIONAL',
      statusColor: 'text-green-400',
      metrics: [
        { label: 'Tasa de Transferencia', value: '4.3 GB/s', valueColor: 'text-pink-400' }
      ]
    },
    {
      id: 'osint',
      title: 'OSINT y Reconocimiento',
      status: 'OPERACIONAL',
      statusColor: 'text-green-400',
      metrics: [
        { label: 'Último Ciclo', value: 'ESTABLE', valueColor: 'text-green-400' }
      ]
    },
    {
      id: 'reports',
      title: 'Reportes',
      status: 'OPERACIONAL',
      statusColor: 'text-green-400',
      metrics: [
        { label: 'Último Ciclo', value: 'ESTABLE', valueColor: 'text-green-400' }
      ]
    },
    {
      id: 'providers',
      title: 'Providers',
      status: 'OPERACIONAL',
      statusColor: 'text-green-400',
      metrics: [
        { label: 'Último Ciclo', value: 'ESTABLE', valueColor: 'text-green-400' }
      ]
    }    
  ]);

  return (
    <div>

      <Routes>
        <Route path="/" element={<Home modules={modules} />} />
        <Route path="/payloads" element={<PayloadGenerator/>} />
        <Route path="/rag" element={<RagAssistant/>} />
        <Route path="/classifier" element={<Classifier/>} />
        <Route path="/osint" element={<Osint/>} />
        <Route path="/reports" element={<Reports/>} />
        <Route path="/providers" element={<Providers/>} />
      </Routes>

      <style jsx>{`
        .neon-text {
          color: #00ffff;
          text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
        }
        
        .neon-card {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
        }
        
        .neon-card:hover {
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}

export default App;