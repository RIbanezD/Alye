import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 border-2 border-purple-500/50 hover:border-cyan-500/80 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-white font-mono text-sm hidden md:block">{user.name}</span>
        <svg 
          className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-gray-800 border-2 border-purple-500/50 shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700">
            <p className="text-white font-bold">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-cyan-400 text-xs mt-1">
              Role: <span className="font-mono">{user.role}</span>
            </p>
          </div>
          
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors"
            >
              👤 Mi Perfil
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors"
            >
              ⚙️ Configuración
            </Link>
            <hr className="my-2 border-gray-700" />
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
