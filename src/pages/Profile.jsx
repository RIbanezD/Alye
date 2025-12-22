import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import NeonText from '../components/NeonText';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    organization: user?.organization || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setIsEditing(false);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="MI PERFIL" className="text-3xl md:text-4xl" />
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-5xl font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-cyan-400">{user?.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                <div className="mt-4 inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500 rounded-full text-cyan-400 text-sm font-mono">
{user?.role}
</div>
</div>          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Miembro desde:</span>
              <span className="text-white">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Último acceso:</span>
              <span className="text-white">Hoy</span>
            </div>
          </div>
        </div>
      </div>      {/* Profile Details */}
      <div className="lg:col-span-2">
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-cyan-400">Información Personal</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold text-sm"
              >
                ✏️ EDITAR
              </button>
            )}
          </div>          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>            <div>
              <label className="block text-gray-400 text-sm mb-2">Organización</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tu empresa u organización"
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>            <div>
              <label className="block text-gray-400 text-sm mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                placeholder="Cuéntanos sobre ti..."
                className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>            {isEditing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'GUARDAR CAMBIOS'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      bio: user?.bio || '',
                      organization: user?.organization || '',
                    });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            )}
          </form>
        </div>        {/* Security Section */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 mt-6">
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">Seguridad</h3>
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">Cambiar Contraseña</p>
                  <p className="text-gray-400 text-sm">Última actualización: Hace 30 días</p>
                </div>
                <span className="text-cyan-400">→</span>
              </div>
            </button>            <button className="w-full text-left p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">Autenticación de Dos Factores</p>
                  <p className="text-gray-400 text-sm">Agrega una capa extra de seguridad</p>
                </div>
                <span className="text-yellow-400 text-sm">Desactivado</span>
              </div>
            </button>            <button className="w-full text-left p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">Sesiones Activas</p>
                  <p className="text-gray-400 text-sm">Ver y gestionar tus sesiones</p>
                </div>
                <span className="text-green-400 text-sm">1 activa</span>
              </div>
            </button>
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
};export default Profile;
