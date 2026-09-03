'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL || 'http://127.0.0.1:5000/api';

const DEMO_PRESETS = {
  'superadmin@saas.com': {
    name: 'SaaS Platform Super Admin',
    email: 'superadmin@saas.com',
    role: 'SAAS_SUPER_ADMIN',
    schoolName: 'SaaS Master Control Panel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'
  },
  'admin@greenwood.edu': {
    name: 'Principal Eleanor Vance',
    email: 'admin@greenwood.edu',
    role: 'SCHOOL_ADMIN',
    schoolName: 'Greenwood International School',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'
  },
  'accountant@greenwood.edu': {
    name: 'Marcus Vance',
    email: 'accountant@greenwood.edu',
    role: 'ACCOUNTANT',
    schoolName: 'Greenwood International School',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop'
  },
  'teacher@greenwood.edu': {
    name: 'Sarah Jenkins',
    email: 'teacher@greenwood.edu',
    role: 'TEACHER',
    schoolName: 'Greenwood International School',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop'
  },
  'parent@greenwood.edu': {
    name: 'Robert Davis',
    email: 'parent@greenwood.edu',
    role: 'PARENT',
    schoolName: 'Greenwood International School',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop'
  }
};

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

        // Sync fresh profile data from backend
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
        if (DEMO_PRESETS[cleanEmail]) {
          const demoUser = DEMO_PRESETS[cleanEmail];
          setUser(demoUser);
          setToken(`demo_token_${demoUser.role.toLowerCase()}`);
          localStorage.setItem('erp_user', JSON.stringify(demoUser));
          localStorage.setItem('erp_token', `demo_token_${demoUser.role.toLowerCase()}`);
          return demoUser;
        }
        const data = await res.json().catch(() => ({ message: 'Invalid email or password' }));
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (e) {
      if (DEMO_PRESETS[cleanEmail]) {
        const demoUser = DEMO_PRESETS[cleanEmail];
        setUser(demoUser);
        setToken(`demo_token_${demoUser.role.toLowerCase()}`);
        localStorage.setItem('erp_user', JSON.stringify(demoUser));
        localStorage.setItem('erp_token', `demo_token_${demoUser.role.toLowerCase()}`);
        return demoUser;
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
