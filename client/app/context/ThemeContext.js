'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';

const ThemeContext = createContext();

export const THEME_PRESETS = {
  forest: {
    id: 'forest',
    name: 'Deep Emerald',
    mode: 'light',
    description: 'Clean light workspace with #02563d brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#02563d',
    accentSecondary: '#02422f',
    accentCyan: '#12c4ac',
    glowPrimary: 'rgba(2, 86, 61, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(2, 86, 61, 0.12)'
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    mode: 'light',
    description: 'Clean light workspace with #237dd1 brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#237dd1',
    accentSecondary: '#1b64a8',
    accentCyan: '#38bdf8',
    glowPrimary: 'rgba(35, 125, 209, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(35, 125, 209, 0.12)'
  },
  navy: {
    id: 'navy',
    name: 'Midnight Navy',
    mode: 'light',
    description: 'Clean light workspace with #1d2435 brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#1d2435',
    accentSecondary: '#121824',
    accentCyan: '#38bdf8',
    glowPrimary: 'rgba(29, 36, 53, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(29, 36, 53, 0.12)'
  },
  purple: {
    id: 'purple',
    name: 'Slate Violet',
    mode: 'light',
    description: 'Clean light workspace with #645788 brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#645788',
    accentSecondary: '#4e436c',
    accentCyan: '#e879f9',
    glowPrimary: 'rgba(100, 87, 136, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(100, 87, 136, 0.12)'
  },
  crimson: {
    id: 'crimson',
    name: 'Magenta Crimson',
    mode: 'light',
    description: 'Clean light workspace with #a7205c brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#a7205c',
    accentSecondary: '#831848',
    accentCyan: '#fda4af',
    glowPrimary: 'rgba(167, 32, 92, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(167, 32, 92, 0.12)'
  },
  teal: {
    id: 'teal',
    name: 'Vibrant Teal',
    mode: 'light',
    description: 'Clean light workspace with #12c4ac brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#12c4ac',
    accentSecondary: '#0da18d',
    accentCyan: '#06b6d4',
    glowPrimary: 'rgba(18, 196, 172, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(18, 196, 172, 0.12)'
  },
  orange: {
    id: 'orange',
    name: 'Warm Coral',
    mode: 'light',
    description: 'Clean light workspace with #e6793b brand header & accents',
    bgPrimary: '#f4f6f8',
    bgSecondary: '#ffffff',
    bgSurface: '#ffffff',
    bgElevated: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accentPrimary: '#e6793b',
    accentSecondary: '#c86328',
    accentCyan: '#f59e0b',
    glowPrimary: 'rgba(230, 121, 59, 0.25)',
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderDefault: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'rgba(230, 121, 59, 0.12)'
  }
};

const DEFAULT_MODULE_THEMES = {
  saasAdmin: 'forest',
  admin: 'forest',
  accountant: 'orange',
  teacher: 'forest',
  parent: 'blue',
  student: 'purple'
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const [activeThemeId, setActiveThemeId] = useState('forest');
  const [isModuleThemesEnabled, setIsModuleThemesEnabled] = useState(false);
  const [moduleThemes, setModuleThemes] = useState(DEFAULT_MODULE_THEMES);
  const [customTheme, setCustomTheme] = useState(null);

  const getStorageKey = () => {
    const userEmail = user?.email || 'guest';
    return `erp_theme_config_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  useEffect(() => {
    try {
      if (user?.themePreference) {
        const pref = user.themePreference;
        if (pref.activeThemeId) setActiveThemeId(pref.activeThemeId);
        if (typeof pref.isModuleThemesEnabled === 'boolean') setIsModuleThemesEnabled(pref.isModuleThemesEnabled);
        if (pref.moduleThemes) setModuleThemes({ ...DEFAULT_MODULE_THEMES, ...pref.moduleThemes });
        if (pref.customTheme) setCustomTheme(pref.customTheme);
        return;
      }

      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeThemeId) setActiveThemeId(parsed.activeThemeId);
        if (typeof parsed.isModuleThemesEnabled === 'boolean') setIsModuleThemesEnabled(parsed.isModuleThemesEnabled);
        if (parsed.moduleThemes) setModuleThemes({ ...DEFAULT_MODULE_THEMES, ...parsed.moduleThemes });
        if (parsed.customTheme) setCustomTheme(parsed.customTheme);
      }
    } catch (e) {
      console.warn('Failed to load theme preference', e);
    }
  }, [user]);

  const getCurrentThemeConfig = () => {
    let effectiveThemeId = activeThemeId;

    if (isModuleThemesEnabled && pathname) {
      if (pathname.startsWith('/saas-admin')) effectiveThemeId = moduleThemes.saasAdmin || 'forest';
      else if (pathname.startsWith('/admin')) effectiveThemeId = moduleThemes.admin || 'forest';
      else if (pathname.startsWith('/accountant')) effectiveThemeId = moduleThemes.accountant || 'orange';
      else if (pathname.startsWith('/teacher')) effectiveThemeId = moduleThemes.teacher || 'forest';
      else if (pathname.startsWith('/parent')) effectiveThemeId = moduleThemes.parent || 'blue';
      else if (pathname.startsWith('/student')) effectiveThemeId = moduleThemes.student || 'purple';
    }

    if (effectiveThemeId === 'custom' && customTheme) {
      return customTheme;
    }

    return THEME_PRESETS[effectiveThemeId] || THEME_PRESETS.forest;
  };

  useEffect(() => {
    const theme = getCurrentThemeConfig();
    const root = document.documentElement;

    root.style.setProperty('--bg-primary', theme.bgPrimary || '#f4f6f8');
    root.style.setProperty('--bg-secondary', theme.bgSecondary || '#ffffff');
    root.style.setProperty('--bg-surface', theme.bgSurface || '#ffffff');
    root.style.setProperty('--bg-elevated', theme.bgElevated || '#f1f5f9');
    root.style.setProperty('--text-primary', theme.textPrimary || '#0f172a');
    root.style.setProperty('--text-secondary', theme.textSecondary || '#475569');
    root.style.setProperty('--text-muted', theme.textMuted || '#64748b');
    root.style.setProperty('--accent-primary', theme.accentPrimary || '#02563d');
    root.style.setProperty('--accent-secondary', theme.accentSecondary || '#02422f');
    root.style.setProperty('--accent-cyan', theme.accentCyan || '#12c4ac');
    root.style.setProperty('--glow-primary', theme.glowPrimary || 'rgba(2, 86, 61, 0.25)');
    root.style.setProperty('--border-subtle', theme.borderSubtle || 'rgba(15, 23, 42, 0.08)');
    root.style.setProperty('--border-default', theme.borderDefault || 'rgba(15, 23, 42, 0.12)');
    
    root.setAttribute('data-theme-mode', 'light');
    root.setAttribute('data-theme-id', theme.id);

  }, [activeThemeId, isModuleThemesEnabled, moduleThemes, customTheme, pathname]);

  const saveThemeConfig = async (newActiveId, newModuleEnabled, newModuleThemes, newCustom) => {
    try {
      const payload = {
        activeThemeId: newActiveId !== undefined ? newActiveId : activeThemeId,
        isModuleThemesEnabled: newModuleEnabled !== undefined ? newModuleEnabled : isModuleThemesEnabled,
        moduleThemes: newModuleThemes || moduleThemes,
        customTheme: newCustom !== undefined ? newCustom : customTheme
      };

      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(payload));

      const token = localStorage.getItem('erp_token');
      if (token) {
        fetch('/api/auth/theme', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ themeConfig: payload })
        }).catch(err => console.warn('Failed to sync theme preference to backend', err));
      }
    } catch (e) {
      console.warn('Failed to save theme settings', e);
    }
  };

  const changeTheme = (themeId) => {
    setActiveThemeId(themeId);
    saveThemeConfig(themeId, undefined, undefined, undefined);
  };

  const toggleModuleThemes = (enabled) => {
    setIsModuleThemesEnabled(enabled);
    saveThemeConfig(undefined, enabled, undefined, undefined);
  };

  const setModuleTheme = (moduleName, themeId) => {
    const updated = { ...moduleThemes, [moduleName]: themeId };
    setModuleThemes(updated);
    saveThemeConfig(undefined, undefined, updated, undefined);
  };

  const applyCustomTheme = (customObj) => {
    const fullCustom = {
      id: 'custom',
      name: customObj.name || 'Custom Brand Theme',
      mode: 'light',
      description: 'User-configured custom brand accent theme',
      bgPrimary: '#f4f6f8',
      bgSecondary: '#ffffff',
      bgSurface: '#ffffff',
      bgElevated: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      accentPrimary: customObj.accentPrimary || '#02563d',
      accentSecondary: customObj.accentSecondary || '#02422f',
      accentCyan: customObj.accentCyan || '#12c4ac',
      glowPrimary: `${customObj.accentPrimary || '#02563d'}40`,
      borderSubtle: 'rgba(15, 23, 42, 0.08)',
      borderDefault: 'rgba(15, 23, 42, 0.12)'
    };

    setCustomTheme(fullCustom);
    setActiveThemeId('custom');
    saveThemeConfig('custom', undefined, undefined, fullCustom);
  };

  const resetTheme = () => {
    setActiveThemeId('forest');
    setIsModuleThemesEnabled(false);
    setModuleThemes(DEFAULT_MODULE_THEMES);
    setCustomTheme(null);
    saveThemeConfig('forest', false, DEFAULT_MODULE_THEMES, null);
  };

  const currentTheme = getCurrentThemeConfig();

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        activeThemeId,
        changeTheme,
        isModuleThemesEnabled,
        toggleModuleThemes,
        moduleThemes,
        setModuleTheme,
        applyCustomTheme,
        customTheme,
        resetTheme,
        presets: THEME_PRESETS
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      currentTheme: THEME_PRESETS.forest,
      activeThemeId: 'forest',
      changeTheme: () => {},
      isModuleThemesEnabled: false,
      toggleModuleThemes: () => {},
      moduleThemes: DEFAULT_MODULE_THEMES,
      setModuleTheme: () => {},
      applyCustomTheme: () => {},
      customTheme: null,
      resetTheme: () => {},
      presets: THEME_PRESETS
    };
  }
  return context;
};
