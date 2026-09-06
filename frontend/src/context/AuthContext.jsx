import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('csea-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('csea-user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('csea-user');
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('csea-token', token);
    } else {
      localStorage.removeItem('csea-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('csea-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('csea-user');
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    const payload = response.data.data;

    setToken(payload.token);
    setUser(payload.user);

    return payload;
  };

  const register = async (formData) => {
    const response = await axiosInstance.post('/api/auth/register', formData);
    const payload = response.data.data;

    setToken(payload.token);
    setUser(payload.user);

    return payload;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
