import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('food_waste_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Failed to load user profile from token:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password, role) => {
    const res = await api.login({ email, password, role });
    localStorage.setItem('food_waste_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('food_waste_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitch = async (email, password, role) => {
    return await login(email, password, role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
