import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function checkSession() {
    setLoading(true);
    setError('');
    try { setUser(await api.get('/auth/me')); }
    catch (err) {
      setUser(null);
      if (err.status !== 401) setError('Unable to connect to the shop server. Please try again.');
    } finally { setLoading(false); }
  }
  useEffect(() => {
    checkSession();
    const expired = () => setUser(null);
    window.addEventListener('pahwa-auth-expired', expired);
    return () => window.removeEventListener('pahwa-auth-expired', expired);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.role !== 'admin') {
      await api.post('/auth/logout');
      throw new Error('This account does not have admin access.');
    }
    setError('');
    setUser(res);
    navigate('/admin/dashboard', { replace: true });
    return res;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/admin/login', { replace: true });
  };

  return <AuthContext.Provider value={{ user, loading, error, checkSession, login, logout }}>{children}</AuthContext.Provider>;
};
