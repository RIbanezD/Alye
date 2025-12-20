import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NeonText from '../components/NeonText';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Glitch 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 glitch-text">
            404
          </h1>
          <h1 className="text-9xl font-bold absolute top-0 left-0 w-full text-red-500 opacity-70 glitch-text-shadow" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}>
            404
          </h1>
          <h1 className="text-9xl font-bold absolute top-0 left-0 w-full text-cyan-500 opacity-70 glitch-text-shadow-2" style={{ clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)' }}>
            404
          </h1>
        </div>

        {/* Mensaje */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <NeonText text="ACCESO DENEGADO" className="text-3xl" />
          </h2>
          <p className="text-gray-400 text-lg mb-2">
            La página que buscas no existe en esta dimensión
          </p>
          <p className="text-cyan-400 font-mono text-sm">
            Error Code: <span className="text-red-500">MODULE_NOT_FOUND</span>
          </p>
        </div>

        {/* Terminal simulado */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-red-500/50 mb-8 text-left">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-400 text-xs ml-2">terminal@alye</span>
          </div>
          <div className="font-mono text-sm space-y-2">
            <p className="text-gray-500">$ cat /var/log/system.log</p>
            <p className="text-red-400">[ERROR] Route not found: {window.location.pathname}</p>
            <p className="text-yellow-400">[WARN] Redirecting to main module...</p>
            <p className="text-cyan-400">
              [INFO] Redirect in {countdown} seconds <span className="animate-pulse">_</span>
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
          >
            VOLVER AL INICIO
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
          >
            PÁGINA ANTERIOR
          </button>
        </div>

        {/* ASCII Art */}
        <div className="mt-12 text-xs text-gray-600 font-mono hidden md:block">
          <pre>
{`
    ⚠️  SYSTEM BREACH DETECTED  ⚠️
    ================================
    [####################] 100%
    Scanning for vulnerabilities...
    No threats found in this sector
    ================================
`}
          </pre>
        </div>
      </div>

      <style jsx>{`
        .neon-card {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .glitch-text {
          animation: glitch 1s infinite;
        }
        
        .glitch-text-shadow {
          animation: glitch 0.5s infinite reverse;
        }
        
        .glitch-text-shadow-2 {
          animation: glitch 0.7s infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
