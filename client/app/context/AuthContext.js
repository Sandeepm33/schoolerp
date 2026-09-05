'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('erp_user');
      const savedToken = localStorage.getItem('erp_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);

        // Sync fresh profile data from backend if server is reachable
        fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(meData => {
            if (meData && meData._id) {
              setUser(meData);
              localStorage.setItem('erp_user', JSON.stringify(meData));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Session restore error:', e);
    } finally {
      setInitialized(true);
    }
  }, []);

  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (res.ok) {
        const data = await res.json();
        let fullUser = data.user;
        
        try {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData && meData._id) fullUser = meData;
          }
        } catch (e) {}

        setUser(fullUser);
        setToken(data.token);
        localStorage.setItem('erp_user', JSON.stringify(fullUser));
        localStorage.setItem('erp_token', data.token);
        return fullUser;
      } else {
        const data = await res.json().catch(() => ({ message: 'Invalid email/mobile or password' }));
        throw new Error(data.message || 'Invalid email/mobile or password');
      }
    } catch (e) {
      if (e.message === 'Failed to fetch' || e.name === 'TypeError' || e.message?.includes('fetch')) {
        throw new Error('Unable to connect to authentication server. Please ensure backend server is running.');
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
  };

  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: 'API Request failed' }));
      throw new Error(errData.message || `Error ${res.status}`);
    }

    return res.json();
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithCredentials, logout, apiFetch, loading, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


