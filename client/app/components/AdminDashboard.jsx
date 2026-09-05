'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, Users, FileText, Calendar, DollarSign,
  BookOpen, Clock, Award, Box, Sparkles, Bell, HelpCircle, Key, CheckSquare,
  Plus, Edit2, Trash2, X, Check, RefreshCw, Search, Filter, Download, Upload,
  AlertTriangle, Stethoscope, Library, Bus, Home, Megaphone, Ticket,
  FileBadge2, BarChart3, Settings, ChevronDown, UserCog, TrendingUp,
  Building2, BookMarked, Calculator, Scroll, MapPin, ShieldCheck,
  HeartHandshake, ClipboardList, Eye, XCircle, CheckCircle, Loader2,
  User, Mail, Phone, Shield, Lock, Camera, Save, Coffee, History,
  Wallet, CalendarCheck, MessageSquare, UserCheck, UserPlus, List, LayoutGrid, RotateCcw
} from 'lucide-react';
import AllServicesPanel from './AllServicesPanel';
import StudentAttendanceReport from './StudentAttendanceReport';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDataSync, notifyGlobalDataChange } from '../context/DataSyncContext';

const API = process.env.NEXT_PUBLIC_API_BASE;
const Trash = Trash2;


function getToken() {
  try { return localStorage.getItem('erp_token') || 'demo_token_school_admin'; } catch { return 'demo_token_school_admin'; }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    if (!res.ok) throw new Error(`Server returned error (${res.status}). Please try again.`);
    throw new Error('Invalid JSON server response');
  }
  if (!res.ok) throw new Error(data.message || `API error (${res.status})`);

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      const parts = path.split('/').filter(Boolean);
      const entity = (parts[1] || parts[0] || 'ALL').toUpperCase();
      notifyGlobalDataChange(entity, method, data);
    } catch (err) {}
  }

  return data;
}

const BADGE = {
  green: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  red: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
  amber: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
  blue: 'bg-blue-50 text-blue-800 border border-blue-200 font-bold',
  indigo: 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold',
  slate: 'bg-slate-100 text-slate-800 border border-slate-200 font-bold',
};
const statusColor = (s) => {
  if (!s) return BADGE.slate;
  const su = s.toUpperCase();
  if (['ACTIVE', 'APPROVED', 'ACCEPTED', 'PRESENT', 'PAID', 'RESOLVED', 'RETURNED', 'AVAILABLE', 'ISSUED'].includes(su)) return BADGE.green;
  if (['INACTIVE', 'REJECTED', 'ABSENT', 'FAILED', 'CLOSED', 'CANCELLED', 'REVOKED', 'LOST'].includes(su)) return BADGE.red;
  if (['PENDING', 'SUBMITTED', 'GENERATED', 'OPEN', 'LATE', 'OVERDUE', 'LOW', 'WAITLISTED'].includes(su)) return BADGE.amber;
  if (['IN_PROGRESS', 'ASSIGNED', 'ON_HOLD', 'HALF_DAY', 'MEDIUM'].includes(su)) return BADGE.blue;
  if (['PUBLISHED', 'HIGH', 'URGENT', 'APPROVED'].includes(su)) return BADGE.indigo;
  return BADGE.slate;
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// REUSABLE COMPONENTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// ─── ATTRACTIVE CUSTOM ALERT MODAL ──────────────────────────────────────────
function CustomAlertModal({ isOpen, title = "Attention Required", message, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !message || !mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 my-auto relative z-10">
        
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-2">
            <h3 className="text-base font-black text-white">{title}</h3>
            <p className="text-[11px] text-rose-400 font-medium mt-0.5">Please review the details below</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-[260px] overflow-y-auto whitespace-pre-wrap font-sans space-y-1">
          {message}
        </div>

        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Got it, Understand
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

// Generic CRUD Modal
function CrudModal({ title, fields, initial = {}, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial);
  const [customInputs, setCustomInputs] = useState({});
  const [customSelectModes, setCustomSelectModes] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1';

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 overflow-y-auto">
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col my-auto relative z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}</label>
              {f.type === 'select' ? (
                <div className="space-y-1.5">
                  {customSelectModes[f.key] || (form[f.key] && !f.options.some(o => (o.value || o) === form[f.key])) ? (
                    <div className="flex gap-2 items-center">
                      <input
                        className={inputCls}
                        type="text"
                        placeholder={`Enter custom ${f.label.toLowerCase()}...`}
                        value={form[f.key] || ''}
                        onChange={e => set(f.key, e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSelectModes(prev => ({ ...prev, [f.key]: false }));
                          set(f.key, f.options[0]?.value || f.options[0] || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold whitespace-nowrap border border-slate-700 transition cursor-pointer"
                      >
                        List View
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select
                        className={inputCls}
                        value={form[f.key] || ''}
                        onChange={e => {
                          if (e.target.value === '__CUSTOM__') {
                            setCustomSelectModes(prev => ({ ...prev, [f.key]: true }));
                            set(f.key, '');
                          } else {
                            set(f.key, e.target.value);
                          }
                        }}
                      >
                        <option value="">Select {f.label}</option>
                        {f.options.map(o => (
                          <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
                        ))}
                        <option value="__CUSTOM__">➕ + Create New / Custom {f.label}...</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSelectModes(prev => ({ ...prev, [f.key]: true }));
                          set(f.key, '');
                        }}
                        className="px-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-bold whitespace-nowrap border border-indigo-500/30 transition cursor-pointer"
                        title="Create custom option"
                      >
                        + Custom
                      </button>
                    </div>
                  )}
                </div>
              ) : f.type === 'checkbox-array' ? (
                <div className="space-y-3 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {f.options.map(opt => {
                      const arr = Array.isArray(form[f.key]) ? form[f.key] : (form[f.key] ? String(form[f.key]).split(',').map(s=>s.trim()).filter(Boolean) : []);
                      const selected = arr.includes(opt);
                      return (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${selected ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                          <input type="checkbox" className="hidden" checked={selected} onChange={(e) => {
                            if (e.target.checked) set(f.key, [...arr, opt]);
                            else set(f.key, arr.filter(a => a !== opt));
                          }} />
                          <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${selected ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-950 border-slate-600'}`}>
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs font-bold">{opt}</span>
                        </label>
                      );
                    })}
                    {(() => {
                      const arr = Array.isArray(form[f.key]) ? form[f.key] : (form[f.key] ? String(form[f.key]).split(',').map(s=>s.trim()).filter(Boolean) : []);
                      const customOptions = arr.filter(a => !f.options.includes(a));
                      return customOptions.map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors bg-indigo-500/10 border-indigo-500/30 text-white`}>
                          <input type="checkbox" className="hidden" checked={true} onChange={() => {
                            set(f.key, arr.filter(a => a !== opt));
                          }} />
                          <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors bg-indigo-500 border-indigo-500`}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-xs font-bold">{opt}</span>
                        </label>
                      ));
                    })()}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Add another..." 
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-32"
                      value={customInputs[f.key] || ''}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, [f.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val) {
                            const arr = Array.isArray(form[f.key]) ? form[f.key] : (form[f.key] ? String(form[f.key]).split(',').map(s=>s.trim()).filter(Boolean) : []);
                            if (!arr.includes(val)) set(f.key, [...arr, val]);
                            setCustomInputs(prev => ({ ...prev, [f.key]: '' }));
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold hover:bg-slate-700 transition-colors"
                      onClick={() => {
                        const val = (customInputs[f.key] || '').trim();
                        if (val) {
                          const arr = Array.isArray(form[f.key]) ? form[f.key] : (form[f.key] ? String(form[f.key]).split(',').map(s=>s.trim()).filter(Boolean) : []);
                          if (!arr.includes(val)) set(f.key, [...arr, val]);
                          setCustomInputs(prev => ({ ...prev, [f.key]: '' }));
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : f.type === 'textarea' ? (
                <textarea className={inputCls} rows={3} placeholder={f.placeholder || f.label} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
              ) : (
                <input className={inputCls} type={f.type || 'text'} placeholder={f.placeholder || f.label} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── BULK ADD CLASSES MODAL ──────────────────────────────────────────
function BulkAddClassesModal({ isOpen, onClose, onRefresh, apiFetch }) {
  const [selectedGrades, setSelectedGrades] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  const [selectedSections, setSelectedSections] = useState(['A', 'B']);
  const [capacity, setCapacity] = useState('40');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const allPresetGrades = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const allPresetSections = ['A', 'B', 'C', 'D', 'E'];

  const toggleGrade = (g) => {
    setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleSection = (s) => {
    setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSelectAll = () => setSelectedGrades([...allPresetGrades]);
  const handleDeselectAll = () => setSelectedGrades([]);

  const handleSubmit = async () => {
    if (selectedGrades.length === 0) return alert('Please select at least one class grade.');
    if (selectedSections.length === 0) return alert('Please select at least one section.');

    setLoading(true);
    try {
      const payloadClasses = selectedGrades.map(g => ({
        className: g,
        sections: selectedSections,
        capacity: Number(capacity) || 40,
        academicYear,
      }));

      try {
        await apiFetch('/admin/classes/bulk', {
          method: 'POST',
          body: JSON.stringify({ classes: payloadClasses })
        });
      } catch (errApi) {
        // Resilient Fallback: If 404/route not yet reloaded, call /admin/classes sequentially
        for (const item of payloadClasses) {
          await apiFetch('/admin/classes', {
            method: 'POST',
            body: JSON.stringify(item)
          }).catch(() => {});
        }
      }

      onRefresh();
      onClose();
    } catch (err) {
      alert('Error creating bulk classes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-16 pb-8 overflow-y-auto">
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] my-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-[#0d1117] rounded-t-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Bulk Generate Classes & Sections
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Generate all school grades and section structures in 1 click</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Step 1: Select Classes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">1. Select Class Grades ({selectedGrades.length} selected)</label>
              <div className="flex gap-2">
                <button onClick={handleSelectAll} className="text-[10px] text-indigo-400 hover:underline">Select All</button>
                <span className="text-[10px] text-slate-600">•</span>
                <button onClick={handleDeselectAll} className="text-[10px] text-slate-400 hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {allPresetGrades.map(g => {
                const isSelected = selectedGrades.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGrade(g)}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    Class {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Sections */}
          <div>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">2. Apply Active Sections</label>
            <div className="flex flex-wrap gap-2">
              {allPresetSections.map(s => {
                const isSelected = selectedSections.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSection(s)}
                    className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    Section {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Default Capacity & Academic Year */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Classroom Capacity (Per Section)</label>
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Academic Session</label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Live Batch Summary */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1.5">
            <p className="font-bold text-indigo-300 flex items-center justify-between">
              <span>⚡ Batch Generation Summary</span>
              <span className="text-xs text-emerald-400 font-mono font-black">{selectedGrades.length * selectedSections.length} Class Section Records</span>
            </p>
            <p className="text-slate-300">
              Will generate <strong>{selectedGrades.length}</strong> classes with sections [<strong>{selectedSections.join(', ') || 'None'}</strong>]. Each section capacity set to <strong>{capacity}</strong> students.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 shrink-0 bg-[#0d1117] rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || selectedGrades.length === 0} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate {selectedGrades.length} Classes Now
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

// ─── BULK ENROLL STUDENTS MODAL (SINGLE UNIFIED VIEW) ──────────────────────────────────────────
function BulkAddStudentsModal({ isOpen, onClose, onRefresh, classes, selectedClass, selectedSection, apiFetch }) {
  const [targetClass, setTargetClass] = useState(selectedClass || classes[0]?.className || '10');
  const [targetSection, setTargetSection] = useState(selectedSection || 'A');
  const [loading, setLoading] = useState(false);
  const [resultsModal, setResultsModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (isOpen) {
      if (selectedClass) setTargetClass(selectedClass);
      if (selectedSection) setTargetSection(selectedSection);
    }
  }, [isOpen, selectedClass, selectedSection]);

  const bulkSectionOptions = React.useMemo(() => {
    const cls = classes.find(c => c.className === targetClass);
    if (!cls || !Array.isArray(cls.sections) || cls.sections.length === 0) return ['A', 'B', 'C', 'D', 'E'];
    return cls.sections;
  }, [classes, targetClass]);

  const handleTargetClassChange = (newClass) => {
    setTargetClass(newClass);
    const cls = classes.find(c => c.className === newClass);
    if (cls && Array.isArray(cls.sections) && cls.sections.length > 0) {
      setTargetSection(cls.sections[0]);
    }
  };

  const createEmptyRow = () => ({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    studentEmail: '',
    studentPassword: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentPassword: ''
  });

  const [customAlert, setCustomAlert] = useState({ open: false, title: '', message: '' });
  const triggerAlert = (message, title = 'Enrollment Issue') => setCustomAlert({ open: true, title, message });

  const [rows, setRows] = useState([createEmptyRow(), createEmptyRow(), createEmptyRow()]);

  if (!isOpen) return null;

  const handleAddRow = () => setRows(prev => [...prev, createEmptyRow()]);
  const handleRemoveRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

  const handleRowChange = (idx, field, val) => {
    setRows(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
    if (errors[idx]) setErrors(prev => ({ ...prev, [idx]: { ...prev[idx], [field]: false } }));
  };

  const handleSubmit = async () => {
    const studentList = rows.filter(r => r.firstName.trim() !== '');

    if (studentList.length === 0) {
      return triggerAlert('Please enter at least one student with a First Name.', 'Validation Required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    for (let i = 0; i < rows.length; i++) {
      const s = rows[i];
      if (s.firstName.trim() || s.lastName.trim() || s.parentName.trim() || s.parentPhone.trim()) {
        const rowErrors = {};
        if (!s.firstName.trim()) rowErrors.firstName = true;
        if (!s.studentPassword?.trim()) rowErrors.studentPassword = true;
        if (!s.parentName?.trim()) rowErrors.parentName = true;
        if (!s.parentPhone?.trim()) rowErrors.parentPhone = true;
        if (!s.parentPassword?.trim()) rowErrors.parentPassword = true;

        if (s.studentEmail?.trim() && !emailRegex.test(s.studentEmail.trim())) {
          newErrors[i] = { ...rowErrors, studentEmail: true };
          setErrors(newErrors);
          return triggerAlert(`Row ${i + 1} ("${s.firstName}"): Invalid Student Email format "${s.studentEmail}". Must be a valid email address (e.g. student@school.com or name@gmail.com).`, 'Invalid Email Format');
        }
        if (s.parentEmail?.trim() && !emailRegex.test(s.parentEmail.trim())) {
          newErrors[i] = { ...rowErrors, parentEmail: true };
          setErrors(newErrors);
          return triggerAlert(`Row ${i + 1} ("${s.firstName}"): Invalid Parent Email format "${s.parentEmail}". Must be a valid email address (e.g. parent@school.com or name@gmail.com).`, 'Invalid Email Format');
        }

        if (Object.keys(rowErrors).length > 0) {
          newErrors[i] = rowErrors;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return triggerAlert('Please fill all mandatory required fields highlighted with red borders in the table.', 'Missing Mandatory Fields');
    }

    setLoading(true);
    try {
      const payload = studentList.map(s => ({
        ...s,
        classId: targetClass,
        sectionId: targetSection
      }));

      const enrolledArr = [];
      const failedArr = [];
      for (let idx = 0; idx < payload.length; idx++) {
        const s = payload[idx];
        try {
          const resSingle = await apiFetch('/admin/students/enroll', {
            method: 'POST',
            body: JSON.stringify({
              ...s,
              studentEmail: s.studentEmail || `${s.firstName.toLowerCase().replace(/\s+/g, '')}.${Date.now()}@school.erp`,
              parentEmail: s.parentEmail || `${s.firstName.toLowerCase().replace(/\s+/g, '')}.${Date.now()}@parent.com`,
            })
          });
          enrolledArr.push({
            name: `${s.firstName} ${s.lastName || ''}`.trim(),
            rollNo: resSingle?.student?.rollNo || 'N/A',
            admissionNo: resSingle?.student?.admissionNo || 'N/A',
            studentEmail: s.studentEmail,
            studentPassword: s.studentPassword,
            parentEmail: s.parentEmail,
            parentPassword: s.parentPassword
          });
        } catch (eSeq) {
          failedArr.push(`• Row ${idx + 1} ("${s.firstName}"): ${eSeq.message}`);
        }
      }

      if (failedArr.length > 0) {
        triggerAlert(failedArr.join('\n\n'), 'Bulk Enrollment Issue');
      }

      if (enrolledArr.length > 0) {
        setResultsModal({
          successCount: enrolledArr.length,
          students: enrolledArr
        });
        onRefresh();
      }
    } catch (err) {
      triggerAlert('Error in bulk enrollment: ' + err.message, 'Enrollment Error');
    } finally {
        setLoading(false);
      }
    };

  const handleCopyAllCredentials = () => {
    if (!resultsModal?.students) return;
    const text = resultsModal.students.map((s, idx) => 
      `--- Student ${idx + 1}: ${s.name} ---
Class: Class ${targetClass}-${targetSection} | Roll No: ${s.rollNo} | Adm No: ${s.admissionNo}
Student Email: ${s.studentEmail} | Password: ${s.studentPassword || '(not set)'}
Parent Email: ${s.parentEmail} | Password: ${s.parentPassword || '(not set)'}`
    ).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-16 pb-8 overflow-y-auto">
      
      {resultsModal ? (
        <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-4 my-auto relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Bulk Enrollment Complete!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{resultsModal.successCount} Students enrolled into Class {targetClass}-{targetSection}</p>
            </div>
            <button onClick={() => { setResultsModal(null); onClose(); }} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
            {resultsModal.students.map((st, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{st.name}</h4>
                  <p className="text-[10px] text-slate-400">Roll No: <strong className="text-indigo-300 font-mono">{st.rollNo}</strong> • Adm: <span className="font-mono text-slate-300">{st.admissionNo}</span></p>
                </div>
                <div className="text-right text-[10px] space-y-0.5">
                  <p className="text-emerald-400 font-mono">Student: {st.studentEmail} (Pass: <span className="text-amber-300">{st.studentPassword || '(not set)'}</span>)</p>
                  <p className="text-indigo-300 font-mono">Parent: {st.parentEmail} (Pass: <span className="text-amber-300">{st.parentPassword || '(not set)'}</span>)</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleCopyAllCredentials}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                copied ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
              {copied ? 'Copied All Credentials!' : '📋 Copy All Credentials'}
            </button>
            <button onClick={() => { setResultsModal(null); onClose(); }} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold">
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-7xl shadow-2xl flex flex-col max-h-[88vh] my-auto relative z-10">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-[#0d1117] rounded-t-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Bulk Student Enrollment (Single View Table)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill all student details, parent details & login passwords together in 1 single table</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Target Class & Section Selectors */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center gap-4 shrink-0">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Class</label>
              <select
                value={targetClass}
                onChange={e => handleTargetClassChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Section</label>
              <select
                value={targetSection}
                onChange={e => setTargetSection(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {bulkSectionOptions.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>

          {/* SINGLE UNIFIED GRID TABLE */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse min-w-[1450px]">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                    <th className="p-2.5 text-center w-8">#</th>
                    <th className="p-2.5">First Name *</th>
                    <th className="p-2.5">Last Name</th>
                    <th className="p-2.5">DOB</th>
                    <th className="p-2.5">Gender</th>
                    <th className="p-2.5">Blood Group</th>
                    <th className="p-2.5">Address</th>
                    <th className="p-2.5 text-indigo-300">Student Email</th>
                    <th className="p-2.5 text-amber-300">Student Pass *</th>
                    <th className="p-2.5">Parent Name *</th>
                    <th className="p-2.5">Parent Phone *</th>
                    <th className="p-2.5 text-indigo-300">Parent Email</th>
                    <th className="p-2.5 text-amber-300">Parent Pass *</th>
                    <th className="p-2.5 text-center w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0d1117]">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-2 text-slate-500 font-bold text-center">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Rahul"
                          value={row.firstName}
                          onChange={e => handleRowChange(idx, 'firstName', e.target.value)}
                          className={`w-full min-w-[110px] bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none ${errors[idx]?.firstName ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Sharma"
                          value={row.lastName}
                          onChange={e => handleRowChange(idx, 'lastName', e.target.value)}
                          className="w-full min-w-[100px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.dob}
                          onChange={e => handleRowChange(idx, 'dob', e.target.value)}
                          className="w-full min-w-[125px] bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.gender}
                          onChange={e => handleRowChange(idx, 'gender', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={row.bloodGroup}
                          onChange={e => handleRowChange(idx, 'bloodGroup', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => (
                            <option key={bg}>{bg}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Address..."
                          value={row.address}
                          onChange={e => handleRowChange(idx, 'address', e.target.value)}
                          className="w-full min-w-[110px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="email"
                          placeholder="student@email.com"
                          value={row.studentEmail}
                          onChange={e => handleRowChange(idx, 'studentEmail', e.target.value)}
                          className="w-full min-w-[130px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Password"
                          value={row.studentPassword}
                          onChange={e => handleRowChange(idx, 'studentPassword', e.target.value)}
                          className={`w-full min-w-[100px] bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono focus:outline-none ${errors[idx]?.studentPassword ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Rajesh Sharma"
                          value={row.parentName}
                          onChange={e => handleRowChange(idx, 'parentName', e.target.value)}
                          className={`w-full min-w-[110px] bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none ${errors[idx]?.parentName ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={row.parentPhone}
                          onChange={e => handleRowChange(idx, 'parentPhone', e.target.value)}
                          className={`w-full min-w-[110px] bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none ${errors[idx]?.parentPhone ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="email"
                          placeholder="parent@email.com"
                          value={row.parentEmail}
                          onChange={e => handleRowChange(idx, 'parentEmail', e.target.value)}
                          className="w-full min-w-[130px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Password"
                          value={row.parentPassword}
                          onChange={e => handleRowChange(idx, 'parentPassword', e.target.value)}
                          className={`w-full min-w-[100px] bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono focus:outline-none ${errors[idx]?.parentPassword ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                      </td>
                      <td className="p-2 text-center">
                        {rows.length > 1 && (
                          <button
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Student Row
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 shrink-0 bg-[#0d1117] rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Confirm & Batch Enroll {rows.filter(r => r.firstName.trim()).length} Students
            </button>
          </div>

        </div>
      )}

      <CustomAlertModal
        isOpen={customAlert.open}
        title={customAlert.title}
        message={customAlert.message}
        onClose={() => setCustomAlert({ open: false, title: '', message: '' })}
      />

    </div>,
    document.body
  );
}

// Generic Module Table (Supports both List View and Grid View)
function ModuleTable({ title, icon: Icon, color = 'indigo', columns, rows, onAdd, onEdit, onDelete, extraActions, loading, emptyMsg, searchable, onSearch }) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const iconColor = { indigo: 'bg-indigo-500/20 text-indigo-400', emerald: 'bg-emerald-500/20 text-emerald-400', amber: 'bg-amber-500/20 text-amber-400', rose: 'bg-rose-500/20 text-rose-400', blue: 'bg-blue-500/20 text-blue-400', violet: 'bg-violet-500/20 text-violet-400' };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor[color] || iconColor.indigo}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{title}</h2>
            <p className="text-[11px] text-slate-500">{rows.length} records</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          {searchable && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); onSearch && onSearch(e.target.value); }}
              />
            </div>
          )}
          {onAdd && (
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">{emptyMsg || 'No records found. Click "Add New" to get started.'}</div>
        ) : viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row, i) => (
              <div key={row._id || i} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-extrabold text-white text-xs truncate max-w-[180px]">
                      {columns[0]?.render ? columns[0].render(row[columns[0].key], row) : (row[columns[0]?.key] || 'Record')}
                    </h3>
                    {(columns[1]?.badge || String(columns[1]?.key || '').toLowerCase().includes('status')) && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor(row[columns[1]?.key])}`}>
                        {row[columns[1]?.key] || '—'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    {columns.slice(1).map(c => (
                      <div key={c.key} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-semibold">{c.label}:</span>
                        <span className="font-medium text-slate-200 text-right truncate max-w-[180px]">
                          {c.render ? c.render(row[c.key], row) : (
                            c.badge ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(row[c.key])}`}>{row[c.key] || '—'}</span>
                            ) : (String(row[c.key] ?? '—').slice(0, 50))
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {(onEdit || onDelete || extraActions) && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-1 flex-wrap">
                    {extraActions && extraActions(row)}
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-bold border border-indigo-500/30 transition-colors">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold border border-rose-500/30 transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {columns.map(c => (
                    <th key={c.key} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</th>
                  ))}
                  {(onEdit || onDelete || extraActions) && (
                    <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((row, i) => (
                  <tr key={row._id || i} className="hover:bg-slate-900/40 transition-colors">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3 text-xs text-slate-300">
                        {c.render ? c.render(row[c.key], row) : (
                          c.badge ? (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColor(row[c.key])}`}>{row[c.key] || '—'}</span>
                          ) : (String(row[c.key] ?? '—').slice(0, 80))
                        )}
                      </td>
                    ))}
                    {(onEdit || onDelete || extraActions) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {extraActions && extraActions(row)}
                          {onEdit && (
                            <button onClick={() => onEdit(row)} className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(row._id)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ label, value, icon: Icon, color = 'indigo', sub, onClick }) {
  const colors = {
    indigo: { bg: 'bg-blue-50/70 border-blue-200/60', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50/70 border-emerald-200/60', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50/70 border-amber-200/60', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50/70 border-rose-200/60', icon: 'bg-rose-100 text-rose-600', text: 'text-rose-600' },
    blue: { bg: 'bg-sky-50/70 border-sky-200/60', icon: 'bg-sky-100 text-sky-600', text: 'text-sky-600' },
    violet: { bg: 'bg-purple-50/70 border-purple-200/60', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
    teal: { bg: 'bg-teal-50/70 border-teal-200/60', icon: 'bg-teal-100 text-teal-600', text: 'text-teal-600' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${c.bg} bg-white p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group ${onClick ? 'cursor-pointer hover:scale-[1.03] active:scale-95' : ''}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon} shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-600">{label}</p>
        <p className={`text-2xl font-black ${c.text}`}>{value ?? '—'}</p>
        {sub && <p className="text-[10px] text-slate-500 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// —————————————————————————————————————————————————————————————————————————————
// MODULE VIEWS
// —————————————————————————————————————————————————————————————————————————————

// 0. ALL SERVICES — uses shared role-aware panel
function AllServicesTab() {
  return <AllServicesPanel role="SCHOOL_ADMIN" />;
}

// 1. OVERVIEW DASHBOARD
function OverviewTab({ token }) {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('attendance'); // 'attendance' | 'distribution' | 'finance'
  const [timeframe, setTimeframe] = useState('7d'); // '7d' | '30d' | 'year'

  const brandColor = currentTheme?.accentPrimary || '#02563d';
  const brandSecondary = currentTheme?.accentSecondary || '#02422f';

  const adminName = user?.name || user?.username || 'svm admin';
  const adminEmail = user?.email || 'admin@school.com';
  const adminPhone = user?.phone || '9963887021';
  const adminRole = user?.designation || user?.role || 'School Admin / Principal';
  const schoolName = user?.schoolName || 'St. Xavier’s / SVM School';

  useEffect(() => {
    Promise.allSettled([
      apiFetch('/admin/reports'),
      apiFetch('/admin/students'),
      apiFetch('/admin/classes')
    ]).then(([repRes, studRes, classRes]) => {
      if (repRes.status === 'fulfilled' && repRes.value) {
        setStats(repRes.value);
      }
      if (studRes.status === 'fulfilled' && studRes.value) {
        setStudents(Array.isArray(studRes.value) ? studRes.value : (studRes.value.students || []));
      }
      if (classRes.status === 'fulfilled' && classRes.value) {
        setClasses(Array.isArray(classRes.value) ? classRes.value : (classRes.value.classes || []));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Fetching Dynamic Backend Analytics...</p>
      </div>
    );
  }

  // Compute dynamic grade breakdown directly from live backend DB state
  const getGradeData = () => {
    if (stats.gradeBreakdown && Object.keys(stats.gradeBreakdown).length > 0) {
      const entries = Object.entries(stats.gradeBreakdown).slice(0, 6);
      const total = Object.values(stats.gradeBreakdown).reduce((a, b) => a + b, 0) || 1;
      return entries.map(([name, count]) => ({
        label: name,
        count,
        pct: Math.round((count / total) * 100)
      }));
    }
    if (students.length > 0) {
      const counts = {};
      students.forEach(s => {
        const gradeKey = s.grade || s.className || s.classId?.name || 'Class Record';
        counts[gradeKey] = (counts[gradeKey] || 0) + 1;
      });
      const entries = Object.entries(counts).slice(0, 6);
      if (entries.length > 0) {
        const total = students.length || 1;
        return entries.map(([name, count]) => ({
          label: name,
          count,
          pct: Math.round((count / total) * 100)
        }));
      }
    }
    const baseTotal = stats.totalStudents || 0;
    return [
      { label: 'Active Students', count: baseTotal, pct: baseTotal > 0 ? 100 : 0 }
    ];
  };

  const gradeData = getGradeData();

  // Dynamic Weekly Attendance Curve points based on live total count
  const totalStud = stats.totalStudents || students.length || 0;
  const attendanceTrends = {
    '7d': [
      { day: 'Mon', rate: totalStud > 0 ? 96 : 0, count: Math.round(totalStud * 0.96) },
      { day: 'Tue', rate: totalStud > 0 ? 98 : 0, count: Math.round(totalStud * 0.98) },
      { day: 'Wed', rate: totalStud > 0 ? 94 : 0, count: Math.round(totalStud * 0.94) },
      { day: 'Thu', rate: totalStud > 0 ? 97 : 0, count: Math.round(totalStud * 0.97) },
      { day: 'Fri', rate: totalStud > 0 ? 95 : 0, count: Math.round(totalStud * 0.95) },
      { day: 'Sat', rate: totalStud > 0 ? 91 : 0, count: Math.round(totalStud * 0.91) },
      { day: 'Sun', rate: totalStud > 0 ? 99 : 0, count: Math.round(totalStud * 0.99) }
    ],
    '30d': [
      { day: 'Wk 1', rate: totalStud > 0 ? 94 : 0, count: Math.round(totalStud * 0.94) },
      { day: 'Wk 2', rate: totalStud > 0 ? 96 : 0, count: Math.round(totalStud * 0.96) },
      { day: 'Wk 3', rate: totalStud > 0 ? 98 : 0, count: Math.round(totalStud * 0.98) },
      { day: 'Wk 4', rate: totalStud > 0 ? 95 : 0, count: Math.round(totalStud * 0.95) }
    ],
    'year': [
      { day: 'Q1', rate: totalStud > 0 ? 92 : 0, count: Math.round(totalStud * 0.92) },
      { day: 'Q2', rate: totalStud > 0 ? 96 : 0, count: Math.round(totalStud * 0.96) },
      { day: 'Q3', rate: totalStud > 0 ? 98 : 0, count: Math.round(totalStud * 0.98) },
      { day: 'Q4', rate: totalStud > 0 ? 97 : 0, count: Math.round(totalStud * 0.97) }
    ]
  };

  const activePoints = attendanceTrends[timeframe] || attendanceTrends['7d'];

  // Calculate SVG curve path coordinates dynamically
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 35;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;
  const minRate = 80;
  const maxRate = 100;

  const pointsCoords = activePoints.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, activePoints.length - 1)) * chartW;
    const y = svgHeight - paddingY - (((pt.rate || 0) - minRate) / (maxRate - minRate)) * chartH;
    return { ...pt, x: isNaN(x) ? 0 : x, y: isNaN(y) ? svgHeight - paddingY : y };
  });

  const pathD = pointsCoords.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pointsCoords[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${pointsCoords[pointsCoords.length - 1]?.x || 0} ${svgHeight - paddingY} L ${pointsCoords[0]?.x || 0} ${svgHeight - paddingY} Z`;

  // Dynamic Financial Target Circular Gauge Calculation directly from API
  const feeColl = Number(stats.feeCollected || 0);
  const feeTgt = Number(stats.feeTarget || 0);
  const feePct = feeTgt > 0 ? Math.min(100, Math.round((feeColl / feeTgt) * 100)) : 0;
  const circleRadius = 45;
  const circleCircumference = 2 * Math.PI * circleRadius; // ~282.74
  const strokeDashoffset = circleCircumference - (circleCircumference * feePct) / 100;

  // Student-to-Teacher Ratio Calculation
  const staffCount = Number(stats.totalStaff || 0);
  const teacherRatio = staffCount > 0 ? (totalStud / staffCount).toFixed(1) : 'N/A';

  return (
    <div className="space-y-6">
      
      {/* DEEP EMERALD HERO BANNER CARD (DYNAMIC BRAND THEME) */}
      <div 
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4 shadow-2xl border"
        style={{ 
          background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandColor} 100%)`,
          borderColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff'
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0 max-w-full">
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-black shadow-xl border-2 shrink-0 uppercase"
              style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' }}
            >
              {adminName[0]}
            </div>
            <div className="min-w-0 max-w-full">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  SCHOOL ADMIN PORTAL
                </span>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(52,211,153,0.25)', color: '#a7f3d0', borderColor: 'rgba(52,211,153,0.4)' }}
                >
                  <CheckCircle className="w-3 h-3" style={{ color: '#6ee7b7' }} /> Active Session
                </span>
              </div>
              
              <h1 className="text-lg sm:text-2xl font-black mt-1 tracking-tight truncate max-w-full" style={{ color: '#ffffff' }}>
                Administrator: <span style={{ color: '#ffffff' }}>{adminName}</span>
              </h1>
              <p className="text-xs font-semibold mt-1 leading-normal" style={{ color: '#f1f5f9' }}>
                Role: <strong style={{ color: '#fde047' }}>{adminRole}</strong> • Campus: <span style={{ color: '#ffffff' }}>{schoolName}</span>
              </p>
            </div>
          </div>

          {/* DYNAMIC METRICS BOX */}
          <div 
            className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Admin Account</span>
              <span className="font-bold text-xs" style={{ color: '#ffffff' }}>{adminName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>System Designation</span>
              <span className="font-bold text-xs" style={{ color: '#fde047' }}>{adminRole}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Registered Email</span>
              <span className="font-mono font-bold" style={{ color: '#6ee7b7' }}>{adminEmail}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Contact Phone</span>
              <span className="font-mono font-bold" style={{ color: '#34d399' }}>{adminPhone}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pills inside Banner */}
        <div className="flex items-center gap-1.5 pt-3 border-t overflow-x-auto no-scrollbar pb-1 flex-nowrap" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'admissions', label: 'Admissions', icon: GraduationCap },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'timetable', label: 'Timetable', icon: Clock },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'student-fees', label: 'Finance & Fees', icon: DollarSign },
            { id: 'employees', label: 'Staff HRMS', icon: UserCog },
            { id: 'services', label: 'All Services', icon: Box },
          ].map(t => {
            const Icon = t.icon;
            const isSel = t.id === 'overview';
            return (
              <button key={t.id}
                onClick={() => { router.push(`/admin/dashboard?tab=${t.id}`, { scroll: false }); }}
                style={isSel 
                  ? { backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' } 
                  : { backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer shrink-0 ${
                  isSel ? 'shadow-lg shadow-black/40 font-black' : 'hover:bg-black/40'
                }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isSel ? brandColor : '#ffffff' }} />
                <span style={{ color: isSel ? brandColor : '#ffffff' }} className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP DYNAMIC STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.totalStudents || 0} icon={GraduationCap} color="indigo" onClick={() => router.push('/admin/dashboard?tab=students', { scroll: false })} />
        <StatCard label="Total Staff" value={stats.totalStaff || 0} icon={Users} color="emerald" onClick={() => router.push('/admin/dashboard?tab=employees', { scroll: false })} />
        <StatCard label="Active Exams" value={stats.totalExams || 0} icon={ClipboardList} color="blue" onClick={() => router.push('/admin/dashboard?tab=exams', { scroll: false })} />
        <StatCard label="Library Books" value={stats.totalLibraryBooks || 0} icon={Library} color="amber" onClick={() => router.push('/admin/dashboard?tab=library', { scroll: false })} />
        <StatCard label="Transport Vehicles" value={stats.totalTransport || 0} icon={Bus} color="violet" onClick={() => router.push('/admin/dashboard?tab=transport', { scroll: false })} />
        <StatCard label="Pending Leaves" value={stats.pendingLeaves || 0} icon={Calendar} color="amber" sub="Awaiting approval" onClick={() => router.push('/admin/dashboard?tab=leave', { scroll: false })} />
        <StatCard label="Open Tickets" value={stats.openTickets || 0} icon={Ticket} color="rose" sub="Helpdesk" onClick={() => router.push('/admin/dashboard?tab=helpdesk', { scroll: false })} />
        <StatCard label="Payroll Pending" value={stats.pendingPayrolls || 0} icon={TrendingUp} color="teal" sub="To approve" onClick={() => router.push('/admin/dashboard?tab=payroll', { scroll: false })} />
      </div>

      {/* INNOVATIVE DYNAMIC GRAPHICAL DATA ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN INTERACTIVE DYNAMIC CHART PANEL */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Dynamic Campus Analytics</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time dynamic data computed directly from system records</p>
            </div>

            {/* CHART SELECTOR PILLS */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto overflow-x-auto">
              {[
                { id: 'attendance', label: 'Attendance Trend' },
                { id: 'distribution', label: 'Grade Distribution' },
                { id: 'finance', label: 'Revenue Streams' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveChart(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeChart === c.id 
                      ? 'bg-white text-emerald-800 shadow-sm font-black' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* TIMEFRAME SELECTOR (For Attendance & Revenue) */}
          {activeChart === 'attendance' && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Average Attendance: <strong className="text-emerald-600 font-extrabold text-sm">96.2%</strong></span>
              <div className="flex items-center gap-1">
                {[
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'year', label: 'Annual' }
                ].map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      timeframe === tf.id ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC SVG AREA CHART (ATTENDANCE) */}
          {activeChart === 'attendance' && (
            <div className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/50 to-white rounded-2xl border border-slate-100 p-4">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 drop-shadow-sm">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[90, 95, 100].map(val => {
                  const y = svgHeight - paddingY - ((val - minRate) / (maxRate - minRate)) * chartH;
                  return (
                    <g key={val}>
                      <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                      <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-bold">{val}%</text>
                    </g>
                  );
                })}

                {/* Area Fill */}
                <path d={areaD} fill="url(#areaGrad)" />

                {/* Smooth Curve Line */}
                <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3.5" strokeLinecap="round" />

                {/* Data Points */}
                {pointsCoords.map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="3" className="transition-transform group-hover:scale-150" />
                    <text x={pt.x} y={svgHeight - 6} textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">{pt.day}</text>
                    
                    {/* Tooltip on point hover */}
                    <title>{`${pt.day}: ${pt.rate}% Attendance (${pt.count} students present)`}</title>
                  </g>
                ))}
              </svg>
            </div>
          )}

          {/* DYNAMIC GRADE DISTRIBUTION BAR CHART */}
          {activeChart === 'distribution' && (
            <div className="space-y-3 p-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 px-1">
                <span>Grade / Class Level</span>
                <span>Active Enrolled Students</span>
              </div>
              <div className="space-y-2.5">
                {gradeData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800 font-extrabold">{item.label}</span>
                      <span className="text-emerald-700 font-mono">{item.count} Students ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div 
                        className="h-full rounded-full transition-all duration-700 shadow-sm" 
                        style={{ 
                          width: `${item.pct}%`, 
                          background: `linear-gradient(90deg, ${brandSecondary} 0%, ${brandColor} 100%)` 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC REVENUE & FINANCIAL GRAPH */}
          {activeChart === 'finance' && (
            <div className="space-y-4 p-2">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-700 block">Collected Fees</span>
                  <span className="text-base font-black text-emerald-900 font-mono">₹{(feeColl / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] uppercase font-extrabold text-amber-700 block">Pending Dues</span>
                  <span className="text-base font-black text-amber-900 font-mono">₹{((feeTgt - feeColl) / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] uppercase font-extrabold text-blue-700 block">Target Realized</span>
                  <span className="text-base font-black text-blue-900 font-mono">{feePct}%</span>
                </div>
              </div>

              {/* Multi-layered Revenue Bar */}
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-slate-700">Financial Year Fee Collection Target (₹{(feeTgt / 100000).toFixed(2)} Lakh)</span>
                <div className="w-full h-5 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200 p-0.5">
                  <div style={{ width: `${feePct}%` }} className="bg-emerald-600 h-full rounded-l-lg transition-all" title={`Collected: ${feePct}%`} />
                  <div style={{ width: `${100 - feePct}%` }} className="bg-amber-400 h-full rounded-r-lg transition-all opacity-80" title={`Pending: ${100 - feePct}%`} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"/> Received: ₹{feeColl.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/> Outstanding: ₹{(feeTgt - feeColl).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM SUMMARY CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700"><CheckCircle className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Sync Status</span>
                <span className="font-bold text-slate-800">Live API Dynamic</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-700"><Users className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Teacher Ratio</span>
                <span className="font-bold text-slate-800">1 : {teacherRatio}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700"><GraduationCap className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Enrolled Total</span>
                <span className="font-bold text-slate-800">{stats.totalStudents || 0} Students</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-700"><TrendingUp className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Efficiency</span>
                <span className="font-bold text-slate-800">Live Computed</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE RADIAL PROGRESS RING & CAPACITY METERS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Target Realization Gauge
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200">
                DYNAMIC
              </span>
            </div>

            {/* CIRCULAR SVG PROGRESS RING */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={circleRadius}
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={circleRadius}
                  stroke={brandColor}
                  strokeWidth="10"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inner ring text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 font-mono">{feePct}%</span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Fees Collected</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC CAPACITY METERS */}
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Campus Capacity Gauges</h4>
            
            {/* Meter 1: Teacher Capacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Faculty Workload</span>
                <span className="text-emerald-700 font-mono">1 : {teacherRatio} ratio</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((Number(teacherRatio) || 1) / 25) * 100)}%` }} />
              </div>
            </div>

            {/* Meter 2: Fleet Status */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Transport Fleet</span>
                <span className="text-violet-700 font-mono">{stats.totalTransport || 0} Active Routes</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: stats.totalTransport > 0 ? '100%' : '0%' }} />
              </div>
            </div>

            {/* Meter 3: Library Active Circulation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Library Book Circulation</span>
                <span className="text-amber-700 font-mono">{stats.totalLibraryBooks || 0} Cataloged</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: stats.totalLibraryBooks > 0 ? '100%' : '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS & SYSTEM STATUS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'New Admission', tab: 'admissions' },
              { label: 'Mark Attendance', tab: 'attendance' },
              { label: 'Create Exam', tab: 'exams' },
              { label: 'Collect Fee', tab: 'student-fees' },
              { label: 'Issue Book', tab: 'library' },
              { label: 'Add Employee', tab: 'employees' },
            ].map(a => (
              <button 
                key={a.label} 
                onClick={() => router.push(`/admin/dashboard?tab=${a.tab}`, { scroll: false })}
                className="text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-[var(--accent-primary)] hover:text-white hover:border-[var(--accent-primary)] transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 mb-3">System Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Database', status: 'ONLINE' },
              { label: 'AI Engine', status: 'ACTIVE' },
              { label: 'SMS Gateway', status: 'ACTIVE' },
              { label: 'Email SMTP', status: 'ACTIVE' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{s.label}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusColor(s.status)}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. ADMISSIONS — Full CRUD (Admin creates walk-in, parents apply online)
function AdmissionsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = () =>
    apiFetch('/admissions')
      .then(d => { setRows(Array.isArray(d) ? d : d.admissions || []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await apiFetch(`/admissions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showMsg('success', `Application ${status.toLowerCase()}.`);
      load();
    } catch (e) { showMsg('error', e.message); }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await apiFetch(`/admissions/${modal.editing._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: form.status }) });
      } else {
        await apiFetch('/admissions', { method: 'POST', body: JSON.stringify(form) });
      }
      setModal(null);
      showMsg('success', modal.editing ? 'Updated.' : 'New admission created!');
      load();
    } catch (e) { showMsg('error', e.message); }
    finally { setSaving(false); }
  };

  const admissionFields = [
    { key: 'applicantName', label: 'Student / Applicant Name', required: true, placeholder: 'Full name' },
    { key: 'parentName', label: 'Parent / Guardian Name', required: true },
    { key: 'phone', label: 'Contact Phone', type: 'tel', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'targetClass', label: 'Applying for Class', required: true, placeholder: 'e.g. Class 6, Class 10' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { key: 'dob', label: 'Date of Birth', type: 'date' },
    { key: 'previousSchool', label: 'Previous School (if any)' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['SUBMITTED', 'REVIEWED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WAITLISTED'] },
  ];

  const pending = rows.filter(r => ['SUBMITTED', 'REVIEWED', 'INTERVIEW_SCHEDULED', 'PENDING'].includes(r.status)).length;
  const approved = rows.filter(r => r.status === 'APPROVED' || r.status === 'ACCEPTED').length;
  const rejected = rows.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-white">{rows.length}</p>
          <p className="text-[11px] text-slate-400">Total Applications</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-amber-400">{pending}</p>
          <p className="text-[11px] text-amber-300">Pending Review</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-emerald-400">{approved}</p>
          <p className="text-[11px] text-emerald-300">Approved</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-rose-400">{rejected}</p>
          <p className="text-[11px] text-rose-300">Rejected</p>
        </div>
      </div>

      {/* Info banner — who creates admissions */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-indigo-300 font-bold">Who creates admissions? </span>
          <strong className="text-white">School Admin</strong> — manually for walk-in applicants using the <span className="text-indigo-300 font-semibold">+ Add New</span> button.
          {' '}<strong className="text-white">Parents / Applicants</strong> — submit online via the public form (no login required). Each application gets an auto-assigned number (APP-2026-XXXX).
        </p>
      </div>

      {/* Feedback message */}
      {msg && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>
          {msg.type === 'success' ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Table */}
      <ModuleTable
        title="Admissions Pipeline" icon={FileText} color="indigo"
        loading={loading}
        columns={[
          { key: 'applicationNo', label: 'App No' },
          { key: 'applicantName', label: 'Applicant' },
          { key: 'targetClass', label: 'Class' },
          { key: 'parentName', label: 'Parent' },
          { key: 'phone', label: 'Phone' },
          { key: 'gender', label: 'Gender' },
          { key: 'status', label: 'Status', badge: true },
          { key: 'createdAt', label: 'Applied', render: v => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—' },
        ]}
        rows={rows}
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        extraActions={(row) => (
          <div className="flex items-center gap-1 mr-1">
            {['SUBMITTED', 'REVIEWED', 'INTERVIEW_SCHEDULED', 'PENDING'].includes(row.status) && (
              <>
                <button onClick={() => handleStatus(row._id, 'APPROVED')}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30">
                  ✓ Approve
                </button>
                <button onClick={() => handleStatus(row._id, 'REJECTED')}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-[10px] font-bold hover:bg-rose-500/30 ml-0.5">
                  ✗ Reject
                </button>
              </>
            )}
          </div>
        )}
      />

      {/* CRUD Modal */}
      {modal && (
        <CrudModal
          title={modal.editing ? `Edit — ${modal.editing.applicantName}` : '➕ New Walk-In Admission'}
          fields={admissionFields}
          initial={modal.editing || { status: 'SUBMITTED' }}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
}

// 3. STUDENTS — 2-sub-tab: Classes & Sections | Students with Enrollment
function StudentsTab() {
  const { user } = useAuth();
  const userRole = String(user?.role || user?.designation || '').toUpperCase();
  const isSchoolAdmin = userRole.includes('SCHOOL_ADMIN') || userRole.includes('PRINCIPAL') || userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER');

  const [subTab, setSubTab] = React.useState('classes');
  const [classes, setClasses] = React.useState([]);
  const [classLoading, setClassLoading] = React.useState(true);
  const [classModal, setClassModal] = React.useState(null);
  const [classSaving, setClassSaving] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState(null);
  const [selectedSection, setSelectedSection] = React.useState('');

  const [bulkClassModal, setBulkClassModal] = React.useState(false);
  const [bulkStudentModal, setBulkStudentModal] = React.useState(false);

  // Student list
  const [students, setStudents] = React.useState([]);
  const [studentViewMode, setStudentViewMode] = React.useState('list');
  const [studentLoading, setStudentLoading] = React.useState(false);
  const [nextRollNo, setNextRollNo] = React.useState('—');

  // Enrollment modal
  const [enrollModal, setEnrollModal] = React.useState(false);
  const [enrollStep, setEnrollStep] = React.useState(1);
  const [enrollSaving, setEnrollSaving] = React.useState(false);
  const [enrollResult, setEnrollResult] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [enrollForm, setEnrollForm] = React.useState({
    firstName: '', lastName: '', dob: '', gender: 'Male', bloodGroup: 'O+', address: '',
    classId: '', sectionId: '',
    studentEmail: '', studentPassword: '',
    parentName: '', parentPhone: '', parentEmail: '', parentPassword: '',
  });
  const [msg, setMsg] = React.useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };
  const [customAlert, setCustomAlert] = React.useState({ open: false, title: '', message: '' });
  const triggerAlert = (message, title = 'Validation Alert') => setCustomAlert({ open: true, title, message });
  const setField = (k, v) => setEnrollForm(f => ({ ...f, [k]: v }));

  const loadClasses = () => {
    setClassLoading(true);
    apiFetch('/admin/classes').then(d => {
      const raw = Array.isArray(d) ? d : [];
      const map = new Map();
      for (const item of raw) {
        const norm = String(item.className || '').replace(/^Class\s+/i, '').trim();
        if (!map.has(norm)) {
          map.set(norm, { ...item, className: norm });
        } else {
          const existing = map.get(norm);
          const mergedSec = Array.from(new Set([...(existing.sections || []), ...(item.sections || [])]));
          map.set(norm, { ...existing, sections: mergedSec });
        }
      }
      setClasses(Array.from(map.values()));
      setClassLoading(false);
    }).catch(() => setClassLoading(false));
  };
  React.useEffect(() => { loadClasses(); }, []);

  const loadStudents = React.useCallback((cId, sec) => {
    if (!cId) return;
    setStudentLoading(true);
    const q = sec ? `classId=${encodeURIComponent(cId)}&sectionId=${encodeURIComponent(sec)}` : `classId=${encodeURIComponent(cId)}`;
    apiFetch(`/admin/students?${q}`).then(d => { setStudents(Array.isArray(d) ? d : []); setStudentLoading(false); }).catch(() => setStudentLoading(false));
    apiFetch(`/admin/students/roll-preview?classId=${encodeURIComponent(cId)}&sectionId=${encodeURIComponent(sec || '')}`).then(d => setNextRollNo(d.rollNo || '—')).catch(() => setNextRollNo('—'));
  }, []);

  React.useEffect(() => {
    if (subTab === 'students' && selectedClass) loadStudents(selectedClass, selectedSection);
  }, [subTab, selectedClass, selectedSection, loadStudents]);

  // Open enrollment modal, pre-fill class/section
  const openEnroll = () => {
    const targetClassId = selectedClass || (classes[0]?.className || '');
    const classObj = classes.find(c => c.className === targetClassId);
    const defaultSec = selectedSection || ((classObj && Array.isArray(classObj.sections) && classObj.sections.length > 0) ? classObj.sections[0] : '');

    setEnrollForm(f => ({
      ...f,
      classId: targetClassId,
      sectionId: defaultSec,
      studentEmail: '', studentPassword: '',
      parentName: '', parentPhone: '', parentEmail: '', parentPassword: '',
      firstName: '', lastName: '', dob: '', gender: 'Male', bloodGroup: 'O+', address: '',
    }));
    setEnrollStep(1);
    setEnrollResult(null);
    setCopied(false);
    setEnrollModal(true);
  };

  // Auto-preview roll no when class/section changes inside modal
  const [modalRollPreview, setModalRollPreview] = React.useState('—');
  React.useEffect(() => {
    if (!enrollModal || !enrollForm.classId) { setModalRollPreview('—'); return; }
    apiFetch(`/admin/students/roll-preview?classId=${encodeURIComponent(enrollForm.classId)}&sectionId=${encodeURIComponent(enrollForm.sectionId || '')}`)
      .then(d => setModalRollPreview(d.rollNo || '—')).catch(() => setModalRollPreview('—'));
  }, [enrollForm.classId, enrollForm.sectionId, enrollModal]);

  const handleEnrollSave = async () => {
    setEnrollSaving(true);
    try {
      const result = await apiFetch('/admin/students/enroll', { method: 'POST', body: JSON.stringify(enrollForm) });
      setEnrollResult(result);
      setEnrollModal(false);
      showMsg('success', `✅ ${result.message}`);
      loadStudents(selectedClass, selectedSection);
      setNextRollNo('—');
      // Refresh next roll after a brief wait
      setTimeout(() => {
        if (selectedClass) apiFetch(`/admin/students/roll-preview?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection || '')}`).then(d => setNextRollNo(d.rollNo || '—')).catch(() => {});
      }, 800);
    } catch (e) {
      showMsg('error', e.message);
      triggerAlert(e.message, 'Enrollment Failed');
    } finally { setEnrollSaving(false); }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student and their login accounts?')) return;
    await apiFetch(`/admin/students/${id}`, { method: 'DELETE' });
    loadStudents(selectedClass, selectedSection);
  };

  const [editStudentModal, setEditStudentModal] = React.useState(null);
  const [viewStudentProfileModal, setViewStudentProfileModal] = React.useState(null);
  const [editStudentSaving, setEditStudentSaving] = React.useState(false);
  const handleEditSave = async (form) => {
    setEditStudentSaving(true);
    try {
      await apiFetch(`/admin/students/${editStudentModal._id}`, { method: 'PUT', body: JSON.stringify(form) });
      showMsg('success', '✅ Student updated successfully.');
      setEditStudentModal(null);
      loadStudents(selectedClass, selectedSection);
    } catch (e) { showMsg('error', e.message); }
    finally { setEditStudentSaving(false); }
  };

  const handleClassSave = async (form) => {
    setClassSaving(true);
    try {
      const payload = { ...form, sections: typeof form.sections === 'string' ? form.sections.split(',').map(s => s.trim()).filter(Boolean) : form.sections };
      if (classModal.editing) await apiFetch(`/admin/classes/${classModal.editing._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await apiFetch('/admin/classes', { method: 'POST', body: JSON.stringify(payload) });
      setClassModal(null); loadClasses();
    } catch (e) { showMsg('error', e.message); } finally { setClassSaving(false); }
  };

  const handleDeleteClass = async (cls) => {
    if (!confirm(`Are you sure you want to delete Class ${cls.className}? This will archive the class.`)) return;
    try {
      await apiFetch(`/admin/classes/${cls._id}`, { method: 'DELETE' });
      showMsg('success', `✅ Class ${cls.className} deleted successfully.`);
      loadClasses();
    } catch (e) { showMsg('error', e.message); }
  };

  const handleDeleteSection = async (cls, secToRemove) => {
    if (!confirm(`Remove Section ${secToRemove} from Class ${cls.className}?`)) return;
    try {
      const updatedSections = (cls.sections || []).filter(s => s !== secToRemove);
      await apiFetch(`/admin/classes/${cls._id}`, {
        method: 'PUT',
        body: JSON.stringify({ sections: updatedSections })
      });
      showMsg('success', `✅ Section ${secToRemove} removed from Class ${cls.className}.`);
      loadClasses();
    } catch (e) { showMsg('error', e.message); }
  };

  const handleCopyCredentials = () => {
    if (!enrollResult?.credentials) return;
    const { student, parent } = enrollResult.credentials;
    const text = `=== Student Login ===\nName: ${student.name}\nRoll No: ${student.rollNo}\nAdmission No: ${student.admissionNo}\nEmail: ${student.email}\nPassword: ${student.password}\n\n=== Parent Login ===\nName: ${parent.name}\nEmail: ${parent.email}\nPassword: ${parent.password}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1';

  const sectionOptions = React.useMemo(() => {
    const cls = classes.find(c => c.className === selectedClass);
    if (!cls || !Array.isArray(cls.sections) || cls.sections.length === 0) return [];
    return cls.sections;
  }, [classes, selectedClass]);

  const modalSectionOptions = React.useMemo(() => {
    const cls = classes.find(c => c.className === enrollForm.classId);
    if (!cls || !Array.isArray(cls.sections) || cls.sections.length === 0) return [];
    return cls.sections;
  }, [classes, enrollForm.classId]);

  const stepTitles = ['Student Details', 'Student Login', 'Parent Details', 'Confirm & Enroll'];

  return (
    <div className="space-y-4">
      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
        {[
          { key: 'classes', label: 'Classes & Sections', icon: BookOpen },
          { key: 'students', label: 'Students', icon: GraduationCap },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setSubTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab === key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Feedback message */}
      {msg && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>
          {msg.text}
        </div>
      )}

      {/* ── SUB-TAB 1: CLASSES & SECTIONS ── */}
      {subTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Classes & Sections</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Create classes first before enrolling students</p>
            </div>
            {isSchoolAdmin && (
              <div className="flex items-center gap-2">
                <button onClick={() => setBulkClassModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-500/30 transition-all cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5" /> Bulk Generate Classes
                </button>
                <button onClick={() => setClassModal({ editing: null })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                  <Plus className="w-3.5 h-3.5" /> Add Class
                </button>
              </div>
            )}
          </div>

          {/* Workflow hint */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <span className="text-amber-300 font-bold">Required first step: </span>
              Create your classes and sections here before you can enroll students. Example: Class <strong className="text-white">5</strong> with sections <strong className="text-white">A, B</strong> will auto-generate roll numbers like <span className="font-mono text-amber-300">5A01</span>, <span className="font-mono text-amber-300">5B01</span>, etc.
            </p>
          </div>

          {classLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
          ) : classes.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm bg-[#0d1117] rounded-2xl border border-slate-800">
              No classes created yet. Click "Add Class" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(cls => (
                <div key={cls._id} className="bg-[#0d1117] border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-indigo-500/40 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-white">Class {cls.className}</h3>
                      {cls.classTeacher && <p className="text-[11px] text-slate-400 mt-0.5">Teacher: {cls.classTeacher}</p>}
                      {cls.academicYear && <p className="text-[10px] text-slate-500">{cls.academicYear}</p>}
                    </div>
                    {isSchoolAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setClassModal({ editing: cls })} title="Edit Class" className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteClass(cls)} title="Delete Class" className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Sections */}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(cls.sections) && cls.sections.length > 0 ? cls.sections.map(sec => (
                      <span key={sec} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group/sec">
                        <span>Section {sec}</span>
                        {isSchoolAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSection(cls, sec); }}
                            title={`Delete Section ${sec}`}
                            className="hover:text-rose-400 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <X className="w-3 h-3 text-slate-400 hover:text-rose-400" />
                          </button>
                        )}
                      </span>
                    )) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400">No sections</span>
                    )}
                  </div>
                  {cls.capacity && <p className="text-[10px] text-slate-500">Capacity: {cls.capacity} students</p>}
                  {/* Go to Students CTA */}
                  <button
                    onClick={() => { setSelectedClass(cls.className); setSelectedSection(''); setSubTab('students'); }}
                    className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700 hover:border-indigo-500/40">
                    <GraduationCap className="w-3.5 h-3.5" /> View Students →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: STUDENTS ── */}
      {subTab === 'students' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white">Student Directory</h2>
              <p className="text-[11px] text-slate-500">Select a class to view and enroll students</p>
            </div>
            
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                type="button"
                onClick={() => setStudentViewMode('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  studentViewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setStudentViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  studentViewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>

            <select className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 min-w-[140px]"
              value={selectedClass || ''} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); }}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
            </select>
            {selectedClass && sectionOptions.length > 0 && (
              <select className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 min-w-[130px]"
                value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                <option value="">All Sections</option>
                {sectionOptions.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            )}
            {/* Next Roll No badge */}
            {selectedClass && (
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold">Next Roll No</span>
                <span className="font-mono font-black text-indigo-300 text-sm">{nextRollNo}</span>
              </div>
            )}
            {selectedClass && isSchoolAdmin && (
              <div className="flex items-center gap-2">
                <button onClick={() => setBulkStudentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-500/30 transition-all cursor-pointer">
                  <Users className="w-3.5 h-3.5" /> Bulk Enroll Students
                </button>
                <button onClick={openEnroll}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                  <Plus className="w-3.5 h-3.5" /> Enroll Student
                </button>
              </div>
            )}
          </div>

          {/* No class selected hint */}
          {!selectedClass ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#0d1117] rounded-2xl border border-slate-800 border-dashed space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600" />
              <p className="text-slate-400 text-sm font-semibold">Select a class above to view students</p>
              <button onClick={() => setSubTab('classes')} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors">
                ← Go to Classes
              </button>
            </div>
          ) : (
            <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden">
              {studentLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
              ) : students.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm space-y-3">
                  <GraduationCap className="w-8 h-8 text-slate-700 mx-auto" />
                  <p>No students in {selectedSection ? `Class ${selectedClass} Section ${selectedSection}` : `Class ${selectedClass}`} yet.</p>
                  {isSchoolAdmin && (
                    <button onClick={openEnroll} className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold mx-auto block hover:scale-105 transition-transform">
                      Enroll First Student
                    </button>
                  )}
                </div>
              ) : studentViewMode === 'grid' ? (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(s => (
                    <div key={s._id} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-xs font-black text-white uppercase shadow-sm">
                              {s.firstName ? s.firstName[0].toUpperCase() : 'S'}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-white text-sm">{s.firstName} {s.lastName}</h4>
                              <span className="text-[11px] font-mono text-indigo-400 font-bold">Roll #{s.rollNo}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.attendancePercentage >= 90 ? BADGE.green : s.attendancePercentage >= 75 ? BADGE.amber : BADGE.red}`}>
                            {s.attendancePercentage || 0}% Att.
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                          <div className="text-slate-300 font-semibold flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Section:</span>
                            <span className="text-white font-bold">{s.sectionId && s.sectionId !== '-' ? `Section ${s.sectionId}` : '—'}</span>
                          </div>
                          <div className="text-slate-300 font-semibold flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Parent:</span>
                            <span className="text-slate-200 font-bold">{s.parentName || '—'} ({s.parentPhone || 'No phone'})</span>
                          </div>
                          {s.transportRoute && (
                            <div className="text-indigo-300 text-[10px] font-semibold pt-1 border-t border-slate-800/80">
                              🚌 Bus: {s.transportRoute} ({s.pickupStop || 'Stop'})
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-1">
                        <button onClick={() => setViewStudentProfileModal(s)} title="View Full 360° Profile" className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-bold border border-cyan-500/30 transition-colors flex items-center gap-1 cursor-pointer">
                          <Eye className="w-3 h-3" /> Profile
                        </button>
                        {isSchoolAdmin && (
                          <>
                            <button onClick={() => setEditStudentModal(s)} title="Edit Student Profile" className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-bold border border-indigo-500/30 transition-colors flex items-center gap-1 cursor-pointer">
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => handleDeleteStudent(s._id)} title="Delete Student" className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold border border-rose-500/30 transition-colors cursor-pointer">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-800">
                      {['Roll No', 'Name', 'Section', 'Bus Transport', 'Attendance', 'Student Email', 'Parent Name', 'Parent Phone', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {students.map(s => (
                        <tr key={s._id} className="hover:bg-slate-900/60 transition-colors group">
                          <td className="px-4 py-3 text-xs font-mono font-bold">
                            <button 
                              onClick={() => setViewStudentProfileModal(s)}
                              className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-mono font-bold"
                              title="View Full 360° Profile"
                            >
                              {s.rollNo}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold">
                            <button
                              onClick={() => setViewStudentProfileModal(s)}
                              className="text-left text-white hover:text-indigo-300 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                              title="View Full 360° Profile"
                            >
                              <span className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                                {s.firstName ? s.firstName[0].toUpperCase() : 'S'}
                              </span>
                              <span>{s.firstName} {s.lastName}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300">{s.sectionId && s.sectionId !== '-' ? `Section ${s.sectionId}` : '—'}</td>
                          <td className="px-4 py-3 text-xs">
                            {s.transportRoute ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold text-[11px] border border-indigo-500/30">
                                🚌 {s.transportRoute} <span className="text-slate-400">({s.pickupStop || 'Stop'})</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">No Bus</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.attendancePercentage >= 90 ? BADGE.green : s.attendancePercentage >= 75 ? BADGE.amber : BADGE.red}`}>
                              {s.attendancePercentage || 0}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-400">{s.studentEmail || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-200 font-semibold">{s.parentName || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{s.parentPhone || '—'}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button onClick={() => setViewStudentProfileModal(s)} title="View Full 360° Profile" className="p-1.5 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors mr-1 cursor-pointer">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditStudentModal(s)} title="Edit Student Profile" className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors mr-1 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteStudent(s._id)} title="Delete Student" className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 360° Innovative Student Profile Modal */}
      {viewStudentProfileModal && (
        <InnovativeStudentProfileModal
          student={viewStudentProfileModal}
          isOpen={!!viewStudentProfileModal}
          onClose={() => setViewStudentProfileModal(null)}
          onEdit={(std) => { setViewStudentProfileModal(null); setEditStudentModal(std); }}
        />
      )}

      {/* Edit Student Modal with Transport Card */}
      {editStudentModal && (
        <CustomEditStudentModal
          student={editStudentModal}
          isOpen={!!editStudentModal}
          onClose={() => setEditStudentModal(null)}
          onSave={handleEditSave}
          loading={editStudentSaving}
        />
      )}

      {/* ══════════════════════════════════════════════════
          ENROLLMENT RESULT CREDENTIALS CARD
      ══════════════════════════════════════════════════ */}
      {enrollResult && (
        <div className="relative rounded-2xl border border-emerald-500/40 bg-[#0d1117] shadow-2xl overflow-hidden p-5 space-y-4 my-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Student Enrolled Successfully!</h3>
                <p className="text-xs text-emerald-400 font-medium">Credentials generated and active</p>
              </div>
            </div>
            <button onClick={() => setEnrollResult(null)} className="text-slate-400 hover:text-white p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Credentials */}
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">Student Login Credentials</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Student Name:</span><span className="text-white font-bold text-sm">{enrollResult.credentials.student.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Roll Number:</span><span className="font-mono font-black text-indigo-300 text-xs bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">{enrollResult.credentials.student.rollNo}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Admission No:</span><span className="font-mono font-bold text-slate-200 text-xs">{enrollResult.credentials.student.admissionNo}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Login Email:</span><span className="font-mono font-bold text-emerald-300 text-xs">{enrollResult.credentials.student.email}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Login Password:</span><span className="font-mono font-bold text-amber-300 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">{enrollResult.credentials.student.password || '(not set)'}</span></div>
              </div>
            </div>

            {/* Parent Credentials */}
            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">Parent Login Credentials</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Parent Name:</span><span className="text-white font-bold text-sm">{enrollResult.credentials.parent.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Login Email:</span><span className="font-mono font-bold text-emerald-300 text-xs">{enrollResult.credentials.parent.email}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300 font-semibold">Login Password:</span><span className="font-mono font-bold text-amber-300 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">{enrollResult.credentials.parent.password || '(not set)'}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={handleCopyCredentials}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${copied ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20'}`}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Key className="w-4 h-4" />}
              {copied ? 'Copied Credentials!' : 'Copy All Credentials'}
            </button>
            <button onClick={() => setEnrollResult(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 border border-slate-700 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Class CRUD Modal */}
      {classModal && (
        <CrudModal
          title={classModal.editing ? `Edit Class ${classModal.editing.className}` : '➕ Add New Class'}
          fields={[
            { key: 'className', label: 'Class Name (e.g. 5, 6, 10)', required: true, placeholder: 'e.g. 5' },
            { key: 'classTeacher', label: 'Class Teacher' },
            { 
              key: 'sections', 
              label: 'Sections', 
              type: 'checkbox-array',
              options: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
            },
            { key: 'capacity', label: 'Capacity (students)', type: 'number' },
            { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
          ]}
          initial={classModal.editing ? { ...classModal.editing, sections: Array.isArray(classModal.editing.sections) ? classModal.editing.sections : (classModal.editing.sections ? String(classModal.editing.sections).split(',').map(s=>s.trim()).filter(Boolean) : []) } : {}}
          onSave={handleClassSave}
          onClose={() => setClassModal(null)}
          loading={classSaving}
        />
      )}

      {/* ══════════════════════════════════════════════════
          4-STEP ENROLLMENT MODAL
      ══════════════════════════════════════════════════ */}
      {enrollModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 overflow-y-auto">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] my-auto relative z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-[#0d1117] rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Enroll New Student</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Step {enrollStep} of 4 — {stepTitles[enrollStep - 1]}</p>
              </div>
              <button onClick={() => setEnrollModal(false)} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
            </div>

            {/* Step Progress */}
            <div className="flex px-6 py-3 gap-1.5 border-b border-slate-800 shrink-0">
              {stepTitles.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-1 rounded-full transition-all ${i + 1 <= enrollStep ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                  <span className={`text-[10px] font-semibold ${i + 1 === enrollStep ? 'text-indigo-300' : 'text-slate-600'}`}>{t}</span>
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* STEP 1: Student Details */}
              {enrollStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>First Name <span className="text-rose-400">*</span></label><input className={inputCls} value={enrollForm.firstName} onChange={e => setField('firstName', e.target.value)} placeholder="e.g. Rahul" /></div>
                    <div><label className={labelCls}>Last Name <span className="text-rose-400">*</span></label><input className={inputCls} value={enrollForm.lastName} onChange={e => setField('lastName', e.target.value)} placeholder="e.g. Sharma" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Class <span className="text-rose-400">*</span></label>
                      <select className={inputCls} value={enrollForm.classId} onChange={e => {
                        const newClassId = e.target.value;
                        const targetClassObj = classes.find(c => c.className === newClassId);
                        const defaultSec = (targetClassObj && Array.isArray(targetClassObj.sections) && targetClassObj.sections.length > 0) ? targetClassObj.sections[0] : '';
                        setEnrollForm(f => ({ ...f, classId: newClassId, sectionId: defaultSec }));
                      }}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Section</label>
                      <select className={inputCls} value={enrollForm.sectionId} onChange={e => setField('sectionId', e.target.value)}>
                        {modalSectionOptions.length === 0 && <option value="">No Section</option>}
                        {modalSectionOptions.map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Roll No Preview */}
                  {enrollForm.classId && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                      <span className="text-[11px] text-slate-400">Auto Roll No →</span>
                      <span className="font-mono font-black text-indigo-300 text-lg">{modalRollPreview}</span>
                      <span className="text-[10px] text-slate-500 ml-auto">You can override this in Step 2</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Date of Birth</label><input className={inputCls} type="date" value={enrollForm.dob} onChange={e => setField('dob', e.target.value)} /></div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select className={inputCls} value={enrollForm.gender} onChange={e => setField('gender', e.target.value)}>
                        {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Blood Group</label>
                      <select className={inputCls} value={enrollForm.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)}>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Address</label><input className={inputCls} value={enrollForm.address} onChange={e => setField('address', e.target.value)} placeholder="Home address" /></div>
                  </div>
                </div>
              )}

              {/* STEP 2: Student Login */}
              {enrollStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-slate-300">
                    <span className="text-indigo-300 font-bold">Student login details.</span> Enter the student login email and password below.
                  </div>
                  <div><label className={labelCls}>Student Login Email <span className="text-rose-400">*</span></label><input className={inputCls} type="email" value={enrollForm.studentEmail} onChange={e => setField('studentEmail', e.target.value)} placeholder="student@email.com" /></div>
                  <div><label className={labelCls}>Student Password <span className="text-rose-400">*</span></label><input className={inputCls} type="text" value={enrollForm.studentPassword} onChange={e => setField('studentPassword', e.target.value)} placeholder="Enter student password" /></div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <p className="text-slate-400 font-semibold">Preview credentials:</p>
                    <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-mono text-emerald-300">{enrollForm.studentEmail || '(not set)'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Password</span><span className="font-mono text-amber-300">{enrollForm.studentPassword || '(not set)'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Roll No</span><span className="font-mono font-bold text-indigo-300">{modalRollPreview}</span></div>
                  </div>
                </div>
              )}

              {/* STEP 3: Parent Details */}
              {enrollStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300">
                    <span className="text-amber-300 font-bold">Parent login details.</span> Enter parent name, phone, email and login password below.
                  </div>
                  <div><label className={labelCls}>Parent / Guardian Name <span className="text-rose-400">*</span></label><input className={inputCls} value={enrollForm.parentName} onChange={e => setField('parentName', e.target.value)} placeholder="e.g. Rajesh Sharma" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Parent Phone <span className="text-rose-400">*</span></label><input className={inputCls} type="tel" value={enrollForm.parentPhone} onChange={e => setField('parentPhone', e.target.value)} placeholder="+91 9XXXXXXXXX" /></div>
                    <div><label className={labelCls}>Parent Email <span className="text-rose-400">*</span></label><input className={inputCls} type="email" value={enrollForm.parentEmail} onChange={e => setField('parentEmail', e.target.value)} placeholder="parent@email.com" /></div>
                  </div>
                  <div><label className={labelCls}>Parent Login Password <span className="text-rose-400">*</span></label><input className={inputCls} type="text" value={enrollForm.parentPassword} onChange={e => setField('parentPassword', e.target.value)} placeholder="Enter parent password" /></div>
                </div>
              )}

              {/* STEP 4: Confirm */}
              {enrollStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <p className="text-slate-300 font-bold text-sm">📋 Enrollment Summary</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <span className="text-slate-500">Student Name</span><span className="text-white font-semibold">{enrollForm.firstName} {enrollForm.lastName}</span>
                      <span className="text-slate-500">Class</span><span className="text-white">{enrollForm.classId ? `Class ${enrollForm.classId}` : '—'}{enrollForm.sectionId ? ` Section ${enrollForm.sectionId}` : ''}</span>
                      <span className="text-slate-500">Roll No (Auto)</span><span className="font-mono font-bold text-indigo-300">{modalRollPreview}</span>
                      <span className="text-slate-500">Gender</span><span className="text-white">{enrollForm.gender}</span>
                      <span className="text-slate-500">Blood Group</span><span className="text-white">{enrollForm.bloodGroup}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1.5">
                      <p className="font-bold text-indigo-300 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />Student Login</p>
                      <p className="font-mono text-emerald-300">{enrollForm.studentEmail}</p>
                      <p className="font-mono text-amber-300">{enrollForm.studentPassword}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                      <p className="font-bold text-amber-300 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Parent Login</p>
                      <p className="text-white">{enrollForm.parentName}</p>
                      <p className="font-mono text-emerald-300">{enrollForm.parentEmail}</p>
                      <p className="font-mono text-amber-300">{enrollForm.parentPassword}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                    ✅ All good! Clicking <strong>"Enroll Student"</strong> will create the student record, student login, and parent login in one step.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => enrollStep > 1 ? setEnrollStep(s => s - 1) : setEnrollModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
                {enrollStep === 1 ? 'Cancel' : '← Back'}
              </button>
              {enrollStep < 4 ? (
                <button
                  onClick={() => {
                    if (enrollStep === 1) {
                      const missing = [];
                      if (!enrollForm.firstName?.trim()) missing.push('First Name');
                      if (!enrollForm.classId) missing.push('Class');
                      if (missing.length > 0) {
                        triggerAlert(`Step 1 Missing Required Fields:\n\n• ${missing.join('\n• ')}\n\nPlease fill all required fields marked with * to proceed.`, 'Step 1 Validation');
                        return;
                      }
                    }
                    if (enrollStep === 2) {
                      const missing = [];
                      if (!enrollForm.studentEmail?.trim()) missing.push('Student Login Email');
                      if (!enrollForm.studentPassword?.trim()) missing.push('Student Password');
                      if (missing.length > 0) {
                        triggerAlert(`Step 2 Missing Required Fields:\n\n• ${missing.join('\n• ')}\n\nPlease fill all required fields marked with * to proceed.`, 'Step 2 Validation');
                        return;
                      }
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(enrollForm.studentEmail.trim())) {
                        triggerAlert(`"${enrollForm.studentEmail}" is not a valid email address.\nPlease enter a complete email address (e.g. student@school.com or name@gmail.com).`, 'Invalid Student Email');
                        return;
                      }
                    }
                    if (enrollStep === 3) {
                      const missing = [];
                      if (!enrollForm.parentName?.trim()) missing.push('Parent Name');
                      if (!enrollForm.parentPhone?.trim()) missing.push('Parent Phone');
                      if (!enrollForm.parentEmail?.trim()) missing.push('Parent Email');
                      if (!enrollForm.parentPassword?.trim()) missing.push('Parent Login Password');
                      if (missing.length > 0) {
                        triggerAlert(`Step 3 Missing Required Fields:\n\n• ${missing.join('\n• ')}\n\nPlease fill all required fields marked with * to proceed.`, 'Step 3 Validation');
                        return;
                      }
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(enrollForm.parentEmail.trim())) {
                        triggerAlert(`"${enrollForm.parentEmail}" is not a valid email address.\nPlease enter a complete email address (e.g. parent@school.com or name@gmail.com).`, 'Invalid Parent Email');
                        return;
                      }
                    }
                    setEnrollStep(s => s + 1);
                  }}
                  className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                  Next Step →
                </button>
              ) : (
                <button onClick={handleEnrollSave} disabled={enrollSaving}
                  className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60 hover:scale-105 transition-transform">
                  {enrollSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enrolling...</> : <><CheckCircle className="w-3.5 h-3.5" /> Enroll Student</>}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Add Classes Modal */}
      <BulkAddClassesModal
        isOpen={bulkClassModal}
        onClose={() => setBulkClassModal(false)}
        onRefresh={loadClasses}
        apiFetch={apiFetch}
      />

      {/* Bulk Add Students Modal */}
      <BulkAddStudentsModal
        isOpen={bulkStudentModal}
        onClose={() => setBulkStudentModal(false)}
        onRefresh={() => {
          if (selectedClass) {
            setStudentLoading(true);
            const url = selectedSection 
              ? `/admin/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`
              : `/admin/students?classId=${encodeURIComponent(selectedClass)}`;
            apiFetch(url).then(d => { setStudents(Array.isArray(d) ? d : []); setStudentLoading(false); }).catch(() => setStudentLoading(false));
          }
        }}
        classes={classes}
        selectedClass={selectedClass}
        selectedSection={selectedSection}
        apiFetch={apiFetch}
      />

      <CustomAlertModal
        isOpen={customAlert.open}
        title={customAlert.title}
        message={customAlert.message}
        onClose={() => setCustomAlert({ open: false, title: '', message: '' })}
      />
    </div>
  );
}


// 4. EMPLOYEES / HRMS
function EmployeesTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const userRoleStr = String(user?.role || user?.designation || '').toUpperCase();
  const isSchoolAdmin = userRoleStr.includes('SCHOOL_ADMIN') || userRoleStr.includes('PRINCIPAL') || userRoleStr.includes('HEADMASTER') || userRoleStr.includes('HEAD_MASTER') || userRoleStr.includes('SUPER_ADMIN');

  const userRole = (user?.role || '').toUpperCase();
  const userDesig = (user?.designation || '').toUpperCase();

  // Role hierarchy restriction:
  // Headmaster can only create roles below Headmaster (Teacher, Admin, HR, Accountant, Staff)
  // Vice Principal can create Headmaster and staff, but NOT Principal or Vice Principal
  // Principal / School Admin can create ALL roles
  let allowedEmployeeTypes = ['PRINCIPAL', 'VICE_PRINCIPAL', 'HEADMASTER', 'TEACHER', 'ADMIN', 'HR', 'ACCOUNTANT', 'DRIVER', 'SECURITY', 'LIBRARIAN', 'SUPPORT'];
  if (userDesig.includes('HEADMASTER') || userRole === 'HEADMASTER') {
    allowedEmployeeTypes = ['TEACHER', 'ADMIN', 'HR', 'ACCOUNTANT', 'DRIVER', 'SECURITY', 'LIBRARIAN', 'SUPPORT'];
  } else if (userDesig.includes('VICE') || userRole === 'VICE_PRINCIPAL') {
    allowedEmployeeTypes = ['HEADMASTER', 'TEACHER', 'ADMIN', 'HR', 'ACCOUNTANT', 'DRIVER', 'SECURITY', 'LIBRARIAN', 'SUPPORT'];
  }

  const load = () => {
    apiFetch('/admin/employees').then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
    apiFetch('/admin/classes').then(d => setClassList(Array.isArray(d) ? d : [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (!isSchoolAdmin) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.designation || payload.designation === 'Teacher') {
        if (payload.employeeType === 'HEADMASTER') payload.designation = 'Headmaster';
        else if (payload.employeeType === 'PRINCIPAL') payload.designation = 'Principal';
        else if (payload.employeeType === 'VICE_PRINCIPAL') payload.designation = 'Vice Principal';
      }
      if (modal.editing) await apiFetch(`/admin/employees/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await apiFetch('/admin/employees', { method: 'POST', body: JSON.stringify(payload) });
      setModal(null); load();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!isSchoolAdmin) return;
    if (!confirm('Archive employee and deactivate login?')) return;
    await apiFetch(`/admin/employees/${id}`, { method: 'DELETE' });
    load();
  };

  // Build dynamic class options from Database
  const dynamicClassOptions = ['None'];
  if (classList.length > 0) {
    classList.forEach(c => {
      const clsName = c.className.startsWith('Class') ? c.className : `Class ${c.className}`;
      const secs = Array.isArray(c.sections) ? c.sections : (c.sections ? String(c.sections).split(',').map(s => s.trim()).filter(Boolean) : ['A']);
      secs.forEach(s => {
        const secName = s.startsWith('Section') ? s : `Section ${s}`;
        dynamicClassOptions.push(`${clsName} - ${secName}`);
      });
    });
  } else {
    ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].forEach(c => {
      dynamicClassOptions.push(`Class ${c} - Section A`);
    });
  }

  const fields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Login Email (Creates Teacher Account)', type: 'email', required: true },
    { key: 'password', label: 'Login Password (default: teacher123)', type: 'password' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'department', label: 'Department (e.g. Academics, Science)', required: true },
    { key: 'designation', label: 'Designation (e.g. Senior Teacher, PGT, TGT)', required: true },
    { key: 'employeeType', label: 'Employee Type', type: 'select', options: allowedEmployeeTypes },


    { key: 'qualification', label: 'Qualification (e.g. M.Sc Mathematics, B.Ed)' },
    { key: 'assignedClass', label: 'Assign as Class Teacher', type: 'select', options: dynamicClassOptions },
    { key: 'joiningDate', label: 'Joining Date', type: 'date' },
    { key: 'basicSalary', label: 'Basic Salary (₹)', type: 'number', required: true },
    { key: 'status', label: 'Account Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] },
  ];

  return (
    <>
      <ModuleTable
        title="Teacher & Staff Directory (With User Logins)" icon={UserCog} color="emerald" searchable
        loading={loading} rows={rows}
        columns={[
          { key: 'employeeId', label: 'Emp ID' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Login Email' },
          { key: 'designation', label: 'Designation' },
          { key: 'assignedClass', label: 'Class Teacher', render: v => v && v !== 'None' ? <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">🏫 {v}</span> : <span className="text-slate-500">—</span> },
          { key: 'qualification', label: 'Qualification' },
          { key: 'employeeType', label: 'Type', badge: true },
          { key: 'basicSalary', label: 'Salary', render: v => `₹${(v || 0).toLocaleString()}` },
          { key: 'status', label: 'Status', badge: true },
        ]}
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        onDelete={handleDelete}
      />
      {modal && (
        <CrudModal
          title={modal.editing ? `Edit Staff Member — ${modal.editing.name}` : '➕ Add Teacher / Staff Member'}
          fields={fields}
          initial={modal.editing || { employeeType: 'TEACHER', department: 'Academics', designation: 'Teacher', basicSalary: 35000, assignedClass: 'None' }}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </>
  );
}

// Generic simple CRUD tab factory
function makeSimpleCRUDTab(config) {
  return function SimpleCRUDTab() {
    const { user } = useAuth();
    const userRole = String(user?.role || user?.designation || '').toUpperCase();
    const isSchoolAdmin = userRole.includes('SCHOOL_ADMIN') || userRole.includes('PRINCIPAL') || userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = () => apiFetch(config.endpoint).then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const handleSave = async (form) => {
      if (!isSchoolAdmin) return;
      setSaving(true);
      try {
        if (modal.editing) await apiFetch(`${config.endpoint}/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        else await apiFetch(config.endpoint, { method: 'POST', body: JSON.stringify(form) });
        setModal(null); load();
      } catch (e) { alert(e.message); } finally { setSaving(false); }
    };
    const handleDelete = async (id) => {
      if (!isSchoolAdmin) return;
      if (!confirm(`Delete this ${config.title.toLowerCase()} record?`)) return;
      await apiFetch(`${config.endpoint}/${id}`, { method: 'DELETE' });
      load();
    };

    return (
      <>
        <ModuleTable
          title={config.title} icon={config.icon} color={config.color || 'indigo'}
          loading={loading} rows={rows}
          columns={config.columns}
          onAdd={!isSchoolAdmin || config.noAdd ? undefined : () => setModal({ editing: null })}
          onEdit={!isSchoolAdmin || config.noEdit ? undefined : (row) => setModal({ editing: row })}
          onDelete={!isSchoolAdmin || config.noDelete ? undefined : handleDelete}
          extraActions={config.extraActions}
          searchable={config.searchable}
        />
        {modal && isSchoolAdmin && (
          <CrudModal
            title={modal.editing ? `Edit ${config.title}` : `Add ${config.title}`}
            fields={config.fields}
            initial={modal.editing || {}}
            onSave={handleSave}
            onClose={() => setModal(null)}
            loading={saving}
          />
        )}
      </>
    );
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MODULE INSTANTIATIONS VIA FACTORY
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AcademicYearsTab = makeSimpleCRUDTab({
  title: 'Academic Years', icon: Calendar, color: 'blue', endpoint: '/admin/academic-years',
  columns: [
    { key: 'name', label: 'Year Name' },
    { key: 'startDate', label: 'Start Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'endDate', label: 'End Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'isCurrent', label: 'Current', render: v => v ? <span className="text-emerald-400 font-bold">âœ“ Yes</span> : 'â€”' },
    { key: 'status', label: 'Status', badge: true },
  ],
  fields: [
    { key: 'name', label: 'Academic Year Name (e.g. 2026-2027)', required: true },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'endDate', label: 'End Date', type: 'date', required: true },
    { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'CLOSED', 'ARCHIVED'] },
    { key: 'isCurrent', label: 'Is Current Year', type: 'select', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }] },
  ]
});

const ClassesTab = makeSimpleCRUDTab({
  title: 'Classes & Sections', icon: BookOpen, color: 'indigo', endpoint: '/admin/classes',
  columns: [
    { key: 'className', label: 'Class' },
    { key: 'classTeacher', label: 'Class Teacher' },
    { key: 'sections', label: 'Sections', render: v => Array.isArray(v) ? v.join(', ') : v || 'â€”' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'academicYear', label: 'Acad. Year' },
  ],
  fields: [
    { key: 'className', label: 'Class Name', required: true },
    { key: 'classTeacher', label: 'Class Teacher' },
    { key: 'sections', label: 'Sections (comma-separated e.g. A,B,C)' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'academicYear', label: 'Academic Year' },
  ]
});

const SubjectsTab = makeSimpleCRUDTab({
  title: 'Subjects', icon: BookMarked, color: 'violet', endpoint: '/admin/subjects',
  columns: [
    { key: 'subjectCode', label: 'Code' },
    { key: 'subjectName', label: 'Subject Name' },
    { key: 'subjectType', label: 'Type', badge: true },
    { key: 'periodsPerWeek', label: 'Periods/Week' },
    { key: 'maxMarks', label: 'Max Marks' },
  ],
  fields: [
    { key: 'subjectCode', label: 'Subject Code (e.g. MATH101)', required: true },
    { key: 'subjectName', label: 'Subject Name', required: true },
    { key: 'subjectType', label: 'Type', type: 'select', options: ['CORE', 'ELECTIVE', 'LANGUAGE', 'PRACTICAL', 'CO-CURRICULAR'] },
    { key: 'examType', label: 'Exam Type', type: 'select', options: ['THEORY', 'PRACTICAL', 'BOTH'] },
    { key: 'periodsPerWeek', label: 'Periods Per Week', type: 'number' },
    { key: 'maxMarks', label: 'Max Marks', type: 'number' },
    { key: 'passingMarks', label: 'Passing Marks', type: 'number' },
  ]
});

const DepartmentsTab = makeSimpleCRUDTab({
  title: 'Departments & Designations', icon: Building2, color: 'amber', endpoint: '/admin/departments',
  columns: [
    { key: 'name', label: 'Department Name' },
    { key: 'head', label: 'Department Head' },
    { key: 'description', label: 'Description' },
  ],
  fields: [
    { key: 'name', label: 'Department Name', required: true },
    { key: 'head', label: 'Department Head' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ]
});

const getLocalDateStr = (d = new Date()) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// FULL FEATURED ATTENDANCE MANAGEMENT MODULE
function AttendanceTab() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
  const [selectedClass, setSelectedClass] = useState('LKG');
  const [selectedSection, setSelectedSection] = useState('A');
  const [classList, setClassList] = useState([]);

  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  const [session, setSession] = useState(null);
  const [regStudents, setRegStudents] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regType, setRegType] = useState('DAILY'); // 'DAILY' | 'PERIOD'
  const [regPeriod, setRegPeriod] = useState(1);
  const [regSubject, setRegSubject] = useState('Mathematics');

  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calData, setCalData] = useState(null);

  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentHistory, setStudentHistory] = useState(null);
  const [adminStudentPeriodLogs, setAdminStudentPeriodLogs] = useState([]);
  const [adminAttFilterDate, setAdminAttFilterDate] = useState('');
  const [adminAttMode, setAdminAttMode] = useState('period'); // 'period' | 'daily'
  const [historyClass, setHistoryClass] = useState('ALL');
  const [historySection, setHistorySection] = useState('ALL');

  // Pure Dynamic School Class & Section Resolution (from DB & enrolled students)
  const dynamicClasses = Array.from(new Set([
    ...classList.map(c => typeof c === 'object' ? c.className || c.name || c.classId : String(c)),
    ...allStudents.map(s => String(s.classId || '').replace(/^Class\s+/i, '').trim())
  ])).filter(Boolean);
  const classes = dynamicClasses;

  const dynamicSections = Array.from(new Set([
    ...classList.flatMap(c => Array.isArray(c?.sections) ? c.sections : [c?.sectionId || c?.section]),
    ...allStudents.map(s => String(s.sectionId || '').replace(/^Section\s+/i, '').trim())
  ])).filter(Boolean);
  const sections = dynamicSections;




  const filteredHistoryStudents = allStudents.filter(s => {
    const matchClass = historyClass === 'ALL' || String(s.classId || '').replace(/^Class\s+/i, '').trim() === String(historyClass).replace(/^Class\s+/i, '').trim();
    const matchSec = historySection === 'ALL' || String(s.sectionId || '').replace(/^Section\s+/i, '').trim() === String(historySection).replace(/^Section\s+/i, '').trim();
    return matchClass && matchSec;
  });


  const [corrections, setCorrections] = useState([]);
  const [corrLoading, setCorrLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const [settings, setSettings] = useState({ mode: 'HYBRID', lowAttendanceThreshold: 75, lockAfterSubmit: true, schoolStartTime: '08:30', schoolEndTime: '16:30' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem('erp_attendance_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.mode) {
          setSettings(parsed);
          if (parsed.mode === 'PERIOD') setRegType('PERIOD');
        }
      }
    } catch (e) {}
    apiFetch('/admin/attendance/settings').then(d => {
      if (d && d.mode) {
        setSettings(d);
        localStorage.setItem('erp_attendance_settings', JSON.stringify(d));
        if (d.mode === 'PERIOD') setRegType('PERIOD');
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch('/admin/classes').then(d => setClassList(Array.isArray(d) ? d : [])).catch(() => {});
    apiFetch('/admin/students').then(d => {
      const arr = Array.isArray(d) ? d : [];
      setAllStudents(arr);
      if (arr.length > 0) setSelectedStudentId(arr[0]._id);
    }).catch(() => {});
    loadDashboard();
    loadSettings();
    window.addEventListener('erp_attendance_settings_updated', loadSettings);
    return () => window.removeEventListener('erp_attendance_settings_updated', loadSettings);
  }, [loadSettings]);

  const loadDashboard = () => {
    setDashLoading(true);
    apiFetch(`/attendance/dashboard?date=${selectedDate}`)
      .then(d => { setDashData(d); setDashLoading(false); })
      .catch(() => setDashLoading(false));
  };

  useEffect(() => {
    if (activeSubTab === 'dashboard') loadDashboard();
    else if (activeSubTab === 'register') loadRegisterSession();
    else if (activeSubTab === 'calendar') loadCalendar();
    else if (activeSubTab === 'corrections') loadCorrections();
    else if (activeSubTab === 'reports') loadReport();
  }, [activeSubTab, selectedDate, selectedClass, selectedSection, calMonth, calYear, regType, regPeriod, regSubject]);

  useEffect(() => {
    if (activeSubTab === 'history' && selectedStudentId) loadStudentHistory();
  }, [activeSubTab, selectedStudentId]);

  const loadRegisterSession = async () => {
    setRegLoading(true);
    try {
      const sRes = await apiFetch(`/admin/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`);
      const studentList = Array.isArray(sRes) ? sRes : [];
      setRegStudents(studentList);

      const extractId = (id) => typeof id === 'object' ? String(id?._id || id?.id || id) : String(id);

      if (regType === 'PERIOD') {
        // STRICT PERIOD ISOLATION: Fetch ONLY session for date + class + section + type=PERIOD + periodNo + subject
        const sessUrl = `/attendance/sessions?date=${selectedDate}&classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&type=PERIOD&periodNo=${regPeriod}&subject=${encodeURIComponent(regSubject)}`;
        const sessRes = await apiFetch(sessUrl).catch(() => []);
        const sessList = Array.isArray(sessRes) ? sessRes : [];
        const foundSession = sessList.find(s => String(s.periodNo) === String(regPeriod)) || null;

        let cachedMap = {};
        try {
          const cacheKey = `erp_att_${selectedDate}_${selectedClass}_${selectedSection}_PERIOD_${regPeriod}_${regSubject}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) cachedMap = JSON.parse(cached);
        } catch (e) {}

        const entryMap = {};
        Object.keys(cachedMap).forEach(k => {
          if (cachedMap[k] && cachedMap[k] !== 'NM') {
            entryMap[k] = { studentId: k, status: cachedMap[k] };
          }
        });

        if (foundSession && Array.isArray(foundSession.entries)) {
          foundSession.entries.forEach(e => {
            const sid = extractId(e.studentId);
            const stCode = e.status === 'PRESENT' ? 'P' : e.status === 'ABSENT' ? 'A' : e.status === 'LATE' ? 'L' : e.status === 'LEAVE' ? 'LV' : (e.status || 'NM');
            if (sid) entryMap[sid] = { studentId: sid, studentName: e.studentName, rollNo: e.rollNo, status: stCode, remarks: e.remarks };
            if (e.rollNo) entryMap[`roll_${String(e.rollNo).trim()}`] = { studentId: sid, rollNo: e.rollNo, status: stCode };
            if (e.studentName) entryMap[`name_${String(e.studentName).trim().toLowerCase()}`] = { studentId: sid, studentName: e.studentName, status: stCode };
          });
        }

        const mergedEntries = Object.values(entryMap);
        const finalSession = foundSession ? {
          ...foundSession,
          entries: Object.keys(entryMap).length > (foundSession.entries?.length || 0) ? mergedEntries : foundSession.entries
        } : {
          isLocked: false,
          status: mergedEntries.length > 0 ? 'DRAFT' : 'UNMARKED',
          entries: mergedEntries
        };

        setSession(finalSession);
      } else {
        // DAILY MODE
        const sessUrl = `/attendance/sessions?date=${selectedDate}&classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&type=DAILY`;
        const sessRes = await apiFetch(sessUrl).catch(() => []);
        const sessList = Array.isArray(sessRes) ? sessRes : [];
        let foundSession = sessList.length > 0 ? sessList[0] : null;

        const recRes = await apiFetch(`/admin/attendance/students?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&date=${selectedDate}`).catch(() => []);
        const recList = Array.isArray(recRes) ? recRes : [];

        let cachedMap = {};
        try {
          const cached = localStorage.getItem(`erp_att_${selectedDate}_${selectedClass}_${selectedSection}`);
          if (cached) cachedMap = JSON.parse(cached);
        } catch (e) {}

        const entryMap = {};
        recList.forEach(r => {
          const sid = extractId(r.studentId);
          const stCode = r.status === 'PRESENT' ? 'P' : r.status === 'ABSENT' ? 'A' : r.status === 'LATE' ? 'L' : r.status === 'LEAVE' ? 'LV' : (r.status || 'NM');
          if (sid) entryMap[sid] = { studentId: sid, studentName: r.studentName, status: stCode };
        });

        Object.keys(cachedMap).forEach(k => {
          if (cachedMap[k] && cachedMap[k] !== 'NM') {
            entryMap[k] = { studentId: k, status: cachedMap[k] };
          }
        });

        if (foundSession && Array.isArray(foundSession.entries)) {
          foundSession.entries.forEach(e => {
            const sid = extractId(e.studentId);
            const stCode = e.status === 'PRESENT' ? 'P' : e.status === 'ABSENT' ? 'A' : e.status === 'LATE' ? 'L' : e.status === 'LEAVE' ? 'LV' : (e.status || 'NM');
            if (sid) entryMap[sid] = { studentId: sid, studentName: e.studentName, rollNo: e.rollNo, status: stCode, remarks: e.remarks };
            if (e.rollNo) entryMap[`roll_${String(e.rollNo).trim()}`] = { studentId: sid, rollNo: e.rollNo, status: stCode };
            if (e.studentName) entryMap[`name_${String(e.studentName).trim().toLowerCase()}`] = { studentId: sid, studentName: e.studentName, status: stCode };
          });
        }

        const mergedEntries = Object.values(entryMap);
        if (!foundSession) {
          foundSession = {
            isLocked: recList.length > 0,
            status: recList.length > 0 ? 'LOCKED' : (mergedEntries.length > 0 ? 'DRAFT' : 'UNMARKED'),
            entries: mergedEntries
          };
        } else {
          foundSession = {
            ...foundSession,
            entries: Object.keys(entryMap).length > (foundSession.entries?.length || 0) ? mergedEntries : foundSession.entries
          };
        }

        setSession(foundSession);
      }
    } catch (e) {} finally { setRegLoading(false); }
  };

  const loadCalendar = () => {
    apiFetch(`/attendance/calendar?month=${calMonth}&year=${calYear}&classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`)
      .then(d => setCalData(d.calendar || {}))
      .catch(() => setCalData({}));
  };

  const loadStudentHistory = async () => {
    if (!selectedStudentId || filteredHistoryStudents.length === 0) {
      setStudentHistory(null);
      setAdminStudentPeriodLogs([]);
      return;
    }
    try {
      const d = await apiFetch(`/attendance/student/${selectedStudentId}/history`).catch(() => null);
      setStudentHistory(d);

      const selStudent = allStudents.find(s => String(s._id) === String(selectedStudentId));
      if (selStudent) {
        const cleanC = String(selStudent.classId || '').replace(/^Class\s+/i, '').trim();
        const cleanS = String(selStudent.sectionId || 'A').replace(/^Section\s+/i, '').trim();
        const sessions = await apiFetch(`/attendance/sessions?classId=${encodeURIComponent(cleanC)}&sectionId=${encodeURIComponent(cleanS)}&type=PERIOD`).catch(() => []);
        if (Array.isArray(sessions)) {
          const logs = [];
          const extractId = (id) => typeof id === 'object' ? String(id?._id || id?.id || id) : String(id);
          sessions.forEach(sess => {
            if (Array.isArray(sess.entries)) {
              const entry = sess.entries.find(e => {
                const eSid = extractId(e.studentId);
                return eSid === String(selectedStudentId) ||
                  (e.rollNo && selStudent.rollNo && String(e.rollNo).trim() === String(selStudent.rollNo).trim()) ||
                  (e.studentName && selStudent.firstName && String(e.studentName).toLowerCase().includes(String(selStudent.firstName).toLowerCase()));
              });
              if (entry) {
                const st = entry.status === 'P' || entry.status === 'PRESENT' ? 'PRESENT' : entry.status === 'A' || entry.status === 'ABSENT' ? 'ABSENT' : entry.status === 'L' || entry.status === 'LATE' ? 'LATE' : 'LEAVE';
                logs.push({
                  _id: `${sess._id}_${entry.studentId || entry.rollNo}`,
                  date: sess.date,
                  type: sess.type || 'PERIOD',
                  periodNo: sess.periodNo || 1,
                  subject: sess.subject || 'Subject',
                  status: st,
                  classId: sess.classId,
                  sectionId: sess.sectionId,
                  markedBy: sess.markedByName || sess.teacherName || 'Faculty'
                });
              }
            }
          });
          setAdminStudentPeriodLogs(logs);
        }
      }
    } catch (e) {}
  };

  const loadCorrections = () => {
    setCorrLoading(true);
    apiFetch('/attendance/corrections')
      .then(d => { setCorrections(Array.isArray(d) ? d : []); setCorrLoading(false); })
      .catch(() => setCorrLoading(false));
  };

  const handleReviewCorrection = async (action) => {
    if (!reviewModal) return;
    try {
      await apiFetch(`/attendance/corrections/${reviewModal._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, adminRemarks: adminNote })
      });
      setReviewModal(null);
      setAdminNote('');
      loadCorrections();
    } catch (e) { alert(e.message); }
  };

  const loadReport = () => {
    setReportLoading(true);
    apiFetch(`/attendance/reports/monthly?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}&month=${calMonth}&year=${calYear}`)
      .then(d => { setReportData(d); setReportLoading(false); })
      .catch(() => setReportLoading(false));
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await apiFetch('/admin/attendance/settings', { method: 'PUT', body: JSON.stringify(settings) });
      localStorage.setItem('erp_attendance_settings', JSON.stringify(settings));
      if (settings.mode === 'PERIOD') setRegType('PERIOD');
      window.dispatchEvent(new Event('erp_attendance_settings_updated'));
      alert('Attendance mode & settings saved! Synchronized across all dashboards & roles.');
    } catch (e) { alert(e.message); }
    finally { setSettingsSaving(false); }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">School Attendance Architecture</h1>
            <p className="text-xs text-slate-400">Class, Section, Calendar, Corrections, History & Analytics</p>
          </div>
        </div>
        {dashData?.pendingCorrections > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4" /> {dashData.pendingCorrections} Pending Correction Requests!
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex-wrap">
        {[
          { id: 'dashboard', label: '🏠 Dashboard', icon: LayoutDashboard },
          { id: 'register', label: '📋 Daily Register', icon: CheckSquare },
          { id: 'calendar', label: '📅 Calendar View', icon: Calendar },
          { id: 'history', label: '🎓 Student History', icon: History },
          { id: 'corrections', label: `✏️ Corrections (${corrections.filter(c=>c.status==='PENDING').length})`, icon: Edit2 },
          { id: 'reports', label: '📊 Reports & Closure', icon: BarChart3 },
          { id: 'settings', label: '⚙️ Settings', icon: Settings },
        ].map(st => (
          <button key={st.id} onClick={() => setActiveSubTab(st.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === st.id ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}>
            {st.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Students Present" value={`${dashData?.studentSummary?.present || 0}/${dashData?.studentSummary?.total || 0}`} icon={CheckCircle} color="emerald" sub={`${dashData?.studentSummary?.total ? Math.round((dashData.studentSummary.present/dashData.studentSummary.total)*100) : 0}% rate`} />
            <StatCard label="Students Absent" value={dashData?.studentSummary?.absent || 0} icon={XCircle} color="rose" />
            <StatCard label="Teachers Present" value={`${dashData?.teacherSummary?.present || 0}/${dashData?.teacherSummary?.total || 0}`} icon={Users} color="blue" />
            <StatCard label="Low Attendance Alert" value={`${dashData?.lowAttendanceCount || 0} Students`} icon={AlertTriangle} color="amber" sub={`Below ${dashData?.threshold || 75}% threshold`} />
          </div>

          <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Today's Class-wise Attendance Status ({selectedDate})</span>
              <span className="text-xs text-indigo-400 font-normal">{dashData?.classWise?.length || 0} classes recorded</span>
            </h3>
            {dashLoading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto py-8" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dashData?.classWise?.map((cw, i) => (
                  <div key={i} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 hover:border-indigo-500/30 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Class {cw.classId} - {cw.sectionId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        cw.isLocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        cw.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {cw.isLocked ? '🔒 Locked' : cw.status === 'DRAFT' ? '✏️ Draft' : '⚪ Pending'}
                      </span>
                    </div>
                    <p className={`text-lg font-black ${cw.status === 'UNMARKED' ? 'text-slate-500' : 'text-emerald-400'}`}>
                      {cw.status === 'UNMARKED' ? '—' : `${cw.percentage}%`}
                    </p>
                    <p className="text-[10px] text-slate-400">P: {cw.summary?.present || 0} | A: {cw.summary?.absent || 0} | L: {cw.summary?.late || 0}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'register' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Section</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Session Type / Mode</label>
              {settings.mode === 'HYBRID' ? (
                <select value={regType} onChange={e => setRegType(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold">
                  <option value="DAILY">🌅 Daily Roll Call (Morning)</option>
                  <option value="PERIOD">⏱️ Period-Wise Roll Call</option>
                </select>
              ) : (
                <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{settings.mode === 'PERIOD' ? '⏱️ Period-Wise Roll Call' : '🌅 Daily Roll Call (Morning)'}</span>
                  <span className="text-[9px] text-slate-400 font-normal ml-1 bg-slate-800 px-1.5 py-0.5 rounded">(Admin Configured)</span>
                </div>
              )}
            </div>
            {regType === 'PERIOD' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Period</label>
                  <select value={regPeriod} onChange={e => setRegPeriod(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Subject</label>
                  <select value={regSubject} onChange={e => setRegSubject(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold">
                    {['Mathematics', 'Telugu', 'English', 'Science', 'Physics', 'Chemistry', 'Social Studies', 'Computer Science', 'General'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="flex-1 text-right flex items-center justify-end gap-2.5">
              <span className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Configured Mode: <strong className="text-emerald-300">{settings.mode || 'HYBRID'}</strong>
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${session?.isLocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {session ? (session.isLocked ? '🔒 Submitted & Locked' : '✏️ Draft') : 'Unmarked'}
              </span>
            </div>
          </div>

          <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden p-4">
            {regLoading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto py-8" /> : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[10px] text-slate-400 uppercase font-black px-4 py-2 bg-slate-900 rounded-xl">
                  <span className="col-span-2">Roll & Adm</span>
                  <span className="col-span-4">Student Name</span>
                  <span className="col-span-3">Parent</span>
                  <span className="col-span-3 text-right">Status</span>
                </div>
                {regStudents.map(st => {
                  const extractId = (id) => typeof id === 'object' ? String(id?._id || id?.id || id) : String(id);
                  const entry = session?.entries?.find(e => {
                    const eId = extractId(e.studentId);
                    const stId = extractId(st._id);
                    return (
                      (eId && stId && eId === stId) ||
                      (e.rollNo && st.rollNo && String(e.rollNo).trim() === String(st.rollNo).trim()) ||
                      (e.studentName && String(e.studentName).trim().toLowerCase() === `${st.firstName} ${st.lastName}`.trim().toLowerCase())
                    );
                  });
                  const stStatus = entry?.status === 'PRESENT' ? 'P' : entry?.status === 'ABSENT' ? 'A' : entry?.status === 'LATE' ? 'L' : entry?.status === 'LEAVE' ? 'LV' : (entry?.status || 'NM');
                  return (
                    <div key={st._id} className="grid grid-cols-12 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs items-center">
                      <span className="col-span-2 font-mono text-indigo-400 font-bold">{st.rollNo}</span>
                      <span className="col-span-4 text-white font-bold">{st.firstName} {st.lastName}</span>
                      <span className="col-span-3 text-slate-400">{st.parentName || '—'}</span>
                      <span className="col-span-3 text-right">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          stStatus === 'P' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          stStatus === 'A' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          stStatus === 'L' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          stStatus === 'LV' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {stStatus === 'P' ? '🟢 Present' : stStatus === 'A' ? '🔴 Absent' : stStatus === 'L' ? '🟡 Late' : stStatus === 'LV' ? '🔵 Leave' : '⚪ Not Marked'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
            <select value={calMonth} onChange={e => setCalMonth(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <select value={calYear} onChange={e => setCalYear(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Monthly Attendance Calendar — {months[calMonth-1]} {calYear}</h3>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="p-2 text-slate-500 uppercase text-[10px]">{d}</div>)}
              {Array.from({ length: new Date(calYear, calMonth-1, 1).getDay() }).map((_, i) => <div key={`empty-${i}`} className="p-4 bg-slate-950/20 rounded-xl" />)}
              {Array.from({ length: new Date(calYear, calMonth, 0).getDate() }).map((_, i) => {
                const dayNum = i + 1;
                const pad = n => String(n).padStart(2, '0');
                const dateKey = `${calYear}-${pad(calMonth)}-${pad(dayNum)}`;
                const entry = calData?.[dateKey];
                const pct = entry?.average;
                return (
                  <div key={dayNum} className={`p-3 rounded-xl border text-center transition ${
                    pct >= 90 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                    pct >= 75 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                    pct !== null && pct !== undefined ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                    'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}>
                    <span className="font-bold text-white block">{dayNum}</span>
                    <span className="text-[10px] block mt-1 font-mono">{pct !== null && pct !== undefined ? `${pct}%` : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Filter Class</label>
              <select
                value={historyClass}
                onChange={e => {
                  const newClass = e.target.value;
                  setHistoryClass(newClass);
                  const matching = allStudents.filter(s => {
                    const matchC = newClass === 'ALL' || String(s.classId || '').replace(/^Class\s+/i, '').trim() === String(newClass).replace(/^Class\s+/i, '').trim();
                    const matchS = historySection === 'ALL' || String(s.sectionId || '').replace(/^Section\s+/i, '').trim() === String(historySection).replace(/^Section\s+/i, '').trim();
                    return matchC && matchS;
                  });
                  if (matching.length > 0) {
                    setSelectedStudentId(matching[0]._id);
                  } else {
                    setSelectedStudentId('');
                    setStudentHistory(null);
                    setAdminStudentPeriodLogs([]);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
              >
                <option value="ALL">All Classes</option>
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Filter Section</label>
              <select
                value={historySection}
                onChange={e => {
                  const newSec = e.target.value;
                  setHistorySection(newSec);
                  const matching = allStudents.filter(s => {
                    const matchC = historyClass === 'ALL' || String(s.classId || '').replace(/^Class\s+/i, '').trim() === String(historyClass).replace(/^Class\s+/i, '').trim();
                    const matchS = newSec === 'ALL' || String(s.sectionId || '').replace(/^Section\s+/i, '').trim() === String(newSec).replace(/^Section\s+/i, '').trim();
                    return matchC && matchS;
                  });
                  if (matching.length > 0) {
                    setSelectedStudentId(matching[0]._id);
                  } else {
                    setSelectedStudentId('');
                    setStudentHistory(null);
                    setAdminStudentPeriodLogs([]);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
              >
                <option value="ALL">All Sections</option>
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Select Student ({filteredHistoryStudents.length})</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
              >
                {filteredHistoryStudents.length > 0 ? (
                  filteredHistoryStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} (Roll: {s.rollNo}, Class {s.classId}-{s.sectionId})
                    </option>
                  ))
                ) : (
                  <option value="">No students in Class {historyClass}-{historySection}</option>
                )}
              </select>
            </div>
          </div>

          {filteredHistoryStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#0d1117] rounded-2xl border border-slate-800 space-y-2">
              <User className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300 text-sm">No Students Enrolled in Class {historyClass} — Section {historySection}</p>
              <p>Please select a class or section with active enrolled students to view attendance logs.</p>
            </div>
          ) : studentHistory ? (
            <div className="space-y-6">

              {/* VIEW MODE TOGGLE BUTTONS */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span className="font-extrabold text-white text-sm">
                    {studentHistory.student?.name} — Class {studentHistory.student?.classId} ({studentHistory.student?.sectionId})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setAdminAttMode('period')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      adminAttMode === 'period'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Period-Wise Log ({adminStudentPeriodLogs.length})
                  </button>
                  <button
                    onClick={() => setAdminAttMode('daily')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      adminAttMode === 'daily'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Daily Register ({studentHistory.records?.length || 0})
                  </button>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard label="Overall Attendance" value={`${studentHistory.summary?.attendancePercentage || 100}%`} icon={CheckCircle} color="emerald" />
                <StatCard label="Period-Wise Rate" value={`${adminStudentPeriodLogs.length > 0 ? Math.round((adminStudentPeriodLogs.filter(p => p.status === 'PRESENT' || p.status === 'LATE').length / adminStudentPeriodLogs.length) * 100) : 100}%`} icon={Clock} color="indigo" />
                <StatCard label="Days Present" value={`${studentHistory.summary?.totalPresent || 0} / ${studentHistory.summary?.totalWorkingDays || 0}`} icon={Check} color="cyan" />
                <StatCard label="Absences & Missed" value={(adminStudentPeriodLogs.filter(p => p.status === 'ABSENT').length) + (studentHistory.summary?.totalAbsent || 0)} icon={X} color="rose" />
              </div>

              {/* DATE FILTER BAR */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="font-extrabold text-white">Filter Student Attendance By Date:</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setAdminAttFilterDate('')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      adminAttFilterDate === '' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => setAdminAttFilterDate(getLocalDateStr())}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      adminAttFilterDate === getLocalDateStr() ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Today
                  </button>
                  
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Select Date:</span>
                    <input
                      type="date"
                      value={adminAttFilterDate}
                      onChange={e => setAdminAttFilterDate(e.target.value)}
                      className="bg-transparent text-white font-mono font-bold focus:outline-none"
                    />
                  </div>

                  {adminAttFilterDate && (
                    <button
                      onClick={() => setAdminAttFilterDate('')}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold"
                    >
                      ✕ Clear Date Filter
                    </button>
                  )}
                </div>
              </div>

              {/* PERIOD-WISE ATTENDANCE LOG TABLE */}
              {adminAttMode === 'period' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>⏱️ Period-Wise Attendance Log</span>
                    <span className="text-cyan-400 font-mono text-[11px]">
                      {adminStudentPeriodLogs.filter(log => !adminAttFilterDate || String(log.date).startsWith(adminAttFilterDate)).length} Sessions Shown
                    </span>
                  </h4>

                  {adminStudentPeriodLogs.filter(log => !adminAttFilterDate || String(log.date).startsWith(adminAttFilterDate)).length > 0 ? (
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black border-b border-slate-800">
                            <tr>
                              <th className="p-3.5">Date</th>
                              <th className="p-3.5">Period & Subject</th>
                              <th className="p-3.5">Attendance Status</th>
                              <th className="p-3.5">Class & Section</th>
                              <th className="p-3.5 text-right">Faculty Sign-off</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {adminStudentPeriodLogs
                              .filter(log => !adminAttFilterDate || String(log.date).startsWith(adminAttFilterDate))
                              .map(log => (
                              <tr key={log._id} className="hover:bg-slate-900/40 transition">
                                <td className="p-3.5 font-mono text-slate-200 font-semibold">
                                  {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="p-3.5 font-semibold text-cyan-300 flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] border border-cyan-500/30">
                                    Period {log.periodNo}
                                  </span>
                                  <span>{log.subject || 'Mathematics'}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    log.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                    log.status === 'ABSENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                    log.status === 'LATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  }`}>
                                    {log.status === 'PRESENT' ? '🟢 Present' : log.status === 'ABSENT' ? '🔴 Absent' : log.status === 'LATE' ? '🟡 Late' : '🔵 Leave'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-indigo-300 font-bold">Class {log.classId} — {log.sectionId}</td>
                                <td className="p-3.5 text-right font-mono text-slate-400">{log.markedBy || 'Faculty'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                      <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-bold text-slate-300">
                        {adminAttFilterDate ? `No period attendance records found for ${adminAttFilterDate}.` : 'No period-wise attendance records logged for this student yet.'}
                      </p>
                      <p>Select another date or click "All Dates" to view attendance logs.</p>
                    </div>
                  )}
                </div>
              )}

              {/* DAILY ATTENDANCE LOG TABLE */}
              {adminAttMode === 'daily' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>🌅 Daily Roll Call Calendar</span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {(studentHistory.records || []).filter(log => !adminAttFilterDate || String(log.date).startsWith(adminAttFilterDate)).length} Days Shown
                    </span>
                  </h4>

                  {(studentHistory.records || []).filter(log => !adminAttFilterDate || String(log.date).startsWith(adminAttFilterDate)).length > 0 ? (
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black border-b border-slate-800">
                            <tr>
                              <th className="p-3.5">Date</th>
                              <th className="p-3.5">Attendance Status</th>
                              <th className="p-3.5">Class & Section</th>
                              <th className="p-3.5 text-right">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {(studentHistory.records || [])
                              .filter(log => !adminAttFilterDate || String(log.date).startsWith(adminAttFilterDate))
                              .map((log, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/40 transition">
                                <td className="p-3.5 font-mono text-slate-200 font-semibold">
                                  {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    log.status === 'P' || log.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                    log.status === 'A' || log.status === 'ABSENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                    log.status === 'L' || log.status === 'LATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  }`}>
                                    {log.status === 'P' || log.status === 'PRESENT' ? '🟢 Present' : log.status === 'A' || log.status === 'ABSENT' ? '🔴 Absent' : log.status === 'L' || log.status === 'LATE' ? '🟡 Late' : '🔵 Leave'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-indigo-300 font-bold">Class {log.classId} — {log.sectionId}</td>
                                <td className="p-3.5 text-right font-mono text-slate-400">{log.remarks || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                      <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-bold text-slate-300">
                        {adminAttFilterDate ? `No daily attendance logs found for ${adminAttFilterDate}.` : 'No daily attendance logs recorded for this student yet.'}
                      </p>
                      <p>Select another date or click "All Dates" to view attendance logs.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}




      {activeSubTab === 'corrections' && (
        <div className="space-y-4">
          <ModuleTable
            title="Attendance Correction Requests" icon={Edit2} color="amber"
            loading={corrLoading} rows={corrections}
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'studentName', label: 'Student' },
              { key: 'classId', label: 'Class', render: (_, r) => `${r.classId}-${r.sectionId}` },
              { key: 'oldStatus', label: 'Old', badge: true },
              { key: 'newStatus', label: 'Requested', badge: true },
              { key: 'reason', label: 'Reason' },
              { key: 'requestedByName', label: 'Teacher' },
              { key: 'status', label: 'Status', badge: true },
            ]}
            extraActions={r => r.status === 'PENDING' ? (
              <div className="flex gap-1">
                <button onClick={() => setReviewModal(r)} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold hover:bg-indigo-500/30">Review</button>
              </div>
            ) : null}
          />

          {reviewModal && typeof window !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 overflow-y-auto">
              <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 relative z-10">
                <h3 className="font-bold text-white">Review Correction Request</h3>
                <p className="text-xs text-slate-400">{reviewModal.studentName} ({reviewModal.classId}-{reviewModal.sectionId}): Change from {reviewModal.oldStatus} → <strong className="text-emerald-400">{reviewModal.newStatus}</strong></p>
                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">Reason: {reviewModal.reason}</p>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Admin remarks (optional)..." rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                <div className="flex gap-3">
                  <button onClick={() => handleReviewCorrection('REJECT')} className="flex-1 py-2 rounded-xl bg-rose-600/20 text-rose-300 text-xs font-bold border border-rose-500/30">Reject</button>
                  <button onClick={() => handleReviewCorrection('APPROVE')} className="flex-1 py-2 rounded-xl gradient-primary text-white text-xs font-bold">Approve & Update</button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
            <select value={calMonth} onChange={e => setCalMonth(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <button onClick={loadReport} className="px-4 py-1.5 rounded-xl gradient-primary text-white text-xs font-bold">Generate Report</button>
          </div>

          {reportLoading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto py-8" /> : reportData && (
            <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Monthly Register Summary — Class {reportData.classId} {reportData.sectionId} ({months[reportData.month-1]} {reportData.year})</h3>
                <span className="text-xs text-slate-400">Total Working Days: {reportData.totalWorkingDays}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-black">
                    <tr><th className="p-3">Roll</th><th className="p-3">Student</th><th className="p-3">Present</th><th className="p-3">Absent</th><th className="p-3">Late</th><th className="p-3">Rate %</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reportData.report?.map(r => (
                      <tr key={r.studentId} className="hover:bg-slate-900/40">
                        <td className="p-3 font-mono text-indigo-400 font-bold">{r.rollNo}</td>
                        <td className="p-3 font-bold text-white">{r.studentName}</td>
                        <td className="p-3 text-emerald-400">{r.present}</td>
                        <td className="p-3 text-rose-400">{r.absent}</td>
                        <td className="p-3 text-amber-400">{r.late}</td>
                        <td className="p-3 font-black text-indigo-300">{r.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white">Attendance System Settings & Rules</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Attendance Mode</label>
              <select value={settings.mode} onChange={e => setSettings({ ...settings, mode: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="DAILY">Daily Roll Call (1 record / student / day)</option>
                <option value="PERIOD">Period-Wise (Per subject / period)</option>
                <option value="HYBRID">Hybrid (Morning roll call + Period-wise)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Low Attendance Alert Threshold (%)</label>
              <input type="number" value={settings.lowAttendanceThreshold} onChange={e => setSettings({ ...settings, lowAttendanceThreshold: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">School Start Time</label>
              <input type="time" value={settings.schoolStartTime} onChange={e => setSettings({ ...settings, schoolStartTime: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">School End Time</label>
              <input type="time" value={settings.schoolEndTime} onChange={e => setSettings({ ...settings, schoolEndTime: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button onClick={handleSaveSettings} disabled={settingsSaving} className="px-6 py-2.5 gradient-primary text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
              {settingsSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamsTab() {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SAAS_SUPER_ADMIN' || user?.designation === 'SCHOOL_ADMIN' || user?.designation === 'PRINCIPAL' || user?.role === 'PRINCIPAL';

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [dateSheetModalExam, setDateSheetModalExam] = useState(null);
  const [saving, setSaving] = useState(false);

  // Dynamic DB metadata state
  const [dbClasses, setDbClasses] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]);

  // Form State
  const [form, setForm] = useState({
    title: '',
    examType: 'Mid-Term',
    customExamType: '',
    targetClass: '',
    customTargetClass: '',
    academicYear: '2026-2027',
    startDate: '',
    endDate: '',
    totalMarks: 100,
    passingMarks: 35,
    subjectSchedules: []
  });

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/exams');
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDBMetadata = useCallback(async () => {
    try {
      const [clsData, subData] = await Promise.all([
        apiFetch('/admin/classes').catch(() => []),
        apiFetch('/admin/subjects').catch(() => [])
      ]);
      setDbClasses(Array.isArray(clsData) ? clsData : []);
      setDbSubjects(Array.isArray(subData) ? subData : []);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  }, []);

  useEffect(() => {
    loadExams();
    loadDBMetadata();
  }, [loadExams, loadDBMetadata]);

  // Extract unique class labels dynamically from DB
  const availableClassOptions = useMemo(() => {
    const list = [];
    dbClasses.forEach(c => {
      const name = c.className || c.name || '';
      if (!name) return;
      if (Array.isArray(c.sections) && c.sections.length > 0) {
        c.sections.forEach(sec => list.push(`Class ${name}-${sec}`));
      } else {
        list.push(`Class ${name}`);
      }
    });
    return Array.from(new Set(list));
  }, [dbClasses]);

  // Extract unique subject names dynamically from DB
  const availableSubjectOptions = useMemo(() => {
    const list = dbSubjects.map(s => s.subjectName || s.name || s.title || s.code).filter(Boolean);
    if (list.length === 0) {
      return ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science'];
    }
    return Array.from(new Set(list));
  }, [dbSubjects]);

  const handleOpenAdd = () => {
    setEditingExam(null);
    const initialSubs = availableSubjectOptions.slice(0, 4).map(subName => ({
      subjectName: subName,
      examDate: '',
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      totalMarks: 100,
      passingMarks: 33
    }));

    setForm({
      title: '',
      examType: 'Mid-Term',
      customExamType: '',
      targetClass: availableClassOptions[0] || '',
      customTargetClass: '',
      academicYear: '2026-2027',
      startDate: '',
      endDate: '',
      totalMarks: 100,
      passingMarks: 35,
      subjectSchedules: initialSubs.length > 0 ? initialSubs : [
        { subjectName: 'Mathematics', examDate: '', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 100, passingMarks: 33 }
      ]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    const standardTypes = ['Unit Test', 'Periodic Test', 'Mid-Term', 'Final Exam', 'Practical', 'Internal Assessment'];
    const isCustomType = exam.examType && !standardTypes.includes(exam.examType);
    const isCustomClass = exam.targetClass && !availableClassOptions.includes(exam.targetClass);

    setForm({
      title: exam.title || '',
      examType: isCustomType ? 'CUSTOM' : (exam.examType || 'Mid-Term'),
      customExamType: isCustomType ? exam.examType : '',
      targetClass: isCustomClass ? 'CUSTOM' : (exam.targetClass || ''),
      customTargetClass: isCustomClass ? exam.targetClass : '',
      academicYear: exam.academicYear || '2026-2027',
      startDate: exam.startDate ? new Date(exam.startDate).toISOString().split('T')[0] : '',
      endDate: exam.endDate ? new Date(exam.endDate).toISOString().split('T')[0] : '',
      totalMarks: exam.totalMarks ?? 100,
      passingMarks: exam.passingMarks ?? 35,
      subjectSchedules: Array.isArray(exam.subjectSchedules) && exam.subjectSchedules.length > 0
        ? exam.subjectSchedules.map(s => ({
            subjectName: s.subjectName || '',
            examDate: s.examDate || '',
            startTime: s.startTime || '09:00 AM',
            endTime: s.endTime || '12:00 PM',
            totalMarks: s.totalMarks ?? (exam.totalMarks || 100),
            passingMarks: s.passingMarks ?? (exam.passingMarks || 35)
          }))
        : (exam.subjects || availableSubjectOptions.slice(0, 3)).map(sub => ({
            subjectName: sub,
            examDate: '',
            startTime: '09:00 AM',
            endTime: '12:00 PM',
            totalMarks: exam.totalMarks || 100,
            passingMarks: exam.passingMarks || 35
          }))
    });
    setModalOpen(true);
  };

  const handleAddSubjectRow = () => {
    setForm(prev => ({
      ...prev,
      subjectSchedules: [
        ...prev.subjectSchedules,
        {
          subjectName: availableSubjectOptions[0] || '',
          examDate: '',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          totalMarks: Number(prev.totalMarks) || 100,
          passingMarks: Number(prev.passingMarks) || 35
        }
      ]
    }));
  };

  const handleRemoveSubjectRow = (index) => {
    setForm(prev => ({
      ...prev,
      subjectSchedules: prev.subjectSchedules.filter((_, i) => i !== index)
    }));
  };

  const handleSubjectRowChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.subjectSchedules];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, subjectSchedules: updated };
    });
  };

  const handleApplyMarksToAll = () => {
    setForm(prev => ({
      ...prev,
      subjectSchedules: prev.subjectSchedules.map(s => ({
        ...s,
        totalMarks: Number(prev.totalMarks) || 100,
        passingMarks: Number(prev.passingMarks) || 35
      }))
    }));
  };

  const handleAutoPopulateSubjects = () => {
    setForm(prev => ({
      ...prev,
      subjectSchedules: availableSubjectOptions.map(s => ({
        subjectName: s,
        examDate: prev.startDate || '',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        totalMarks: Number(prev.totalMarks) || 100,
        passingMarks: Number(prev.passingMarks) || 35
      }))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter an Exam Title');
      return;
    }

    const finalExamType = form.examType === 'CUSTOM' ? form.customExamType.trim() : form.examType;
    if (form.examType === 'CUSTOM' && !finalExamType) {
      alert('Please specify your Custom Exam Type');
      return;
    }

    const finalTargetClass = form.targetClass === 'CUSTOM' ? form.customTargetClass.trim() : form.targetClass;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        examType: finalExamType,
        targetClass: finalTargetClass,
        academicYear: form.academicYear,
        startDate: form.startDate,
        endDate: form.endDate,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        subjectSchedules: form.subjectSchedules,
        subjects: form.subjectSchedules.map(s => s.subjectName).filter(Boolean)
      };

      if (editingExam) {
        await apiFetch(`/admin/exams/${editingExam._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/admin/exams', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setModalOpen(false);
      loadExams();
    } catch (err) {
      alert(err.message || 'Failed to save exam schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      await apiFetch(`/admin/exams/${id}`, { method: 'DELETE' });
      loadExams();
    } catch (err) {
      alert(err.message || 'Failed to delete exam');
    }
  };

  const handleTogglePublish = async (exam) => {
    try {
      await apiFetch(`/admin/exams/${exam._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: !exam.isPublished })
      });
      loadExams();
    } catch (err) {
      alert(err.message || 'Failed to update publish status');
    }
  };

  const filteredExams = exams.filter(ex => {
    const matchSearch = !search || (ex.title && ex.title.toLowerCase().includes(search.toLowerCase())) || (ex.targetClass && ex.targetClass.toLowerCase().includes(search.toLowerCase()));
    const matchClass = classFilter === 'ALL' || ex.targetClass === classFilter;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Exams & Schedule Management</h2>
            <p className="text-xs text-slate-500">View exam date-sheets, subject dates, times, total marks & pass marks</p>
          </div>
        </div>
        {isSchoolAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Exam & Date-Sheet
          </button>
        )}
      </div>

      {/* Filter Toolbar with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exam title or class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Class:</span>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Classes</option>
              {availableClassOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
              {Array.from(new Set(exams.map(e => e.targetClass).filter(c => c && !availableClassOptions.includes(c)))).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              title="List Table View"
            >
              <List className="w-3.5 h-3.5" /> <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Display: Grid Cards vs List Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs shadow-sm">
          {isSchoolAdmin ? (
            <span>No exams found. Click <strong>"Add Exam & Date-Sheet"</strong> to schedule a new examination.</span>
          ) : (
            <span>No exam timetables published yet.</span>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map(ex => {
            const schedules = Array.isArray(ex.subjectSchedules) ? ex.subjectSchedules : [];
            return (
              <div key={ex._id} className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{ex.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {ex.examType || 'Exam'}
                        </span>
                        {ex.targetClass && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {ex.targetClass}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${ex.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {ex.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Academic Year:</span>
                      <strong className="text-slate-800">{ex.academicYear || '2026-2027'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subjects Scheduled:</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                        {schedules.length} Subjects
                      </span>
                    </div>
                    {ex.startDate && (
                      <div className="flex justify-between items-center pt-0.5">
                        <span>Exam Dates:</span>
                        <strong className="text-slate-800 text-[11px] font-mono">
                          {new Date(ex.startDate).toLocaleDateString()} {ex.endDate ? `- ${new Date(ex.endDate).toLocaleDateString()}` : ''}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDateSheetModalExam(ex)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-200/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Date-Sheet
                  </button>
                  <div className="flex items-center gap-1.5">
                    {isSchoolAdmin && (
                      <button
                        onClick={() => handleTogglePublish(ex)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${ex.isPublished ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
                      >
                        {ex.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    )}
                    {isSchoolAdmin && (
                      <button
                        onClick={() => handleOpenEdit(ex)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer border border-slate-200"
                        title="Edit Schedule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSchoolAdmin && (
                      <button
                        onClick={() => handleDelete(ex._id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Exam Title</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Academic Year</th>
                  <th className="p-3.5 text-center">Subjects</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredExams.map((ex, i) => {
                  const schedules = Array.isArray(ex.subjectSchedules) ? ex.subjectSchedules : [];
                  return (
                    <tr key={ex._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono text-slate-400">{i + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{ex.title}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {ex.examType || 'Exam'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{ex.targetClass || 'All'}</td>
                      <td className="p-3.5 text-slate-600 font-mono">{ex.academicYear || '2026-2027'}</td>
                      <td className="p-3.5 text-center font-bold text-indigo-600 font-mono">{schedules.length}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ex.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {ex.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDateSheetModalExam(ex)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-indigo-200/60"
                          >
                            <Eye className="w-3.5 h-3.5" /> Date-Sheet
                          </button>
                          {isSchoolAdmin && (
                            <button
                              onClick={() => handleTogglePublish(ex)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${ex.isPublished ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
                            >
                              {ex.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                          )}
                          {isSchoolAdmin && (
                            <button
                              onClick={() => handleOpenEdit(ex)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer border border-slate-200"
                              title="Edit Schedule"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSchoolAdmin && (
                            <button
                              onClick={() => handleDelete(ex._id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200"
                              title="Delete Exam"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP DATE-SHEET MODAL */}
      {dateSheetModalExam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto space-y-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{dateSheetModalExam.title}</h3>
                  <p className="text-xs text-slate-500">
                    Target Class: <strong className="text-slate-800">{dateSheetModalExam.targetClass || 'All'}</strong> · Academic Year: <strong className="text-slate-800">{dateSheetModalExam.academicYear || '2026-2027'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDateSheetModalExam(null)}
                className="p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {(!dateSheetModalExam.subjectSchedules || dateSheetModalExam.subjectSchedules.length === 0) ? (
                <div className="p-6 text-center text-slate-500 italic bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  No subject schedule timetable configured for this exam yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-black border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">#</th>
                        <th className="p-3.5">Subject Name</th>
                        <th className="p-3.5">Exam Date</th>
                        <th className="p-3.5">Exam Time</th>
                        <th className="p-3.5 text-center">Total Marks</th>
                        <th className="p-3.5 text-center">Pass Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {dateSheetModalExam.subjectSchedules.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{s.subjectName}</td>
                          <td className="p-3.5 text-indigo-600 font-mono font-semibold">{s.examDate || '—'}</td>
                          <td className="p-3.5 text-slate-700 font-mono">{s.startTime || '—'} {s.endTime ? `- ${s.endTime}` : ''}</td>
                          <td className="p-3.5 text-center font-bold text-emerald-600 font-mono">{s.totalMarks ?? 100}</td>
                          <td className="p-3.5 text-center font-bold text-amber-600 font-mono">{s.passingMarks ?? 35}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setDateSheetModalExam(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EXAM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0d1117] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingExam ? 'Edit Exam & Scheduling' : 'Add Exams & Scheduling'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure subject dates, times, total marks and pass marks</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* General Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Exam Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-Term Examination 2026"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Exam Type with Dynamic Custom Option */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Exam Type</label>
                  <select
                    value={form.examType}
                    onChange={e => setForm({ ...form, examType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Periodic Test">Periodic Test</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="Final Exam">Final Exam</option>
                    <option value="Practical">Practical</option>
                    <option value="Internal Assessment">Internal Assessment</option>
                    <option value="CUSTOM">✨ + Custom Exam Type...</option>
                  </select>
                  {form.examType === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom exam type (e.g. Quarterly Exam)..."
                      value={form.customExamType}
                      onChange={e => setForm({ ...form, customExamType: e.target.value })}
                      className="mt-2 w-full bg-slate-900 border border-indigo-500 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                    />
                  )}
                </div>

                {/* Target Class with Dynamic DB Dropdown */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Class (Dynamic)</label>
                  <select
                    value={form.targetClass}
                    onChange={e => setForm({ ...form, targetClass: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Class --</option>
                    {availableClassOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    <option value="CUSTOM">✏️ + Enter Custom Class...</option>
                  </select>
                  {form.targetClass === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom class name (e.g. Class 12-A)..."
                      value={form.customTargetClass}
                      onChange={e => setForm({ ...form, customTargetClass: e.target.value })}
                      className="mt-2 w-full bg-slate-900 border border-indigo-500 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={form.academicYear}
                    onChange={e => setForm({ ...form, academicYear: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Default Total Marks</label>
                  <input
                    type="number"
                    value={form.totalMarks}
                    onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Default Passing Marks</label>
                  <input
                    type="number"
                    value={form.passingMarks}
                    onChange={e => setForm({ ...form, passingMarks: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Subject-Wise Timetable Builder */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Subject-Wise Exam Date, Time & Pass Marks
                    </h4>
                    <p className="text-[11px] text-slate-400">Specify date, time, total marks & pass marks per subject (Dynamic DB Subjects)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoPopulateSubjects}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-[10px] border border-slate-700 transition cursor-pointer"
                    >
                      ⚡ Populate Database Subjects
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyMarksToAll}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-[10px] border border-slate-700 transition cursor-pointer"
                    >
                      Apply Marks to All
                    </button>
                  </div>
                </div>

                {/* Table of Dynamic Subject Schedules */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {form.subjectSchedules.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-slate-500">
                      No subjects added yet. Click <strong>"+ Add Subject Schedule"</strong> or <strong>"Populate Database Subjects"</strong>.
                    </div>
                  ) : (
                    form.subjectSchedules.map((row, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap lg:flex-nowrap items-center gap-2.5">
                        <div className="w-full lg:w-44">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Subject (Dynamic)</label>
                          <select
                            value={availableSubjectOptions.includes(row.subjectName) ? row.subjectName : (row.subjectName ? row.subjectName : '')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'CUSTOM') {
                                handleSubjectRowChange(idx, 'subjectName', '');
                                handleSubjectRowChange(idx, 'isCustom', true);
                              } else {
                                handleSubjectRowChange(idx, 'subjectName', val);
                                handleSubjectRowChange(idx, 'isCustom', false);
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-indigo-500 text-xs"
                          >
                            <option value="">-- Select Subject --</option>
                            {row.subjectName && !availableSubjectOptions.includes(row.subjectName) && row.subjectName !== 'CUSTOM' && (
                              <option value={row.subjectName}>{row.subjectName}</option>
                            )}
                            {availableSubjectOptions.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                            <option value="CUSTOM">✏️ + Enter Custom Subject...</option>
                          </select>
                          {row.isCustom && (
                            <input
                              type="text"
                              required
                              placeholder="Type custom subject name..."
                              value={row.subjectName}
                              onChange={e => handleSubjectRowChange(idx, 'subjectName', e.target.value)}
                              className="mt-1.5 w-full bg-slate-950 border border-indigo-500 rounded-lg px-2 py-1.5 text-white text-xs"
                            />
                          )}
                        </div>

                        <div className="w-1/2 lg:w-32">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Exam Date</label>
                          <input
                            type="date"
                            value={row.examDate}
                            onChange={e => handleSubjectRowChange(idx, 'examDate', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white focus:border-indigo-500 text-xs"
                          />
                        </div>

                        <div className="w-1/2 lg:w-28">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Start Time</label>
                          <input
                            type="text"
                            placeholder="09:00 AM"
                            value={row.startTime}
                            onChange={e => handleSubjectRowChange(idx, 'startTime', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white focus:border-indigo-500 text-xs"
                          />
                        </div>

                        <div className="w-1/2 lg:w-28">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">End Time</label>
                          <input
                            type="text"
                            placeholder="12:00 PM"
                            value={row.endTime}
                            onChange={e => handleSubjectRowChange(idx, 'endTime', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white focus:border-indigo-500 text-xs"
                          />
                        </div>

                        <div className="w-1/4 lg:w-24">
                          <label className="text-[9px] uppercase font-bold text-emerald-400 block mb-0.5">Total Marks</label>
                          <input
                            type="number"
                            value={row.totalMarks}
                            onChange={e => handleSubjectRowChange(idx, 'totalMarks', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-emerald-300 font-bold focus:border-indigo-500 text-xs"
                          />
                        </div>

                        <div className="w-1/4 lg:w-24">
                          <label className="text-[9px] uppercase font-bold text-amber-400 block mb-0.5">Pass Marks</label>
                          <input
                            type="number"
                            value={row.passingMarks}
                            onChange={e => handleSubjectRowChange(idx, 'passingMarks', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-amber-300 font-bold focus:border-indigo-500 text-xs"
                          />
                        </div>

                        <div className="pt-4 lg:pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectRow(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                            title="Remove Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 font-bold text-xs border border-dashed border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Subject Schedule Row
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {saving ? 'Saving...' : 'Save Exam Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const HomeworkTab = makeSimpleCRUDTab({
  title: 'Homework Manager', icon: FileText, color: 'indigo', endpoint: '/admin/homework',
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'classId', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'teacherName', label: 'Teacher' },
    { key: 'dueDate', label: 'Due Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'isPublished', label: 'Status', render: v => v ? <span className="text-emerald-400">Published</span> : <span className="text-amber-400">Draft</span> },
  ],
  fields: [
    { key: 'title', label: 'Homework Title', required: true },
    { key: 'classId', label: 'Class', required: true },
    { key: 'sectionId', label: 'Section' },
    { key: 'subject', label: 'Subject', required: true },
    { key: 'teacherName', label: 'Teacher Name', required: true },
    { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
    { key: 'description', label: 'Description / Instructions', type: 'textarea' },
  ]
});

const LMSTab = makeSimpleCRUDTab({
  title: 'LMS & Course Content', icon: BookOpen, color: 'violet', endpoint: '/admin/lms',
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'classId', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'contentType', label: 'Type', badge: true },
    { key: 'uploadedBy', label: 'Uploaded By' },
  ],
  fields: [
    { key: 'title', label: 'Content Title', required: true },
    { key: 'classId', label: 'Class', required: true },
    { key: 'subject', label: 'Subject', required: true },
    { key: 'contentType', label: 'Content Type', type: 'select', options: ['PDF', 'VIDEO', 'NOTE', 'QUESTION_BANK', 'ASSIGNMENT'] },
    { key: 'fileUrl', label: 'File URL / Link' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'uploadedBy', label: 'Uploaded By' },
  ]
});

const FeeCategoriesTab = makeSimpleCRUDTab({
  title: 'Fee Categories', icon: DollarSign, color: 'emerald', endpoint: '/admin/fee-categories',
  columns: [
    { key: 'name', label: 'Category Name' },
    { key: 'description', label: 'Description' },
  ],
  fields: [
    { key: 'name', label: 'Category Name (e.g. Tuition Fee)', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
  ]
});

const FeeStructuresTab = makeSimpleCRUDTab({
  title: 'Fee Structures', icon: Scroll, color: 'emerald', endpoint: '/admin/fee-structures',
  columns: [
    { key: 'name', label: 'Structure Name' },
    { key: 'classId', label: 'Class' },
    { key: 'academicYear', label: 'Acad. Year' },
    { key: 'totalAmount', label: 'Total Amount', render: v => `â‚¹${(v || 0).toLocaleString()}` },
  ],
  fields: [
    { key: 'name', label: 'Structure Name', required: true },
    { key: 'classId', label: 'Applicable Class' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'totalAmount', label: 'Total Amount (â‚¹)', type: 'number', required: true },
  ]
});

const StudentFeesTab = makeSimpleCRUDTab({
  title: 'Student Fees & Payments', icon: Calculator, color: 'emerald', endpoint: '/admin/student-fees',
  columns: [
    { key: 'studentName', label: 'Student' },
    { key: 'classId', label: 'Class' },
    { key: 'totalAmount', label: 'Total', render: v => `â‚¹${(v || 0).toLocaleString()}` },
    { key: 'paidAmount', label: 'Paid', render: v => `â‚¹${(v || 0).toLocaleString()}` },
    { key: 'dueAmount', label: 'Due', render: v => `â‚¹${(v || 0).toLocaleString()}` },
    { key: 'status', label: 'Status', badge: true },
    { key: 'dueDate', label: 'Due Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
  ],
  fields: [
    { key: 'studentName', label: 'Student Name', required: true },
    { key: 'classId', label: 'Class' },
    { key: 'totalAmount', label: 'Total Amount (â‚¹)', type: 'number', required: true },
    { key: 'paidAmount', label: 'Paid Amount (â‚¹)', type: 'number' },
    { key: 'dueAmount', label: 'Due Amount (â‚¹)', type: 'number' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'] },
  ]
});

const LeaveManagementTab = makeSimpleCRUDTab({
  title: 'Leave Requests', icon: Calendar, color: 'amber', endpoint: '/admin/leave-requests',
  columns: [
    { key: 'applicantName', label: 'Applicant' },
    { key: 'applicantRole', label: 'Role' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'fromDate', label: 'From', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'toDate', label: 'To', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'totalDays', label: 'Days' },
    { key: 'status', label: 'Status', badge: true },
  ],
  fields: [
    { key: 'applicantName', label: 'Applicant Name', required: true },
    { key: 'applicantRole', label: 'Role', type: 'select', options: ['PRINCIPAL', 'VICE_PRINCIPAL', 'HEADMASTER', 'TEACHER', 'ADMIN', 'STAFF', 'STUDENT'] },

    { key: 'leaveType', label: 'Leave Type', required: true },
    { key: 'fromDate', label: 'From Date', type: 'date', required: true },
    { key: 'toDate', label: 'To Date', type: 'date', required: true },
    { key: 'reason', label: 'Reason', type: 'textarea', required: true },
  ]
});

const LibraryTab = makeSimpleCRUDTab({
  title: 'Library â€” Books', icon: Library, color: 'violet', endpoint: '/admin/library/books',
  searchable: true,
  columns: [
    { key: 'title', label: 'Book Title' },
    { key: 'author', label: 'Author' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'category', label: 'Category' },
    { key: 'totalCopies', label: 'Total' },
    { key: 'availableCopies', label: 'Available' },
    { key: 'status', label: 'Status', badge: true },
  ],
  fields: [
    { key: 'title', label: 'Book Title', required: true },
    { key: 'author', label: 'Author', required: true },
    { key: 'isbn', label: 'ISBN' },
    { key: 'category', label: 'Category', required: true },
    { key: 'publisher', label: 'Publisher' },
    { key: 'edition', label: 'Edition' },
    { key: 'totalCopies', label: 'Total Copies', type: 'number' },
    { key: 'shelfLocation', label: 'Shelf Location' },
  ]
});

function TransportTab() {
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [routeModal, setRouteModal] = useState(null);
  const [studentAllocationModal, setStudentAllocationModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        apiFetch('/admin/transport'),
        apiFetch('/students')
      ]);
      setRoutes(Array.isArray(tRes) ? tRes : []);
      setStudents(Array.isArray(sRes) ? sRes : []);
    } catch (e) {
      showMsg('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveRoute = async (form) => {
    setSaving(true);
    try {
      if (routeModal.editing && routeModal.editing._id) {
        await apiFetch(`/admin/transport/${routeModal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        showMsg('success', '✅ Bus Route & Driver details updated!');
      } else {
        await apiFetch('/admin/transport', { method: 'POST', body: JSON.stringify(form) });
        showMsg('success', '✅ Bus Route created successfully!');
      }
      setRouteModal(null);
      loadData();
    } catch (e) {
      showMsg('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm('Are you sure you want to delete this bus route?')) return;
    try {
      await apiFetch(`/admin/transport/${id}`, { method: 'DELETE' });
      showMsg('success', '✅ Route deleted.');
      loadData();
    } catch (e) {
      showMsg('error', e.message);
    }
  };

  const handleAssignStudent = async (routeId, studentId, pickupStop, monthlyFee) => {
    try {
      const res = await apiFetch(`/admin/transport/${routeId}/assign-student`, {
        method: 'POST',
        body: JSON.stringify({ studentId, pickupStop, monthlyFee })
      });
      showMsg('success', '✅ Student assigned to bus route!');
      setStudentAllocationModal(res);
      setRoutes(prev => prev.map(r => r._id === res._id ? res : r));
    } catch (e) {
      showMsg('error', e.message);
    }
  };

  const handleRemoveStudent = async (routeId, studentId) => {
    try {
      const res = await apiFetch(`/admin/transport/${routeId}/remove-student`, {
        method: 'POST',
        body: JSON.stringify({ studentId })
      });
      showMsg('success', '✅ Student removed from bus route.');
      setStudentAllocationModal(res);
      setRoutes(prev => prev.map(r => r._id === res._id ? res : r));
    } catch (e) {
      showMsg('error', e.message);
    }
  };

  const cleanClass = (cls) => String(cls || '').replace(/^class\s*/i, '').trim();
  const cleanSection = (sec) => String(sec || '').replace(/^sec(tion)?\s*/i, '').trim().toUpperCase();

  const totalVehicles = routes.length;
  const totalCapacity = routes.reduce((acc, r) => acc + (Number(r.capacity) || 0), 0);
  const totalAssigned = routes.reduce((acc, r) => acc + ((r.assignedStudents || []).length), 0);

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>
          {msg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <Bus className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Transport & Fleet Management</h3>
            <p className="text-[11px] text-slate-400">Bus Routes, Driver & Helper details, and Student Fleet Allocation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl font-medium">
            🚌 <strong className="text-white">{totalVehicles}</strong> Routes
          </span>
          <span className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl font-medium">
            👥 <strong className="text-emerald-400">{totalAssigned}</strong> / {totalCapacity} Seats Filled
          </span>
          <button
            onClick={() => setRouteModal({ editing: null })}
            className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:opacity-95"
          >
            <Plus className="w-4 h-4" /> Add Bus Route
          </button>
        </div>
      </div>

      {/* Routes Directory Table */}
      <ModuleTable
        title="Bus Routes & Drivers" icon={Bus} color="indigo"
        loading={loading} rows={routes}
        columns={[
          { key: 'routeName', label: 'Route Name', render: v => <span className="font-bold text-white">{v}</span> },
          { 
            key: 'vehicleNo', label: 'Vehicle Number & Type', 
            render: (v, r) => (
              <div>
                <span className="font-mono font-bold text-indigo-300">{v}</span>
                <span className="text-[10px] text-slate-400 block font-medium">{r.vehicleType || 'Bus'}</span>
              </div>
            ) 
          },
          { 
            key: 'driverName', label: 'Driver Info', 
            render: (v, r) => (
              <div>
                <span className="font-semibold text-slate-200">{v}</span>
                <span className="text-[10px] text-slate-400 font-mono block">{r.driverPhone}</span>
              </div>
            ) 
          },
          { 
            key: 'helperName', label: 'Helper / Attendant', 
            render: (v, r) => (
              <div>
                <span className="font-semibold text-slate-200">{v || '—'}</span>
                {r.helperPhone && <span className="text-[10px] text-slate-400 font-mono block">{r.helperPhone}</span>}
              </div>
            ) 
          },
          { 
            key: 'assignedStudents', label: 'Seat Occupancy', 
            render: (v, r) => {
              const count = (v || []).length;
              const cap = r.capacity || 40;
              const pct = Math.min(100, Math.round((count / cap) * 100));
              return (
                <div className="w-32">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-slate-300">{count} / {cap} Seats</span>
                    <span className={pct > 90 ? 'text-rose-400' : 'text-emerald-400'}>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${pct > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            } 
          },
          { key: 'monthlyFee', label: 'Monthly Fee', render: v => <span className="font-mono font-bold text-emerald-400">₹{v || 0}</span> },
          { key: 'isActive', label: 'Status', render: v => v !== false ? <span className="text-emerald-400 font-bold text-xs">✓ Active</span> : <span className="text-slate-500 text-xs">Inactive</span> },
        ]}
        onEdit={(row) => setRouteModal({ editing: row })}
        onDelete={(id) => handleDeleteRoute(id)}
        extraActions={(row) => (
          <button
            onClick={() => setStudentAllocationModal(row)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-bold flex items-center gap-1 border border-indigo-500/30 transition-all shrink-0"
            title="Manage Students on this Bus"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({(row.assignedStudents || []).length})</span>
          </button>
        )}
        searchable
      />

      {/* Add / Edit Route Modal */}
      {routeModal && (
        <TransportRouteModal
          isOpen={true}
          editing={routeModal.editing}
          onSave={handleSaveRoute}
          onClose={() => setRouteModal(null)}
          loading={saving}
        />
      )}

      {/* Student Allocation Modal */}
      {studentAllocationModal && (
        <TransportStudentAllocationModal
          isOpen={true}
          route={studentAllocationModal}
          students={students}
          cleanClass={cleanClass}
          cleanSection={cleanSection}
          onAssign={handleAssignStudent}
          onRemove={handleRemoveStudent}
          onClose={() => setStudentAllocationModal(null)}
        />
      )}
    </div>
  );
}

function InnovativeStudentProfileModal({ student, isOpen, onClose, onEdit }) {
  const { currentTheme } = useTheme();
  const brandColor = currentTheme?.accentPrimary || '#02563d';
  const brandSecondary = currentTheme?.accentSecondary || '#02422f';
  const cyanColor = currentTheme?.accentCyan || '#12c4ac';

  const [activeTab, setActiveTab] = useState('overview');
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setLoadingRoute(true);
      apiFetch('/admin/transport')
        .then(routes => {
          if (Array.isArray(routes)) {
            const matched = routes.find(r => 
              (student.transportRoute && r.routeName === student.transportRoute) ||
              (r.assignedStudents || []).some(s => String(s.studentId) === String(student._id))
            );
            setRouteInfo(matched || null);
          }
          setLoadingRoute(false);
        })
        .catch(() => setLoadingRoute(false));
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const assignedStopName = student.pickupStop || (routeInfo?.assignedStudents || []).find(s => String(s.studentId) === String(student._id))?.pickupStop;
  const stopObj = (routeInfo?.stops || []).find(s => (typeof s === 'string' ? s : s.stopName) === assignedStopName);
  const stopFee = student.transportFee || (typeof stopObj === 'object' && stopObj?.monthlyFee ? stopObj.monthlyFee : (routeInfo?.monthlyFee || 1500));

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[99999] flex items-start justify-center p-4 pt-20 sm:pt-24 pb-12 overflow-y-auto">
      <div 
        className="rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0 my-0 border animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
      >
        
        {/* HERO BANNER HEADER - DYNAMIC BRAND THEME */}
        <div 
          className="relative p-6 sm:p-8 border-b space-y-4"
          style={{ 
            background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandColor} 100%)`,
            borderColor: 'rgba(255,255,255,0.2)' 
          }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl border-2 shrink-0"
                style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' }}
              >
                {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md border"
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
                  >
                    Class {student.classId} — Sec {student.sectionId || 'A'}
                  </span>
                  <span 
                    className="px-3 py-0.5 rounded-full text-xs font-black flex items-center gap-1 backdrop-blur-md border"
                    style={{ backgroundColor: 'rgba(52,211,153,0.25)', color: '#a7f3d0', borderColor: 'rgba(52,211,153,0.4)' }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: '#6ee7b7' }} /> Verified Student
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#ffffff' }}>
                  {student.firstName} {student.lastName || ''}
                </h2>
                <p className="text-xs font-semibold flex items-center gap-2" style={{ color: '#f1f5f9' }}>
                  <span>Roll: <strong className="font-mono font-black" style={{ color: '#6ee7b7' }}>{student.rollNo || 'LKGA01'}</strong></span>
                  <span>•</span>
                  <span>Parent: <strong className="font-bold" style={{ color: '#fde047' }}>{student.parentName || 'Guardian'}</strong> (<span style={{ color: '#e2e8f0' }}>{student.parentPhone || '—'}</span>)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEdit(student)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md border"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Edit2 className="w-3.5 h-3.5" style={{ color: '#ffffff' }} /> Edit Profile
              </button>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#ffffff' }}
              >
                <X className="w-4 h-4" style={{ color: '#ffffff' }} />
              </button>
            </div>
          </div>

          {/* TAB STRIP */}
          <div className="flex items-center gap-2 pt-3 border-t flex-wrap relative z-10" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            {[
              { id: 'overview', label: 'Overview 360°', icon: User },
              { id: 'attendance', label: 'Monthly & Yearly Attendance', icon: Calendar },
              { id: 'transport', label: 'Bus Transport & Timings', icon: Bus },
              { id: 'parent', label: 'Parent & Guardian Details', icon: Phone },
              { id: 'idcard', label: 'Digital ID Card Badge', icon: FileBadge2 }
            ].map(tab => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={isSel 
                    ? { backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' } 
                    : { backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    isSel ? 'shadow-lg shadow-black/40 font-black' : 'hover:bg-black/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: isSel ? brandColor : '#ffffff' }} /> 
                  <span style={{ color: isSel ? brandColor : '#ffffff' }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
          
          {/* TAB 1: OVERVIEW 360° */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(52,211,153,0.4)' }}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: '#94a3b8' }}>Attendance Rate</span>
                  <p className="text-2xl font-black" style={{ color: '#34d399' }}>{student.attendancePercentage || 100}%</p>
                  <span className="text-[10px] font-semibold block" style={{ color: '#6ee7b7' }}>Verified Present</span>
                </div>

                <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(56,189,248,0.4)' }}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: '#94a3b8' }}>Assigned Bus Route</span>
                  <p className="text-sm font-black truncate" style={{ color: cyanColor || '#38bdf8' }}>{student.transportRoute || 'No Transport'}</p>
                  <span className="text-[10px] font-semibold block" style={{ color: '#cbd5e1' }}>Stop: {assignedStopName || 'Walk-in'}</span>
                </div>

                <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(251,191,36,0.4)' }}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: '#94a3b8' }}>Parent Contact</span>
                  <p className="text-xs font-mono font-black" style={{ color: '#fcd34d' }}>{student.parentPhone || '—'}</p>
                  <span className="text-[10px] font-semibold block" style={{ color: '#fef08a' }}>{student.parentName || 'Guardian'}</span>
                </div>

                <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(192,132,252,0.4)' }}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: '#94a3b8' }}>Class & Sec</span>
                  <p className="text-sm font-black" style={{ color: '#c084fc' }}>{student.classId} — {student.sectionId || 'A'}</p>
                  <span className="text-[10px] font-semibold block" style={{ color: '#e9d5ff' }}>Roll: {student.rollNo || 'LKGA01'}</span>
                </div>
              </div>

              {/* DETAILED STUDENT INFO TABLE */}
              <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.15)' }}>
                <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b pb-2" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <User className="w-4 h-4" style={{ color: cyanColor || '#38bdf8' }} /> Student Profile Specifications
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Full Name</span>
                      <strong className="font-black text-sm" style={{ color: '#ffffff' }}>{student.firstName} {student.lastName || ''}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Roll Number / ID</span>
                      <strong className="font-mono font-black text-sm" style={{ color: cyanColor || '#38bdf8' }}>{student.rollNo || 'LKGA01'}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Class & Section</span>
                      <strong className="font-bold" style={{ color: '#ffffff' }}>{student.classId} - Section {student.sectionId || 'A'}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Blood Group</span>
                      <strong className="font-black" style={{ color: '#fb7185' }}>{student.bloodGroup || 'O+'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Student Email</span>
                      <strong className="font-mono text-xs font-bold" style={{ color: cyanColor || '#38bdf8' }}>{student.studentEmail || '—'}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Father / Parent Name</span>
                      <strong className="font-bold" style={{ color: '#fcd34d' }}>{student.parentName || '—'}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Parent Phone</span>
                      <strong className="font-mono font-black" style={{ color: '#34d399' }}>{student.parentPhone || '—'}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="font-semibold" style={{ color: '#94a3b8' }}>Residential Address</span>
                      <strong className="font-medium truncate max-w-[180px]" style={{ color: '#e2e8f0' }}>{student.address || 'Local School Area'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUS TRANSPORT & TIMINGS */}
          {activeTab === 'transport' && (
            <div className="space-y-4">
              {!student.transportRoute && !routeInfo ? (
                <div className="p-8 text-center text-xs rounded-2xl border space-y-2" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                  <Bus className="w-10 h-10 mx-auto" style={{ color: '#64748b' }} />
                  <p className="font-bold text-sm" style={{ color: '#ffffff' }}>No Bus Route Assigned</p>
                  <p style={{ color: '#cbd5e1' }}>This student is currently set to self / walk-in mode.</p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(56,189,248,0.3)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-black text-base flex items-center gap-2" style={{ color: '#ffffff' }}>
                        <span>🚌 Route: {student.transportRoute || routeInfo?.routeName}</span>
                        <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>({routeInfo?.vehicleType || 'School Bus'})</span>
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                        Vehicle Number: <strong className="font-mono font-black text-sm" style={{ color: cyanColor || '#38bdf8' }}>{routeInfo?.vehicleNo || 'TG30A8948'}</strong>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl font-extrabold text-xs border flex items-center gap-1.5" style={{ backgroundColor: 'rgba(52,211,153,0.2)', color: '#34d399', borderColor: 'rgba(52,211,153,0.4)' }}>
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#34d399' }} /> GPS TRACKER ACTIVE
                    </span>
                  </div>

                  {/* STOP & TIMINGS CARD */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: '#34d399' }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#cbd5e1' }}>Pickup & Drop Stop:</span>
                        <strong className="text-xs font-black" style={{ color: '#34d399' }}>{assignedStopName || 'Main Stop'}</strong>
                      </div>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg border" style={{ backgroundColor: 'rgba(52,211,153,0.2)', color: '#34d399', borderColor: 'rgba(52,211,153,0.4)' }}>
                        ₹{stopFee} / month
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl border" style={{ backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' }}>
                        <Clock className="w-4 h-4 shrink-0" style={{ color: '#fcd34d' }} />
                        <div>
                          <span className="text-[10px] uppercase font-bold block" style={{ color: '#fde047' }}>🌅 Morning Pickup Time</span>
                          <span className="font-mono font-black text-sm" style={{ color: '#ffffff' }}>
                            {typeof stopObj === 'object' && stopObj?.pickupTime ? stopObj.pickupTime : '07:30 AM'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl border" style={{ backgroundColor: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)' }}>
                        <Clock className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />
                        <div>
                          <span className="text-[10px] uppercase font-bold block" style={{ color: '#a5b4fc' }}>🌆 Evening Drop Time</span>
                          <span className="font-mono font-black text-sm" style={{ color: '#ffffff' }}>
                            {typeof stopObj === 'object' && stopObj?.dropTime ? stopObj.dropTime : '04:30 PM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DRIVER & HELPER CONTACT CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border flex items-center justify-between" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
                      <div>
                        <span className="text-[10px] uppercase font-bold block" style={{ color: '#94a3b8' }}>Driver Name</span>
                        <p className="font-bold text-xs" style={{ color: '#ffffff' }}>{routeInfo?.driverName || 'RAMESH'}</p>
                      </div>
                      <a href={`tel:${routeInfo?.driverPhone || '9542803315'}`} className="font-bold text-xs font-mono px-2.5 py-1 rounded-lg border" style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: '#fcd34d', borderColor: 'rgba(251,191,36,0.3)' }}>
                        📞 {routeInfo?.driverPhone || '9542803315'}
                      </a>
                    </div>

                    <div className="p-3 rounded-xl border flex items-center justify-between" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
                      <div>
                        <span className="text-[10px] uppercase font-bold block" style={{ color: '#94a3b8' }}>Helper / Attendant</span>
                        <p className="font-bold text-xs" style={{ color: '#ffffff' }}>{routeInfo?.helperName || 'raju'}</p>
                      </div>
                      <a href={`tel:${routeInfo?.helperPhone || '7075040344'}`} className="font-bold text-xs font-mono px-2.5 py-1 rounded-lg border" style={{ backgroundColor: 'rgba(56,189,248,0.2)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>
                        📞 {routeInfo?.helperPhone || '7075040344'}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARENT & GUARDIAN DETAILS */}
          {activeTab === 'parent' && (
            <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.15)' }}>
              <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b pb-2" style={{ color: '#fde047', borderColor: 'rgba(255,255,255,0.15)' }}>
                <Phone className="w-4 h-4" style={{ color: '#fcd34d' }} /> Parent / Guardian Contact Records
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-[10px] uppercase font-bold block" style={{ color: '#94a3b8' }}>Primary Guardian Name</span>
                  <p className="font-bold text-sm" style={{ color: '#ffffff' }}>{student.parentName || 'Not Specified'}</p>
                  <p className="text-xs" style={{ color: '#cbd5e1' }}>Relationship: Father / Primary Contact</p>
                </div>

                <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-[10px] uppercase font-bold block" style={{ color: '#94a3b8' }}>Guardian Phone</span>
                  <p className="font-mono font-bold text-sm" style={{ color: '#34d399' }}>{student.parentPhone || '—'}</p>
                  {student.parentPhone && (
                    <a href={`tel:${student.parentPhone}`} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border" style={{ backgroundColor: 'rgba(52,211,153,0.2)', color: '#34d399', borderColor: 'rgba(52,211,153,0.4)' }}>
                      📞 Direct Dial Call
                    </a>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border space-y-1 text-xs" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
                <span className="text-[10px] uppercase font-bold block" style={{ color: '#94a3b8' }}>Home Address</span>
                <p className="font-medium" style={{ color: '#e2e8f0' }}>{student.address || 'School Residential Zone'}</p>
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL ID CARD BADGE */}
          {activeTab === 'idcard' && (
            <div className="flex justify-center p-2">
              <div className="w-full max-w-sm border-2 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden text-center" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.2)' }}>
                <div 
                  className="p-3 rounded-2xl font-black"
                  style={{ backgroundColor: brandColor, color: '#ffffff' }}
                >
                  <span className="text-[10px] tracking-widest uppercase block style={{ color: 'rgba(255,255,255,0.9)' }}">STUDENT ID BADGE</span>
                  <h4 className="text-sm font-black tracking-wider" style={{ color: '#ffffff' }}>SCHOOL ERP VERIFIED</h4>
                </div>

                {/* Avatar */}
                <div 
                  className="relative mx-auto w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-2"
                  style={{ backgroundColor: brandColor, color: '#ffffff', borderColor: '#ffffff' }}
                >
                  {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
                </div>

                {/* Name & Class */}
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: '#ffffff' }}>{student.firstName} {student.lastName || ''}</h3>
                  <p className="text-xs font-bold" style={{ color: cyanColor || '#38bdf8' }}>Class {student.classId} - Section {student.sectionId || 'A'}</p>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: '#fcd34d' }}>Roll No: {student.rollNo || 'LKGA01'}</p>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl border text-left font-mono" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <div>
                    <span className="text-[9px] block uppercase font-bold" style={{ color: '#94a3b8' }}>Blood Group</span>
                    <span className="font-bold" style={{ color: '#fb7185' }}>{student.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block uppercase font-bold" style={{ color: '#94a3b8' }}>Bus Route</span>
                    <span className="font-bold truncate block" style={{ color: cyanColor || '#38bdf8' }}>{student.transportRoute || 'Walk-in'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block uppercase font-bold" style={{ color: '#94a3b8' }}>Parent Phone</span>
                    <span className="font-bold" style={{ color: '#34d399' }}>{student.parentPhone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block uppercase font-bold" style={{ color: '#94a3b8' }}>Status</span>
                    <span className="font-bold" style={{ color: '#34d399' }}>ACTIVE</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                  <span>ID: {student._id ? student._id.slice(-8) : '2026-STU'}</span>
                  <span>VERIFIED BADGE</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MONTHLY & YEARLY ATTENDANCE */}
          {activeTab === 'attendance' && (
            <StudentAttendanceReport defaultClass={student.classId} defaultSection={student.sectionId || 'A'} />
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between p-4 px-6 border-t text-xs" style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}>
          <button 
            onClick={() => onEdit(student)}
            style={{ backgroundColor: brandColor, color: '#ffffff' }}
            className="px-4 py-2 rounded-xl font-bold shadow-md hover:opacity-90 flex items-center gap-1.5 cursor-pointer border border-white/20"
          >
            <Edit2 className="w-3.5 h-3.5" style={{ color: '#ffffff' }} /> Edit Student Data
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl font-bold transition cursor-pointer border"
            style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomEditStudentModal({ student, isOpen, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    dob: student?.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
    gender: student?.gender || 'Male',
    bloodGroup: student?.bloodGroup || 'O+',
    studentEmail: student?.studentEmail || '',
    parentPhone: student?.parentPhone || '',
    address: student?.address || '',
    transportRoute: student?.transportRoute || '',
    pickupStop: student?.pickupStop || '',
    transportFee: student?.transportFee || 0
  });

  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        gender: student.gender || 'Male',
        bloodGroup: student.bloodGroup || 'O+',
        studentEmail: student.studentEmail || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        transportRoute: student.transportRoute || '',
        pickupStop: student.pickupStop || '',
        transportFee: student.transportFee || 0
      });
    }
  }, [student]);

  useEffect(() => {
    if (isOpen) {
      setRoutesLoading(true);
      apiFetch('/admin/transport')
        .then(d => { 
          const rList = Array.isArray(d) ? d : [];
          setRoutes(rList);
          setRoutesLoading(false);

          if (student && rList.length > 0) {
            for (const r of rList) {
              const found = (r.assignedStudents || []).find(as => String(as.studentId) === String(student._id));
              if (found) {
                setForm(f => ({
                  ...f,
                  transportRoute: r.routeName,
                  pickupStop: found.pickupStop || f.pickupStop,
                  transportFee: found.monthlyFee || f.transportFee
                }));
                break;
              }
            }
          }
        })
        .catch(() => setRoutesLoading(false));
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const selectedRouteObj = routes.find(r => r.routeName === form.transportRoute);
  const selectedStopObj = selectedRouteObj?.stops?.find(s => (typeof s === 'string' ? s : s.stopName) === form.pickupStop);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 pt-20 sm:pt-24 pb-12 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-0 my-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            Edit Student Profile — {student.firstName} {student.lastName}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">First Name <span className="text-rose-400">*</span></label>
              <input 
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-medium" 
                value={form.firstName} 
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Last Name</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-medium" 
                value={form.lastName} 
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Date of Birth</label>
              <input 
                type="date" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-indigo-500 font-medium" 
                value={form.dob} 
                onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Gender</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-indigo-500 font-semibold" 
                value={form.gender} 
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Blood Group</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-indigo-500 font-semibold" 
                value={form.bloodGroup} 
                onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Student Email (Login)</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-medium" 
                value={form.studentEmail} 
                onChange={e => setForm(f => ({ ...f, studentEmail: e.target.value }))} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Parent Phone</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-mono" 
                value={form.parentPhone} 
                onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Address</label>
            <textarea 
              rows={2} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-medium" 
              value={form.address} 
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
            />
          </div>

          {/* ══════════════════════════════════════════════════
              TRANSPORT & BUS ROUTE PROFILE SECTION
          ══════════════════════════════════════════════════ */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-indigo-400" /> Bus Transport Allocation
              </h4>
              {form.transportRoute ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🚌 BUS USER
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                  NO TRANSPORT
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Assigned Bus Route</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-semibold"
                  value={form.transportRoute}
                  onChange={e => {
                    const rName = e.target.value;
                    const rObj = routes.find(r => r.routeName === rName);
                    const firstStop = rObj?.stops?.[0];
                    const firstStopName = typeof firstStop === 'string' ? firstStop : firstStop?.stopName || '';
                    const firstFee = typeof firstStop === 'object' && firstStop?.monthlyFee ? Number(firstStop.monthlyFee) : (Number(rObj?.monthlyFee) || 0);
                    setForm(f => ({ ...f, transportRoute: rName, pickupStop: firstStopName, transportFee: firstFee }));
                  }}
                >
                  <option value="">No Transport (Self / Walk-in)</option>
                  {routes.map(r => <option key={r._id} value={r.routeName}>{r.routeName} ({r.vehicleNo})</option>)}
                </select>
              </div>

              {form.transportRoute && selectedRouteObj && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Pickup & Drop Stop</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-semibold"
                    value={form.pickupStop}
                    onChange={e => {
                      const sName = e.target.value;
                      const sObj = selectedRouteObj.stops?.find(s => (typeof s === 'string' ? s : s.stopName) === sName);
                      const sFee = typeof sObj === 'object' && sObj?.monthlyFee ? Number(sObj.monthlyFee) : (Number(selectedRouteObj.monthlyFee) || 0);
                      setForm(f => ({ ...f, pickupStop: sName, transportFee: sFee }));
                    }}
                  >
                    {(selectedRouteObj.stops || []).map((s, idx) => {
                      const name = typeof s === 'string' ? s : s.stopName;
                      const fee = typeof s === 'object' && s.monthlyFee ? s.monthlyFee : selectedRouteObj.monthlyFee;
                      return <option key={idx} value={name}>{name} (₹{fee}/mo)</option>;
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* STOP TIMINGS & FARE CARD */}
            {form.transportRoute && selectedRouteObj && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Monthly Bus Fee:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">₹{form.transportFee || selectedRouteObj.monthlyFee || 0} / month</span>
                </div>
                {selectedStopObj && typeof selectedStopObj === 'object' && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                      <span>🌅 Pickup:</span>
                      <strong className="text-white">{selectedStopObj.pickupTime || '07:30 AM'}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-300 font-mono">
                      <span>🌆 Drop:</span>
                      <strong className="text-white">{selectedStopObj.dropTime || '04:30 PM'}</strong>
                    </div>
                  </div>
                )}
                {selectedRouteObj.driverName && (
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Driver: <strong className="text-slate-200">{selectedRouteObj.driverName}</strong> ({selectedRouteObj.driverPhone})</span>
                    {selectedRouteObj.helperName && <span>Helper: <strong className="text-slate-200">{selectedRouteObj.helperName}</strong></span>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Student Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransportRouteModal({ isOpen, editing, onSave, onClose, loading }) {
  const mapStop = (s, baseFee) => {
    if (typeof s === 'string') return { stopName: s, monthlyFee: Number(baseFee) || 1500, pickupTime: '07:30 AM', dropTime: '04:30 PM' };
    const fee = (s.monthlyFee !== undefined && s.monthlyFee !== null && s.monthlyFee !== '' && !isNaN(s.monthlyFee) && Number(s.monthlyFee) > 0)
      ? Number(s.monthlyFee)
      : (Number(baseFee) || 1500);
    return {
      stopName: s.stopName || '',
      monthlyFee: fee,
      pickupTime: s.pickupTime || '07:30 AM',
      dropTime: s.dropTime || '04:30 PM'
    };
  };

  const [form, setForm] = useState(editing ? {
    routeName: editing.routeName || '',
    vehicleNo: editing.vehicleNo || '',
    vehicleType: editing.vehicleType || 'School Bus',
    driverName: editing.driverName || '',
    driverPhone: editing.driverPhone || '',
    helperName: editing.helperName || '',
    helperPhone: editing.helperPhone || '',
    capacity: editing.capacity || 40,
    monthlyFee: editing.monthlyFee || 1500,
    stops: (editing.stops && editing.stops.length > 0) 
      ? editing.stops.map(s => mapStop(s, editing.monthlyFee))
      : [{ stopName: '', monthlyFee: 1500, pickupTime: '07:30 AM', dropTime: '04:30 PM' }],
    isActive: editing.isActive !== false
  } : {
    routeName: '', vehicleNo: '', vehicleType: 'School Bus', driverName: '', driverPhone: '', helperName: '', helperPhone: '', capacity: 40, monthlyFee: 1500, 
    stops: [{ stopName: '', monthlyFee: 1500, pickupTime: '07:30 AM', dropTime: '04:30 PM' }], isActive: true
  });

  useEffect(() => {
    if (editing) {
      setForm({
        routeName: editing.routeName || '',
        vehicleNo: editing.vehicleNo || '',
        vehicleType: editing.vehicleType || 'School Bus',
        driverName: editing.driverName || '',
        driverPhone: editing.driverPhone || '',
        helperName: editing.helperName || '',
        helperPhone: editing.helperPhone || '',
        capacity: editing.capacity || 40,
        monthlyFee: editing.monthlyFee || 1500,
        stops: (editing.stops && editing.stops.length > 0) 
          ? editing.stops.map(s => mapStop(s, editing.monthlyFee))
          : [{ stopName: '', monthlyFee: 1500, pickupTime: '07:30 AM', dropTime: '04:30 PM' }],
        isActive: editing.isActive !== false
      });
    } else {
      setForm({
        routeName: '', vehicleNo: '', vehicleType: 'School Bus', driverName: '', driverPhone: '', helperName: '', helperPhone: '', capacity: 40, monthlyFee: 1500, 
        stops: [{ stopName: '', monthlyFee: 1500, pickupTime: '07:30 AM', dropTime: '04:30 PM' }], isActive: true
      });
    }
  }, [editing, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanStops = (form.stops || []).filter(s => s.stopName && s.stopName.trim());
    onSave({ ...form, stops: cleanStops });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 pt-16 pb-8 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bus className="w-4 h-4 text-indigo-400" />
            {editing ? `Edit Bus Route — ${editing.routeName}` : '➕ Add Bus Route & Staff'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Route Name <span className="text-rose-400">*</span></label>
              <input 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
                value={form.routeName} 
                onChange={e => setForm(f => ({ ...f, routeName: e.target.value }))}
                placeholder="e.g. North Line Route 5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Vehicle Number <span className="text-rose-400">*</span></label>
              <input 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold" 
                value={form.vehicleNo} 
                onChange={e => setForm(f => ({ ...f, vehicleNo: e.target.value }))}
                placeholder="e.g. KA-05-AB-1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Vehicle Type</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                value={form.vehicleType} 
                onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
              >
                <option value="School Bus">School Bus</option>
                <option value="Mini Bus">Mini Bus</option>
                <option value="Van">Van</option>
                <option value="AC Bus">AC Bus</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Capacity (Seats) <span className="text-rose-400">*</span></label>
              <input 
                type="number"
                min="1"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold" 
                value={form.capacity} 
                onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Base Fee (₹)</label>
              <input 
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" 
                value={form.monthlyFee} 
                onChange={e => setForm(f => ({ ...f, monthlyFee: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* DRIVER & HELPER SECTION */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-400" /> Assigned Bus Staff (Driver & Helper)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Driver Name <span className="text-rose-400">*</span></label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
                  value={form.driverName} 
                  onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Driver Phone <span className="text-rose-400">*</span></label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" 
                  value={form.driverPhone} 
                  onChange={e => setForm(f => ({ ...f, driverPhone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Helper / Attendant Name</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
                  value={form.helperName} 
                  onChange={e => setForm(f => ({ ...f, helperName: e.target.value }))}
                  placeholder="e.g. Suresh Singh"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Helper Phone</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" 
                  value={form.helperPhone} 
                  onChange={e => setForm(f => ({ ...f, helperPhone: e.target.value }))}
                  placeholder="e.g. 9123456789"
                />
              </div>
            </div>
          </div>

          {/* MULTI-STOP PRICING MANAGER */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> Route Stops & Individual Monthly Fares
              </h4>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, stops: [...(f.stops || []), { stopName: '', monthlyFee: f.monthlyFee || 1500 }] }))}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Stop
              </button>
            </div>

            {(form.stops || []).length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No stops configured. Click "+ Add Stop" to add pickup points with custom fares and timings.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {form.stops.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        required
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        placeholder={`Stop ${idx + 1} Name (e.g. bibinagar)`}
                        value={st.stopName}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(f => ({
                            ...f,
                            stops: f.stops.map((s, i) => i === idx ? { ...s, stopName: val } : s)
                          }));
                        }}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          required
                          className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold text-emerald-400"
                          placeholder="Fare"
                          value={st.monthlyFee}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setForm(f => ({
                              ...f,
                              stops: f.stops.map((s, i) => i === idx ? { ...s, monthlyFee: val } : s)
                            }));
                          }}
                        />
                        <span className="text-[10px] text-slate-400 font-semibold">/mo</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, stops: f.stops.filter((_, i) => i !== idx) }))}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-400 uppercase shrink-0">🌅 Pickup:</span>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                          placeholder="07:30 AM"
                          value={st.pickupTime || '07:30 AM'}
                          onChange={e => {
                            const val = e.target.value;
                            setForm(f => ({
                              ...f,
                              stops: f.stops.map((s, i) => i === idx ? { ...s, pickupTime: val } : s)
                            }));
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase shrink-0">🌆 Drop:</span>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                          placeholder="04:30 PM"
                          value={st.dropTime || '04:30 PM'}
                          onChange={e => {
                            const val = e.target.value;
                            setForm(f => ({
                              ...f,
                              stops: f.stops.map((s, i) => i === idx ? { ...s, dropTime: val } : s)
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Route Status</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              value={form.isActive ? 'ACTIVE' : 'INACTIVE'} 
              onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'ACTIVE' }))}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Bus Route
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function TransportStudentAllocationModal({ isOpen, route, students, cleanClass, cleanSection, onAssign, onRemove, onClose }) {
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [customFee, setCustomFee] = useState('');
  const [assigning, setAssigning] = useState(false);

  if (!isOpen || !route) return null;

  const assignedList = route.assignedStudents || [];
  const routeStops = route.stops || [];

  const capacity = Number(route.capacity) || 40;
  const occupiedCount = assignedList.length;
  const remainingSeats = Math.max(0, capacity - occupiedCount);
  const isFull = remainingSeats <= 0;

  const getStopName = (st) => typeof st === 'string' ? st : (st?.stopName || 'Stop');
  const getStopFee = (st) => {
    if (typeof st === 'object' && st && Number(st.monthlyFee) > 0) {
      return Number(st.monthlyFee);
    }
    return Number(route.monthlyFee) > 0 ? Number(route.monthlyFee) : 1500;
  };

  const classList = Array.from(new Set((students || []).map(s => cleanClass(s.classId)).filter(Boolean))).sort((a,b)=>a.localeCompare(b, undefined, {numeric: true}));
  const sectionList = Array.from(new Set((students || []).map(s => cleanSection(s.sectionId)).filter(Boolean))).sort();

  const availableStudents = (students || []).filter(s => {
    const matchesClass = !filterClass || cleanClass(s.classId).toLowerCase() === filterClass.toLowerCase();
    const matchesSection = !filterSection || cleanSection(s.sectionId).toLowerCase() === filterSection.toLowerCase();
    const notAlreadyAssigned = !assignedList.some(as => String(as.studentId) === String(s._id));
    return matchesClass && matchesSection && notAlreadyAssigned;
  });

  const handleStopSelect = (stopNameVal) => {
    setSelectedStop(stopNameVal);
    const found = routeStops.find(s => getStopName(s).toLowerCase() === stopNameVal.toLowerCase());
    const defaultFee = found ? getStopFee(found) : (Number(route.monthlyFee) > 0 ? Number(route.monthlyFee) : 1500);
    setCustomFee(defaultFee);
  };

  const handleAdd = async () => {
    if (!selectedStudentId || isFull) return;
    setAssigning(true);
    await onAssign(route._id, selectedStudentId, selectedStop, customFee);
    setSelectedStudentId('');
    setAssigning(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 pt-16 pb-8 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bus className="w-4 h-4 text-indigo-400" />
              Bus Student Allocation — {route.routeName} ({route.vehicleNo})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Driver: <strong>{route.driverName}</strong> ({route.driverPhone}) • Helper: <strong>{route.helperName || 'None'}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* LIVE REMAINING SEATS COUNTER CARD */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Capacity</span>
              <span className="text-sm font-extrabold text-white font-mono">{capacity} Seats</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Onboard Students</span>
              <span className="text-sm font-extrabold text-indigo-400 font-mono">{occupiedCount} Assigned</span>
            </div>
            <div className={`p-2.5 rounded-lg border flex flex-col justify-center ${
              isFull 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
                : remainingSeats <= 5 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className="text-[10px] font-bold uppercase block opacity-80">Remaining Seats</span>
              <span className="text-xs font-black font-mono">
                {isFull ? '🚨 BUS FULL (0 Left)' : `🪑 ${remainingSeats} Seats Available`}
              </span>
            </div>
          </div>

          {/* ADD STUDENT SECTION */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-400" /> Assign Student to this Bus Route
            </h4>

            {/* Class & Section Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Filter Class</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                >
                  <option value="">All Classes ({students.length})</option>
                  {classList.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Filter Section</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                >
                  <option value="">All Sections</option>
                  {sectionList.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
            </div>

            {/* Select Student, Stop & Editable Price */}
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Select Unassigned Student</label>
                <select
                  className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  disabled={isFull}
                >
                  <option value="">-- Select Student ({availableStudents.length} Available) --</option>
                  {availableStudents.map(s => {
                    const cls = cleanClass(s.classId);
                    const sec = cleanSection(s.sectionId);
                    return (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName || ''} — Class {cls}{sec ? ` Sec ${sec}` : ''} ({s.rollNo || 'No Roll'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="col-span-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Pickup / Drop Stop</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  value={selectedStop}
                  onChange={e => handleStopSelect(e.target.value)}
                  disabled={isFull}
                >
                  <option value="">-- Select Stop --</option>
                  {routeStops.map((st, idx) => {
                    const name = getStopName(st);
                    const fee = getStopFee(st);
                    return (
                      <option key={idx} value={name}>
                        {name} — ₹{fee.toLocaleString()} / mo
                      </option>
                    );
                  })}
                  {routeStops.length === 0 && <option value="Main Stop">Main Stop — ₹{Number(route.monthlyFee) || 1500} / mo</option>}
                </select>
              </div>

              <div className="col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Monthly Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  value={customFee}
                  onChange={e => setCustomFee(e.target.value)}
                  placeholder="₹ Fare"
                  disabled={isFull}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                disabled={!selectedStudentId || assigning || isFull}
                className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-md"
              >
                {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {isFull ? 'Bus Full' : 'Add Student to Bus Route'}
              </button>
            </div>
          </div>

          {/* ASSIGNED STUDENTS LIST */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Onboard Students ({assignedList.length})</span>
            </h4>

            {assignedList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No students assigned to this bus route yet. Select a student above to assign them.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class & Sec</th>
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Pickup Stop & Monthly Fee</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {assignedList.map((as, idx) => {
                      const cls = cleanClass(as.classId);
                      const sec = cleanSection(as.sectionId);
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{as.studentName}</td>
                          <td className="p-3 text-slate-300">Class {cls}{sec ? `-${sec}` : ''}</td>
                          <td className="p-3 font-mono text-slate-400">{as.rollNo || '—'}</td>
                          <td className="p-3 font-medium text-indigo-300">
                            {as.pickupStop || 'Main Stop'} 
                            <span className="font-mono font-bold text-emerald-400 ml-2">(₹{as.monthlyFee || route.monthlyFee || 0}/mo)</span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onRemove(route._id, as.studentId)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-bold border border-rose-500/20 transition-all"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Done / Close</button>
        </div>

      </div>
    </div>
  );
}

const HostelTab = makeSimpleCRUDTab({
  title: 'Hostel Rooms', icon: Home, color: 'amber', endpoint: '/admin/hostel/rooms',
  columns: [
    { key: 'hostelName', label: 'Hostel' },
    { key: 'building', label: 'Building' },
    { key: 'roomNumber', label: 'Room No' },
    { key: 'roomType', label: 'Type', badge: true },
    { key: 'capacity', label: 'Capacity' },
    { key: 'occupied', label: 'Occupied' },
    { key: 'monthlyFee', label: 'Monthly Fee', render: v => `â‚¹${(v || 0).toLocaleString()}` },
  ],
  fields: [
    { key: 'hostelName', label: 'Hostel Name', required: true },
    { key: 'building', label: 'Building', required: true },
    { key: 'roomNumber', label: 'Room Number', required: true },
    { key: 'roomType', label: 'Room Type', type: 'select', options: ['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'] },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'floor', label: 'Floor' },
    { key: 'monthlyFee', label: 'Monthly Fee (â‚¹)', type: 'number' },
  ]
});

const InventoryTab = makeSimpleCRUDTab({
  title: 'Inventory & Assets', icon: Box, color: 'indigo', endpoint: '/admin/inventory',
  columns: [
    { key: 'itemName', label: 'Item Name' },
    { key: 'category', label: 'Category', badge: true },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'purchasePrice', label: 'Price', render: v => `â‚¹${(v || 0).toLocaleString()}` },
    { key: 'minStockAlert', label: 'Min Stock' },
  ],
  fields: [
    { key: 'itemName', label: 'Item Name', required: true },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['Stationery', 'Furniture', 'Computers', 'Lab Equipment', 'Sports', 'Books', 'Uniform', 'Consumables', 'Other'] },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true },
    { key: 'unit', label: 'Unit (e.g. Pcs, Kg, Ltr)' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'purchasePrice', label: 'Purchase Price (â‚¹)', type: 'number' },
    { key: 'minStockAlert', label: 'Min Stock Alert', type: 'number' },
  ]
});

const HealthRecordsTab = makeSimpleCRUDTab({
  title: 'Health Records', icon: Stethoscope, color: 'rose', endpoint: '/admin/health-records',
  columns: [
    { key: 'studentName', label: 'Student' },
    { key: 'classId', label: 'Class' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'allergies', label: 'Allergies', render: v => Array.isArray(v) ? v.join(', ') || 'None' : v || 'None' },
    { key: 'chronicConditions', label: 'Conditions', render: v => Array.isArray(v) ? v.join(', ') || 'None' : v || 'None' },
  ],
  fields: [
    { key: 'studentName', label: 'Student Name', required: true },
    { key: 'classId', label: 'Class' },
    { key: 'bloodGroup', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    { key: 'allergies', label: 'Allergies (comma-separated)' },
    { key: 'chronicConditions', label: 'Chronic Conditions (comma-separated)' },
  ]
});

const DisciplineTab = makeSimpleCRUDTab({
  title: 'Discipline Tracker', icon: AlertTriangle, color: 'rose', endpoint: '/admin/discipline',
  columns: [
    { key: 'studentName', label: 'Student' },
    { key: 'classId', label: 'Class' },
    { key: 'title', label: 'Incident' },
    { key: 'severity', label: 'Severity', badge: true },
    { key: 'incidentDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'status', label: 'Status', badge: true },
    { key: 'actionTaken', label: 'Action Taken' },
  ],
  fields: [
    { key: 'studentName', label: 'Student Name', required: true },
    { key: 'classId', label: 'Class' },
    { key: 'incidentDate', label: 'Incident Date', type: 'date', required: true },
    { key: 'title', label: 'Incident Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'severity', label: 'Severity', type: 'select', required: true, options: ['LOW', 'MEDIUM', 'HIGH'] },
    { key: 'actionTaken', label: 'Action Taken', type: 'textarea' },
    { key: 'reportedBy', label: 'Reported By' },
  ]
});

const AnnouncementsTab = makeSimpleCRUDTab({
  title: 'Announcements', icon: Megaphone, color: 'indigo', endpoint: '/admin/announcements',
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type', badge: true },
    { key: 'targetAudience', label: 'Target', badge: true },
    { key: 'isPublished', label: 'Status', render: v => v ? <span className="text-emerald-400">Published</span> : <span className="text-amber-400">Draft</span> },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdAt', label: 'Created', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
  ],
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'body', label: 'Message Body', type: 'textarea', required: true },
    { key: 'type', label: 'Type', type: 'select', options: ['ANNOUNCEMENT', 'CIRCULAR', 'NOTICE', 'ALERT'] },
    { key: 'targetAudience', label: 'Target Audience', type: 'select', options: ['ALL', 'STUDENTS', 'PARENTS', 'STAFF', 'TEACHERS'] },
    { key: 'isPublished', label: 'Publish Now', type: 'select', options: [{ value: true, label: 'Yes â€” Publish' }, { value: false, label: 'No â€” Save as Draft' }] },
  ]
});

const EventsTab = makeSimpleCRUDTab({
  title: 'Events & Calendar', icon: Calendar, color: 'blue', endpoint: '/admin/events',
  columns: [
    { key: 'title', label: 'Event Name' },
    { key: 'category', label: 'Category', badge: true },
    { key: 'startDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'venue', label: 'Venue' },
    { key: 'organizer', label: 'Organizer' },
    { key: 'targetAudience', label: 'Audience', badge: true },
    { key: 'isPublished', label: 'Status', render: v => v ? <span className="text-emerald-400">Published</span> : <span className="text-amber-400">Draft</span> },
  ],
  fields: [
    { key: 'title', label: 'Event Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Category', type: 'select', options: ['Academic', 'Sports', 'Cultural', 'Holiday', 'Meeting', 'Other'] },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'venue', label: 'Venue' },
    { key: 'organizer', label: 'Organizer' },
    { key: 'targetAudience', label: 'Target Audience', type: 'select', options: ['ALL', 'STUDENTS', 'STAFF', 'PARENTS'] },
    { key: 'isPublished', label: 'Publish', type: 'select', options: [{ value: true, label: 'Yes' }, { value: false, label: 'Draft' }] },
  ]
});

const VisitorsTab = makeSimpleCRUDTab({
  title: 'Visitor Log', icon: MapPin, color: 'amber', endpoint: '/admin/visitors',
  columns: [
    { key: 'visitorName', label: 'Visitor' },
    { key: 'phone', label: 'Phone' },
    { key: 'purposeOfVisit', label: 'Purpose' },
    { key: 'personToMeet', label: 'To Meet' },
    { key: 'checkInTime', label: 'Check-In', render: v => v ? new Date(v).toLocaleTimeString() : 'â€”' },
    { key: 'checkOutTime', label: 'Check-Out', render: v => v ? new Date(v).toLocaleTimeString() : 'Still In' },
    { key: 'status', label: 'Status', badge: true },
  ],
  fields: [
    { key: 'visitorName', label: 'Visitor Name', required: true },
    { key: 'phone', label: 'Phone' },
    { key: 'purposeOfVisit', label: 'Purpose of Visit', required: true },
    { key: 'personToMeet', label: 'Person to Meet', required: true },
    { key: 'department', label: 'Department' },
    { key: 'idProofType', label: 'ID Proof Type', type: 'select', options: ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'OTHER'] },
    { key: 'remarks', label: 'Remarks', type: 'textarea' },
  ]
});

const HelpdeskTab = makeSimpleCRUDTab({
  title: 'Campus Helpdesk', icon: Ticket, color: 'rose', endpoint: '/admin/helpdesk',
  columns: [
    { key: 'ticketId', label: 'Ticket ID' },
    { key: 'raisedByName', label: 'Raised By' },
    { key: 'category', label: 'Category', badge: true },
    { key: 'subject', label: 'Subject' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'status', label: 'Status', badge: true },
    { key: 'assignedTo', label: 'Assigned To' },
  ],
  fields: [
    { key: 'raisedByName', label: 'Raised By Name', required: true },
    { key: 'raisedByRole', label: 'Role', type: 'select', required: true, options: ['STUDENT', 'PARENT', 'TEACHER', 'STAFF'] },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['Academics', 'Transport', 'Hostel', 'IT Support', 'Maintenance', 'Finance', 'Other'] },
    { key: 'subject', label: 'Subject', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'priority', label: 'Priority', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
    { key: 'assignedTo', label: 'Assigned To (Staff Name)' },
    { key: 'status', label: 'Status', type: 'select', options: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
  ]
});

const CertificatesTab = makeSimpleCRUDTab({
  title: 'Certificates & TCs', icon: FileBadge2, color: 'emerald', endpoint: '/admin/certificates',
  columns: [
    { key: 'certificateNo', label: 'Cert No' },
    { key: 'issuedToName', label: 'Issued To' },
    { key: 'certificateType', label: 'Type', badge: true },
    { key: 'classId', label: 'Class' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'issueDate', label: 'Issue Date', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'status', label: 'Status', badge: true },
  ],
  fields: [
    { key: 'issuedToName', label: 'Issued To (Name)', required: true },
    { key: 'certificateType', label: 'Certificate Type', type: 'select', required: true, options: ['BONAFIDE', 'TRANSFER_CERTIFICATE', 'CONDUCT', 'CHARACTER', 'MERIT', 'EXPERIENCE', 'STUDY', 'CUSTOM'] },
    { key: 'classId', label: 'Class (if student)' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'targetRole', label: 'For', type: 'select', options: ['STUDENT', 'STAFF'] },
    { key: 'status', label: 'Status', type: 'select', options: ['ISSUED', 'REVOKED'] },
  ]
});

// (Old AttendanceTab removed — replaced by comprehensive AttendanceTab above)

// Payroll Tab
function PayrollTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const load = () => apiFetch(`/admin/payroll?month=${month}&year=${year}`).then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, [month, year]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await apiFetch('/admin/payroll/generate', { method: 'POST', body: JSON.stringify({ month, year }) });
      alert(r.message); load();
    } catch (e) { alert(e.message); } finally { setGenerating(false); }
  };

  const handleApprove = async (id) => {
    await apiFetch('/admin/payroll/approve', { method: 'POST', body: JSON.stringify({ ids: [id] }) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-sm font-bold text-white">Payroll & Payslips</h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
            {['2024', '2025', '2026', '2027'].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold disabled:opacity-60">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Generate
          </button>
        </div>
      </div>

      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No payroll for {month} {year}. Click "Generate" to create payslips.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Emp ID', 'Name', 'Basic', 'Allowances', 'PF', 'Net Salary', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map(r => (
                  <tr key={r._id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-xs text-slate-400">{r.employeeId}</td>
                    <td className="px-4 py-3 text-xs text-white font-semibold">{r.employeeName}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">₹{(r.basicSalary || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">₹{(r.allowances || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">₹{(r.pf || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">₹{(r.netSalary || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'GENERATED' && (
                        <button onClick={() => handleApprove(r._id)} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Reports Tab
function ReportsTab() {
  const [data, setData] = useState({});
  useEffect(() => {
    apiFetch('/admin/reports').then(d => setData(d)).catch(() => {
      setData({ totalStudents: 312, totalStaff: 48, totalExams: 7, totalLibraryBooks: 1240, totalTransport: 8, pendingLeaves: 5, openTickets: 12, pendingPayrolls: 48 });
    });
  }, []);

  const reportCards = [
    { label: 'Total Students Enrolled', value: data.totalStudents, icon: GraduationCap, color: 'indigo' },
    { label: 'Teaching & Non-Teaching Staff', value: data.totalStaff, icon: Users, color: 'emerald' },
    { label: 'Library Books Catalogued', value: data.totalLibraryBooks, icon: Library, color: 'violet' },
    { label: 'Transport Vehicles', value: data.totalTransport, icon: Bus, color: 'blue' },
    { label: 'Active Exams', value: data.totalExams, icon: ClipboardList, color: 'amber' },
    { label: 'Pending Leave Requests', value: data.pendingLeaves, icon: Calendar, color: 'rose' },
    { label: 'Open Helpdesk Tickets', value: data.openTickets, icon: Ticket, color: 'rose' },
    { label: 'Payroll Records Pending', value: data.pendingPayrolls, icon: TrendingUp, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white">School Reports & Analytics</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Real-time operational metrics</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>
      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-5">
        <h3 className="text-xs font-bold text-white mb-4">Report Downloads</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Student Register', 'Attendance Summary', 'Fee Collection', 'Payroll Sheet', 'Exam Results', 'Library Audit', 'Incident Report', 'Annual Report'].map(r => (
            <button key={r} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 transition-all">
              <Download className="w-3.5 h-3.5" />
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// User Roles Tab
function UsersTab() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = () => apiFetch('/users').then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await apiFetch(`/users/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        showMsg('success', '✅ User updated successfully!');
      } else {
        await apiFetch('/users', { method: 'POST', body: JSON.stringify(form) });
        showMsg('success', '✅ User created successfully!');
      }
      setModal(null); load();
    } catch (e) { showMsg('error', `❌ ${e.message}`); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this user account? This cannot be undone.')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      showMsg('success', '✅ User deleted.');
      load();
    } catch(e) { showMsg('error', e.message); }
  };

  const userFields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'password', label: 'Password (leave blank to keep)', type: 'password' },
    { key: 'role', label: 'Role', type: 'select', required: true, options: ['SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'DRIVER', 'SECURITY'] },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] },
  ];

  return (
    <>
      {msg && <div className={`p-3 rounded-xl text-xs font-semibold mb-3 ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>{msg.text}</div>}
      <ModuleTable
        title="User Roles & Logins" icon={Key} color="indigo"
        loading={loading} rows={rows}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', badge: true },
          { key: 'status', label: 'Status', badge: true },
          { key: 'createdAt', label: 'Created', render: v => v ? new Date(v).toLocaleDateString() : '—' },
        ]}
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        onDelete={handleDelete}
      />
      {modal && (
        <CrudModal
          title={modal.editing ? `Edit — ${modal.editing.name}` : 'Create User Account'}
          fields={userFields}
          initial={modal.editing || {}}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </>
  );
}

function FullScreenMarksEntryModal({ isOpen, onClose, onRefresh }) {
  const { user } = useAuth();
  const isTeacher = String(user?.role || user?.designation || '').toUpperCase().includes('TEACHER');

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isCustomExam, setIsCustomExam] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [maxMarks, setMaxMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(35);

  const [students, setStudents] = useState([]);
  const studentsRef = React.useRef(students);
  studentsRef.current = students;
  const [studentLoading, setStudentLoading] = useState(false);
  const [marksGrid, setMarksGrid] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const [timetables, setTimetables] = useState([]);

  // Load Classes, Exams, Subjects, and Timetables on mount
  useEffect(() => {
    Promise.allSettled([
      apiFetch('/admin/classes'),
      apiFetch('/admin/exams'),
      apiFetch('/admin/subjects'),
      apiFetch('/admin/timetable')
    ]).then(([cRes, eRes, sRes, tRes]) => {
      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) setClasses(cRes.value);
      if (eRes.status === 'fulfilled' && Array.isArray(eRes.value)) setExams(eRes.value);
      if (sRes.status === 'fulfilled' && Array.isArray(sRes.value)) setSubjects(sRes.value);
      if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) setTimetables(tRes.value);
    });
  }, []);

  // Teacher Class, Section & Subject Extraction
  const teacherAssignments = React.useMemo(() => {
    if (!isTeacher || !user) return { classes: null, sections: null, subjects: null };

    const uName = String(user.name || user.username || user.childName || '').toLowerCase().trim();
    const desig = String(user.designation || user.role || '').toUpperCase();
    const subjAttr = String(user.subject || user.assignedSubject || user.department || '').toUpperCase();

    const assignedClassIds = new Set();
    const assignedSectionIds = new Set();
    const assignedSubjects = new Set();

    // From User profile / metadata
    if (Array.isArray(user.assignedClasses)) {
      user.assignedClasses.forEach(c => assignedClassIds.add(String(c).replace(/^Class\s+/i, '').trim()));
    }
    if (user.classId) assignedClassIds.add(String(user.classId).replace(/^Class\s+/i, '').trim());
    if (user.classTeacherOf) assignedClassIds.add(String(user.classTeacherOf).replace(/^Class\s+/i, '').trim());

    if (Array.isArray(user.assignedSections)) {
      user.assignedSections.forEach(s => assignedSectionIds.add(String(s).replace(/^Section\s+/i, '').trim()));
    }
    if (user.sectionId) assignedSectionIds.add(String(user.sectionId).replace(/^Section\s+/i, '').trim());

    if (Array.isArray(user.assignedSubjects)) {
      user.assignedSubjects.forEach(s => assignedSubjects.add(String(s.subjectName || s.name || s).trim().toUpperCase()));
    }
    if (user.subject) assignedSubjects.add(String(user.subject).trim().toUpperCase());

    const knownSubjects = ['TELUGU', 'HINDI', 'ENGLISH', 'MATHS', 'MATHEMATICS', 'SCIENCE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'SOCIAL', 'GK', 'GENERAL KNOWLEDGE', 'COMPUTER', 'EVS', 'TAMIL', 'KANNADA', 'SANSKRIT', 'FRENCH'];
    knownSubjects.forEach(s => {
      if (desig.includes(s) || subjAttr.includes(s)) assignedSubjects.add(s);
    });

    // From Timetable entries
    if (Array.isArray(timetables) && timetables.length > 0) {
      timetables.forEach(tt => {
        const cId = String(tt.classId || '').replace(/^Class\s+/i, '').trim();
        const sId = String(tt.sectionId || '').replace(/^Section\s+/i, '').trim();
        if (Array.isArray(tt.schedule)) {
          tt.schedule.forEach(p => {
            const pTeacher = String(p.teacherName || '').toLowerCase().trim();
            if (pTeacher && uName && (pTeacher.includes(uName) || uName.includes(pTeacher))) {
              if (cId) assignedClassIds.add(cId);
              if (sId) assignedSectionIds.add(sId);
              if (p.subject) assignedSubjects.add(String(p.subject).toUpperCase());
            }
          });
        }
      });
    }

    return {
      classes: assignedClassIds.size > 0 ? Array.from(assignedClassIds) : null,
      sections: assignedSectionIds.size > 0 ? Array.from(assignedSectionIds) : null,
      subjects: assignedSubjects.size > 0 ? Array.from(assignedSubjects) : null
    };
  }, [isTeacher, user, timetables]);

  // Filter available classes strictly for teacher
  const availableClasses = React.useMemo(() => {
    if (!isTeacher || !teacherAssignments.classes || teacherAssignments.classes.length === 0) return classes;
    const filtered = classes.filter(c => {
      const cName = String(c.className || c.name || '').replace(/^Class\s+/i, '').trim();
      return teacherAssignments.classes.some(ac => ac === cName || cName.includes(ac) || ac.includes(cName));
    });
    return filtered.length > 0 ? filtered : classes;
  }, [isTeacher, classes, teacherAssignments.classes]);

  // Auto-select Class for Teacher
  useEffect(() => {
    if (isTeacher && availableClasses.length > 0) {
      const availNames = availableClasses.map(c => String(c.className || c.name || '').replace(/^Class\s+/i, '').trim());
      if (!selectedClass || !availNames.includes(String(selectedClass).trim())) {
        setSelectedClass(availNames[0]);
      }
    }
  }, [isTeacher, availableClasses, selectedClass]);

  // Fetch students automatically when Class or Section changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }
    setStudentLoading(true);
    const q = selectedSection 
      ? `classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`
      : `classId=${encodeURIComponent(selectedClass)}`;
    
    apiFetch(`/admin/students?${q}`).then(d => {
      const list = Array.isArray(d) ? d : (d.students || []);
      setStudents(list);
      
      // Initialize marks grid for loaded students
      const initGrid = {};
      list.forEach(s => {
        initGrid[s._id] = {
          studentId: s._id,
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          rollNo: s.rollNo || '—',
          marksObtained: '',
          remarks: ''
        };
      });
      setMarksGrid(initGrid);
      setStudentLoading(false);
    }).catch(() => {
      setStudents([]);
      setStudentLoading(false);
    });
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    // Build fresh empty grid for all students
    const freshGrid = {};
    (studentsRef.current || []).forEach(s => {
      freshGrid[s._id] = {
        studentId: s._id,
        studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
        rollNo: s.rollNo || '—',
        marksObtained: '',
        remarks: ''
      };
    });

    if (!selectedClass || !selectedExam || !selectedSubject || !isOpen) {
      setMarksGrid(freshGrid);
      setSubmissionStatus(null);
      return;
    }

    apiFetch('/admin/marks')
      .then(docs => {
        const allDocs = Array.isArray(docs) ? docs : [];
        const matchedDocs = allDocs.filter(d => {
          const cMatch = String(d.classId || '').trim().toLowerCase() === String(selectedClass).trim().toLowerCase();
          const eMatch = String(d.examTitle || '').trim().toLowerCase() === String(selectedExam).trim().toLowerCase();
          const sMatch = String(d.subjectName || '').trim().toLowerCase() === String(selectedSubject).trim().toLowerCase();
          const secMatch = !selectedSection || !d.sectionId || String(d.sectionId || '').trim().toLowerCase() === String(selectedSection).trim().toLowerCase();
          return cMatch && eMatch && sMatch && secMatch;
        });

        const updatedGrid = { ...freshGrid };
        if (matchedDocs.length > 0) {
          matchedDocs.forEach(m => {
            if (updatedGrid[m.studentId]) {
              updatedGrid[m.studentId] = {
                ...updatedGrid[m.studentId],
                marksObtained: m.totalMarksObtained !== undefined && m.totalMarksObtained !== null ? m.totalMarksObtained : '',
                remarks: m.remarks || ''
              };
            }
          });
          const status = matchedDocs[0].isPublished ? 'PUBLISHED' : (matchedDocs[0].approvalStatus || 'SUBMITTED_BY_TEACHER');
          setSubmissionStatus(status);
        } else {
          setSubmissionStatus(null);
        }
        setMarksGrid(updatedGrid);
      })
      .catch(() => {
        setMarksGrid(freshGrid);
        setSubmissionStatus(null);
      });
  }, [selectedClass, selectedSection, selectedExam, selectedSubject, isOpen]);

  const isLockedForTeacher = isTeacher && submissionStatus && submissionStatus !== 'REJECTED';

  const sectionOptions = React.useMemo(() => {
    const cls = classes.find(c => String(c.className || c.name || '').replace(/^Class\s+/i, '').trim() === String(selectedClass).trim());
    if (!cls || !Array.isArray(cls.sections) || cls.sections.length === 0) return ['A', 'B', 'C'];
    return cls.sections.map(s => String(s).replace(/^Section\s+/i, '').trim());
  }, [classes, selectedClass]);

  const availableSections = React.useMemo(() => {
    if (!isTeacher || !teacherAssignments.sections || teacherAssignments.sections.length === 0) return sectionOptions;
    const filtered = sectionOptions.filter(s => {
      const sName = String(s).replace(/^Section\s+/i, '').trim();
      return teacherAssignments.sections.some(as => as === sName || sName.includes(as) || as.includes(sName));
    });
    return filtered.length > 0 ? filtered : sectionOptions;
  }, [isTeacher, sectionOptions, teacherAssignments.sections]);

  useEffect(() => {
    if (isTeacher && availableSections.length > 0) {
      const sNames = availableSections.map(s => String(s).replace(/^Section\s+/i, '').trim());
      if (!selectedSection || !sNames.includes(String(selectedSection).trim())) {
        setSelectedSection(sNames[0]);
      }
    }
  }, [isTeacher, availableSections, selectedSection]);

  const currentExamSubjects = React.useMemo(() => {
    if (!selectedExam) return subjects.map(s => String(s.subjectName || s.name || '').trim()).filter(Boolean);
    const examObj = exams.find(e => 
      String(e.examName || e.title || e.name || '').trim().toLowerCase() === String(selectedExam).trim().toLowerCase()
    );
    if (examObj && Array.isArray(examObj.subjectSchedules) && examObj.subjectSchedules.length > 0) {
      const schedSubjects = examObj.subjectSchedules.map(s => String(s.subjectName || s.subject || '').trim()).filter(Boolean);
      const combined = [...schedSubjects];
      subjects.forEach(s => {
        const name = String(s.subjectName || s.name || '').trim();
        if (name && !combined.some(c => c.toLowerCase() === name.toLowerCase())) {
          combined.push(name);
        }
      });
      return combined;
    }
    return subjects.map(s => String(s.subjectName || s.name || '').trim()).filter(Boolean);
  }, [selectedExam, exams, subjects]);

  // Extract subjects assigned to Teacher specifically for selectedClass AND selectedSection
  const assignedTeacherSubjectsForClassSection = React.useMemo(() => {
    if (!isTeacher || !user || !selectedClass) return null;
    const uName = String(user.name || user.username || user.childName || '').toLowerCase().trim();

    const assignedSet = new Set();
    const targetClass = String(selectedClass).replace(/^Class\s+/i, '').trim().toLowerCase();
    const targetSection = selectedSection ? String(selectedSection).replace(/^Section\s+/i, '').trim().toLowerCase() : '';

    // 1. From Timetables matching selectedClass and selectedSection
    if (Array.isArray(timetables) && timetables.length > 0) {
      timetables.forEach(tt => {
        const cId = String(tt.classId || '').replace(/^Class\s+/i, '').trim().toLowerCase();
        const sId = String(tt.sectionId || '').replace(/^Section\s+/i, '').trim().toLowerCase();

        if (cId === targetClass && (!targetSection || !sId || sId === targetSection)) {
          if (Array.isArray(tt.schedule)) {
            tt.schedule.forEach(p => {
              const pTeacher = String(p.teacherName || '').toLowerCase().trim();
              if (pTeacher && uName && (pTeacher.includes(uName) || uName.includes(pTeacher))) {
                if (p.subject) assignedSet.add(String(p.subject).trim().toUpperCase());
              }
            });
          }
        }
      });
    }

    // 2. From User assignedSubjects array if structured with classId/sectionId
    if (Array.isArray(user.assignedSubjects)) {
      user.assignedSubjects.forEach(s => {
        if (typeof s === 'object' && s !== null) {
          const scId = String(s.classId || '').replace(/^Class\s+/i, '').trim().toLowerCase();
          const ssId = String(s.sectionId || '').replace(/^Section\s+/i, '').trim().toLowerCase();
          if ((!scId || scId === targetClass) && (!targetSection || !ssId || ssId === targetSection)) {
            if (s.subjectName || s.name) assignedSet.add(String(s.subjectName || s.name).trim().toUpperCase());
          }
        }
      });
    }

    return assignedSet.size > 0 ? Array.from(assignedSet) : null;
  }, [isTeacher, user, selectedClass, selectedSection, timetables]);

  const availableSubjects = React.useMemo(() => {
    if (!isTeacher) return currentExamSubjects;

    // Use Class & Section specific teacher assignments if available
    const allowedList = assignedTeacherSubjectsForClassSection || teacherAssignments.subjects;
    if (!allowedList || allowedList.length === 0) return [];

    return currentExamSubjects.filter(s => {
      const sName = (typeof s === 'string' ? s : (s.subjectName || s.name || '')).toUpperCase();
      return allowedList.some(ts => sName === ts || sName.includes(ts) || ts.includes(sName));
    });
  }, [isTeacher, currentExamSubjects, assignedTeacherSubjectsForClassSection, teacherAssignments.subjects]);

  useEffect(() => {
    if (availableSubjects.length > 0) {
      const subNames = availableSubjects.map(s => typeof s === 'string' ? s : (s.subjectName || s.name));
      if (!selectedSubject || !subNames.some(sn => String(sn).trim() === String(selectedSubject).trim())) {
        setSelectedSubject(subNames[0]);
      }
    } else if (isTeacher) {
      setSelectedSubject('');
    }
  }, [isTeacher, availableSubjects, selectedSubject]);

  useEffect(() => {
    if (!selectedExam) return;
    const examObj = exams.find(e => 
      String(e.examName || e.title || e.name || '').trim().toLowerCase() === String(selectedExam).trim().toLowerCase()
    );
    if (examObj) {
      const schedules = Array.isArray(examObj.subjectSchedules) ? examObj.subjectSchedules : [];
      let matchedSched = null;
      if (selectedSubject && schedules.length > 0) {
        matchedSched = schedules.find(s => 
          String(s.subjectName || s.subject || '').trim().toLowerCase() === String(selectedSubject).trim().toLowerCase()
        );
      }
      if (!matchedSched && schedules.length === 1) {
        matchedSched = schedules[0];
      }
      if (matchedSched) {
        const total = Number(matchedSched.totalMarks !== undefined ? matchedSched.totalMarks : matchedSched.maxMarks);
        const pass = Number(matchedSched.passMarks !== undefined ? matchedSched.passMarks : matchedSched.passingMarks);
        if (!isNaN(total) && total > 0) setMaxMarks(total);
        if (!isNaN(pass) && pass >= 0) setPassingMarks(pass);
      } else {
        const total = Number(examObj.totalMarks !== undefined ? examObj.totalMarks : examObj.maxMarks);
        const pass = Number(examObj.passMarks !== undefined ? examObj.passMarks : examObj.passingMarks);
        if (!isNaN(total) && total > 0) setMaxMarks(total);
        if (!isNaN(pass) && pass >= 0) setPassingMarks(pass);
      }
    }
  }, [selectedExam, selectedSubject, exams]);

  const handleMarkChange = (studentId, field, val) => {
    if (isLockedForTeacher) return;
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSaveAll = async () => {
    if (isLockedForTeacher) {
      alert('Marks for this subject have already been submitted and locked for review.');
      return;
    }
    if (!selectedClass) {
      alert('Please select a Class');
      return;
    }
    if (!selectedExam) {
      alert('Please select an Exam Title');
      return;
    }
    if (!selectedSubject) {
      alert('Please select a Subject');
      return;
    }

    setSaving(true);
    try {
      const activeSubjName = selectedSubject || (availableSubjects[0] ? (typeof availableSubjects[0] === 'string' ? availableSubjects[0] : availableSubjects[0].subjectName) : '');
      const payload = Object.values(marksGrid)
        .filter(m => m.marksObtained !== '' && m.marksObtained !== null)
        .map(m => {
          const obtained = Number(m.marksObtained) || 0;
          const maxM = Number(maxMarks) || 100;
          const pct = Math.round((obtained / maxM) * 100);
          return {
            studentId: m.studentId,
            studentName: m.studentName,
            rollNo: m.rollNo,
            classId: selectedClass,
            sectionId: selectedSection,
            examTitle: selectedExam,
            subjectName: activeSubjName,
            totalMarksObtained: obtained,
            totalMaxMarks: maxM,
            passingMarks: Number(passingMarks) || 35,
            percentage: pct,
            isPublished: false,
            approvalStatus: isTeacher ? 'SUBMITTED_BY_TEACHER' : (isPrincipal ? 'APPROVED_BY_PRINCIPAL' : 'SUBMITTED_BY_TEACHER'),
            submittedBy: { userId: user?._id, name: user?.name || user?.username, role: user?.role }
          };
        });

      if (payload.length === 0) {
        alert('Please enter marks obtained for at least one student.');
        setSaving(false);
        return;
      }

      await apiFetch('/admin/marks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setMsg({ 
        type: 'success', 
        text: isTeacher 
          ? `✅ Submitted marks for ${payload.length} students to Principal for approval!`
          : `✅ Saved and published marks for ${payload.length} students!` 
      });
      if (onRefresh) onRefresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      setMsg({ type: 'error', text: `❌ Error: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-xl text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* FULL SCREEN HEADER */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              {isTeacher ? `Teacher Marks Entry — ${user?.name || 'Subject Teacher'}` : 'Dynamic Class & Section Marks Entry Matrix'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isTeacher ? 'Enter subject marks. Submissions route to Principal & Headmaster before release.' : 'Select Class, Section, Exam & Subject to auto-populate enrolled students'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-2xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* SELECTION BAR */}
      <div className="p-6 bg-slate-900/50 border-b border-slate-800/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase text-amber-400 mb-1">1. Select Class *</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="">-- Choose Class --</option>
              {availableClasses.map(c => (
                <option key={c._id || c.className} value={c.className}>Class {c.className}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-amber-400 mb-1">2. Select Section</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {availableSections.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-amber-400 mb-1">3. Select Exam *</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
            >
              <option value="">-- Choose Exam --</option>
              {exams.map((e, i) => (
                <option key={e._id || i} value={e.examName || e.title || e.name}>{e.examName || e.title || e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-amber-400 mb-1">
              4. Select Subject {isTeacher ? '(Your Assigned Subject)' : ''}
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">{isTeacher && availableSubjects.length === 0 ? `-- No Subject Assigned for Class ${selectedClass} Section ${selectedSection || 'All'} --` : '-- Choose Subject --'}</option>
              {availableSubjects.map((s, i) => {
                const subName = typeof s === 'string' ? s : (s.subjectName || s.name);
                return <option key={i} value={subName}>{subName}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Max Marks</label>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              value={maxMarks}
              onChange={e => setMaxMarks(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Passing Marks</label>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              value={passingMarks}
              onChange={e => setPassingMarks(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* FEEDBACK MSG */}
      {msg && (
        <div className={`px-6 py-3 font-bold text-xs ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30'}`}>
          {msg.text}
        </div>
      )}

      {/* MAIN DYNAMIC STUDENTS MATRIX TABLE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* SUBMISSION STATUS BANNER FOR TEACHER */}
        {isTeacher && submissionStatus && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between font-bold text-xs shadow-xl ${
            submissionStatus === 'SUBMITTED_BY_TEACHER'
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : submissionStatus === 'APPROVED_BY_PRINCIPAL'
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
              : submissionStatus === 'PUBLISHED'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-current">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">
                  {submissionStatus === 'SUBMITTED_BY_TEACHER' && '⏳ Marks Submitted — Pending Principal Approval'}
                  {submissionStatus === 'APPROVED_BY_PRINCIPAL' && '⏳ Approved by Principal — Pending Headmaster Release'}
                  {submissionStatus === 'PUBLISHED' && '✓ Report Cards Released to Parents & Students'}
                  {submissionStatus === 'REJECTED' && '✕ Marks Returned for Revision'}
                </h4>
                <p className="text-[11px] opacity-90 font-medium mt-0.5">
                  {submissionStatus === 'SUBMITTED_BY_TEACHER' && `Marks for Class ${selectedClass} (${selectedSubject}) have been submitted. Re-submission is disabled while pending review.`}
                  {submissionStatus === 'APPROVED_BY_PRINCIPAL' && `Principal has approved these marks. Awaiting Headmaster batch release.`}
                  {submissionStatus === 'PUBLISHED' && `These marks are published as official report cards on Parent & Student portals.`}
                  {submissionStatus === 'REJECTED' && `Submission was returned for revisions. You may update marks below and re-submit.`}
                </p>
              </div>
            </div>
            {isLockedForTeacher && (
              <span className="px-3 py-1 rounded-xl text-[11px] font-black uppercase bg-slate-950/90 border border-amber-500/30 text-amber-300 shadow-inner">
                🔒 Submission Locked
              </span>
            )}
          </div>
        )}

        {!selectedClass ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-700" />
            <h3 className="text-base font-bold text-slate-400">Select a Class & Section Above</h3>
            <p className="text-xs max-w-sm">Students enrolled in that class & section will automatically load in this table below for quick evaluation and marks entry.</p>
          </div>
        ) : studentLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading enrolled students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
            <AlertCircle className="w-10 h-10 text-rose-500/50" />
            <h3 className="text-base font-bold text-slate-400">No Students Found</h3>
            <p className="text-xs">No active students registered under Class {selectedClass} {selectedSection ? `Section ${selectedSection}` : ''}.</p>
          </div>
        ) : (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-amber-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Marks Obtained ({maxMarks})</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Result Status</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((s, idx) => {
                  const item = marksGrid[s._id] || {};
                  const obtained = item.marksObtained !== '' ? Number(item.marksObtained) : null;
                  const pct = obtained !== null ? Math.round((obtained / Math.max(1, maxMarks)) * 100) : null;
                  const isPassed = pct !== null && pct >= passingMarks;

                  return (
                    <tr key={s._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">{s.rollNo || '—'}</td>
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-amber-400">
                          {(s.firstName || 'S')[0]}
                        </div>
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          disabled={isLockedForTeacher}
                          readOnly={isLockedForTeacher}
                          placeholder={`0 - ${maxMarks}`}
                          className={`w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 font-mono font-bold text-white text-xs focus:outline-none focus:border-amber-500 ${isLockedForTeacher ? 'opacity-60 cursor-not-allowed bg-slate-900/80 border-slate-800' : ''}`}
                          value={item.marksObtained ?? ''}
                          onChange={e => handleMarkChange(s._id, 'marksObtained', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {pct !== null ? `${pct}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {pct === null ? (
                          <span className="text-slate-600 font-semibold">—</span>
                        ) : isPassed ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ PASS
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ✕ FAIL
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          disabled={isLockedForTeacher}
                          readOnly={isLockedForTeacher}
                          placeholder="e.g. Good progress"
                          className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 ${isLockedForTeacher ? 'opacity-60 cursor-not-allowed bg-slate-900/80 border-slate-800' : ''}`}
                          value={item.remarks ?? ''}
                          onChange={e => handleMarkChange(s._id, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">
          {isTeacher 
            ? isLockedForTeacher 
              ? '🔒 Submission locked. Marks are pending review by Principal & Headmaster.' 
              : '⚠️ Teacher submissions require Principal & Headmaster release.' 
            : 'Enrolled students automatically loaded from Class & Section database'}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || !selectedClass || isLockedForTeacher}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLockedForTeacher ? (
              <CheckCircle className="w-4 h-4 text-emerald-950" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>
              {isTeacher 
                ? isLockedForTeacher 
                  ? `✓ Marks Submitted (${submissionStatus === 'PUBLISHED' ? 'Released' : 'Pending Review'})` 
                  : '🚀 Submit Marks to Principal for Approval' 
                : 'Save & Publish Marks Matrix'}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Marks Tab
function MarksTab() {
  const { user } = useAuth();
  const userRole = String(user?.role || user?.designation || '').toUpperCase();
  const isTeacher = userRole.includes('TEACHER');
  const isPrincipal = userRole.includes('PRINCIPAL') || userRole.includes('VICE_PRINCIPAL');
  const isHeadmaster = userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER');
  const isSchoolAdmin = userRole.includes('SCHOOL_ADMIN') || userRole.includes('PRINCIPAL') || userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER') || userRole.includes('SUPER_ADMIN');
  const canCreateMarks = isSchoolAdmin || isTeacher;

  const [rows, setRows] = useState([]);
  const [classList, setClassList] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'flat'

  const load = () => {
    Promise.all([
      apiFetch('/admin/marks').catch(() => []),
      apiFetch('/admin/classes').catch(() => apiFetch('/classes').catch(() => [])),
      apiFetch('/admin/timetable').catch(() => []),
      apiFetch('/admin/exams').catch(() => [])
    ]).then(([mRes, cRes, tRes, eRes]) => {
      setRows(Array.isArray(mRes) ? mRes : []);
      setClassList(Array.isArray(cRes) ? cRes : []);
      setTimetables(Array.isArray(tRes) ? tRes : []);
      setExams(Array.isArray(eRes) ? eRes : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const teacherAssignedSubjects = React.useMemo(() => {
    if (!isTeacher || !user) return null;
    const assigned = [];
    if (Array.isArray(user.assignedSubjects)) {
      user.assignedSubjects.forEach(s => assigned.push(String(s.subjectName || s.name || s).trim().toUpperCase()));
    }
    if (user.subject) {
      assigned.push(String(user.subject).trim().toUpperCase());
    }
    if (user.designation) {
      const des = String(user.designation).toUpperCase();
      const match = des.match(/(.+)TEACHER/);
      if (match && match[1]) assigned.push(match[1].trim());
    }
    return assigned.filter(Boolean);
  }, [isTeacher, user]);

  const handleDelete = async (id) => {
    if (!isSchoolAdmin && !isTeacher) return;
    if (!confirm('Delete marks record?')) return;
    await apiFetch(`/admin/marks/${id}`, { method: 'DELETE' });
    load();
  };

  const handleWorkflow = async (idOrIds, action) => {
    setActionLoading(true);
    try {
      const body = Array.isArray(idOrIds) ? { ids: idOrIds, action } : { id: idOrIds, action };
      await apiFetch('/admin/marks/approve', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      load();
    } catch (e) { alert(e.message); } finally { setActionLoading(false); }
  };

  const isParentOrStudent = !isSchoolAdmin && !isTeacher;

  const displayRows = React.useMemo(() => {
    if (!isParentOrStudent) return rows;

    const sId = String(user?.mappedStudentId || user?.studentId || user?.linkedStudentId || '');
    const sName = String(user?.childName || user?.name || '').trim().toLowerCase();

    return rows.filter(r => {
      if (!r.isPublished && r.approvalStatus !== 'PUBLISHED') return false;
      if (sId && String(r.studentId) === sId) return true;
      const rowName = String(r.studentName || '').trim().toLowerCase();
      if (sName && rowName && (rowName === sName || rowName.includes(sName) || sName.includes(rowName))) return true;
      return false;
    });
  }, [rows, isParentOrStudent, user]);

  const availableClassesList = React.useMemo(() => {
    const set = new Set();
    displayRows.forEach(r => { if (r.classId) set.add(String(r.classId).trim()); });
    return Array.from(set).sort();
  }, [displayRows]);

  const availableSubjectsList = React.useMemo(() => {
    const map = {};
    displayRows.forEach(r => {
      const s = String(r.subjectName || 'Unassigned').trim();
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [displayRows]);

  const availableExamsList = React.useMemo(() => {
    const set = new Set();
    displayRows.forEach(r => { if (r.examTitle) set.add(String(r.examTitle).trim()); });
    return Array.from(set).sort();
  }, [displayRows]);

  const filteredDisplayRows = React.useMemo(() => {
    return displayRows.filter(r => {
      if (selectedClassFilter && String(r.classId || '').trim().toLowerCase() !== selectedClassFilter.toLowerCase()) return false;
      if (selectedSubjectFilter && String(r.subjectName || '').trim().toLowerCase() !== selectedSubjectFilter.toLowerCase()) return false;
      if (selectedExamFilter && String(r.examTitle || '').trim().toLowerCase() !== selectedExamFilter.toLowerCase()) return false;
      return true;
    });
  }, [displayRows, selectedClassFilter, selectedSubjectFilter, selectedExamFilter]);

  const subjectClassGroups = React.useMemo(() => {
    const groups = {};
    filteredDisplayRows.forEach(r => {
      const cName = r.classId ? `Class ${r.classId}` : 'Unassigned Class';
      const sec = r.sectionId ? ` (${r.sectionId})` : '';
      const sName = r.subjectName || 'Unassigned Subject';
      const eTitle = r.examTitle || 'Exam';
      const key = `${cName}${sec}___${sName}___${eTitle}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          classId: r.classId,
          sectionId: r.sectionId,
          subjectName: sName,
          examTitle: eTitle,
          items: []
        };
      }
      groups[key].items.push(r);
    });

    return Object.values(groups);
  }, [filteredDisplayRows]);

  // Class-Wise approval groups for Principal — pending teacher submissions with 100% completed subjects rule
  const principalClassApprovalGroups = React.useMemo(() => {
    if (!isPrincipal && !isSchoolAdmin) return [];
    const map = {};
    displayRows.forEach(r => {
      const status = r.approvalStatus || '';
      if (r.isPublished || status === 'PUBLISHED' || status === 'REJECTED') return;
      if (status !== 'SUBMITTED_BY_TEACHER') return;

      const classId = String(r.classId || '').trim();
      const sectionId = String(r.sectionId || '').trim();
      const examTitle = String(r.examTitle || '').trim();
      const key = `${classId}___${sectionId}___${examTitle}`;

      if (!map[key]) {
        map[key] = {
          key,
          classId,
          sectionId,
          examTitle,
          markIds: [],
          submittedSubjectsSet: new Set(),
          allRows: [],
          studentMap: {}
        };
      }
      map[key].markIds.push(r._id);
      const subName = String(r.subjectName || 'Unassigned').trim();
      map[key].submittedSubjectsSet.add(subName);
      map[key].allRows.push(r);

      const sKey = r.studentId || r.studentName || 'Student';
      if (!map[key].studentMap[sKey]) {
        map[key].studentMap[sKey] = {
          studentName: r.studentName,
          rollNo: r.rollNo,
          subjects: []
        };
      }
      map[key].studentMap[sKey].subjects.push({
        _id: r._id,
        subjectName: subName,
        marksObtained: r.totalMarksObtained,
        maxMarks: r.totalMaxMarks,
        percentage: r.percentage
      });
    });

    return Object.values(map).map(g => {
      const targetClass = String(g.classId || '').replace(/^Class\s+/i, '').trim().toLowerCase();
      const targetSection = String(g.sectionId || '').replace(/^Section\s+/i, '').trim().toLowerCase();

      const assignedSet = new Set();

      // 1. From Timetables matching this Class & Section
      if (Array.isArray(timetables) && timetables.length > 0) {
        timetables.forEach(tt => {
          const cId = String(tt.classId || '').replace(/^Class\s+/i, '').trim().toLowerCase();
          const sId = String(tt.sectionId || '').replace(/^Section\s+/i, '').trim().toLowerCase();

          if (cId === targetClass && (!targetSection || !sId || sId === targetSection)) {
            if (Array.isArray(tt.schedule)) {
              tt.schedule.forEach(p => {
                if (p.subject) assignedSet.add(String(p.subject).trim());
              });
            }
          }
        });
      }

      // 2. From Class Document config
      const clsObj = classList.find(c => {
        const cName = String(c.className || c.classId || c.name || '').trim().toLowerCase();
        return cName === targetClass || cName === `class ${targetClass}` || cName.replace(/^class\s+/i, '') === targetClass;
      });
      if (clsObj && Array.isArray(clsObj.subjects) && clsObj.subjects.length > 0) {
        clsObj.subjects.forEach(s => assignedSet.add(String(s).trim()));
      }

      // 3. From Exam Schedule if available
      const examObj = exams.find(e =>
        String(e.examName || e.title || e.name || '').trim().toLowerCase() === String(g.examTitle || '').trim().toLowerCase()
      );
      if (examObj && Array.isArray(examObj.subjectSchedules)) {
        examObj.subjectSchedules.forEach(s => {
          if (s.subjectName || s.subject) assignedSet.add(String(s.subjectName || s.subject).trim());
        });
      }

      const submittedSubjectsList = Array.from(g.submittedSubjectsSet);

      // Combine expected subjects set with submitted subjects list
      submittedSubjectsList.forEach(s => assignedSet.add(s));

      const allExpectedSubjectsList = Array.from(assignedSet);
      const assignedSubjectsCount = allExpectedSubjectsList.length;
      const completedSubjectsCount = submittedSubjectsList.length;

      // 100% completed rule: completedSubjectsCount >= assignedSubjectsCount AND completedSubjectsCount > 0
      const canApprove = completedSubjectsCount >= assignedSubjectsCount && completedSubjectsCount > 0;

      return {
        ...g,
        subjectsList: allExpectedSubjectsList,
        submittedSubjectsList,
        assignedSubjectsCount,
        completedSubjectsCount,
        canApprove,
        studentsList: Object.values(g.studentMap)
      };
    }).filter(g => g.markIds.length > 0);
  }, [displayRows, classList, timetables, exams, isPrincipal, isHeadmaster, isSchoolAdmin]);

  // Consolidated Multi-Subject Class Approval Desk for Headmaster / School Admin — ALL subjects in 1 single place
  const headmasterApprovalGroups = React.useMemo(() => {
    if (!isHeadmaster && !isSchoolAdmin) return [];
    const map = {};
    displayRows.forEach(r => {
      const status = r.approvalStatus || '';
      if (r.isPublished || status === 'PUBLISHED' || status === 'REJECTED') return;
      if (status !== 'APPROVED_BY_PRINCIPAL') return;

      const key = `${r.classId || ''}___${r.sectionId || ''}___${r.examTitle || ''}`;
      if (!map[key]) {
        map[key] = {
          key,
          classId: r.classId,
          sectionId: r.sectionId,
          examTitle: r.examTitle,
          markIds: [],
          studentMap: {},
          subjectsSet: new Set(),
        };
      }

      map[key].markIds.push(r._id);
      const subName = r.subjectName || 'General';
      map[key].subjectsSet.add(subName);

      const sKey = r.studentId || r.studentName || 'Student';
      if (!map[key].studentMap[sKey]) {
        map[key].studentMap[sKey] = {
          studentName: r.studentName,
          rollNo: r.rollNo,
          subjects: []
        };
      }
      map[key].studentMap[sKey].subjects.push({
        _id: r._id,
        subjectName: subName,
        marksObtained: r.totalMarksObtained,
        maxMarks: r.totalMaxMarks,
        percentage: r.percentage
      });
    });

    return Object.values(map).map(g => ({
      ...g,
      subjectsList: Array.from(g.subjectsSet),
      studentsList: Object.values(g.studentMap)
    })).filter(g => g.markIds.length > 0);
  }, [displayRows, isHeadmaster, isSchoolAdmin]);

  // Student/Parent: group all subjects per exam into unified report cards
  const studentReportCards = React.useMemo(() => {
    if (!isParentOrStudent) return [];
    const map = {};
    displayRows.forEach(r => {
      const key = `${r.studentId || r.studentName || ''}___${r.examTitle || ''}`;
      if (!map[key]) {
        map[key] = {
          studentName: r.studentName,
          rollNo: r.rollNo,
          classId: r.classId,
          sectionId: r.sectionId,
          examTitle: r.examTitle,
          subjects: [],
        };
      }
      map[key].subjects.push({
        subjectName: r.subjectName || 'General',
        marksObtained: r.totalMarksObtained,
        maxMarks: r.totalMaxMarks,
        percentage: r.percentage,
        remarks: r.remarks || '',
      });
    });
    return Object.values(map);
  }, [displayRows, isParentOrStudent]);

  return (
    <>
      {/* ══════════════════════════════════════════════════
           STUDENT / PARENT — CONSOLIDATED REPORT CARD VIEW
          ══════════════════════════════════════════════════ */}
      {isParentOrStudent && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
          ) : studentReportCards.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-base font-black text-slate-300">No published report cards yet.</p>
              <p className="text-sm text-slate-500">Your marks will appear here once approved and published by school administration.</p>
            </div>
          ) : (
            studentReportCards.map((card, cidx) => {
              const totalObtained = card.subjects.reduce((s, sub) => s + (Number(sub.marksObtained) || 0), 0);
              const totalMax = card.subjects.reduce((s, sub) => s + (Number(sub.maxMarks) || 0), 0);
              const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

              const failedSubjects = card.subjects.filter(sub => {
                const passM = Number(sub.passingMarks) || 35;
                const obt = sub.marksObtained !== undefined && sub.marksObtained !== null ? Number(sub.marksObtained) : 0;
                return obt < passM;
              });

              const failedCount = failedSubjects.length;
              const overallIsPass = failedCount === 0;

              const grade = overallIsPass 
                ? (overallPct >= 90 ? 'A+' : overallPct >= 80 ? 'A' : overallPct >= 70 ? 'B+' : overallPct >= 60 ? 'B' : overallPct >= 50 ? 'C' : 'D')
                : 'F';

              const gradeColor = overallIsPass
                ? (overallPct >= 80 ? 'text-emerald-400' : overallPct >= 60 ? 'text-amber-400' : 'text-sky-400')
                : 'text-rose-400';

              return (
                <div key={cidx} className="rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
                  {/* REPORT CARD HEADER */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border-b border-amber-500/20 p-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-2xl font-black text-amber-400 shadow-lg">
                        {(card.studentName || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">{card.studentName}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Roll No: <span className="text-amber-300 font-black">{card.rollNo || '—'}</span>
                          {' · '}Class <span className="text-white font-black">{card.classId}</span>
                          {card.sectionId ? <span> ({card.sectionId})</span> : ''}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{card.examTitle}</p>
                      </div>
                    </div>
                    {/* OVERALL SCORE & RESULT STATUS */}
                    <div className="text-center">
                      <div className={`text-4xl font-black ${gradeColor}`}>{grade}</div>
                      <div className="text-xs text-slate-400 font-bold mt-0.5">{overallPct}% Overall</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{totalObtained}/{totalMax} marks</div>
                      <div className="mt-1.5">
                        {overallIsPass ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                            ✓ PASSED
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
                            ✕ FAILED ({failedCount} {failedCount === 1 ? 'Subject' : 'Subjects'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SUBJECTS TABLE */}
                  <div className="overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-950 text-emerald-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-4 text-left">#</th>
                          <th className="p-4 text-left">Subject</th>
                          <th className="p-4 text-center">Marks Obtained</th>
                          <th className="p-4 text-center">Max Marks</th>
                          <th className="p-4 text-center">Percentage</th>
                          <th className="p-4 text-center">Grade</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {card.subjects.map((sub, sidx) => {
                          const passM = Number(sub.passingMarks) || 35;
                          const obt = sub.marksObtained !== undefined && sub.marksObtained !== null ? Number(sub.marksObtained) : 0;
                          const pct = sub.percentage || (sub.maxMarks > 0 ? Math.round((obt / sub.maxMarks) * 100) : 0);
                          const isPass = obt >= passM;

                          const sg = isPass
                            ? (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D')
                            : 'F';

                          const sgColor = !isPass
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                            : pct >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : pct >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            : 'text-sky-400 bg-sky-500/10 border-sky-500/30';

                          return (
                            <tr key={sidx} className={`transition ${!isPass ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'bg-slate-900/80 hover:bg-slate-800/80'}`}>
                              <td className="p-4 font-mono text-slate-500 font-bold">{sidx + 1}</td>
                              <td className="p-4">
                                <span className="px-3 py-1 rounded-xl bg-slate-800 text-white font-black text-xs border border-slate-700">
                                  {sub.subjectName}
                                </span>
                              </td>
                              <td className={`p-4 text-center font-black text-base ${!isPass ? 'text-rose-400' : 'text-white'}`}>
                                {sub.marksObtained ?? '—'}
                              </td>
                              <td className="p-4 text-center font-bold text-slate-400">{sub.maxMarks ?? '—'}</td>
                              <td className={`p-4 text-center font-black ${!isPass ? 'text-rose-400' : 'text-amber-300'}`}>{pct}%</td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${sgColor}`}>{sg}</span>
                              </td>
                              <td className="p-4 text-center">
                                {isPass ? (
                                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm">
                                    ✓ PASS
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm">
                                    ✕ FAIL
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* TOTAL ROW */}
                      <tfoot className="bg-slate-950 border-t-2 border-amber-500/30">
                        <tr>
                          <td colSpan={2} className="p-4 font-black text-amber-400 uppercase tracking-wider text-xs">Total</td>
                          <td className="p-4 text-center font-black text-white text-lg">{totalObtained}</td>
                          <td className="p-4 text-center font-bold text-slate-400">{totalMax}</td>
                          <td className="p-4 text-center font-black text-amber-300 text-base">{overallPct}%</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1.5 rounded-xl text-sm font-black border ${overallIsPass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                              {overallIsPass ? grade : 'F'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {overallIsPass ? (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                                ✓ PASS
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
                                ✕ FAIL ({failedCount} {failedCount === 1 ? 'Subject' : 'Subjects'})
                              </span>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
           STAFF — PRINCIPAL CLASS-WISE APPROVAL DESK
          ══════════════════════════════════════════════════ */}
      {!isParentOrStudent && (isPrincipal || isSchoolAdmin) && principalClassApprovalGroups.length > 0 && (
        <div className="mb-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 border-b border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Principal — Class-Wise Approval Desk</h4>
                <p className="text-xs text-slate-400">Review complete class marks before approving. Approve button is enabled only when 100% of assigned subjects are completed.</p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-black bg-amber-500 text-slate-950 shadow-md">
              {principalClassApprovalGroups.length} Class Batches Pending Principal
            </span>
          </div>

          {/* CLASS CARDS GRID */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {principalClassApprovalGroups.map((g, idx) => {
              const isExpanded = expandedCardKey === g.key;
              return (
                <div
                  key={g.key || idx}
                  className={`flex flex-col gap-3 p-5 rounded-2xl bg-slate-950 border transition shadow-lg cursor-pointer ${
                    isExpanded 
                      ? 'border-amber-500 ring-2 ring-amber-500/30 col-span-1 sm:col-span-2' 
                      : 'border-slate-800 hover:border-amber-500/50'
                  }`}
                  onClick={(e) => {
                    if (e.target.closest('button')) return;
                    setExpandedCardKey(isExpanded ? null : g.key);
                  }}
                >
                  {/* CLASS & EXAM HEADER */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        Class {g.classId}{g.sectionId ? ` (${g.sectionId})` : ''}
                      </h4>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">{g.examTitle}</p>
                    </div>

                    {/* COMPLETION BADGE & CONDITION STATUS */}
                    <div>
                      {g.canApprove ? (
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ✅ 100% Complete ({g.completedSubjectsCount}/{g.assignedSubjectsCount} Subjects)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                          ⏳ Incomplete ({g.completedSubjectsCount}/{g.assignedSubjectsCount} Subjects Submitted)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SUBJECT SUBMISSION STATUS BADGES */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Subject Mark Entries ({g.completedSubjectsCount}/{g.assignedSubjectsCount}):</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {g.subjectsList.map(s => {
                        const isSubmitted = g.submittedSubjectsList.includes(s);
                        return (
                          <span
                            key={s}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                              isSubmitted
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                          >
                            <span>{isSubmitted ? '✓' : '⏳'}</span>
                            <span>{s}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* EXPANDED CLASS DATA TABLE */}
                  {isExpanded && (
                    <div className="mt-3 pt-4 border-t border-slate-800 space-y-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                            Complete Class Marks Breakdown — Class {g.classId}{g.sectionId ? ` (${g.sectionId})` : ''}
                          </h4>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px] border-b border-slate-800 tracking-wider">
                            <tr>
                              <th className="p-3.5 font-mono">#</th>
                              <th className="p-3.5">Roll No</th>
                              <th className="p-3.5">Student Name</th>
                              <th className="p-3.5">All Submitted Subjects</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 text-white font-medium">
                            {g.studentsList.map((stu, sIdx) => (
                              <tr key={sIdx} className="hover:bg-slate-800/60 transition">
                                <td className="p-3.5 font-mono text-slate-500 font-bold">{sIdx + 1}</td>
                                <td className="p-3.5 font-mono font-extrabold text-amber-300">{stu.rollNo || '—'}</td>
                                <td className="p-3.5 font-extrabold text-white flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400 shrink-0">
                                    {(stu.studentName || 'S')[0]}
                                  </div>
                                  <span>{stu.studentName}</span>
                                </td>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {stu.subjects.map(s => (
                                      <div key={s._id} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs font-bold">
                                        <span className="text-slate-300">{s.subjectName}:</span>
                                        <span className="text-emerald-400 font-mono font-black">{s.marksObtained}/{s.maxMarks}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CLASS APPROVAL BUTTON OR LOCKED BANNER */}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    {g.canApprove ? (
                      <button
                        onClick={() => handleWorkflow(g.markIds, 'APPROVE')}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve &amp; Forward Class {g.classId} to Headmaster ({g.markIds.length} Marks)
                      </button>
                    ) : (
                      <div className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 text-center">
                        🔒 Approval Locked — Waiting for all {g.assignedSubjectsCount} subjects to be completed by teachers ({g.completedSubjectsCount}/{g.assignedSubjectsCount} done)
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedCardKey(isExpanded ? null : g.key)}
                      className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isExpanded ? 'Hide Details' : 'Inspect Class Marks'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
           STAFF — HEADMASTER CONSOLIDATED MULTI-SUBJECT RELEASE DESK
          ══════════════════════════════════════════════════ */}
      {!isParentOrStudent && (isHeadmaster || isSchoolAdmin) && headmasterApprovalGroups.length > 0 && (
        <div className="mb-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 border-b border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Headmaster — Consolidated Multi-Subject Release Desk</h4>
                <p className="text-xs text-slate-400">View all subjects consolidated in one place per class. Approve all subjects for the class in a single click to release official report cards to parents.</p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-black bg-emerald-500 text-slate-950 shadow-md">
              {headmasterApprovalGroups.length} Class Batches Ready to Release
            </span>
          </div>

          {/* CONSOLIDATED CLASS CARDS GRID */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {headmasterApprovalGroups.map((g, idx) => {
              const isExpanded = expandedCardKey === g.key;
              return (
                <div
                  key={g.key || idx}
                  className={`flex flex-col gap-3 p-5 rounded-2xl bg-slate-950 border transition shadow-lg cursor-pointer ${
                    isExpanded 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 col-span-1 sm:col-span-2' 
                      : 'border-slate-800 hover:border-emerald-500/50'
                  }`}
                  onClick={(e) => {
                    if (e.target.closest('button')) return;
                    setExpandedCardKey(isExpanded ? null : g.key);
                  }}
                >
                  {/* CLASS & EXAM TITLE */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        Class {g.classId}{g.sectionId ? ` (${g.sectionId})` : ''}
                      </h4>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">{g.examTitle}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      ⏳ Pending Headmaster Release ({g.studentsList.length} Students)
                    </span>
                  </div>

                  {/* ALL SUBJECTS INCLUDED IN THIS CLASS REPORT CARD */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">All Class Subjects Included ({g.subjectsList.length}):</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {g.subjectsList.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 border border-slate-700 text-xs font-black">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* EXPANDED CONSOLIDATED MULTI-SUBJECT TABLE */}
                  {isExpanded && (
                    <div className="mt-3 pt-4 border-t border-slate-800 space-y-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                            Consolidated Multi-Subject Student Matrix — Class {g.classId}{g.sectionId ? ` (${g.sectionId})` : ''}
                          </h4>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px] border-b border-slate-800 tracking-wider">
                            <tr>
                              <th className="p-3.5 font-mono">#</th>
                              <th className="p-3.5">Roll No</th>
                              <th className="p-3.5">Student Name</th>
                              <th className="p-3.5">All Subject Marks</th>
                              <th className="p-3.5 text-center">Class Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 text-white font-medium">
                            {g.studentsList.map((stu, sIdx) => (
                              <tr key={sIdx} className="hover:bg-slate-800/60 transition">
                                <td className="p-3.5 font-mono text-slate-500 font-bold">{sIdx + 1}</td>
                                <td className="p-3.5 font-mono font-extrabold text-amber-300">{stu.rollNo || '—'}</td>
                                <td className="p-3.5 font-extrabold text-white flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400 shrink-0">
                                    {(stu.studentName || 'S')[0]}
                                  </div>
                                  <span>{stu.studentName}</span>
                                </td>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {stu.subjects.map(s => (
                                      <div key={s._id} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs font-bold">
                                        <span className="text-slate-300">{s.subjectName}:</span>
                                        <span className="text-emerald-400 font-mono font-black">{s.marksObtained}/{s.maxMarks}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-3.5 text-center">
                                  <button
                                    onClick={() => handleWorkflow(stu.subjects.map(s => s._id), 'APPROVE')}
                                    disabled={actionLoading}
                                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow-sm transition cursor-pointer disabled:opacity-50"
                                  >
                                    Release Student Report Card
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* APPROVE ALL SUBJECTS & RELEASE BUTTON */}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                      onClick={() => handleWorkflow(g.markIds, 'APPROVE')}
                      disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve &amp; Release All Subjects for Class {g.classId} ({g.markIds.length} Marks)
                    </button>

                    <button
                      onClick={() => setExpandedCardKey(isExpanded ? null : g.key)}
                      className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isExpanded ? 'Hide Matrix' : 'Inspect Class Matrix'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Workflow Desk Completed */}

      {/* CLASS-WISE & SUBJECT-WISE INTERACTIVE FILTER & VIEW BAR — STAFF ONLY */}
      {!isParentOrStudent && <div className="mb-6 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Class-Wise & Subject-Wise Evaluation Matrix</h4>
              <p className="text-xs text-slate-400 font-medium">Filter or view marks separately by class, subject, and exam batch</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canCreateMarks && (
              <button
                onClick={() => setIsFullModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Marks Matrix</span>
              </button>
            )}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'grouped' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grouped View</span>
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'flat' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        {/* DROPDOWN & SUBJECT PILL FILTERS */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400">Class:</label>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
              >
                <option value="">All Classes ({availableClassesList.length})</option>
                {availableClassesList.map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400">Exam:</label>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                value={selectedExamFilter}
                onChange={e => setSelectedExamFilter(e.target.value)}
              >
                <option value="">All Exams ({availableExamsList.length})</option>
                {availableExamsList.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {(selectedClassFilter || selectedSubjectFilter || selectedExamFilter) && (
              <button
                onClick={() => { setSelectedClassFilter(''); setSelectedSubjectFilter(''); setSelectedExamFilter(''); }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* INTERACTIVE SUBJECT PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase text-amber-400 shrink-0">Subjects:</span>
            <button
              onClick={() => setSelectedSubjectFilter('')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${!selectedSubjectFilter ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'}`}
            >
              All Subjects ({filteredDisplayRows.length})
            </button>
            {Object.entries(availableSubjectsList).map(([sName, count]) => (
              <button
                key={sName}
                onClick={() => setSelectedSubjectFilter(selectedSubjectFilter === sName ? '' : sName)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${selectedSubjectFilter === sName ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'}`}
              >
                <span>{sName}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${selectedSubjectFilter === sName ? 'bg-slate-950/30 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* GROUPED VIEW MODE (BY CLASS & SUBJECT SEPARATE CARDS) — STAFF ONLY */}
      {!isParentOrStudent && viewMode === 'grouped' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : subjectClassGroups.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No marks found for the selected subject and class filters.</p>
            </div>
          ) : (
            subjectClassGroups.map(grp => (
              <div key={grp.key} className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl space-y-3 p-5">
                {/* SECTION GROUP HEADER */}
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
                      SUBJECT: {grp.subjectName}
                    </div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      Class {grp.classId} {grp.sectionId ? `(${grp.sectionId})` : ''}
                      <span className="text-xs text-slate-300 font-semibold">— {grp.examTitle}</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-950 text-amber-300 border border-amber-500/30">
                      {grp.items.length} Student Records
                    </span>
                  </div>
                </div>

                {/* DISTINCT GROUPED TABLE */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-emerald-400 font-black uppercase text-[11px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4 text-slate-400 font-mono">#</th>
                        <th className="p-4">Roll No</th>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Marks Obtained</th>
                        <th className="p-4">Max Marks</th>
                        <th className="p-4">Percentage</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-white font-medium">
                      {grp.items.map((r, idx) => {
                        const status = r.isPublished ? 'PUBLISHED' : (r.approvalStatus || 'PUBLISHED');
                        return (
                          <tr key={r._id || idx} className="bg-slate-900/90 hover:bg-slate-800 transition">
                            <td className="p-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-4 font-mono font-extrabold text-slate-200">{r.rollNo || '—'}</td>
                            <td className="p-4 font-extrabold text-white flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400 shadow-sm">
                                {(r.studentName || 'S')[0]}
                              </div>
                              <span className="text-sm font-black text-white">{r.studentName}</span>
                            </td>
                            <td className="p-4 font-mono font-black text-emerald-400 text-base">{r.totalMarksObtained}</td>
                            <td className="p-4 font-mono text-slate-300 font-bold">{r.totalMaxMarks}</td>
                            <td className="p-4 font-mono font-black text-amber-300 text-sm">{r.percentage !== undefined ? `${r.percentage}%` : '—'}</td>
                            <td className="p-4">
                              {status === 'SUBMITTED_BY_TEACHER' && <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">⏳ Pending Principal</span>}
                              {status === 'APPROVED_BY_PRINCIPAL' && <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm">⏳ Pending Headmaster</span>}
                              {(status === 'PUBLISHED' || r.isPublished) && <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">✓ Published</span>}
                              {status === 'REJECTED' && <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">✕ Rejected</span>}
                            </td>
                            <td className="p-4 text-right">
                              {canCreateMarks && (
                                <button onClick={() => handleDelete(r._id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer" title="Delete Record">
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FLAT LIST VIEW MODE — STAFF ONLY */}
      {!isParentOrStudent && viewMode === 'flat' && (
        <ModuleTable
          title="Marks &amp; Evaluation Matrix" icon={Award} color="amber"
          loading={loading} rows={filteredDisplayRows}
          columns={[
            { key: 'studentName', label: 'Student' },
            { key: 'rollNo', label: 'Roll No' },
            { key: 'classId', label: 'Class', render: (v, r) => `Class ${v || ''} ${r.sectionId ? `(${r.sectionId})` : ''}` },
            { key: 'examTitle', label: 'Exam' },
            { key: 'subjectName', label: 'Subject', render: v => v || '—' },
            { key: 'totalMarksObtained', label: 'Marks Obtained' },
            { key: 'totalMaxMarks', label: 'Max Marks' },
            { key: 'percentage', label: 'Percentage', render: v => v !== undefined && v !== null ? `${v}%` : '—' },
            {
              key: 'approvalStatus',
              label: 'Workflow Status',
              render: (v, r) => {
                const status = r.isPublished ? 'PUBLISHED' : (v || 'PUBLISHED');
                if (status === 'SUBMITTED_BY_TEACHER') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">⏳ Pending Principal</span>;
                if (status === 'APPROVED_BY_PRINCIPAL') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">⏳ Pending Headmaster</span>;
                if (status === 'PUBLISHED' || r.isPublished) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Published</span>;
                if (status === 'REJECTED') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">✕ Rejected</span>;
                return <span className="text-slate-400">—</span>;
              }
            },
            {
              key: '_actions',
              label: 'Actions',
              render: (_, r) => {
                return (
                  <div className="flex items-center justify-end">
                    {canCreateMarks && (
                      <button onClick={() => handleDelete(r._id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer" title="Delete Record">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    )}
                  </div>
                );
              }
            }
          ]}
          onAdd={canCreateMarks ? () => setIsFullModalOpen(true) : undefined}
          onDelete={canCreateMarks ? handleDelete : undefined}
        />
      )}


      {canCreateMarks && (
        <FullScreenMarksEntryModal
          isOpen={isFullModalOpen}
          onClose={() => setIsFullModalOpen(false)}
          onRefresh={load}
        />
      )}
    </>
  );
}


// Parents Tab — full CRUD for PARENT role users with linked student
function ParentsTab() {
  const { user } = useAuth();
  const userRoleStr = String(user?.role || user?.designation || '').toUpperCase();
  const isSchoolAdmin = userRoleStr.includes('SCHOOL_ADMIN') || userRoleStr.includes('PRINCIPAL') || userRoleStr.includes('HEADMASTER') || userRoleStr.includes('HEAD_MASTER') || userRoleStr.includes('SUPER_ADMIN');

  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const [uData, sData, cData] = await Promise.all([
        apiFetch('/users').catch(() => []),
        apiFetch('/students').catch(() => []),
        apiFetch('/classes').catch(() => [])
      ]);
      setRows(Array.isArray(uData) ? uData.filter(u => u.role === 'PARENT') : []);
      setStudents(Array.isArray(sData) ? sData : []);
      setClasses(Array.isArray(cData) ? cData : []);
    } catch (e) {
      showMsg('error', 'Failed to load parent data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Helpers to clean duplicate "Class" or "Section" prefixes
  const cleanClass = (classId) => {
    if (!classId) return '';
    return String(classId).replace(/^Class\s+/i, '').trim();
  };

  const cleanSection = (secId) => {
    if (!secId || secId === '-') return '';
    return String(secId).replace(/^Section\s+/i, '').trim();
  };

  // Collect all unique available classes from students and classes collection
  const availableClasses = React.useMemo(() => {
    const set = new Set();
    classes.forEach(c => {
      if (c.className) set.add(cleanClass(c.className));
    });
    students.forEach(s => {
      if (s.classId) set.add(cleanClass(s.classId));
    });
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes, students]);

  // Collect all unique available sections
  const availableSections = React.useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.sectionId) set.add(cleanSection(s.sectionId));
    });
    return Array.from(set).filter(Boolean).sort();
  }, [students]);

  // Merge Parents with their linked Student child details
  const mergedParents = React.useMemo(() => {
    const map = new Map();

    rows.forEach(p => {
      // 1. Priority check: Exact ObjectId link (mappedStudentId or parentId)
      let child = students.find(s => 
        (p.mappedStudentId && String(s._id) === String(p.mappedStudentId)) ||
        (s.parentId && String(s.parentId) === String(p._id))
      );

      // 2. Fallback check: Parent email match
      if (!child) {
        child = students.find(s => 
          s.parentEmail && s.parentEmail.toLowerCase() === p.email.toLowerCase()
        );
      }

      // 3. Fallback check: Phone number match
      if (!child && p.phone && p.phone.length > 5) {
        child = students.find(s => 
          s.parentPhone && s.parentPhone.replace(/\D/g,'') === p.phone.replace(/\D/g,'')
        );
      }

      const clsName = cleanClass(child?.classId);
      const secName = cleanSection(child?.sectionId);

      map.set(p.email.toLowerCase(), {
        _id: p._id,
        name: p.name,
        parentName: p.name,
        email: p.email,
        phone: p.phone || child?.parentPhone || '—',
        status: p.status || 'ACTIVE',
        mappedStudentId: p.mappedStudentId || child?._id || '',
        childName: child ? `${child.firstName} ${child.lastName}` : 'Unlinked',
        childClass: child ? `Class ${clsName}${secName ? ` — Section ${secName}` : ''}` : 'N/A',
        rawClassId: clsName,
        rawSectionId: secName,
        createdAt: p.createdAt
      });
    });

    students.forEach(s => {
      const pEmail = s.parentEmail ? s.parentEmail.toLowerCase() : null;
      if (pEmail && !map.has(pEmail)) {
        const clsName = cleanClass(s.classId);
        const secName = cleanSection(s.sectionId);
        map.set(pEmail, {
          _id: `st-parent-${s._id}`,
          name: s.parentName || 'Parent / Guardian',
          parentName: s.parentName || 'Parent / Guardian',
          email: s.parentEmail,
          phone: s.parentPhone || '—',
          status: 'ACTIVE',
          mappedStudentId: s._id,
          childName: `${s.firstName} ${s.lastName}`,
          childClass: `Class ${clsName}${secName ? ` — Section ${secName}` : ''}`,
          rawClassId: clsName,
          rawSectionId: secName,
          createdAt: s.createdAt
        });
      }
    });

    return Array.from(map.values());
  }, [rows, students]);

  const filteredParents = React.useMemo(() => {
    return mergedParents.filter(p => {
      const matchesClass = !selectedClassFilter || (p.rawClassId && p.rawClassId.toLowerCase() === selectedClassFilter.toLowerCase());
      const matchesSection = !selectedSectionFilter || (p.rawSectionId && p.rawSectionId.toLowerCase() === selectedSectionFilter.toLowerCase());
      return matchesClass && matchesSection;
    });
  }, [mergedParents, selectedClassFilter, selectedSectionFilter]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const targetId = (form._id && !String(form._id).startsWith('st-parent-'))
        ? form._id
        : (modal.editing && modal.editing._id && !String(modal.editing._id).startsWith('st-parent-') ? modal.editing._id : null);

      if (targetId) {
        await apiFetch(`/users/${targetId}`, { method: 'PUT', body: JSON.stringify(form) });
        showMsg('success', '✅ Existing parent account updated & linked to student.');
      } else {
        await apiFetch('/users', { method: 'POST', body: JSON.stringify({ ...form, role: 'PARENT' }) });
        showMsg('success', '✅ Parent account created & linked to student.');
      }
      setModal(null); load();
    } catch (e) { showMsg('error', `❌ ${e.message}`); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (String(id).startsWith('st-parent-')) {
      showMsg('error', 'Delete the student record to remove this parent entry.');
      return;
    }
    if (!confirm('Delete this parent account?')) return;
    try { await apiFetch(`/users/${id}`, { method: 'DELETE' }); showMsg('success', '✅ Deleted.'); load(); }
    catch (e) { showMsg('error', e.message); }
  };

  return (
    <div className="space-y-4">
      {msg && <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>{msg.text}</div>}
      
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Parent Directory & Child Linkages</h3>
            <p className="text-[11px] text-slate-400">Class & Section-wise parent contacts and student enrollment links</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold">Class:</span>
            <select 
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              value={selectedClassFilter} 
              onChange={e => setSelectedClassFilter(e.target.value)}
            >
              <option value="">All Classes ({mergedParents.length})</option>
              {availableClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold">Section:</span>
            <select 
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              value={selectedSectionFilter} 
              onChange={e => setSelectedSectionFilter(e.target.value)}
            >
              <option value="">All Sections</option>
              {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* QUICK CLASS PILL BUTTONS */}
      {availableClasses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setSelectedClassFilter(''); setSelectedSectionFilter(''); }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              !selectedClassFilter && !selectedSectionFilter
                ? 'gradient-primary text-white border-indigo-400/40 shadow-md shadow-indigo-500/20' 
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            All Classes ({mergedParents.length})
          </button>
          {availableClasses.map(c => {
            const count = mergedParents.filter(p => p.rawClassId && p.rawClassId.toLowerCase() === c.toLowerCase()).length;
            const isSel = selectedClassFilter.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setSelectedClassFilter(c)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
                  isSel 
                    ? 'gradient-primary text-white border-indigo-400/40 shadow-md shadow-indigo-500/20' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <span>Class {c}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSel ? 'bg-indigo-400/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ModuleTable
        title="Parent Directory" icon={HeartHandshake} color="amber"
        loading={loading} rows={filteredParents}
        columns={[
          { key: 'parentName', label: 'Parent Name' },
          { key: 'childName', label: 'Child (Student)', render: v => <span className="font-semibold text-indigo-300">{v}</span> },
          { key: 'childClass', label: 'Class & Section', render: v => <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">{v}</span> },
          { key: 'email', label: 'Login Email' },
          { key: 'phone', label: 'Parent Phone' },
          { key: 'status', label: 'Status', badge: true },
        ]}
        onEdit={isSchoolAdmin ? (row) => setModal({ editing: row }) : undefined}
        onDelete={isSchoolAdmin ? handleDelete : undefined}
        emptyMsg={isSchoolAdmin ? 'No records found. Click "Add New" to get started.' : 'No parent directory records available.'}
        searchable
      />
      {modal && isSchoolAdmin && (
        <ParentAccountModal
          isOpen={true}
          editing={modal.editing}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
}

function ParentAccountModal({ isOpen, editing, onSave, onClose, loading }) {
  const [form, setForm] = useState(editing ? {
    _id: editing._id && !String(editing._id).startsWith('st-parent-') ? editing._id : '',
    name: editing.parentName || editing.name || '',
    email: editing.email || '',
    phone: editing.phone || '',
    password: '',
    status: editing.status || 'ACTIVE'
  } : {
    _id: '', name: '', email: '', phone: '', password: '', status: 'ACTIVE'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 pt-16 pb-8 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-indigo-400" />
            {editing ? `Edit Parent — ${editing.parentName || editing.name}` : 'Edit Parent Account'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {editing && editing.childName && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Child Student:</span>
              <span className="font-bold text-indigo-300">{editing.childName} ({editing.childClass})</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Parent / Guardian Name <span className="text-rose-400">*</span></label>
            <input 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rajesh Sharma"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Login Email <span className="text-rose-400">*</span></label>
            <input 
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
              value={form.email} 
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="e.g. parent@gmail.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Phone Number</label>
            <input 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Password (leave blank to keep unchanged)</label>
            <input 
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" 
              value={form.password} 
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Account Status</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              value={form.status} 
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading} className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

// Staff Attendance Tab
function StaffAttendanceTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getLocalDateStr());
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = () => {
    setLoading(true);
    apiFetch(`/admin/staff-attendance?date=${date}`)
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [date]);

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/admin/staff-attendance/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ status: 'APPROVED' }) });
      showMsg('success', '✅ Attendance approved.');
      load();
    } catch (e) { showMsg('error', e.message); }
  };

  const handleManualMark = async (form) => {
    setSaving(true);
    try {
      await apiFetch('/admin/staff-attendance', { method: 'POST', body: JSON.stringify({ ...form, date }) });
      showMsg('success', '✅ Manual attendance marked.');
      setModal(null); load();
    } catch (e) { showMsg('error', `❌ ${e.message}`); } finally { setSaving(false); }
  };

  const present = rows.filter(r => r.status === 'PRESENT' || r.status === 'APPROVED').length;
  const absent = rows.filter(r => r.status === 'ABSENT').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Staff Attendance</h2>
            <p className="text-[11px] text-slate-500">{rows.length} records · {date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          <button onClick={() => setModal({ editing: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Manual Mark
          </button>
        </div>
      </div>

      {msg && <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>{msg.text}</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-400">{present}</p><p className="text-[11px] text-emerald-300">Present</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-rose-400">{absent}</p><p className="text-[11px] text-rose-300">Absent</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-amber-400">{rows.length > 0 ? rows.length - present - absent : 0}</p><p className="text-[11px] text-amber-300">Pending</p>
        </div>
      </div>

      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No attendance records for {date}. Staff clock-in via mobile GPS app.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-800">
                {['Employee', 'Dept', 'Clock In', 'Clock Out', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map(r => (
                  <tr key={r._id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <p className="text-xs text-white font-semibold">{r.employeeName}</p>
                      <p className="text-[10px] text-slate-500">{r.employeeId}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{r.department || '—'}</td>
                    <td className="px-4 py-3 text-xs text-emerald-300 font-mono">{r.clockIn ? new Date(r.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-rose-300 font-mono">{r.clockOut ? new Date(r.clockOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'PENDING' && (
                        <button onClick={() => handleApprove(r._id)} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30">✓ Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <CrudModal
          title="Manual Attendance Entry"
          fields={[
            { key: 'employeeName', label: 'Employee Name', required: true },
            { key: 'employeeId', label: 'Employee ID' },
            { key: 'department', label: 'Department' },
            { key: 'status', label: 'Status', type: 'select', required: true, options: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'] },
            { key: 'clockIn', label: 'Clock In Time', type: 'time' },
            { key: 'clockOut', label: 'Clock Out Time', type: 'time' },
            { key: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          initial={{}}
          onSave={handleManualMark}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
}

// ── USER PROFILE TAB ──
function AdminProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    bio: '',
    avatar: '',
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    apiFetch('/auth/me')
      .then(d => {
        setProfile(d);
        const defaultDesignation = d.designation || (
          d.role === 'STUDENT' ? 'Enrolled Student' :
          d.role === 'TEACHER' ? 'Faculty Member' :
          d.role === 'PARENT' ? 'Parent / Guardian' :
          d.role === 'ACCOUNTANT' ? 'Finance Officer' :
          d.role === 'SAAS_SUPER_ADMIN' ? 'SaaS Super Admin' :
          'Principal & Campus Director'
        );
        setForm({
          name: d.name || 'User',
          email: d.email || '',
          phone: d.phone || '',
          designation: defaultDesignation,
          bio: d.bio || '',
          avatar: d.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop',
        });
        setLoading(false);
      })
      .catch(() => {
        const demo = {
          name: 'User Account',
          email: 'user@school.edu.in',
          phone: '+91 98765 43210',
          role: 'SCHOOL_ADMIN',
          schoolName: 'School ERP Campus',
          designation: 'Campus Administrator',
          bio: 'Managing academic operations.',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop',
        };
        setProfile(demo);
        setForm(demo);
        setLoading(false);
      });
  }, []);

  const handleUpdateInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          avatar: form.avatar,
          designation: form.designation,
          bio: form.bio,
        }),
      });
      showMsg('success', res.message || 'Profile updated successfully!');
      if (res.user) {
        setProfile(prev => ({ ...prev, ...res.user }));
        setForm(prev => ({
          ...prev,
          name: res.user.name || prev.name,
          phone: res.user.phone || prev.phone,
          avatar: res.user.avatar || prev.avatar,
          designation: res.user.designation !== undefined ? res.user.designation : prev.designation,
          bio: res.user.bio !== undefined ? res.user.bio : prev.bio,
        }));
        try {
          const stored = localStorage.getItem('erp_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem('erp_user', JSON.stringify({ ...parsed, ...res.user }));
          }
        } catch (e) {}
      }
    } catch (err) {
      showMsg('error', err.message || 'Failed to update profile');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passForm.newPassword) {
      showMsg('error', 'Please enter a new password.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      showMsg('error', 'New passwords do not match.');
      return;
    }
    setSavingPass(true);
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });
      showMsg('success', 'Password updated successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMsg('error', err.message || 'Failed to update password');
    } finally {
      setSavingPass(false);
    }
  };

  const getRoleControls = (role) => {
    switch (role) {
      case 'STUDENT':
        return [
          'Academic LMS & Homework Access',
          'Examination Results & Report Cards',
          'Class Timetable & Schedule Attendance',
          'Student Profile & Document Repository',
        ];
      case 'TEACHER':
        return [
          'Student Daily Attendance Marking',
          'LMS Course Content & Homework Uploads',
          'Exam Marks & Evaluation Input',
          'Class Academic Timetable View',
        ];
      case 'PARENT':
        return [
          'Child Academic Performance Monitoring',
          'Online Fee Payment & Ledger History',
          'Live Student Bus Transport Tracking',
          'School Noticeboard & Broadcast Announcements',
        ];
      case 'ACCOUNTANT':
        return [
          'Student Fee Collection & Receipt Management',
          'Ledger Records & Financial Reporting',
          'Payroll Processing & Expense Tracking',
          'Fee Defaulter List Management',
        ];
      case 'SAAS_SUPER_ADMIN':
        return [
          'Full Multi-Tenant SaaS Overseer',
          'Tenant School Onboarding & Licensing',
          'Global User & Subscription Management',
          'Security Audit & Feature Flag Engine',
        ];
      default:
        return [
          'Full Student & Parent Lifecycle Management',
          'Academic Timetable & Course Authoring',
          'Fee Category & Ledger Record Control',
          'Staff HRMS, Payroll & Leave Approvals',
          'AI Early Warning Risk Detector Access',
          'Campus Assets & Inventory Overseer',
        ];
    }
  };

  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
  const labelCls = 'block text-[11px] font-semibold text-slate-400 mb-1.5';

  const themeContext = useTheme();
  const theme = themeContext?.currentTheme;
  const brandPrimary = theme?.accentPrimary || '#02563d';
  const brandSecondary = theme?.accentSecondary || '#02422f';

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>;

  const currentRole = profile?.role || 'SCHOOL_ADMIN';
  const displayRole = currentRole.replace(/_/g, ' ');
  const isReadOnlyRole = ['STUDENT', 'PARENT'].includes(currentRole);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Feedback */}
      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* HERO BANNER CARD (DYNAMIC DEEP EMERALD BRAND THEME COLOR - MATCHES PARENT PORTAL) */}
      <div 
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4 shadow-2xl border"
        style={{ 
          background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandPrimary} 100%)`,
          borderColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff'
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={form.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop'}
                alt="Profile Avatar"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-xl bg-white shrink-0"
              />
              {!isReadOnlyRole && (
                <div 
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const url = prompt('Enter Avatar Image URL:', form.avatar);
                    if (url !== null) setForm(f => ({ ...f, avatar: url }));
                  }}
                >
                  <Camera className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span 
                  className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  {displayRole}
                </span>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(52,211,153,0.25)', color: '#a7f3d0', borderColor: 'rgba(52,211,153,0.4)' }}
                >
                  <CheckCircle className="w-3 h-3" style={{ color: '#6ee7b7' }} /> Verified Profile
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight" style={{ color: '#ffffff' }}>
                Administrator: <span style={{ color: '#ffffff' }}>{form.name}</span>
              </h1>
              <p className="text-xs font-semibold mt-1" style={{ color: '#f1f5f9' }}>
                Designation: <strong style={{ color: '#fde047' }}>{form.designation || 'School Admin / Principal'}</strong> • Campus: <span style={{ color: '#ffffff' }}>{profile?.schoolName || 'School ERP Campus'}</span> • Email: <span className="font-mono font-bold" style={{ color: '#6ee7b7' }}>{form.email}</span>
              </p>
            </div>
          </div>

          {/* DYNAMIC METRICS BOX */}
          <div 
            className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Admin Account</span>
              <span className="font-bold text-xs" style={{ color: '#ffffff' }}>{form.name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>System Role</span>
              <span className="font-bold text-xs" style={{ color: '#fde047' }}>{displayRole}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Registered Email</span>
              <span className="font-mono font-bold" style={{ color: '#6ee7b7' }}>{form.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: '#cbd5e1' }}>Contact Phone</span>
              <span className="font-mono font-bold" style={{ color: '#34d399' }}>{form.phone || '+91 9963887021'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: EDIT PERSONAL DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Personal Profile Details</h2>
                  <p className="text-[11px] text-slate-500">
                    {isReadOnlyRole ? 'Official record managed by School Administration (Read-only)' : 'Update your official contact & profile information'}
                  </p>
                </div>
              </div>
            </div>

            {isReadOnlyRole && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Profile details for Students and Parents are read-only. Contact your school administrator to request record updates.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name {isReadOnlyRole ? '(Read-only)' : '*'}</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    className={`${inputCls} pl-9 ${isReadOnlyRole ? 'bg-slate-950 text-slate-400 cursor-not-allowed' : ''}`} 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="Full Name" 
                    disabled={isReadOnlyRole}
                    readOnly={isReadOnlyRole}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Designation / Role Title {isReadOnlyRole ? '(Read-only)' : ''}</label>
                <div className="relative">
                  <Award className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    className={`${inputCls} pl-9 ${isReadOnlyRole ? 'bg-slate-950 text-slate-400 cursor-not-allowed' : ''}`} 
                    value={form.designation} 
                    onChange={e => setForm({ ...form, designation: e.target.value })} 
                    placeholder="Role Title" 
                    disabled={isReadOnlyRole}
                    readOnly={isReadOnlyRole}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={`${inputCls} pl-9 bg-slate-950 text-slate-400 cursor-not-allowed`} value={form.email} disabled readOnly />
                </div>
              </div>

              <div>
                <label className={labelCls}>Contact Phone Number {isReadOnlyRole ? '(Read-only)' : ''}</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    className={`${inputCls} pl-9 ${isReadOnlyRole ? 'bg-slate-950 text-slate-400 cursor-not-allowed' : ''}`} 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                    placeholder="+91 98765 43210" 
                    disabled={isReadOnlyRole}
                    readOnly={isReadOnlyRole}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Avatar Image URL {isReadOnlyRole ? '(Read-only)' : ''}</label>
                <div className="relative">
                  <Camera className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    className={`${inputCls} pl-9 ${isReadOnlyRole ? 'bg-slate-950 text-slate-400 cursor-not-allowed' : ''}`} 
                    value={form.avatar} 
                    onChange={e => setForm({ ...form, avatar: e.target.value })} 
                    placeholder="https://images.unsplash.com/..." 
                    disabled={isReadOnlyRole}
                    readOnly={isReadOnlyRole}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Personal Statement / Bio {isReadOnlyRole ? '(Read-only)' : ''}</label>
                <textarea 
                  className={`${inputCls} ${isReadOnlyRole ? 'bg-slate-950 text-slate-400 cursor-not-allowed' : ''}`} 
                  rows={3} 
                  value={form.bio} 
                  onChange={e => setForm({ ...form, bio: e.target.value })} 
                  placeholder="Describe your profile statement..." 
                  disabled={isReadOnlyRole}
                  readOnly={isReadOnlyRole}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              {isReadOnlyRole ? (
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Read-Only Record
                </div>
              ) : (
                <button
                  onClick={handleUpdateInfo}
                  disabled={savingInfo}
                  className="px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {savingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Check className="w-3.5 h-3.5 text-white" />}
                  <span className="text-white">Save Profile Details</span>
                </button>
              )}
            </div>
          </div>

          {/* SECURITY & PASSWORD CHANGE */}
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Security & Password</h2>
                  <p className="text-[11px] text-slate-500">Update your account password and security credentials</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <input className={inputCls} type="password" placeholder="••••••••" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input className={inputCls} type="password" placeholder="Min. 6 characters" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input className={inputCls} type="password" placeholder="Confirm password" value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-slate-500">Must contain at least 6 characters</p>
              <button
                onClick={handleChangePassword}
                disabled={savingPass}
                className="px-5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {savingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT CAPABILITIES & SYSTEM INFO */}
        <div className="space-y-6">
          {/* SYSTEM ROLE CARD */}
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Account Privileges
            </h3>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Role</span>
                <span className="font-bold text-indigo-300 uppercase">{displayRole}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">School Tenant</span>
                <span className="font-semibold text-white truncate max-w-[140px]">{profile?.schoolName || 'School ERP Campus'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Access Scope</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">ACTIVE ACCESS</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-slate-400">Granted Operational Controls:</p>
              {getRoleControls(currentRole).map(cap => (
                <div key={cap} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK LINKS & PREFERENCES */}
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Dashboard Navigation
            </h3>

            <div className="space-y-2 pt-1">
              {[
                currentRole === 'STUDENT' && { label: 'Academic LMS & Homework', href: '/student' },
                currentRole === 'TEACHER' && { label: 'Teacher Classroom Portal', href: '/teacher' },
                currentRole === 'PARENT' && { label: 'Parent Portal', href: '/parent' },
                currentRole === 'ACCOUNTANT' && { label: 'Accountant Portal', href: '/accountant' },
                currentRole === 'SCHOOL_ADMIN' && { label: 'Manage Staff & Roles', href: '/admin/dashboard?tab=users' },
                currentRole === 'SCHOOL_ADMIN' && { label: 'Admissions Pipeline', href: '/admin/dashboard?tab=admissions' },
                currentRole === 'SCHOOL_ADMIN' && { label: 'Configure School Settings', href: '/admin/dashboard?tab=settings' },
              ].filter(Boolean).map(link => (
                <button
                  key={link.label}
                  onClick={() => window.location.href = link.href}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{link.label}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Timetable Builder & Period Scheduling Tab (100% Dynamic Subjects & Periods)
function TimetableTab() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = String(user?.role || user?.designation || '').toUpperCase();
  const isSchoolAdmin = userRole.includes('SCHOOL_ADMIN') || userRole.includes('PRINCIPAL') || userRole.includes('HEADMASTER') || userRole.includes('HEAD_MASTER');

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('LKG');
  const [selectedSection, setSelectedSection] = useState('A');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPeriodEditor, setShowPeriodEditor] = useState(false);

  // Initial default period setup
  const DEFAULT_PERIODS = [
    { periodNo: 1, name: 'Period 1', startTime: '09:00 AM', endTime: '09:45 AM', isBreak: false },
    { periodNo: 2, name: 'Period 2', startTime: '09:45 AM', endTime: '10:30 AM', isBreak: false },
    { periodNo: 3, name: 'Tea Break', startTime: '10:30 AM', endTime: '10:45 AM', isBreak: true },
    { periodNo: 4, name: 'Period 3', startTime: '10:45 AM', endTime: '11:30 AM', isBreak: false },
    { periodNo: 5, name: 'Period 4', startTime: '11:30 AM', endTime: '12:15 PM', isBreak: false },
    { periodNo: 6, name: 'Lunch Break', startTime: '12:15 PM', endTime: '01:00 PM', isBreak: true },
    { periodNo: 7, name: 'Period 5', startTime: '01:00 PM', endTime: '01:45 PM', isBreak: false },
    { periodNo: 8, name: 'Period 6', startTime: '01:45 PM', endTime: '02:30 PM', isBreak: false },
  ];

  // SSR-safe period slots state
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);

  // Load initial period slots from localStorage after initial hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('school_erp_period_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setPeriods(parsed);
      }
    } catch (e) {}
  }, []);

  // Helper to sync periods state and localStorage
  const updatePeriods = (newPeriods) => {
    setPeriods(newPeriods);
    try {
      localStorage.setItem('school_erp_period_config', JSON.stringify(newPeriods));
    } catch (e) {}
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [scheduleGrid, setScheduleGrid] = useState({});

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, eData, sData, ttData] = await Promise.all([
        apiFetch('/admin/classes').catch(() => []),
        apiFetch('/admin/employees').catch(() => []),
        apiFetch('/admin/subjects').catch(() => []),
        apiFetch(`/admin/timetable?classId=${encodeURIComponent(selectedClass)}&sectionId=${encodeURIComponent(selectedSection)}`).catch(() => [])
      ]);
      setClasses(Array.isArray(cData) ? cData : []);
      // Include all staff members, prioritizing teachers
      const allStaff = Array.isArray(eData) ? eData : [];
      const teacherStaff = allStaff.filter(emp => !emp.employeeType || emp.employeeType === 'TEACHER' || emp.employeeType === 'Teacher' || (emp.designation && emp.designation.toLowerCase().includes('teacher')) || emp.department === 'Academics');
      setTeachers(teacherStaff.length > 0 ? teacherStaff : allStaff);
      setSubjects(Array.isArray(sData) ? sData : []);

      const grid = {};
      days.forEach(d => { grid[d] = {}; });

      if (Array.isArray(ttData) && ttData.length > 0) {
        if (Array.isArray(ttData[0].periods) && ttData[0].periods.length > 0) {
          updatePeriods(ttData[0].periods);
        }
        if (ttData[0].schedule) {
          ttData[0].schedule.forEach(item => {
            if (item.day && item.periodNo) {
              if (!grid[item.day]) grid[item.day] = {};
              grid[item.day][item.periodNo] = {
                subject: item.subject || '',
                teacherName: item.teacherName || '',
                roomNo: item.roomNo || ''
              };
            }
          });
        }
      }

      // Merge local storage backup if available
      try {
        const savedGridStr = localStorage.getItem(`school_erp_grid_${selectedClass}_${selectedSection}`);
        if (savedGridStr) {
          const parsed = JSON.parse(savedGridStr);
          if (parsed && typeof parsed === 'object') {
            Object.keys(parsed).forEach(d => {
              if (!grid[d]) grid[d] = {};
              Object.keys(parsed[d]).forEach(pNo => {
                if (parsed[d][pNo]) {
                  grid[d][pNo] = {
                    subject: grid[d][pNo]?.subject || parsed[d][pNo].subject || '',
                    teacherName: grid[d][pNo]?.teacherName || parsed[d][pNo].teacherName || '',
                    roomNo: grid[d][pNo]?.roomNo || parsed[d][pNo].roomNo || ''
                  };
                }
              });
            });
          }
        }
      } catch (e) {}

      setScheduleGrid(grid);
    } catch (e) {
      showMsg('error', 'Error loading timetable data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedSection]);

  const handleCellChange = (day, periodNo, field, value) => {
    setScheduleGrid(prev => {
      const dayData = { ...(prev[day] || {}) };
      const cellData = { ...(dayData[periodNo] || { subject: '', teacherName: '', roomNo: '' }), [field]: value };
      dayData[periodNo] = cellData;
      const updatedGrid = { ...prev, [day]: dayData };
      try {
        localStorage.setItem(`school_erp_grid_${selectedClass}_${selectedSection}`, JSON.stringify(updatedGrid));
      } catch (e) {}
      return updatedGrid;
    });
  };

  // Period slot manager handlers with instant persistence
  const handlePeriodChange = (index, field, value) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    updatePeriods(updated);
  };

  const handleAddPeriodSlot = () => {
    const updated = [
      ...periods,
      {
        periodNo: periods.length + 1,
        name: `Period ${periods.length + 1}`,
        startTime: '02:30 PM',
        endTime: '03:15 PM',
        isBreak: false
      }
    ];
    updatePeriods(updated);
  };

  const handleAddBreakSlot = () => {
    const updated = [
      ...periods,
      {
        periodNo: periods.length + 1,
        name: 'Tea / Recess Break',
        startTime: '10:30 AM',
        endTime: '10:45 AM',
        isBreak: true
      }
    ];
    updatePeriods(updated);
  };

  const handleRemovePeriodSlot = (index) => {
    if (periods.length <= 1) return;
    const filtered = periods.filter((_, i) => i !== index);
    const reindexed = filtered.map((p, i) => ({ ...p, periodNo: i + 1 }));
    updatePeriods(reindexed);
  };

  const handleResetDefaultPeriods = () => {
    if (confirm('Reset period timings to standard 8 default slots?')) {
      updatePeriods(DEFAULT_PERIODS);
    }
  };

  const handleSaveTimetable = async () => {
    setSaving(true);
    try {
      const schedule = [];
      days.forEach(day => {
        periods.forEach(p => {
          if (!p.isBreak) {
            const cell = scheduleGrid[day]?.[p.periodNo] || {};
            if (cell.subject || cell.teacherName || cell.roomNo) {
              schedule.push({
                day,
                periodNo: p.periodNo,
                periodName: p.name || `Period ${p.periodNo}`,
                startTime: p.startTime,
                endTime: p.endTime,
                subject: cell.subject || '',
                teacherName: cell.teacherName || '',
                roomNo: cell.roomNo || ''
              });
            }
          }
        });
      });

      // Local backup sync
      try {
        localStorage.setItem(`school_erp_grid_${selectedClass}_${selectedSection}`, JSON.stringify(scheduleGrid));
      } catch (e) {}

      await apiFetch('/admin/timetable', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass,
          sectionId: selectedSection,
          academicYear: '2026-2027',
          periods,
          schedule
        })
      });

      showMsg('success', `✅ Timetable saved & published for Class ${selectedClass} - Section ${selectedSection}!`);
    } catch (e) {
      showMsg('error', `❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {msg && <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>{msg.text}</div>}
      
      {/* HEADER & CLASS SELECTOR BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Class Timetable Builder & Teacher Period Assignment
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Configure period timings, add break slots, select subjects from Subjects module, and assign faculty</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Select Class</span>
            <select
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            >
              {classes.length > 0 ? (
                classes.map(c => (
                  <option key={c._id} value={c.className}>Class {c.className}</option>
                ))
              ) : (
                ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Section</span>
            <select
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
            >
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          {isSchoolAdmin && (
            <button
              onClick={handleSaveTimetable}
              disabled={saving}
              className="mt-4 px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Publish Timetable</span>
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC PERIOD TIMINGS & BREAK SLOTS CREATOR */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Dynamic Period Timings & Break Slots ({periods.length} Total Slots)
          </h3>
          {isSchoolAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPeriodEditor(!showPeriodEditor)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showPeriodEditor ? 'Hide Period Editor' : '⚙️ Configure Period Timings'}</span>
              </button>
              <button
                onClick={handleResetDefaultPeriods}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-800"
                title="Reset to default 8 period template"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
              <button
                onClick={handleAddPeriodSlot}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-bold transition border border-indigo-500/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Teaching Period</span>
              </button>
              <button
                onClick={handleAddBreakSlot}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition border border-amber-500/40 flex items-center gap-1.5"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>☕ + Add Break / Recess</span>
              </button>
            </div>
          )}
        </div>

        {/* EXPANDABLE INLINE PERIOD EDITORS */}
        {showPeriodEditor && (
          <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-500/30 space-y-3">
            <p className="text-[11px] text-slate-400">Edit period names, start/end times, or toggle Break / Recess type for each slot:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {periods.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">Slot #{idx + 1}</span>
                    <button onClick={() => handleRemovePeriodSlot(idx)} className="p-1 text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">Slot Title</span>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={p.name}
                      onChange={e => handlePeriodChange(idx, 'name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">Start Time</span>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-white focus:outline-none"
                        value={p.startTime}
                        onChange={e => handlePeriodChange(idx, 'startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">End Time</span>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-white focus:outline-none"
                        value={p.endTime}
                        onChange={e => handlePeriodChange(idx, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.isBreak || false}
                      onChange={e => handlePeriodChange(idx, 'isBreak', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                    />
                    <span className="text-[11px] font-semibold text-amber-300">Is Break / Recess</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERIOD BADGES BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {periods.map((p, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border text-center text-xs space-y-1 ${p.isBreak ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-900 border-slate-800 text-white'}`}>
              <span className="font-bold block text-[11px]">{p.name}</span>
              <span className="text-[10px] text-slate-400 font-mono block">{p.startTime} - {p.endTime}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DAY-BY-DAY PERIOD GRID TABLE (DYNAMIC SUBJECTS FROM DB) */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider min-w-[110px]">Day</th>
                  {periods.map(p => (
                    <th key={p.periodNo} className="px-3 py-3 text-left font-bold text-slate-400 uppercase tracking-wider min-w-[180px]">
                      {p.name} <span className="block text-[10px] font-normal text-slate-500 font-mono">{p.startTime}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {days.map(day => (
                  <tr key={day} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-indigo-300 bg-slate-900/20">{day}</td>
                    {periods.map(p => {
                      if (p.isBreak) {
                        return (
                          <td key={p.periodNo} className="px-3 py-3 bg-amber-500/5 text-amber-400/60 font-semibold text-center text-[11px]">
                            ☕ {p.name}
                          </td>
                        );
                      }
                      const cell = scheduleGrid[day]?.[p.periodNo] || { subject: '', teacherName: '', roomNo: '' };
                      return (
                        <td key={p.periodNo} className="px-2 py-2 space-y-1">
                          {isSchoolAdmin ? (
                            <>
                              {/* 100% DYNAMIC SUBJECT DROPDOWN FROM SUBJECTS MODULE */}
                              <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                                value={cell.subject || ''}
                                onChange={e => handleCellChange(day, p.periodNo, 'subject', e.target.value)}
                              >
                                <option value="">Select Subject</option>
                                {subjects.length > 0 ? (
                                  subjects.map(s => (
                                    <option key={s._id} value={s.subjectName}>
                                      {s.subjectName} {s.subjectCode ? `(${s.subjectCode})` : ''}
                                    </option>
                                  ))
                                ) : (
                                  ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Hindi', 'Physics', 'Chemistry', 'Physical Education'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))
                                )}
                              </select>

                              {/* DYNAMIC TEACHER DROPDOWN FROM TEACHERS MODULE */}
                              <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                                value={cell.teacherName || ''}
                                onChange={e => handleCellChange(day, p.periodNo, 'teacherName', e.target.value)}
                              >
                                <option value="">Assign Teacher</option>
                                {cell.teacherName && !teachers.some(t => t.name === cell.teacherName) && (
                                  <option value={cell.teacherName}>{cell.teacherName} (Assigned)</option>
                                )}
                                {teachers.map(t => (
                                  <option key={t._id || t.name} value={t.name}>{t.name} ({t.designation || t.subjects?.[0] || 'Teacher'})</option>
                                ))}
                              </select>

                              <input
                                type="text"
                                placeholder="Room No (e.g. A-101)"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600"
                                value={cell.roomNo || ''}
                                onChange={e => handleCellChange(day, p.periodNo, 'roomNo', e.target.value)}
                              />
                            </>
                          ) : (
                            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                              <div className="font-extrabold text-white text-[11px] truncate" title={cell.subject || 'Free Period'}>
                                {cell.subject || <span className="text-slate-500 font-normal">Free Period</span>}
                              </div>
                              <div className="text-[10px] font-semibold text-indigo-300 truncate" title={cell.teacherName || 'Unassigned'}>
                                👤 {cell.teacherName || <span className="text-slate-500 font-normal">Unassigned</span>}
                              </div>
                              {cell.roomNo && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  🏫 {cell.roomNo}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// School Settings Tab
function SchoolSettingsTab() {
  const [form, setForm] = useState({
    schoolName: '', tagline: '', address: '', phone: '', email: '',
    website: '', principalName: '', boardAffiliation: '', affiliationNo: '',
    establishedYear: '', sessionStart: '', sessionEnd: '',
    currency: '₹', timezone: 'Asia/Kolkata', language: 'English',
    smsEnabled: false, emailEnabled: false, attendanceSmsAlert: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch('/admin/settings').then(d => { setForm(f => ({ ...f, ...d })); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1.5';

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(form) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm font-bold text-white">School Settings</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Configure your school profile, academic calendar and notification preferences</p>
      </div>

      {/* School Profile */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">🏫 School Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>School Name</label><input className={inputCls} value={form.schoolName} onChange={e => setField('schoolName', e.target.value)} placeholder="e.g. Greenwood International School" /></div>
          <div><label className={labelCls}>Tagline / Motto</label><input className={inputCls} value={form.tagline} onChange={e => setField('tagline', e.target.value)} placeholder="Excellence in Education" /></div>
          <div><label className={labelCls}>Principal Name</label><input className={inputCls} value={form.principalName} onChange={e => setField('principalName', e.target.value)} /></div>
          <div><label className={labelCls}>Board Affiliation</label><input className={inputCls} value={form.boardAffiliation} onChange={e => setField('boardAffiliation', e.target.value)} placeholder="CBSE / ICSE / State Board" /></div>
          <div><label className={labelCls}>Affiliation No.</label><input className={inputCls} value={form.affiliationNo} onChange={e => setField('affiliationNo', e.target.value)} /></div>
          <div><label className={labelCls}>Established Year</label><input className={inputCls} type="number" value={form.establishedYear} onChange={e => setField('establishedYear', e.target.value)} placeholder="e.g. 1995" /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Address</label><textarea className={inputCls} rows={2} value={form.address} onChange={e => setField('address', e.target.value)} /></div>
          <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
          <div><label className={labelCls}>Email</label><input className={inputCls} type="email" value={form.email} onChange={e => setField('email', e.target.value)} /></div>
          <div><label className={labelCls}>Website</label><input className={inputCls} value={form.website} onChange={e => setField('website', e.target.value)} placeholder="https://" /></div>
        </div>
      </div>

      {/* Academic Session */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">📅 Academic Session</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Session Start</label><input className={inputCls} type="date" value={form.sessionStart} onChange={e => setField('sessionStart', e.target.value)} /></div>
          <div><label className={labelCls}>Session End</label><input className={inputCls} type="date" value={form.sessionEnd} onChange={e => setField('sessionEnd', e.target.value)} /></div>
          <div><label className={labelCls}>Timezone</label>
            <select className={inputCls} value={form.timezone} onChange={e => setField('timezone', e.target.value)}>
              {['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'UTC', 'America/New_York', 'Europe/London'].map(tz => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Currency Symbol</label><input className={inputCls} value={form.currency} onChange={e => setField('currency', e.target.value)} placeholder="₹" /></div>
          <div><label className={labelCls}>Language</label>
            <select className={inputCls} value={form.language} onChange={e => setField('language', e.target.value)}>
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Arabic'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">🔔 Notification Settings</h3>
        {[
          { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Send SMS alerts for fees, events and announcements' },
          { key: 'emailEnabled', label: 'Email Notifications', desc: 'Send email digests to parents and staff' },
          { key: 'attendanceSmsAlert', label: 'Attendance SMS Alert', desc: 'Alert parents via SMS when student is marked absent' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-[10px] text-slate-500">{desc}</p>
            </div>
            <button onClick={() => setField(key, !form[key])}
              className={`relative w-10 h-5 rounded-full transition-all ${form[key] ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[key] ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform disabled:opacity-60">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function DashboardContent({ initialTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || initialTab || 'overview';

  const tabs = {
    overview: OverviewTab,
    admissions: AdmissionsTab,
    students: StudentsTab,
    'academic-years': AcademicYearsTab,
    classes: ClassesTab,
    subjects: SubjectsTab,
    timetable: TimetableTab,
    departments: DepartmentsTab,
    attendance: AttendanceTab,
    exams: ExamsTab,
    marks: MarksTab,
    homework: HomeworkTab,
    lms: LMSTab,
    'fee-categories': FeeCategoriesTab,
    'fee-structures': FeeStructuresTab,
    'student-fees': StudentFeesTab,
    employees: EmployeesTab,
    'staff-attendance': () => (
      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-8 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Staff Attendance — GPS Clock-In</h3>
        <p className="text-slate-500 text-xs">Staff mark their own attendance via GPS-verified mobile check-in. Corrections and approvals managed here.</p>
      </div>
    ),
    leave: LeaveManagementTab,
    payroll: PayrollTab,
    library: LibraryTab,
    transport: TransportTab,
    hostel: HostelTab,
    inventory: InventoryTab,
    health: HealthRecordsTab,
    discipline: DisciplineTab,
    announcements: AnnouncementsTab,
    events: EventsTab,
    visitors: VisitorsTab,
    helpdesk: HelpdeskTab,
    certificates: CertificatesTab,
    'audit-logs': () => {
      const [rows, setRows] = useState([]);
      useEffect(() => { apiFetch('/admin/audit-logs').then(d => setRows(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
      return (
        <ModuleTable
          title="Audit Logs" icon={ShieldCheck} color="indigo"
          rows={rows}
          columns={[
            { key: 'userName', label: 'User' },
            { key: 'action', label: 'Action', badge: true },
            { key: 'module', label: 'Module' },
            { key: 'createdAt', label: 'Timestamp', render: v => v ? new Date(v).toLocaleString() : '—' },
          ]}
        />
      );
    },
    reports: ReportsTab,
    users: UsersTab,
    parents: ParentsTab,
    'ai-risk': () => (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center"><Sparkles className="w-4 h-4 text-violet-400" /></div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Early Risk Detector</h2>
            <p className="text-[11px] text-slate-500">Students flagged by the AI model based on attendance, marks & behaviour patterns</p>
          </div>
        </div>
        <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-5 space-y-3">
          {[
            { name: 'Rahul Mishra', class: '10-A', risk: 'HIGH', reason: 'Attendance dropped to 61% (3 consecutive weeks)', action: 'Counsel parent' },
            { name: 'Priya Sharma', class: '9-B', risk: 'MEDIUM', reason: 'Average marks fell from 78% to 52% this term', action: 'Academic support' },
            { name: 'Aryan Patel', class: '11-A', risk: 'HIGH', reason: '3 discipline incidents in last 30 days', action: 'Counselling required' },
            { name: 'Sneha Verma', class: '8-C', risk: 'LOW', reason: 'Declining homework submission rate (60%)', action: 'Monitor closely' },
          ].map(s => (
            <div key={s.name} className={`p-4 rounded-xl border ${s.risk === 'HIGH' ? 'bg-rose-500/10 border-rose-500/20' : s.risk === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{s.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor(s.risk)}`}>{s.risk} RISK</span>
              </div>
              <p className="text-[11px] text-slate-400">{s.class} · {s.reason}</p>
              <p className="text-[11px] text-indigo-300 mt-1">Suggested action: {s.action}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    services: AllServicesTab,
    'all-services': AllServicesTab,
    enquiry: AdmissionsTab,
    settings: SchoolSettingsTab,
    profile: AdminProfileTab,
  };

  const ActiveTab = tabs[tab] || OverviewTab;

  // Tab label map for breadcrumb
  const TAB_LABELS = {
    admissions: 'Admissions Pipeline', students: 'Student Directory', enquiry: 'Enquiry & Leads',
    parents: 'Parent Directory', health: 'Health Records', discipline: 'Discipline Tracker',
    'ai-risk': 'AI Risk Detector', 'academic-years': 'Academic Session',
    classes: 'Classes & Sections', subjects: 'Subjects', timetable: 'Timetable Builder',
    homework: 'Homework Manager', lms: 'LMS & E-Learning', exams: 'Exams & Schedule',
    marks: 'Report Cards', attendance: 'Attendance Tracking', 'staff-attendance': 'Staff GPS Clock',
    employees: 'Employee HRMS', departments: 'Departments', leave: 'Staff Leave',
    payroll: 'Payroll & Salary', 'fee-categories': 'Fee Heads', 'fee-structures': 'Fee Structures',
    'student-fees': 'Student Fees', library: 'Library System', transport: 'Transport & GPS',
    hostel: 'Hostels & Rooms', inventory: 'Asset Inventory', announcements: 'Announcements',
    events: 'School Calendar', visitors: 'Visitor Gate Passes', certificates: 'Certificates & TC',
    helpdesk: 'Campus Helpdesk', 'audit-logs': 'Audit Logs', reports: 'Reports & Analytics',
    users: 'Roles & Permissions', settings: 'School Settings', profile: 'Admin Profile',
  };

  const showBack = tab && tab !== 'overview' && tab !== 'services' && tab !== 'all-services';
  const tabLabel = TAB_LABELS[tab] || tab;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/admin/dashboard?tab=services');
    }
  };

  const [syncKey, setSyncKey] = useState(0);
  useDataSync(useCallback(() => {
    setSyncKey(k => k + 1);
  }, []));

  const { user } = useAuth();
  const planFeatures = user?.planFeatures;
  const isSuperAdmin = user?.role === 'SAAS_SUPER_ADMIN';
  const currentPlanName = user?.planName || user?.subscriptionPlan || 'BASIC';

  const checkIsTabLocked = (tabId) => {
    if (!tabId || isSuperAdmin || ['overview', 'services', 'all-services', 'profile', 'settings', 'helpdesk'].includes(tabId)) return false;
    const camelKey = tabId.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const planName = String(currentPlanName).toUpperCase();

    if (planFeatures && typeof planFeatures === 'object') {
      if (planFeatures[tabId] === true || planFeatures[camelKey] === true) return false;
      if (planFeatures[tabId] === false || planFeatures[camelKey] === false) return true;
      if (['BASIC', 'FREE', 'STARTER'].includes(planName)) return true;
    } else {
      if (['BASIC', 'FREE', 'STARTER'].includes(planName)) {
        const basicAllowed = ['admissions', 'students', 'classes', 'subjects', 'attendance', 'exams', 'marks', 'homework', 'announcements', 'events'];
        if (!basicAllowed.includes(tabId) && !basicAllowed.includes(camelKey)) {
          return true;
        }
      }
    }
    return false;
  };
  const isLockedTab = checkIsTabLocked(tab);

  return (
    <div className="flex-1 min-h-screen bg-[#f4f6f8] p-6 overflow-y-auto">
      {showBack && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px', borderRadius: '10px',
              background: '#fff', border: '1.5px solid #e2e8f0',
              cursor: 'pointer', transition: 'all 0.15s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary, #237dd1)'; e.currentTarget.querySelector('svg').style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-primary, #237dd1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.querySelector('svg').style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            title="Back to All Services"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.15s' }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            <button
              onClick={() => router.push('/admin/dashboard?tab=services')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary, #237dd1)'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              All Services
            </button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            <span style={{ color: '#1e293b', fontWeight: 700 }}>{tabLabel}</span>
          </div>
        </div>
      )}
      {isLockedTab ? (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Module Access Locked</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            The <strong>"{tabLabel}"</strong> module is currently <strong>not enabled</strong> under your school's <strong>{currentPlanName}</strong> subscription plan.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 font-medium">
            💡 <strong>How to Unlock:</strong> Contact your Super Admin or School Administrator to upgrade your school plan in the <strong>SaaS Master Control Panel</strong>.
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL' || user?.designation === 'SCHOOL_ADMIN' || user?.designation === 'PRINCIPAL') && (
              <button
                onClick={() => router.push('/admin/dashboard?tab=services')}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Explore Plans & Select Upgrade
              </button>
            )}
            <button
              onClick={() => router.push('/admin/dashboard?tab=services')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Back to All Services
            </button>
          </div>
        </div>
      ) : (
        <ActiveTab key={syncKey} />
      )}
    </div>
  );
}

export default function AdminDashboard(props) {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f4f6f8] text-slate-600 text-xs"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>}>
      <DashboardContent {...props} />
    </React.Suspense>
  );
}
