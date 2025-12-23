import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar token al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Verificar que el token sea válido
        const userData = await authService.verifyToken();
        setUser(userData);
      } catch (error) {
        // Token inválido o expirado
        console.error('Token inválido:', error);
        logout();
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
    const response = await authService.login(email, password);
    
    // Guardar token y usuario
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setUser(response.user);

    navigate('/', { replace: true });
    
    return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);