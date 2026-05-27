import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('csi_jwt_token');
    const storedUser = localStorage.getItem('csi_user_data');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const data = response.data;
      
      setToken(data.accessToken);
      setUser(data);
      
      localStorage.setItem('csi_jwt_token', data.accessToken);
      localStorage.setItem('csi_user_data', JSON.stringify(data));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      await api.post('/api/auth/register', data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('csi_jwt_token');
    localStorage.removeItem('csi_user_data');
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
