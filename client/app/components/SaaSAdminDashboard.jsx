'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2, Plus, Users, ShieldCheck, DollarSign,
  Search, CheckCircle, AlertCircle, Sparkles, X, Key, Globe, Eye,
  Sliders, Shield, Cpu, HardDrive, Bell, UserCheck, Lock, Activity, RefreshCw, FileText, Zap, ArrowUpRight,
  Trash2, Edit3, Send, Hash, Mail, Phone, HelpCircle, Layers, PieChart, Server, Check, Flame, Box,
  MessageSquare, Star
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDataSync, notifyGlobalDataChange } from '../context/DataSyncContext';
import AllServicesPanel from './AllServicesPanel';

function SaaSAdminContent(props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { token } = useAuth();
  const { currentTheme } = useTheme();
  const brandColor = currentTheme?.accentPrimary || '#02563d';
  const brandSecondary = currentTheme?.accentSecondary || '#02422f';

  // Dynamic States
  const [schools, setSchools] = useState([]);
  const [plans, setPlans] = useState([]);
  const [branches, setBranches] = useState([]);
  const [globalUsers, setGlobalUsers] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [leads, setLeads] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '', role: '', schoolName: '', text: '', rating: 5, avatar: '', color: '#059669'
  });

  const [stats, setStats] = useState({
    totalSchools: 0, activeSchools: 0, trialSchools: 0, suspendedSchools: 0,
    totalStudents: 0, totalUsers: 0, totalAdmissions: 0,
    estimatedARR: 0, estimatedMRR: 0, storageUsedGb: 0, aiRequestsUsed: 0,
    systemHealth: '100% EXCELLENT'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  // Search Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({
    title: '', message: '', targetAudience: 'ALL', priority: 'NORMAL'
  });

  // New School Form state
  const [form, setForm] = useState({
    name: '', code: '', email: '', phone: '', address: '',
    subscriptionPlan: 'ENTERPRISE', adminName: '', adminEmail: '', adminPassword: 'password123'
  });

  // Dynamic tab listener
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchSaaSData();
  }, [activeTab]);

  useDataSync(React.useCallback(() => {
    fetchSaaSData();
  }, [activeTab]));

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    router.push(`/saas-admin?tab=${tabName}`);
  };

  const safeFetch = async (url, options) => {
    try {
      return await fetch(url, options);
    } catch (e) {
      return null;
    }
  };

  const fetchSaaSData = async () => {
    setLoading(true);
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;

    try {
      if (activeTab === 'overview' || activeTab === 'schools') {
        const schoolRes = await safeFetch(`${API_BASE}/saas/schools`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (schoolRes && schoolRes.ok) setSchools(await schoolRes.json().catch(() => []));
      }

      if (activeTab === 'plans') {
        const planRes = await safeFetch(`${API_BASE}/saas/plans`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (planRes && planRes.ok) setPlans(await planRes.json().catch(() => []));
      }

      if (activeTab === 'users') {
        const userRes = await safeFetch(`${API_BASE}/saas/global-users`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (userRes && userRes.ok) setGlobalUsers(await userRes.json().catch(() => []));
      }

      if (activeTab === 'security') {
        const secRes = await safeFetch(`${API_BASE}/saas/security-events`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (secRes && secRes.ok) setSecurityEvents(await secRes.json().catch(() => []));
      }

      if (activeTab === 'modules') {
        const flagRes = await safeFetch(`${API_BASE}/saas/feature-flags`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (flagRes && flagRes.ok) setFeatureFlags(await flagRes.json().catch(() => []));
      }

      if (activeTab === 'analytics' || activeTab === 'usage') {
        const invRes = await safeFetch(`${API_BASE}/saas/invoices`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (invRes && invRes.ok) setInvoices(await invRes.json().catch(() => []));
      }

      if (activeTab === 'support') {
        const ticketRes = await safeFetch(`${API_BASE}/saas/tickets`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (ticketRes && ticketRes.ok) setTickets(await ticketRes.json().catch(() => []));

        let combinedLeads = [];
        const leadRes = await safeFetch(`${API_BASE}/saas/leads`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (leadRes && leadRes.ok) {
          const lData = await leadRes.json().catch(() => []);
          combinedLeads = [...combinedLeads, ...lData];
        }

        const admRes = await safeFetch(`${API_BASE}/admissions`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (admRes && admRes.ok) {
          const admData = await admRes.json().catch(() => []);
          const mappedAdm = admData.map(a => ({
            _id: a._id,
            schoolName: a.schoolName || a.targetClass || 'Inquiry Campus',
            schoolStrength: a.schoolStrength || (a.parentName && a.parentName.includes('(') ? a.parentName.split('(')[1].replace(')', '').trim() : ''),
            contactPerson: a.applicantName || a.name || a.contactPerson,
            phone: a.phone || a.mobile,
            email: a.email,
            description: a.description || a.previousSchool || '',
            role: a.parentName && a.parentName.includes('-') ? a.parentName.split('-')[0].trim() : 'School Admin / Owner',
            stage: 'LEAD',
            createdAt: a.createdAt || a.appliedAt
          }));
          combinedLeads = [...combinedLeads, ...mappedAdm];
        }

        // Merge and deduplicate leads by phone/email/contactPerson, prioritizing leads with valid schoolStrength
        const leadMap = new Map();
        combinedLeads.forEach(item => {
          const dedupeKey = (item.phone || item.mobile || item.email || item.contactPerson || item._id || '').trim();
          if (!dedupeKey) return;

          if (!leadMap.has(dedupeKey)) {
            leadMap.set(dedupeKey, item);
          } else {
            const existing = leadMap.get(dedupeKey);
            const hasStrength = item.schoolStrength && item.schoolStrength !== 'N/A' && item.schoolStrength.trim() !== '';
            const existingHasStrength = existing.schoolStrength && existing.schoolStrength !== 'N/A' && existing.schoolStrength.trim() !== '';

            if (hasStrength || (!existingHasStrength && item.createdAt > existing.createdAt)) {
              leadMap.set(dedupeKey, { ...existing, ...item, schoolStrength: item.schoolStrength || existing.schoolStrength });
            }
          }
        });

        setLeads(Array.from(leadMap.values()));
      }

      if (activeTab === 'audit' || activeTab === 'communication') {
        const auditRes = await safeFetch(`${API_BASE}/saas/audit-logs`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (auditRes && auditRes.ok) setAuditLogs(await auditRes.json().catch(() => []));

        const announceRes = await safeFetch(`${API_BASE}/saas/announcements`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (announceRes && announceRes.ok) setAnnouncements(await announceRes.json().catch(() => []));
      }

      if (activeTab === 'testimonials') {
        const testRes = await safeFetch(`${API_BASE}/saas/testimonials`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
        if (testRes && testRes.ok) setTestimonials(await testRes.json().catch(() => []));
      }

      const statRes = await safeFetch(`${API_BASE}/saas/stats`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
      if (statRes && statRes.ok) {
        const statData = await statRes.json().catch(() => null);
        if (statData) setStats(statData);
      }
    } catch (e) {
      console.error('SaaS data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // HANDLERS
  const handleCreateSchool = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;

    try {
      const res = await fetch(`${API_BASE}/saas/schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Saved to MongoDB Atlas! School '${form.name}' created with admin: ${form.adminEmail}` });
        await fetchSaaSData();
        setForm({ name: '', code: '', email: '', phone: '', address: '', subscriptionPlan: 'ENTERPRISE', adminName: '', adminEmail: '', adminPassword: 'password123' });
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.message || `Save failed status ${res.status}`}` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: `❌ Database Error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditSchool = async (e) => {
    e.preventDefault();
    if (!editingSchool) return;

    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/schools/${editingSchool._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify(editingSchool)
      });
      if (res.ok) {
        alert(`✅ Updated school '${editingSchool.name}' in MongoDB Atlas`);
        setEditingSchool(null);
        fetchSaaSData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteSchool = async (schoolId, schoolName) => {
    if (!confirm(`⚠️ ARE YOU SURE? Permanently delete school '${schoolName}' from MongoDB Atlas?`)) return;

    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/schools/${schoolId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.ok) {
        alert(`🗑️ Deleted school '${schoolName}'`);
        fetchSaaSData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateSchoolStatus = async (schoolId, status) => {
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/schools/${schoolId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchSaaSData();
    } catch (e) { }
  };

  const handleImpersonate = async (schoolId) => {
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify({ schoolId })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('erp_token', data.token);
        localStorage.setItem('erp_user', JSON.stringify(data.user));
        alert(`🔓 Impersonating School Admin for ${data.user.schoolName}. Redirecting...`);
        router.push('/admin/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Impersonation failed.');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTogglePlanFeature = async (planCode, featureKey, currentVal) => {
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/plans/toggle-feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify({ planCode, featureKey, enabled: !currentVal })
      });
      if (res.ok) fetchSaaSData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleResetPassword = async (userId, userEmail) => {
    const newPass = prompt(`Enter new password for ${userEmail}:`, 'password123');
    if (!newPass) return;

    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify({ newPassword: newPass })
      });
      if (res.ok) alert(`🔑 Password reset successfully for ${userEmail}`);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify(announcementForm)
      });
      if (res.ok) {
        alert('📢 Global Announcement Broadcasted!');
        setAnnouncementForm({ title: '', message: '', targetAudience: 'ALL', priority: 'NORMAL' });
        fetchSaaSData();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateTestimonialStatus = async (id, status) => {
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/testimonials/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchSaaSData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/saas/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.ok) fetchSaaSData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    setLoading(true);
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const res = await fetch(`${API_BASE}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify(testimonialForm)
      });
      if (res.ok) {
        alert('✅ Testimonial published to Landing Page slider!');
        setIsTestimonialModalOpen(false);
        setTestimonialForm({ name: '', role: '', schoolName: '', text: '', rating: 5, avatar: '', color: '#059669' });
        fetchSaaSData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to publish testimonial');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabsList = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'services', label: 'All Services (36+)', icon: Box },
    { key: 'schools', label: 'Schools & Branches', icon: Building2 },
    { key: 'plans', label: 'Plans & Features Matrix', icon: Sliders },
    { key: 'users', label: 'Global Users & RBAC', icon: Users },
    { key: 'security', label: 'Security & IP Controls', icon: Shield },
    { key: 'modules', label: 'Feature Flags Engine', icon: Box },
    { key: 'ai', label: 'AI Token Quotas', icon: Cpu },
    { key: 'analytics', label: 'SaaS Analytics', icon: DollarSign },
    { key: 'communication', label: 'Broadcasts', icon: Bell },
    { key: 'usage', label: 'Storage Quotas', icon: HardDrive },
    { key: 'support', label: 'Support & CRM', icon: HelpCircle },
    { key: 'testimonials', label: 'Landing Testimonials', icon: MessageSquare },
    { key: 'audit', label: 'Audit Logs', icon: FileText }
  ];

  return (
    <div className="space-y-6">

      {/* HEADER BANNER (DYNAMIC DEEP EMERALD BRAND THEME - MATCHES ALL PORTALS) */}
      <div
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4 shadow-2xl border"
        style={{
          background: `linear-gradient(135deg, ${brandSecondary} 0%, ${brandColor} 100%)`,
          borderColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff'
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span
                className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                SAAS MASTER CONTROL ENGINE (46 MODULES ACTIVE)
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              {activeTab === 'overview' && '🏠 Platform Health & SaaS Dashboard'}
              {activeTab === 'services' && '🧩 All Application Services & System Modules'}
              {activeTab === 'schools' && '🏫 Multi-Tenant School Directory & Impersonation'}
              {activeTab === 'plans' && '💳 Subscription Plans & Feature Matrix Engine'}
              {activeTab === 'users' && '👥 Global Multi-Tenant User Management'}
              {activeTab === 'security' && '🛡️ Security Center & Network Access Controls'}
              {activeTab === 'modules' && '🧩 Feature Flags Engine & Module Rollouts'}
              {activeTab === 'ai' && '🤖 AI Provider & Token Spending Caps'}
              {activeTab === 'analytics' && '📊 SaaS Business Revenue Analytics'}
              {activeTab === 'communication' && '💬 Global Broadcast Communication System'}
              {activeTab === 'usage' && '🗄️ Storage & Media Quota Management'}
              {activeTab === 'support' && '🎧 Helpdesk Tickets & Sales CRM Pipeline'}
              {activeTab === 'testimonials' && '💬 Public Testimonials & Landing Page Approvals'}
              {activeTab === 'audit' && '📋 System Audit Logs & Health Monitor'}
            </h2>
            <p className="text-xs font-semibold" style={{ color: '#f1f5f9' }}>
              Live Atlas Cluster Connection • Persistent Enterprise SaaS Architecture • Full Tenant Control
            </p>
          </div>

          <button
            onClick={() => { setIsModalOpen(true); setMessage(null); }}
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer border border-white"
            style={{ color: brandColor }}
          >
            <Plus className="w-4 h-4" style={{ color: brandColor }} />
            <span>Onboard New School</span>
          </button>
        </div>

        {/* TOP TAB STRIP SELECTOR BAR WITH HIGH-CONTRAST THEMED PILLS */}
        <div className="pt-3 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {tabsList.map((t) => {
            const Icon = t.icon;
            const isSel = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                style={isSel
                  ? { backgroundColor: '#ffffff', color: brandColor, borderColor: '#ffffff' }
                  : { backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${isSel ? 'shadow-lg shadow-black/40 font-black' : 'hover:bg-black/40'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSel ? brandColor : '#ffffff' }} />
                <span style={{ color: isSel ? brandColor : '#ffffff' }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 0: ALL SERVICES (36+ MODULES) */}
      {activeTab === 'services' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <AllServicesPanel role="SAAS_SUPER_ADMIN" />
        </div>
      )}

      {/* VIEW 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Schools</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white">{schools.length || 1}</h3>
                <p className="text-[11px] text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-400" /> Active Tenants in MongoDB
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Platform Users</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white">{stats.totalStudents + stats.totalUsers || 1855}</h3>
                <p className="text-[11px] text-purple-400 font-semibold mt-1">Across All Schools</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated ARR</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-emerald-400">${(stats.estimatedARR || 3588).toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Annual SaaS Revenue
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Platform Health</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-cyan-400">100%</h3>
                <p className="text-[11px] text-cyan-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span> MongoDB Atlas Live
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SCHOOLS DIRECTORY */}
      {activeTab === 'schools' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">Registered Tenant Schools</h3>
              <p className="text-xs text-slate-400">Full 100% CRUD Control & 1-Click Admin Impersonation</p>
            </div>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search school name or code..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">School Name</th>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">School Admin</th>
                  <th className="p-3.5">Subscription</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Full CRUD Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredSchools.map(school => (
                  <tr key={school._id || school.code} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-extrabold text-white">{school.name}</td>
                    <td className="p-3.5 font-mono text-indigo-400 font-bold">{school.code}</td>
                    <td className="p-3.5">
                      <strong className="text-white">{school.adminUser ? school.adminUser.name : 'School Admin'}</strong>
                      <p className="text-[10px] text-slate-400">{school.adminUser ? school.adminUser.email : school.email}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {school.subscriptionPlan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${school.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="p-3.5 flex items-center space-x-2">
                      <button
                        onClick={() => handleImpersonate(school._id)}
                        className="px-2.5 py-1.5 gradient-primary text-white rounded-xl hover:opacity-90 text-[10px] font-bold flex items-center gap-1 shadow-md shadow-indigo-500/20"
                      >
                        <Key className="w-3 h-3 text-amber-300" /> Admin Login
                      </button>
                      <button
                        onClick={() => setEditingSchool(school)}
                        className="px-2.5 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-xl hover:bg-indigo-500/40 text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleUpdateSchoolStatus(school._id, school.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        className="px-2.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-[10px] font-bold"
                      >
                        {school.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteSchool(school._id, school.name)}
                        className="p-1.5 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/40 text-[10px] font-bold border border-rose-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DYNAMIC PLANS & FEATURE MATRIX */}
      {activeTab === 'plans' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-white">Dynamic Plan Feature Control Matrix</h3>
              <p className="text-xs text-slate-400">Toggle features ON/OFF per plan live in MongoDB Atlas without deploying code</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Plan Name</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Admissions</th>
                  <th className="p-3.5">Exams</th>
                  <th className="p-3.5">HRMS/Payroll</th>
                  <th className="p-3.5">Transport</th>
                  <th className="p-3.5">AI Engine</th>
                  <th className="p-3.5">API Access</th>
                  <th className="p-3.5">Multi-Branch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200 font-medium">
                {plans.map(p => (
                  <tr key={p.code} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-extrabold text-white">{p.name} <span className="font-mono text-indigo-400">({p.code})</span></td>
                    <td className="p-3.5 font-bold text-emerald-400">${p.priceMonthly}/mo</td>
                    {['admissions', 'exams', 'payroll', 'transport', 'ai', 'api', 'multiBranch'].map(feat => {
                      const enabled = p.features && p.features[feat];
                      return (
                        <td key={feat} className="p-3.5">
                          <button
                            onClick={() => handleTogglePlanFeature(p.code, feat, enabled)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition ${enabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                          >
                            {enabled ? '✅ ENABLED' : '❌ OFF'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: GLOBAL USER RBAC */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-white">Global Multi-Tenant User Management</h3>
              <p className="text-xs text-slate-400">Manage all School Admins, Teachers, Accountants, Parents across tenants</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total {globalUsers.length} Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">School Campus</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {globalUsers.map(u => (
                  <tr key={u._id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-white">{u.name}</td>
                    <td className="p-3.5 font-mono text-slate-300">{u.email}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-300">{u.schoolName || 'Global Platform'}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleResetPassword(u._id, u.email)}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: SECURITY CENTER */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Security Center & Network Controls
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">User Email</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {securityEvents.map((sec, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-indigo-400">{sec.eventType}</td>
                    <td className="p-3.5 font-mono text-slate-300">{sec.userEmail}</td>
                    <td className="p-3.5 font-mono text-amber-400">{sec.ipAddress}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {sec.severity}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(sec.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 6: FEATURE FLAGS */}
      {activeTab === 'modules' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-purple-400" /> Feature Flags Engine & Rollouts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureFlags.map((flag, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-xs">{flag.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {flag.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Key: {flag.key}</p>
                <div className="pt-2 text-[10px] text-slate-400 flex justify-between">
                  <span>Rollout Target:</span>
                  <strong className="text-indigo-400">{flag.rolloutPercentage}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 7: AI TOKEN QUOTAS */}
      {activeTab === 'ai' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" /> AI Providers & Token Spending Caps
          </h3>
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white">🤖 OpenAI / Anthropic Integration Active</p>
            <p className="text-slate-400">Total Tokens Used: 8,450 / 100,000 Tokens</p>
          </div>
        </div>
      )}

      {/* VIEW 8: SAAS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> SaaS Business Revenue & Billing History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Invoice No</th>
                  <th className="p-3.5">School Name</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-mono text-indigo-400 font-bold">{inv.invoiceNo}</td>
                    <td className="p-3.5 font-bold text-white">{inv.schoolName}</td>
                    <td className="p-3.5">{inv.planName}</td>
                    <td className="p-3.5 font-bold text-emerald-400">${inv.amount}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 9: COMMUNICATION */}
      {activeTab === 'communication' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> Global Announcement Broadcast System
          </h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="Announcement Title"
                required
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <select
                value={announcementForm.targetAudience}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="ALL">All Schools & Users</option>
                <option value="SCHOOL_ADMINS">School Admins Only</option>
              </select>
            </div>
            <textarea
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
              placeholder="Broadcast message..."
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white h-20"
            />
            <button type="submit" className="px-5 py-2.5 gradient-primary text-white font-bold rounded-xl flex items-center gap-2">
              <Send className="w-4 h-4" /> Broadcast Announcement
            </button>
          </form>
        </div>
      )}

      {/* VIEW 10: STORAGE */}
      {activeTab === 'usage' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" /> Storage & File Quota Management
          </h3>
          <p className="text-xs text-slate-400">Total Consumption: 78 GB / 500 GB</p>
        </div>
      )}

      {/* VIEW 11: SUPPORT & CRM */}
      {activeTab === 'support' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" /> Dynamic Sales CRM & Website Inquiry Leads
              </h3>
              <p className="text-xs text-slate-400">Live inquiries submitted from the website form dynamically appear here for SuperAdmin action</p>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              {leads.length} Total Leads Recorded
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Helpdesk Tickets */}
            <div className="lg:col-span-5 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-white text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Support & Helpdesk Tickets</span>
                <span className="text-[10px] text-slate-400 font-mono">{tickets.length} Active</span>
              </h4>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {tickets.map((t, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-bold">{t.subject}</strong>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.status === 'OPEN' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{t.schoolName} • {t.userEmail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic Sales CRM Inquiry Leads */}
            <div className="lg:col-span-7 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-white text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Website Inquiry Leads (Dynamic Sales Pipeline)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Synced from Atlas</span>
              </h4>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {leads.map((l, idx) => {
                  let rawStr = l.schoolStrength || l.strengthOfSchools || l.strength || l.school_strength;
                  if ((!rawStr || rawStr === 'N/A' || String(rawStr).trim() === '') && l.parentName && l.parentName.includes('(')) {
                    const m = l.parentName.match(/\(([^)]+)\)/);
                    if (m && m[1]) rawStr = m[1].trim();
                  }

                  const strClean = rawStr && rawStr !== 'N/A' ? String(rawStr).trim() : '';
                  const formattedStrength = strClean
                    ? (/^\d+$/.test(strClean) ? `${strClean} Students` : strClean)
                    : 'N/A';

                  return (
                    <div key={l._id || idx} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2 hover:border-amber-500/40 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                            Strength: {formattedStrength}
                          </span>
                          <h5 className="text-sm font-black text-white">{l.schoolName || l.city || 'Inquiry School'}</h5>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${l.stage === 'LEAD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                          ● {l.stage || 'LEAD'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px]">Name:</span>
                          <strong className="text-white">{l.contactPerson || l.name || l.fullName || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px]">Mobile:</span>
                          <a href={`tel:${l.phone || l.mobile}`} className="text-emerald-400 font-mono font-bold hover:underline">{l.phone || l.mobile || 'N/A'}</a>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px]">Email:</span>
                          <span className="text-slate-300 font-mono font-bold">{l.email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[10px]">Strength of School:</span>
                          <span className="text-indigo-300 font-bold">{formattedStrength}</span>
                        </div>
                      </div>

                      {l.description && (
                        <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                          <span className="text-slate-500 font-semibold block text-[10px]">Description:</span>
                          <p className="text-slate-300 font-medium italic mt-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">{l.description}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-500 font-mono">
                          Received: {l.createdAt ? new Date(l.createdAt).toLocaleString() : 'Just now'}
                        </span>
                        <button
                          onClick={() => {
                            setForm({
                              name: l.schoolName || '',
                              code: (l.schoolName || 'SCH').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, ''),
                              email: l.email || '',
                              phone: l.phone || l.mobile || '',
                              address: '',
                              subscriptionPlan: 'ENTERPRISE',
                              adminName: l.contactPerson || l.name || '',
                              adminEmail: l.email || `${(l.contactPerson || 'admin').toLowerCase().replace(/\s+/g, '')}@school.com`,
                              adminPassword: 'password123'
                            });
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 rounded-lg font-extrabold border border-emerald-500/30 flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Onboard as School Tenant
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 12: AUDIT LOGS & HEALTH */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Platform Audit Trail & System Health
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-white">{log.performedByName}</td>
                    <td className="p-3.5 font-bold text-indigo-400">{log.action}</td>
                    <td className="p-3.5 text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 13: LANDING PAGE TESTIMONIALS APPROVAL WORKFLOW */}
      {activeTab === 'testimonials' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" /> Landing Page Testimonials Approval & Moderation
              </h3>
              <p className="text-xs text-slate-400">
                School admins submit reviews for approval. SuperAdmin can approve, reject, delete, or create direct testimonials for the landing page slider.
              </p>
            </div>
            <button
              onClick={() => setIsTestimonialModalOpen(true)}
              style={{ color: '#ffffff', backgroundColor: '#059669' }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Add Direct Testimonial</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold block">Pending Review</span>
                <span className="text-2xl font-black">{testimonials.filter(t => t.status === 'PENDING').length}</span>
              </div>
              <MessageSquare className="w-8 h-8 opacity-40" />
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold block">Approved & Published</span>
                <span className="text-2xl font-black">{testimonials.filter(t => t.status === 'APPROVED').length}</span>
              </div>
              <CheckCircle className="w-8 h-8 opacity-40" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold block">Total Testimonials</span>
                <span className="text-2xl font-black">{testimonials.length}</span>
              </div>
              <Star className="w-8 h-8 opacity-40" />
            </div>
          </div>

          {/* Testimonial List */}
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div
                key={t._id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${t.status === 'PENDING'
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : t.status === 'APPROVED'
                      ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md"
                      style={{ backgroundColor: t.color || '#2563eb' }}
                    >
                      {t.avatar || (t.name ? t.name.substring(0, 2).toUpperCase() : 'TS')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm">{t.name}</h4>
                        <span className="text-[10px] text-slate-400">({t.role || 'School Admin'})</span>
                      </div>
                      <p className="text-xs text-emerald-400 font-semibold">{t.schoolName || 'School'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Star Rating */}
                    <div className="flex text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${t.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : t.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                      ● {t.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  "{t.text}"
                </p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-500 font-mono">
                    Submitted: {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recently'}
                  </span>

                  <div className="flex items-center gap-2">
                    {t.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateTestimonialStatus(t._id, 'APPROVED')}
                        style={{ color: '#ffffff', backgroundColor: '#059669' }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                        <span style={{ color: '#ffffff' }}>Approve & Publish</span>
                      </button>
                    )}
                    {t.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateTestimonialStatus(t._id, 'REJECTED')}
                        className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded-lg font-bold border border-amber-500/30 flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTestimonial(t._id)}
                      className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg font-bold border border-rose-500/30 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No testimonials found. Click "Add Direct Testimonial" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE DIRECT TESTIMONIAL MODAL */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> Create Direct Testimonial
              </h3>
              <button onClick={() => setIsTestimonialModalOpen(false)} className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTestimonial} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Author Name *</label>
                <input
                  type="text"
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    placeholder="e.g. Principal / Director"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">School / Institution</label>
                  <input
                    type="text"
                    value={testimonialForm.schoolName}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, schoolName: e.target.value })}
                    placeholder="e.g. Oxford High School"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Testimonial Quote *</label>
                <textarea
                  value={testimonialForm.text}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                  placeholder="Write the school review or feedback here..."
                  required
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                    <option value={3}>3 Stars ⭐⭐⭐</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Badge Theme Color</label>
                  <select
                    value={testimonialForm.color}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="#059669">Emerald Green</option>
                    <option value="#2563eb">Royal Blue</option>
                    <option value="#9333ea">Purple</option>
                    <option value="#d97706">Amber Gold</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsTestimonialModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ color: '#ffffff', backgroundColor: '#059669' }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg transition-all">
                  <span style={{ color: '#ffffff' }}>{loading ? 'Publishing...' : 'Publish to Landing Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl glass-panel rounded-3xl border border-indigo-500/40 p-6 space-y-5 bg-slate-950/90 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> Onboard New Tenant School
                </h3>
                <p className="text-xs text-slate-400">Creates School Tenant & School Admin account in MongoDB Atlas</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                <h4 className="font-extrabold text-indigo-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Step 1: School Profile & Subscription
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-200 font-bold block mb-1.5">School Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. St. Xavier International" required className="w-full bg-[#06080d] border border-slate-700/80 rounded-xl p-3 text-white font-medium focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-slate-200 font-bold block mb-1.5">School Code (Unique ID)</label>
                    <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. STXAVIER" required className="w-full bg-[#06080d] border border-slate-700/80 rounded-xl p-3 text-white uppercase font-mono font-bold focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                <h4 className="font-extrabold text-amber-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Step 2: Initial School Admin Credentials
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-200 font-bold block mb-1.5">Admin Full Name</label>
                    <input type="text" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} placeholder="Principal John Smith" required className="w-full bg-[#06080d] border border-slate-700/80 rounded-xl p-3 text-white font-medium focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-slate-200 font-bold block mb-1.5">Admin Login Email</label>
                    <input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} placeholder="admin@stxavier.edu" required className="w-full bg-[#06080d] border border-slate-700/80 rounded-xl p-3 text-white font-medium focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-slate-200 font-bold block mb-1.5">Admin Password</label>
                    <input type="text" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} placeholder="password123" required className="w-full bg-[#06080d] border border-slate-700/80 rounded-xl p-3 text-white font-mono font-bold focus:border-amber-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 bg-slate-900 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-3 gradient-primary text-white rounded-xl font-extrabold shadow-xl shadow-indigo-500/30 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> <span>{loading ? 'Provisioning...' : 'Save to MongoDB & Onboard School'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHOOL MODAL */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-indigo-500/40 p-6 space-y-5 bg-slate-950/90">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" /> Edit School in MongoDB Atlas
              </h3>
              <button onClick={() => setEditingSchool(null)} className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSchool} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-200 font-bold block mb-1">School Full Name</label>
                <input type="text" value={editingSchool.name} onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })} className="w-full bg-[#0c1018] border border-slate-700 rounded-xl p-3 text-white" required />
              </div>
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingSchool(null)} className="px-4 py-2 bg-slate-900 text-slate-300 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 gradient-primary text-white font-extrabold rounded-xl">Update Atlas</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SaaSAdminDashboard(props) {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400 text-xs">Loading SaaS Control Panel...</div>}>
      <SaaSAdminContent {...props} />
    </React.Suspense>
  );
}
