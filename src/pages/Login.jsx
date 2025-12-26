import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NeonHeader from '../components/NeonHeader';
import LoadingSpinner from '../components/LoadingSpinner';


const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(''); // Agregar esta línea (limpia errores previos)
    
  try {
    await login(formData.email, formData.password);
    // Si llega aquí, el login fue exitoso
  } catch (err) {
    console.error('Error en login:', err);
    setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (


    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <span className="text-4xl font-bold mb-2">
            <NeonHeader text="PENTESTING ASSISTANT" className="text-2xl md:text-3xl" />
          </span>
          <p className="text-gray-400 text-sm">Sistema de Autenticación Seguro</p>
        </div>

        {/* Login Card */}
        <div className="neon-card p-8 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? '👁️‍🗨️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Recordarme</span>
              </label>
              <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Iniciando sesión...</span>
                </div>
              ) : (
                'INICIAR SESIÓN'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-xs font-bold mb-2">🔑 Credenciales de Prueba:</p>
            <p className="text-gray-300 text-xs font-mono">
              Email: admin@alye.com<br />
              Password: Admin123!
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            🔒 Conexión segura mediante cifrado SSL/TLS
          </p>
        </div>
      </div>

      <style jsx>{`
        .neon-card {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Login;
