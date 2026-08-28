'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, Users, FileText, Calendar, DollarSign,
  BookOpen, Clock, Award, Box, Sparkles, Bell, HelpCircle, Key, CheckSquare,
  Plus, Edit2, Trash2, X, Check, RefreshCw, Search, Filter, Download,
  AlertTriangle, Stethoscope, Library, Bus, Home, Megaphone, Ticket,
  FileBadge2, BarChart3, Settings, ChevronDown, UserCog, TrendingUp,
  Building2, BookMarked, Calculator, Scroll, MapPin, ShieldCheck,
  HeartHandshake, ClipboardList, Eye, XCircle, CheckCircle, Loader2,
  User, Mail, Phone, Shield, Lock, Camera, Save, Coffee, History,
  Wallet, CalendarCheck, MessageSquare
} from 'lucide-react';
import AllServicesPanel from './AllServicesPanel';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';


const API = 'http://127.0.0.1:5000/api';


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

// Generic CRUD Modal
function CrudModal({ title, fields, initial = {}, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial);
  const [customInputs, setCustomInputs] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}</label>
              {f.type === 'select' ? (
                <select className={inputCls} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                  <option value="">Select {f.label}</option>
                  {f.options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
                </select>
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
    </div>
  );
}

// Generic Module Table
function ModuleTable({ title, icon: Icon, color = 'indigo', columns, rows, onAdd, onEdit, onDelete, extraActions, loading, emptyMsg, searchable, onSearch }) {
  const [search, setSearch] = useState('');
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
        <div className="flex items-center gap-2">
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
function StatCard({ label, value, icon: Icon, color = 'indigo', sub }) {
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
    <div className={`rounded-2xl border ${c.bg} bg-white p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon} shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
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
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/reports').then(d => { setStats(d); setLoading(false); }).catch(() => {
      setStats({ totalStudents: 312, totalStaff: 48, totalExams: 7, totalLibraryBooks: 1240, totalTransport: 8, pendingLeaves: 5, openTickets: 12, pendingPayrolls: 48 });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900">Executive Dashboard</h2>
        <p className="text-slate-600 text-xs mt-0.5 font-medium">Real-time school operations overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.totalStudents} icon={GraduationCap} color="indigo" />
        <StatCard label="Total Staff" value={stats.totalStaff} icon={Users} color="emerald" />
        <StatCard label="Active Exams" value={stats.totalExams} icon={ClipboardList} color="blue" />
        <StatCard label="Library Books" value={stats.totalLibraryBooks} icon={Library} color="amber" />
        <StatCard label="Transport Vehicles" value={stats.totalTransport} icon={Bus} color="violet" />
        <StatCard label="Pending Leaves" value={stats.pendingLeaves} icon={Calendar} color="amber" sub="Awaiting approval" />
        <StatCard label="Open Tickets" value={stats.openTickets} icon={Ticket} color="rose" sub="Helpdesk" />
        <StatCard label="Payroll Pending" value={stats.pendingPayrolls} icon={TrendingUp} color="teal" sub="To approve" />
      </div>
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
                onClick={() => window.location.href = `/admin/dashboard?tab=${a.tab}`}
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
  const [subTab, setSubTab] = React.useState('classes');
  const [classes, setClasses] = React.useState([]);
  const [classLoading, setClassLoading] = React.useState(true);
  const [classModal, setClassModal] = React.useState(null);
  const [classSaving, setClassSaving] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState(null);
  const [selectedSection, setSelectedSection] = React.useState('');

  // Student list
  const [students, setStudents] = React.useState([]);
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
    studentEmail: '', studentPassword: 'student123',
    parentName: '', parentPhone: '', parentEmail: '', parentPassword: 'parent123',
  });
  const [msg, setMsg] = React.useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };
  const setField = (k, v) => setEnrollForm(f => ({ ...f, [k]: v }));

  const loadClasses = () => {
    setClassLoading(true);
    apiFetch('/admin/classes').then(d => { setClasses(Array.isArray(d) ? d : []); setClassLoading(false); }).catch(() => setClassLoading(false));
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
    setEnrollForm(f => ({
      ...f,
      classId: selectedClass || '',
      sectionId: selectedSection || '',
      studentEmail: '', studentPassword: 'student123',
      parentName: '', parentPhone: '', parentEmail: '', parentPassword: 'parent123',
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

  // Auto-suggest student email
  React.useEffect(() => {
    if (enrollForm.firstName && modalRollPreview !== '—') {
      const auto = `${enrollForm.firstName.toLowerCase().replace(/\s+/g, '')}.${modalRollPreview.toLowerCase()}@school.erp`;
      setField('studentEmail', auto);
    }
  }, [enrollForm.firstName, modalRollPreview]);

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
    } catch (e) { showMsg('error', e.message); }
    finally { setEnrollSaving(false); }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student and their login accounts?')) return;
    await apiFetch(`/admin/students/${id}`, { method: 'DELETE' });
    loadStudents(selectedClass, selectedSection);
  };

  const [editStudentModal, setEditStudentModal] = React.useState(null);
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
            <button onClick={() => setClassModal({ editing: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
              <Plus className="w-3.5 h-3.5" /> Add Class
            </button>
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setClassModal({ editing: cls })} className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {/* Sections */}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(cls.sections) && cls.sections.length > 0 ? cls.sections.map(sec => (
                      <span key={sec} className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Section {sec}
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
            {selectedClass && (
              <button onClick={openEnroll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                <Plus className="w-3.5 h-3.5" /> Enroll Student
              </button>
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
                  <button onClick={openEnroll} className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold mx-auto block hover:scale-105 transition-transform">
                    Enroll First Student
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-800">
                      {['Roll No', 'Name', 'Section', 'Gender', 'Attendance', 'Student Email', 'Parent Name', 'Parent Phone', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {students.map(s => (
                        <tr key={s._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono font-bold text-indigo-300">{s.rollNo}</td>
                          <td className="px-4 py-3 text-xs text-white font-semibold">{s.firstName} {s.lastName}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{s.sectionId && s.sectionId !== '-' ? `Section ${s.sectionId}` : '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{s.gender}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.attendancePercentage >= 90 ? BADGE.green : s.attendancePercentage >= 75 ? BADGE.amber : BADGE.red}`}>
                              {s.attendancePercentage || 0}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-400">{s.studentEmail || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-200 font-semibold">{s.parentName || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{s.parentPhone || '—'}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button onClick={() => setEditStudentModal(s)} className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors mr-1">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteStudent(s._id)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
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

      {/* Edit Student Modal */}
      {editStudentModal && (
        <CrudModal
          title={`Edit Student — ${editStudentModal.firstName} ${editStudentModal.lastName}`}
          fields={[
            { key: 'firstName', label: 'First Name', required: true },
            { key: 'lastName', label: 'Last Name' },
            { key: 'dob', label: 'Date of Birth', type: 'date' },
            { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
            { key: 'bloodGroup', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
            { key: 'studentEmail', label: 'Student Email (Login)' },
            { key: 'parentPhone', label: 'Parent Phone' },
            { key: 'address', label: 'Address', type: 'textarea' },
          ]}
          initial={editStudentModal}
          onSave={handleEditSave}
          onClose={() => setEditStudentModal(null)}
          loading={editStudentSaving}
        />
      )}

      {/* ══════════════════════════════════════════════════
          ENROLLMENT RESULT CREDENTIALS CARD
      ══════════════════════════════════════════════════ */}
      {enrollResult && (
        <div className="relative rounded-2xl border border-emerald-400/40 bg-emerald-500/5 backdrop-blur-sm overflow-hidden p-5 space-y-4">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/30 border border-emerald-400/50">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-black text-emerald-300">Student Enrolled Successfully!</span>
            </div>
            <button onClick={() => setEnrollResult(null)} className="text-slate-400 hover:text-slate-200 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Student Credentials */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">Student Login</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-white font-semibold">{enrollResult.credentials.student.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Roll No</span><span className="font-mono font-bold text-indigo-300">{enrollResult.credentials.student.rollNo}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Adm No</span><span className="font-mono text-slate-200">{enrollResult.credentials.student.admissionNo}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Email</span><span className="font-mono text-[11px] text-emerald-300">{enrollResult.credentials.student.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Password</span><span className="font-mono font-bold text-amber-300">{enrollResult.credentials.student.password}</span></div>
              </div>
            </div>

            {/* Parent Credentials */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">Parent Login</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-white font-semibold">{enrollResult.credentials.parent.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Email</span><span className="font-mono text-[11px] text-emerald-300">{enrollResult.credentials.parent.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Password</span><span className="font-mono font-bold text-amber-300">{enrollResult.credentials.parent.password}</span></div>
              </div>
            </div>
          </div>

          <div className="relative flex gap-3">
            <button onClick={handleCopyCredentials}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${copied ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy All Credentials'}
            </button>
            <button onClick={() => setEnrollResult(null)} className="px-4 py-2 rounded-xl bg-slate-800/60 text-slate-400 text-xs font-semibold hover:bg-slate-800 border border-slate-700">
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
      {enrollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
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
                      <select className={inputCls} value={enrollForm.classId} onChange={e => { setField('classId', e.target.value); setField('sectionId', ''); }}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Section</label>
                      <select className={inputCls} value={enrollForm.sectionId} onChange={e => setField('sectionId', e.target.value)}>
                        <option value="">No Section</option>
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
                    <span className="text-indigo-300 font-bold">Student login will be created automatically.</span> You can customise the email and password below.
                  </div>
                  <div><label className={labelCls}>Student Login Email <span className="text-rose-400">*</span></label><input className={inputCls} type="email" value={enrollForm.studentEmail} onChange={e => setField('studentEmail', e.target.value)} placeholder="auto-generated" /></div>
                  <div><label className={labelCls}>Student Password</label><input className={inputCls} type="text" value={enrollForm.studentPassword} onChange={e => setField('studentPassword', e.target.value)} /></div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <p className="text-slate-400 font-semibold">Preview credentials:</p>
                    <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-mono text-emerald-300">{enrollForm.studentEmail || '(not set)'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Password</span><span className="font-mono text-amber-300">{enrollForm.studentPassword}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Roll No</span><span className="font-mono font-bold text-indigo-300">{modalRollPreview}</span></div>
                  </div>
                </div>
              )}

              {/* STEP 3: Parent Details */}
              {enrollStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300">
                    <span className="text-amber-300 font-bold">Parent login will be created with these details.</span> The parent can then log in to see homework, marks, attendance & messages for their child.
                  </div>
                  <div><label className={labelCls}>Parent / Guardian Name <span className="text-rose-400">*</span></label><input className={inputCls} value={enrollForm.parentName} onChange={e => setField('parentName', e.target.value)} placeholder="e.g. Rajesh Sharma" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Parent Phone</label><input className={inputCls} type="tel" value={enrollForm.parentPhone} onChange={e => setField('parentPhone', e.target.value)} placeholder="+91 9XXXXXXXXX" /></div>
                    <div><label className={labelCls}>Parent Email <span className="text-rose-400">*</span></label><input className={inputCls} type="email" value={enrollForm.parentEmail} onChange={e => setField('parentEmail', e.target.value)} placeholder="parent@email.com" /></div>
                  </div>
                  <div><label className={labelCls}>Parent Login Password</label><input className={inputCls} type="text" value={enrollForm.parentPassword} onChange={e => setField('parentPassword', e.target.value)} /></div>
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
                    if (enrollStep === 1 && (!enrollForm.firstName || !enrollForm.lastName || !enrollForm.classId)) { showMsg('error', 'Please fill in First Name, Last Name and select a Class.'); return; }
                    if (enrollStep === 2 && !enrollForm.studentEmail) { showMsg('error', 'Student email is required.'); return; }
                    if (enrollStep === 3 && (!enrollForm.parentName || !enrollForm.parentEmail)) { showMsg('error', 'Parent name and email are required.'); return; }
                    setEnrollStep(s => s + 1);
                  }}
                  className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform">
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
        </div>
      )}
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
    if (!confirm('Archive employee and deactivate login?')) return;
    await apiFetch(`/admin/employees/${id}`, { method: 'DELETE' });
    load();
  };

  // Build dynamic class options from MongoDB Atlas
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
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = () => apiFetch(config.endpoint).then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const handleSave = async (form) => {
      setSaving(true);
      try {
        if (modal.editing) await apiFetch(`${config.endpoint}/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        else await apiFetch(config.endpoint, { method: 'POST', body: JSON.stringify(form) });
        setModal(null); load();
      } catch (e) { alert(e.message); } finally { setSaving(false); }
    };
    const handleDelete = async (id) => {
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
          onAdd={config.noAdd ? undefined : () => setModal({ editing: null })}
          onEdit={config.noEdit ? undefined : (row) => setModal({ editing: row })}
          onDelete={config.noDelete ? undefined : handleDelete}
          extraActions={config.extraActions}
          searchable={config.searchable}
        />
        {modal && (
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

// FULL FEATURED ATTENDANCE MANAGEMENT MODULE
function AttendanceTab() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
                    onClick={() => setAdminAttFilterDate(new Date().toISOString().split('T')[0])}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      adminAttFilterDate === new Date().toISOString().split('T')[0] ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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

          {reviewModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                <h3 className="font-bold text-white">Review Correction Request</h3>
                <p className="text-xs text-slate-400">{reviewModal.studentName} ({reviewModal.classId}-{reviewModal.sectionId}): Change from {reviewModal.oldStatus} → <strong className="text-emerald-400">{reviewModal.newStatus}</strong></p>
                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">Reason: {reviewModal.reason}</p>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Admin remarks (optional)..." rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                <div className="flex gap-3">
                  <button onClick={() => handleReviewCorrection('REJECT')} className="flex-1 py-2 rounded-xl bg-rose-600/20 text-rose-300 text-xs font-bold border border-rose-500/30">Reject</button>
                  <button onClick={() => handleReviewCorrection('APPROVE')} className="flex-1 py-2 rounded-xl gradient-primary text-white text-xs font-bold">Approve & Update</button>
                </div>
              </div>
            </div>
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

const ExamsTab = makeSimpleCRUDTab({
  title: 'Exams & Scheduling', icon: ClipboardList, color: 'blue', endpoint: '/admin/exams',
  columns: [
    { key: 'title', label: 'Exam Title' },
    { key: 'examType', label: 'Type', badge: true },
    { key: 'targetClass', label: 'Class' },
    { key: 'startDate', label: 'Start', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'endDate', label: 'End', render: v => v ? new Date(v).toLocaleDateString() : 'â€”' },
    { key: 'totalMarks', label: 'Total Marks' },
    { key: 'isPublished', label: 'Published', render: v => v ? <span className="text-emerald-400 font-bold">âœ“</span> : <span className="text-slate-500">Draft</span> },
  ],
  fields: [
    { key: 'title', label: 'Exam Title', required: true },
    { key: 'examType', label: 'Exam Type', type: 'select', options: ['Unit Test', 'Periodic Test', 'Mid-Term', 'Final Exam', 'Practical', 'Internal Assessment'] },
    { key: 'targetClass', label: 'Target Class' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'totalMarks', label: 'Total Marks', type: 'number' },
    { key: 'passingMarks', label: 'Passing Marks', type: 'number' },
    { key: 'academicYear', label: 'Academic Year' },
  ]
});

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

const TransportTab = makeSimpleCRUDTab({
  title: 'Transport Management', icon: Bus, color: 'blue', endpoint: '/admin/transport',
  columns: [
    { key: 'vehicleNo', label: 'Vehicle No' },
    { key: 'vehicleType', label: 'Type' },
    { key: 'driverName', label: 'Driver' },
    { key: 'driverPhone', label: 'Phone' },
    { key: 'routeName', label: 'Route' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'isActive', label: 'Active', render: v => v ? <span className="text-emerald-400">âœ“ Active</span> : <span className="text-slate-500">Inactive</span> },
  ],
  fields: [
    { key: 'vehicleNo', label: 'Vehicle Number', required: true },
    { key: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Bus', 'Van', 'Mini Bus', 'Auto'] },
    { key: 'driverName', label: 'Driver Name', required: true },
    { key: 'driverPhone', label: 'Driver Phone', required: true },
    { key: 'routeName', label: 'Route Name', required: true },
    { key: 'capacity', label: 'Capacity', type: 'number' },
  ]
});

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

// Marks Tab
function MarksTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => apiFetch('/admin/marks').then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.editing) await apiFetch(`/admin/marks/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/marks', { method: 'POST', body: JSON.stringify(form) });
      setModal(null); load();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete marks record?')) return;
    await apiFetch(`/admin/marks/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <ModuleTable
        title="Marks & Report Cards" icon={Award} color="amber"
        loading={loading} rows={rows}
        columns={[
          { key: 'studentName', label: 'Student' },
          { key: 'rollNo', label: 'Roll No' },
          { key: 'classId', label: 'Class' },
          { key: 'examTitle', label: 'Exam' },
          { key: 'totalMarksObtained', label: 'Marks Obtained' },
          { key: 'totalMaxMarks', label: 'Max Marks' },
          { key: 'percentage', label: 'Percentage', render: v => v ? `${v}%` : '—' },
          { key: 'rank', label: 'Rank' },
          { key: 'isPublished', label: 'Published', render: v => v ? <span className="text-emerald-400">✓</span> : '—' },
        ]}
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        onDelete={handleDelete}
      />
      {modal && (
        <CrudModal
          title={modal.editing ? 'Edit Marks' : 'Add Marks'}
          fields={[
            { key: 'studentName', label: 'Student Name', required: true },
            { key: 'rollNo', label: 'Roll No' },
            { key: 'classId', label: 'Class' },
            { key: 'sectionId', label: 'Section' },
            { key: 'examTitle', label: 'Exam Title', required: true },
            { key: 'totalMarksObtained', label: 'Marks Obtained', type: 'number', required: true },
            { key: 'totalMaxMarks', label: 'Max Marks', type: 'number' },
            { key: 'percentage', label: 'Percentage', type: 'number' },
            { key: 'rank', label: 'Rank', type: 'number' },
          ]}
          initial={modal.editing || {}}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </>
  );
}

// Parents Tab — full CRUD for PARENT role users with linked student
function ParentsTab() {
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
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
        parentName: p.name,
        email: p.email,
        phone: p.phone || child?.parentPhone || '—',
        status: p.status || 'ACTIVE',
        childName: child ? `${child.firstName} ${child.lastName}` : 'Unlinked',
        childClass: child ? `Class ${clsName}${secName ? ` — Section ${secName}` : ''}` : 'N/A',
        rawClassId: clsName,
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
          parentName: s.parentName || 'Parent / Guardian',
          email: s.parentEmail,
          phone: s.parentPhone || '—',
          status: 'ACTIVE',
          childName: `${s.firstName} ${s.lastName}`,
          childClass: `Class ${clsName}${secName ? ` — Section ${secName}` : ''}`,
          rawClassId: clsName,
          createdAt: s.createdAt
        });
      }
    });

    return Array.from(map.values());
  }, [rows, students]);

  const filteredParents = React.useMemo(() => {
    if (!selectedClassFilter) return mergedParents;
    return mergedParents.filter(p => 
      p.rawClassId && p.rawClassId.toLowerCase() === selectedClassFilter.toLowerCase()
    );
  }, [mergedParents, selectedClassFilter]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await apiFetch(`/users/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        showMsg('success', '✅ Parent updated.');
      } else {
        await apiFetch('/users', { method: 'POST', body: JSON.stringify({ ...form, role: 'PARENT' }) });
        showMsg('success', '✅ Parent account created.');
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

  const fields = [
    { key: 'name', label: 'Parent / Guardian Name', required: true },
    { key: 'email', label: 'Login Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone Number' },
    { key: 'password', label: 'Password (leave blank to keep unchanged)', type: 'password' },
    { key: 'status', label: 'Account Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] },
  ];

  return (
    <div className="space-y-4">
      {msg && <div className={`p-3 rounded-xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}>{msg.text}</div>}
      
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Parent Directory & Child Linkages</h3>
            <p className="text-[11px] text-slate-400">Class-wise parent contacts and student enrollment links</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Filter by Class:</span>
          <select 
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            value={selectedClassFilter} 
            onChange={e => setSelectedClassFilter(e.target.value)}
          >
            <option value="">All Classes ({mergedParents.length})</option>
            {availableClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
      </div>

      {/* QUICK CLASS PILL BUTTONS */}
      {availableClasses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedClassFilter('')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              !selectedClassFilter 
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
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        onDelete={handleDelete}
        searchable
      />
      {modal && (
        <CrudModal
          title={modal.editing ? `Edit Parent — ${modal.editing.parentName}` : '➕ Add Parent Account'}
          fields={fields}
          initial={modal.editing ? { name: modal.editing.parentName, email: modal.editing.email, phone: modal.editing.phone, status: modal.editing.status } : {}}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
}

// Staff Attendance Tab
function StaffAttendanceTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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

      {/* HERO BANNER CARD — DYNAMICALLY THEMED */}
      <div className="relative bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div 
          className="h-36 border-b border-slate-800/80 relative transition-all duration-500 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 60%, #0d1117 100%)`
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-10">
          <div className="flex items-end gap-4">
            <div className="relative group">
              <img
                src={form.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop'}
                alt="Profile Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#0d1117] shadow-xl bg-slate-900"
              />
              {!isReadOnlyRole && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                     onClick={() => {
                       const url = prompt('Enter Avatar Image URL:', form.avatar);
                       if (url !== null) setForm(f => ({ ...f, avatar: url }));
                     }}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">{form.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 uppercase">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" /> {displayRole}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold">
                {form.designation || (
                  currentRole === 'STUDENT' ? 'Enrolled Student' :
                  currentRole === 'TEACHER' ? 'Faculty Member' :
                  currentRole === 'PARENT' ? 'Parent / Guardian' :
                  currentRole === 'ACCOUNTANT' ? 'Finance Officer' :
                  'Campus Administrator'
                )}
              </p>
              <p className="text-[11px] text-slate-500">{profile?.schoolName || 'School ERP Campus'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Session
            </span>
            {currentRole === 'SCHOOL_ADMIN' && (
              <button
                onClick={() => window.location.href = '/admin/dashboard?tab=settings'}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" /> School Settings
              </button>
            )}
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
                  {savingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Profile Details
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

          <button
            onClick={handleSaveTimetable}
            disabled={saving}
            className="mt-4 px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save & Publish Timetable</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC PERIOD TIMINGS & BREAK SLOTS CREATOR */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Dynamic Period Timings & Break Slots ({periods.length} Total Slots)
          </h3>
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
      <ActiveTab />
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
