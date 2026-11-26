import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { AuthContext } from './useAuth';

const loadInitialUser = () => {
  try {
    const raw = localStorage.getItem('authUser');
    const token = localStorage.getItem('authToken');
    if (!raw || !token) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed._id === 'string' && typeof parsed.email === 'string'
      ? parsed
      : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadInitialUser);

  const persistSession = (userData, token) => {
    setUser(userData);
    try {
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', token);
    } catch {
      // Ignore storage quota / privacy errors
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    persistSession(data.user, data.token);
    toast.success(`Welcome back, ${data.user.name}!`, { autoClose: 2000 });
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    persistSession(data.user, data.token);
    toast.success(`Welcome to BiteDash, ${data.user.name}!`, { autoClose: 2000 });
    return data.user;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
    } catch {
      // Ignore storage errors
    }
    toast.info('Logged out successfully', { autoClose: 2000 });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
