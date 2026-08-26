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
  HeartHandshake, ClipboardList, Eye, XCircle, CheckCircle, Loader2
} from 'lucide-react';

const API = 'http://127.0.0.1:5000/api';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getToken() {
  try { return localStorage.getItem('erp_token') || 'demo_token_school_admin'; } catch { return 'demo_token_school_admin'; }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

const BADGE = {
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  red: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  indigo: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  slate: 'bg-slate-800 text-slate-300 border border-slate-700',
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
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColor(row[c.key])}`}>{row[c.key] || 'â€”'}</span>
                          ) : (String(row[c.key] ?? 'â€”').slice(0, 80))
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
    indigo: { bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-500/20', icon: 'bg-indigo-500/20 text-indigo-400', text: 'text-indigo-400' },
    emerald: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20 text-emerald-400', text: 'text-emerald-400' },
    amber: { bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20', icon: 'bg-amber-500/20 text-amber-400', text: 'text-amber-400' },
    rose: { bg: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-500/20', icon: 'bg-rose-500/20 text-rose-400', text: 'text-rose-400' },
    blue: { bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20', icon: 'bg-blue-500/20 text-blue-400', text: 'text-blue-400' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${c.bg} ${c.border} p-4 flex items-center gap-4`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-semibold">{label}</p>
        <p className={`text-2xl font-black ${c.text}`}>{value ?? 'â€”'}</p>
        {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MODULE VIEWS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        <h2 className="text-lg font-black text-white">Executive Dashboard</h2>
        <p className="text-slate-400 text-xs mt-0.5">Real-time school operations overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.totalStudents} icon={GraduationCap} color="indigo" />
        <StatCard label="Total Staff" value={stats.totalStaff} icon={Users} color="emerald" />
        <StatCard label="Active Exams" value={stats.totalExams} icon={ClipboardList} color="blue" />
        <StatCard label="Library Books" value={stats.totalLibraryBooks} icon={Library} color="amber" />
        <StatCard label="Transport Vehicles" value={stats.totalTransport} icon={Bus} color="indigo" />
        <StatCard label="Pending Leaves" value={stats.pendingLeaves} icon={Calendar} color="amber" sub="Awaiting approval" />
        <StatCard label="Open Tickets" value={stats.openTickets} icon={Ticket} color="rose" sub="Helpdesk" />
        <StatCard label="Payroll Pending" value={stats.pendingPayrolls} icon={TrendingUp} color="emerald" sub="To approve" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="md:col-span-2 bg-[#0d1117] rounded-2xl border border-slate-800 p-5">
          <h3 className="text-xs font-bold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'New Admission', color: 'indigo', tab: 'admissions' },
              { label: 'Mark Attendance', color: 'emerald', tab: 'attendance' },
              { label: 'Create Exam', color: 'blue', tab: 'exams' },
              { label: 'Collect Fee', color: 'amber', tab: 'student-fees' },
              { label: 'Issue Book', color: 'violet', tab: 'library' },
              { label: 'Add Employee', color: 'rose', tab: 'employees' },
            ].map(a => (
              <button key={a.label} onClick={() => window.location.href = `/admin/dashboard?tab=${a.tab}`}
                className={`text-xs font-semibold py-2 px-3 rounded-xl border text-center transition-all hover:scale-105 bg-${a.color}-500/10 border-${a.color}-500/20 text-${a.color}-400 hover:bg-${a.color}-500/20`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#0d1117] rounded-2xl border border-slate-800 p-5">
          <h3 className="text-xs font-bold text-white mb-3">System Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Database', status: 'ONLINE' },
              { label: 'AI Engine', status: 'ACTIVE' },
              { label: 'SMS Gateway', status: 'ACTIVE' },
              { label: 'Email SMTP', status: 'ACTIVE' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{s.label}</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${statusColor(s.status)}`}>{s.status}</span>
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
                      {['Roll No', 'Name', 'Section', 'Gender', 'Attendance', 'Student Email', 'Parent Phone', 'Actions'].map(h => (
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => apiFetch('/admin/employees').then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.editing) await apiFetch(`/admin/employees/${modal.editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/employees', { method: 'POST', body: JSON.stringify(form) });
      setModal(null); load();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Archive employee?')) return;
    await apiFetch(`/admin/employees/${id}`, { method: 'DELETE' });
    load();
  };

  const fields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone' },
    { key: 'department', label: 'Department', required: true },
    { key: 'designation', label: 'Designation', required: true },
    { key: 'employeeType', label: 'Employee Type', type: 'select', options: ['TEACHER', 'ADMIN', 'HR', 'ACCOUNTANT', 'DRIVER', 'SECURITY', 'LIBRARIAN', 'SUPPORT'] },
    { key: 'joiningDate', label: 'Joining Date', type: 'date' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'basicSalary', label: 'Basic Salary', type: 'number', required: true },
    { key: 'allowances', label: 'Allowances', type: 'number' },
    { key: 'deductions', label: 'Deductions', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] },
  ];

  return (
    <>
      <ModuleTable
        title="Employee Directory" icon={UserCog} color="emerald" searchable
        loading={loading} rows={rows}
        columns={[
          { key: 'employeeId', label: 'Emp ID' },
          { key: 'name', label: 'Name' },
          { key: 'department', label: 'Department' },
          { key: 'designation', label: 'Designation' },
          { key: 'employeeType', label: 'Type', badge: true },
          { key: 'basicSalary', label: 'Basic Salary', render: v => `â‚¹${(v || 0).toLocaleString()}` },
          { key: 'status', label: 'Status', badge: true },
        ]}
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        onDelete={handleDelete}
      />
      {modal && (
        <CrudModal
          title={modal.editing ? 'Edit Employee' : 'Add Employee'}
          fields={fields}
          initial={modal.editing || {}}
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
    { key: 'applicantRole', label: 'Role', type: 'select', options: ['TEACHER', 'ADMIN', 'STAFF', 'STUDENT'] },
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

// Attendance Tab
function AttendanceTab() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [allClasses, setAllClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load classes from API
  useEffect(() => {
    apiFetch('/admin/classes').then(d => {
      const list = Array.isArray(d) ? d : [];
      setAllClasses(list);
      if (list.length > 0) setClassId(list[0].className);
    }).catch(() => {
      setAllClasses([{ className: 'Class 10' }, { className: 'Class 9' }]);
      setClassId('Class 10');
    });
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    apiFetch(`/admin/students?classId=${encodeURIComponent(classId)}`).then(d => {
      const list = Array.isArray(d) ? d : [];
      setStudents(list);
      const init = {};
      list.forEach(s => { init[s._id] = 'PRESENT'; });
      setAttendance(init);
      setLoading(false);
    }).catch(() => {
      const demo = [
        { _id: '1', firstName: 'Rohan', lastName: 'Sharma', rollNo: '01' },
        { _id: '2', firstName: 'Priya', lastName: 'Singh', rollNo: '02' },
        { _id: '3', firstName: 'Amit', lastName: 'Verma', rollNo: '03' },
        { _id: '4', firstName: 'Neha', lastName: 'Patel', rollNo: '04' },
        { _id: '5', firstName: 'Rahul', lastName: 'Kumar', rollNo: '05' },
      ];
      setStudents(demo);
      const init = {};
      demo.forEach(s => { init[s._id] = 'PRESENT'; });
      setAttendance(init);
      setLoading(false);
    });
  }, [classId]);

  const mark = (id, status) => setAttendance(a => ({ ...a, [id]: status }));
  const markAll = (status) => { const next = {}; students.forEach(s => { next[s._id] = status; }); setAttendance(next); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({ studentId: s._id, studentName: `${s.firstName} ${s.lastName}`, status: attendance[s._id] || 'PRESENT' }));
      await apiFetch('/admin/attendance/students', { method: 'POST', body: JSON.stringify({ date, classId, sectionId: 'A', records }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const present = Object.values(attendance).filter(v => v === 'PRESENT').length;
  const absent = Object.values(attendance).filter(v => v === 'ABSENT').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Student Attendance</h2>
            <p className="text-[11px] text-slate-500">{students.length} students · {date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          <select value={classId} onChange={e => setClassId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
            {allClasses.map(c => <option key={c._id || c.className} value={c.className}>Class {c.className}</option>)}
          </select>
          <button onClick={() => markAll('PRESENT')} className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30">All Present</button>
          <button onClick={() => markAll('ABSENT')} className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-[10px] font-bold hover:bg-rose-500/
// Payroll Tab
700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          <select value={classId} onChange={e => setClassId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
            {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-400">{present}</p>
          <p className="text-[11px] text-emerald-300">Present</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-rose-400">{absent}</p>
          <p className="text-[11px] text-rose-300">Absent</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-amber-400">{students.length > 0 ? Math.round((present / students.length) * 100) : 0}%</p>
          <p className="text-[11px] text-amber-300">Present %</p>
        </div>
      </div>

      <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500">Roll No</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500">Student Name</th>
              <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500">Mark Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {students.map(s => (
              <tr key={s._id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-xs text-slate-400">{s.rollNo}</td>
                <td className="px-4 py-3 text-xs text-white font-semibold">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'].map(st => (
                      <button key={st} onClick={() => mark(s._id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${attendance[s._id] === st
                          ? st === 'PRESENT' ? 'bg-emerald-500 text-white' : st === 'ABSENT' ? 'bg-rose-500 text-white' : st === 'LATE' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        {st === 'HALF_DAY' ? 'Half' : st.charAt(0) + st.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform disabled:opacity-60">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}

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
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = () => apiFetch('/users')
    .then(d => { setRows((Array.isArray(d) ? d : []).filter(u => u.role === 'PARENT')); setLoading(false); })
    .catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

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
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <HeartHandshake className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <span className="text-indigo-300 font-bold">Parent accounts </span>
          are automatically created when you enroll a student via the <span className="text-white font-semibold">Students → Enroll Student</span> flow. You can also manually create or edit parent accounts here. Parents log in to view their child's homework, marks, attendance and messages.
        </p>
      </div>
      <ModuleTable
        title="Parent Directory" icon={HeartHandshake} color="amber"
        loading={loading} rows={rows}
        columns={[
          { key: 'name', label: 'Parent Name' },
          { key: 'email', label: 'Login Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'status', label: 'Status', badge: true },
          { key: 'createdAt', label: 'Created', render: v => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
        ]}
        onAdd={() => setModal({ editing: null })}
        onEdit={(row) => setModal({ editing: row })}
        onDelete={handleDelete}
        searchable
      />
      {modal && (
        <CrudModal
          title={modal.editing ? `Edit Parent — ${modal.editing.name}` : '➕ Add Parent Account'}
          fields={fields}
          initial={modal.editing || {}}
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
export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const tabs = {
    overview: OverviewTab,
    admissions: AdmissionsTab,
    students: StudentsTab,
    'academic-years': AcademicYearsTab,
    classes: ClassesTab,
    subjects: SubjectsTab,
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
        <h3 className="text-sm font-bold text-white mb-1">Staff Attendance â€” GPS Clock-In</h3>
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
            { key: 'createdAt', label: 'Timestamp', render: v => v ? new Date(v).toLocaleString() : 'â€”' },
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
              <p className="text-[11px] text-slate-400">{s.class} Â· {s.reason}</p>
              <p className="text-[11px] text-indigo-300 mt-1">Suggested action: {s.action}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    enquiry: AdmissionsTab,
    settings: SchoolSettingsTab,
  };

  const ActiveTab = tabs[tab] || OverviewTab;

  return (
    <div className="flex-1 min-h-screen bg-[#070a10] p-6 overflow-y-auto">
      <ActiveTab />
    </div>
  );
}
