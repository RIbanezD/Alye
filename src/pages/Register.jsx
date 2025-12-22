import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NeonText from '../components/NeonText';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setLoading(true);
    
    const { confirmPassword, ...userData } = formData;
    await register(userData);
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Débil';
    if (passwordStrength <= 3) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <NeonText text="CREAR CUENTA" className="text-2xl md:text-3xl" />
          </h1>
          <p className="text-gray-400 text-sm">Únete al sistema de pentesting</p>
        </div>

        <div className="neon-card p-8 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

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
                  minLength={8}
                  className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength ? getStrengthColor() : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Fortaleza: <span className={passwordStrength > 3 ? 'text-green-400' : passwordStrength > 1 ? 'text-yellow-400' : 'text-red-400'}>
                      {getStrengthText()}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full bg-gray-900 text-white border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-cyan-500/50 focus:border-cyan-500'
                }`}
                placeholder="Repite tu contraseña"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="user">Usuario</option>
                <option value="pentester">Pentester</option>
                <option value="analyst">Analista</option>
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1"
              />
              <label htmlFor="terms" className="text-gray-400 text-xs">
                Acepto los{' '}
                <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">
                  términos y condiciones
                </Link>
                {' '}y la{' '}
                <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">
                  política de privacidad
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creando cuenta...</span>
                </div>
              ) : (
                'CREAR CUENTA'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
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

export default Register;
