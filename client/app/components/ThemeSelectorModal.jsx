'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Check, Sparkles, Sliders, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSelectorModal({ isOpen, onClose }) {
  const {
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
    presets
  } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('brand'); // 'brand' | 'modules' | 'custom'
  const [toastMessage, setToastMessage] = useState('');

  // State for custom theme input
  const [customPrimary, setCustomPrimary] = useState('#02563d');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (customTheme?.accentPrimary) {
      setCustomPrimary(customTheme.accentPrimary);
    }
  }, [customTheme]);

  if (!isOpen || !mounted) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    applyCustomTheme({
      accentPrimary: customPrimary,
      accentSecondary: customPrimary,
      mode: 'light'
    });
    showToast('✨ Custom brand color applied!');
  };

  const colorSwatches = [
    { id: 'forest', hex: '#02563d', name: 'Deep Emerald (#02563d)' },
    { id: 'blue', hex: '#237dd1', name: 'Ocean Blue (#237dd1)' },
    { id: 'navy', hex: '#1d2435', name: 'Midnight Navy (#1d2435)' },
    { id: 'purple', hex: '#645788', name: 'Slate Violet (#645788)' },
    { id: 'crimson', hex: '#a7205c', name: 'Magenta Crimson (#a7205c)' },
    { id: 'teal', hex: '#12c4ac', name: 'Vibrant Teal (#12c4ac)' },
    { id: 'orange', hex: '#e6793b', name: 'Warm Coral (#e6793b)' },
  ];

  const moduleLabels = [
    { key: 'saasAdmin', label: 'SaaS Platform Admin', desc: 'Master Control Portal' },
    { key: 'admin', label: 'School Admin', desc: 'School Operating System' },
    { key: 'accountant', label: 'Accountant Portal', desc: 'Fees & Finance Ledger' },
    { key: 'teacher', label: 'Teacher App', desc: 'Class Marker & Attendance' },
    { key: 'parent', label: 'Parent Portal', desc: 'Parent Mobile App' },
    { key: 'student', label: 'Student Portal', desc: 'Student Learning App' }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      {/* Backdrop overlay click */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card Container */}
      <div 
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900 transition-all animate-scale-in my-auto relative z-10"
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: currentTheme?.accentPrimary || '#046a38' }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Brand Color & Theme Settings</h3>
              <p className="text-xs text-slate-500">Select your organization's primary brand theme color</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOAST BANNER */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SUB-TABS NAVIGATION */}
        <div className="px-6 pt-3 border-b border-slate-200 flex space-x-2 shrink-0 bg-slate-50">
          <button
            onClick={() => setActiveSubTab('brand')}
            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeSubTab === 'brand'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Brand Colors</span>
          </button>

          <button
            onClick={() => setActiveSubTab('modules')}
            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeSubTab === 'modules'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Per-Module Accents</span>
          </button>

          <button
            onClick={() => setActiveSubTab('custom')}
            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeSubTab === 'custom'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Hex</span>
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* TAB 1: BRAND COLOR SWATCHES */}
          {activeSubTab === 'brand' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Select Brand Color</span>
                <p className="text-xs text-slate-500">Pick a primary brand color to style your header, action buttons, active tabs, and highlights.</p>
              </div>

              {/* COLOR SWATCH ROW WITH CHECKMARKS (MATCHING SCREENSHOT) */}
              <div className="flex flex-wrap items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {colorSwatches.map((swatch) => {
                  const isSelected = activeThemeId === swatch.id && !isModuleThemesEnabled;

                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => {
                        changeTheme(swatch.id);
                        showToast(`Brand color set to ${swatch.name}!`);
                      }}
                      className={`relative w-11 h-11 rounded-xl transition-all flex items-center justify-center shadow-sm hover:scale-110 border-2 ${
                        isSelected ? 'border-slate-900 ring-2 ring-slate-900/20 scale-105' : 'border-white'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CURRENT ACTIVE THEME INFO BOX */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Active Theme</span>
                  <span className="text-xs text-slate-500">{presets[activeThemeId]?.name || 'Custom Theme'}</span>
                </div>
                <div 
                  className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: currentTheme?.accentPrimary || '#046a38' }}
                >
                  Active Accent
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PER-MODULE THEMES */}
          {activeSubTab === 'modules' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Enable Per-Module Brand Colors</h4>
                  <p className="text-[11px] text-slate-500">Assign distinct accent colors when navigating between Admin, Teacher, Accountant, Parent, or Student views.</p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !isModuleThemesEnabled;
                    toggleModuleThemes(nextVal);
                    showToast(nextVal ? 'Per-module themes enabled!' : 'Global brand color restored');
                  }}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${
                    isModuleThemesEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      isModuleThemesEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className={`space-y-2.5 transition-opacity ${isModuleThemesEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {moduleLabels.map((m) => (
                  <div
                    key={m.key}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{m.label}</span>
                      <span className="text-[10px] text-slate-500">{m.desc}</span>
                    </div>

                    <select
                      value={moduleThemes[m.key] || 'forest'}
                      onChange={(e) => {
                        setModuleTheme(m.key, e.target.value);
                        showToast(`Theme for ${m.label} set to ${presets[e.target.value]?.name || e.target.value}`);
                      }}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      {Object.values(presets).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM HEX BUILDER */}
          {activeSubTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Custom Hex Color</h4>

                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">Pick Organization Brand Hex Code</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md hover:opacity-95"
                style={{ backgroundColor: customPrimary }}
              >
                Apply Custom Hex Color
              </button>
            </form>
          )}

        </div>

        {/* MODAL FOOTER WITH LARGE APPLY BUTTON (MATCHING SCREENSHOT) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              resetTheme();
              showToast('Theme reset to Forest Green!');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 transition-all border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-all shadow-md uppercase tracking-wider"
            style={{ backgroundColor: currentTheme?.accentPrimary || '#046a38' }}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
