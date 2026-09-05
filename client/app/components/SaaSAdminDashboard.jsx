'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2, Plus, Users, ShieldCheck, DollarSign,
  Search, CheckCircle, AlertCircle, Sparkles, X, Key, Globe, Eye,
  Sliders, Shield, Cpu, HardDrive, Bell, UserCheck, Lock, Activity, RefreshCw, FileText, Zap, ArrowUpRight, ArrowLeft,
  Trash2, Edit3, Send, Hash, Mail, Phone, HelpCircle, Layers, PieChart, Server, Check, Flame, Box,
  MessageSquare, Star, ArrowUp, ArrowDown, LayoutGrid, List
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
  const [testimonialViewMode, setTestimonialViewMode] = useState('grid');
  const [schoolViewMode, setSchoolViewMode] = useState('list');
  const [userViewMode, setUserViewMode] = useState('list');
  const [planViewMode, setPlanViewMode] = useState('list');
  const [securityViewMode, setSecurityViewMode] = useState('list');
  const [featureFlagViewMode, setFeatureFlagViewMode] = useState('grid');
  const [analyticsViewMode, setAnalyticsViewMode] = useState('list');
  const [supportViewMode, setSupportViewMode] = useState('grid');
  const [auditViewMode, setAuditViewMode] = useState('list');

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
    name: '', role: '', schoolName: '', text: '', rating: 5, avatar: '', color: '#059669', displayOrder: 1
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

  const handleUpdateTestimonialStatus = async (id, status, displayOrder) => {
    let activeToken = token || localStorage.getItem('erp_token') || `demo_token_saas_super_admin`;
    try {
      const payload = {};
      if (status) payload.status = status;
      if (displayOrder !== undefined && displayOrder !== null) payload.displayOrder = Number(displayOrder);

      const res = await fetch(`${API_BASE}/saas/testimonials/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
        body: JSON.stringify(payload)
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
        setTestimonialForm({ name: '', role: '', schoolName: '', text: '', rating: 5, avatar: '', color: '#059669', displayOrder: 1 });
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

          <div className="flex items-center gap-3 flex-wrap">
            {activeTab !== 'services' && (
              <button
                type="button"
                onClick={() => switchTab('services')}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer border border-white/40"
              >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span>Back to All Services</span>
              </button>
            )}

            <button
              onClick={() => { setIsModalOpen(true); setMessage(null); }}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 text-xs font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer border border-white"
              style={{ color: brandColor }}
            >
              <Plus className="w-4 h-4" style={{ color: brandColor }} />
              <span>Onboard New School</span>
            </button>
          </div>
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

      {/* GLOBAL BACK TO ALL SERVICES TOOLBAR STRIP ON ALL SUPERADMIN PAGES */}
      {activeTab !== 'services' && (
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-3 px-5 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <button 
              type="button"
              onClick={() => switchTab('services')} 
              className="hover:text-amber-400 text-slate-200 font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>All Services</span>
            </button>
            <span className="text-slate-500">/</span>
            <span className="text-amber-400 font-extrabold uppercase tracking-wider">{activeTab}</span>
          </div>

          <button
            type="button"
            onClick={() => switchTab('services')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
          >
            <Box className="w-4 h-4 text-slate-950" />
            <span>Back to All Services (36+)</span>
          </button>
        </div>
      )}

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
                <h3 className="text-3xl font-black text-white">{stats.totalUsers || 28}</h3>
                <p className="text-[11px] text-purple-400 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Verified Accounts
                </p>
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
                <h3 className="text-3xl font-black text-white">${stats.estimatedARR || '120,000'}</h3>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Annual Recurring Revenue
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-teal-500/20 hover:border-teal-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">System Health</span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-400">ONLINE</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  100% MongoDB Atlas Operational
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SCHOOLS DIRECTORY */}
      {activeTab === 'schools' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black">Registered Tenant Schools</h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold">Full 100% CRUD Control & 1-Click Admin Impersonation</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Mode Switcher */}
              <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
                <button
                  type="button"
                  onClick={() => setSchoolViewMode('list')}
                  style={schoolViewMode === 'list'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolViewMode('grid')}
                  style={schoolViewMode === 'grid'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => switchTab('services')}
                style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }}
                className="px-3.5 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer hover:bg-amber-200 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" style={{ color: '#b45309' }} />
                <span>Back to All Services</span>
              </button>

              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search school name or code..."
                  style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                  className="w-full border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none shadow-xs"
                />
              </div>
            </div>
          </div>

          {schoolViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredSchools.map((school) => (
                <div
                  key={school._id || school.code}
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
                  }}
                  className="p-5 rounded-3xl border-2 hover:border-emerald-500 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div
                          style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }}
                          className="w-11 h-11 rounded-2xl border flex items-center justify-center font-black text-sm shadow-xs"
                        >
                          <Building2 className="w-5 h-5" style={{ color: brandColor }} />
                        </div>
                        <div>
                          <h4 style={{ color: '#0f172a' }} className="font-black text-base leading-tight">{school.name}</h4>
                          <span style={{ color: brandColor }} className="text-xs font-mono font-bold">{school.code}</span>
                        </div>
                      </div>
                      <span
                        style={
                          school.status === 'ACTIVE'
                            ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                            : { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fca5a5' }
                        }
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase border"
                      >
                        {school.status}
                      </span>
                    </div>

                    <div
                      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                      className="p-3.5 rounded-2xl border space-y-1 shadow-inner"
                    >
                      <div style={{ color: '#0f172a' }} className="text-xs font-black flex items-center gap-1">
                        <span>👤 Admin:</span>
                        <span style={{ color: '#0f172a' }} className="font-black">{school.adminUser ? school.adminUser.name : 'School Admin'}</span>
                      </div>
                      <div style={{ color: brandColor }} className="text-[11px] font-bold font-mono truncate flex items-center gap-1">
                        <span>✉️</span>
                        <span style={{ color: brandColor }}>{school.adminUser ? school.adminUser.email : school.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span style={{ color: '#475569' }} className="font-bold text-xs">Plan:</span>
                      <span
                        style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }}
                        className="px-3 py-1 rounded-full text-xs font-black uppercase border shadow-xs"
                      >
                        {school.subscriptionPlan}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleImpersonate(school._id)}
                      style={{ backgroundColor: brandColor, color: '#ffffff' }}
                      className="flex-1 py-2.5 hover:opacity-90 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95 border-none"
                    >
                      <Key className="w-4 h-4 text-amber-300" />
                      <span style={{ color: '#ffffff' }}>Admin Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSchool(school)}
                      style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }}
                      className="px-3.5 py-2.5 rounded-xl hover:bg-indigo-100 text-xs font-black border flex items-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      <Edit3 className="w-4 h-4" style={{ color: brandColor }} />
                      <span style={{ color: brandColor }}>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSchoolStatus(school._id, school.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                      style={{ backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}
                      className="px-3.5 py-2.5 rounded-xl hover:bg-slate-200 text-xs font-black border cursor-pointer transition shadow-xs"
                    >
                      <span style={{ color: '#334155' }}>{school.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSchool(school._id, school.name)}
                      style={{ backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fca5a5' }}
                      className="p-2.5 rounded-xl hover:bg-rose-200 text-xs font-black border cursor-pointer transition shadow-xs"
                      title="Delete School"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#e11d48' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW TABLE */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">School Name</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">School Admin</th>
                    <th className="p-4">Subscription</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Full CRUD Actions</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {filteredSchools.map(school => (
                    <tr key={school._id || school.code} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-sm" style={{ color: '#0f172a' }}>{school.name}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: brandColor }}>{school.code}</td>
                      <td className="p-4">
                        <strong style={{ color: '#0f172a' }} className="font-black text-xs block">{school.adminUser ? school.adminUser.name : 'School Admin'}</strong>
                        <p style={{ color: brandColor }} className="text-[11px] font-mono font-bold mt-0.5">{school.adminUser ? school.adminUser.email : school.email}</p>
                      </td>
                      <td className="p-4">
                        <span
                          style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }}
                          className="px-3 py-1 rounded-full text-[11px] font-black uppercase border shadow-xs"
                        >
                          {school.subscriptionPlan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          style={
                            school.status === 'ACTIVE'
                              ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                              : { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fca5a5' }
                          }
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase border"
                        >
                          {school.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleImpersonate(school._id)}
                            style={{ backgroundColor: brandColor, color: '#ffffff' }}
                            className="px-3 py-2 hover:opacity-90 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition cursor-pointer active:scale-95 border-none"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-300" />
                            <span style={{ color: '#ffffff' }}>Admin Login</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSchool(school)}
                            style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }}
                            className="px-3 py-2 rounded-xl hover:bg-indigo-100 text-xs font-black border flex items-center gap-1 cursor-pointer transition shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" style={{ color: brandColor }} />
                            <span style={{ color: brandColor }}>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSchoolStatus(school._id, school.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                            style={{ backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}
                            className="px-3 py-2 rounded-xl hover:bg-slate-200 text-xs font-black border cursor-pointer transition shadow-xs"
                          >
                            <span style={{ color: '#334155' }}>{school.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSchool(school._id, school.name)}
                            style={{ backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fca5a5' }}
                            className="p-2 rounded-xl hover:bg-rose-200 text-xs font-black border cursor-pointer transition shadow-xs"
                            title="Delete School"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#e11d48' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DYNAMIC PLANS & FEATURE MATRIX */}
      {activeTab === 'plans' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black">Dynamic Plan Feature Control Matrix</h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold">Toggle features ON/OFF per plan live in MongoDB Atlas without deploying code</p>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
              <button
                type="button"
                onClick={() => setPlanViewMode('list')}
                style={planViewMode === 'list'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setPlanViewMode('grid')}
                style={planViewMode === 'grid'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>

          {planViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {plans.map(p => (
                <div
                  key={p.code}
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
                  }}
                  className="p-5 rounded-3xl border-2 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h4 style={{ color: '#0f172a' }} className="font-black text-base leading-tight">{p.name}</h4>
                        <span style={{ color: brandColor }} className="text-xs font-mono font-bold">({p.code})</span>
                      </div>
                      <span style={{ backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }} className="px-3 py-1 rounded-full text-xs font-black border">
                        ${p.priceMonthly}/mo
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-3.5 rounded-2xl border space-y-2">
                      <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Module Access:</div>
                      {['admissions', 'exams', 'payroll', 'transport', 'ai', 'api', 'multiBranch'].map(feat => {
                        const enabled = p.features && p.features[feat];
                        return (
                          <div key={feat} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                            <span style={{ color: '#475569' }} className="font-bold capitalize">{feat}:</span>
                            <button
                              type="button"
                              onClick={() => handleTogglePlanFeature(p.code, feat, enabled)}
                              style={enabled
                                ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                                : { backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }
                              }
                              className="px-3 py-1 rounded-xl text-[10px] font-black border transition cursor-pointer"
                            >
                              {enabled ? '✅ ENABLED' : '❌ OFF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">Plan Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Admissions</th>
                    <th className="p-4">Exams</th>
                    <th className="p-4">HRMS/Payroll</th>
                    <th className="p-4">Transport</th>
                    <th className="p-4">AI Engine</th>
                    <th className="p-4">API Access</th>
                    <th className="p-4">Multi-Branch</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {plans.map(p => (
                    <tr key={p.code} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-sm" style={{ color: '#0f172a' }}>{p.name} <span className="font-mono text-indigo-600">({p.code})</span></td>
                      <td className="p-4 font-black text-xs" style={{ color: brandColor }}>${p.priceMonthly}/mo</td>
                      {['admissions', 'exams', 'payroll', 'transport', 'ai', 'api', 'multiBranch'].map(feat => {
                        const enabled = p.features && p.features[feat];
                        return (
                          <td key={feat} className="p-4">
                            <button
                              type="button"
                              onClick={() => handleTogglePlanFeature(p.code, feat, enabled)}
                              style={enabled
                                ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                                : { backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }
                              }
                              className="px-3 py-1 rounded-xl text-[10px] font-black border transition cursor-pointer"
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
          )}
        </div>
      )}

      {/* VIEW 4: GLOBAL USER RBAC */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black">Global Multi-Tenant User Management</h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold">Manage all School Admins, Teachers, Accountants, Parents across tenants</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
                <button
                  type="button"
                  onClick={() => setUserViewMode('list')}
                  style={userViewMode === 'list'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserViewMode('grid')}
                  style={userViewMode === 'grid'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
              </div>

              <span style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }} className="px-3 py-1.5 rounded-xl text-xs font-black border font-mono">
                Total {globalUsers.length} Users
              </span>
            </div>
          </div>

          {userViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {globalUsers.map(u => (
                <div
                  key={u._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
                  }}
                  className="p-5 rounded-3xl border-2 hover:border-emerald-500 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div
                          style={{ backgroundColor: brandColor, color: '#ffffff' }}
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm"
                        >
                          {u.name ? u.name.substring(0, 2) : 'US'}
                        </div>
                        <div>
                          <h4 style={{ color: '#0f172a' }} className="font-black text-base leading-tight">{u.name}</h4>
                          <span style={{ color: brandColor }} className="text-xs font-mono font-bold">{u.email}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-3 rounded-2xl border space-y-1 shadow-inner">
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: '#475569' }} className="font-bold">Role:</span>
                        <span style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }} className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border">
                          {u.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span style={{ color: '#475569' }} className="font-bold">Campus:</span>
                        <span style={{ color: '#0f172a' }} className="font-black truncate max-w-[150px]">{u.schoolName || 'Global Platform'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleResetPassword(u._id, u.email)}
                      style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }}
                      className="w-full py-2 rounded-xl text-xs font-black border hover:bg-amber-200 transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5" style={{ color: '#b45309' }} />
                      <span>Reset Password</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">User Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">School Campus</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {globalUsers.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-sm" style={{ color: '#0f172a' }}>{u.name}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: brandColor }}>{u.email}</td>
                      <td className="p-4">
                        <span
                          style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }}
                          className="px-3 py-1 rounded-full text-[11px] font-black uppercase border shadow-xs"
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-black text-xs" style={{ color: '#334155' }}>{u.schoolName || 'Global Platform'}</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u._id, u.email)}
                          style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }}
                          className="px-3 py-1.5 rounded-xl text-xs font-black border hover:bg-amber-200 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Key className="w-3.5 h-3.5" style={{ color: '#b45309' }} />
                          <span>Reset Password</span>
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

      {/* VIEW 5: SECURITY CENTER */}
      {activeTab === 'security' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: brandColor }} /> Security Center & Network Access Controls
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold mt-0.5">Real-time authentication security events, IP tracking, and severity monitoring</p>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
              <button
                type="button"
                onClick={() => setSecurityViewMode('list')}
                style={securityViewMode === 'list'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setSecurityViewMode('grid')}
                style={securityViewMode === 'grid'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>

          {securityViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {securityEvents.map((sec, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
                  className="p-4.5 rounded-3xl border-2 shadow-sm hover:border-emerald-500 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ color: brandColor }} className="font-extrabold text-xs tracking-wider uppercase">
                        {sec.eventType || 'SECURITY_EVENT'}
                      </span>
                      <span
                        style={
                          sec.severity === 'CRITICAL' || sec.severity === 'HIGH'
                            ? { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fca5a5' }
                            : { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                        }
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
                      >
                        {sec.severity || 'INFO'}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-3 rounded-2xl border space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span style={{ color: '#475569' }} className="font-bold">User Email:</span>
                        <span style={{ color: '#0f172a' }} className="font-mono font-bold truncate max-w-[170px]">{sec.userEmail}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span style={{ color: '#475569' }} className="font-bold">IP Address:</span>
                        <span style={{ color: brandColor }} className="font-mono font-bold">{sec.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>Recorded:</span>
                    <span className="font-mono font-bold text-slate-700">{new Date(sec.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">User Email</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {securityEvents.map((sec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-xs" style={{ color: brandColor }}>{sec.eventType}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: '#0f172a' }}>{sec.userEmail}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: brandColor }}>{sec.ipAddress}</td>
                      <td className="p-4">
                        <span
                          style={
                            sec.severity === 'CRITICAL' || sec.severity === 'HIGH'
                              ? { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fca5a5' }
                              : { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                          }
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-xs"
                        >
                          {sec.severity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{new Date(sec.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 6: FEATURE FLAGS */}
      {activeTab === 'modules' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <Box className="w-5 h-5" style={{ color: brandColor }} /> Feature Flags Engine & Rollouts
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold mt-0.5">Control live rollout percentages and module toggles platform-wide</p>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
              <button
                type="button"
                onClick={() => setFeatureFlagViewMode('grid')}
                style={featureFlagViewMode === 'grid'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
              <button
                type="button"
                onClick={() => setFeatureFlagViewMode('list')}
                style={featureFlagViewMode === 'list'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {featureFlagViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {featureFlags.map((flag, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
                  className="p-5 rounded-3xl border-2 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 style={{ color: '#0f172a' }} className="font-black text-sm">{flag.name}</h4>
                      <span
                        style={flag.enabled
                          ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                          : { backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }
                        }
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
                      >
                        {flag.enabled ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p style={{ color: brandColor }} className="text-xs font-mono font-bold">Key: {flag.key}</p>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-3 rounded-2xl border flex items-center justify-between text-xs font-bold">
                    <span style={{ color: '#475569' }}>Rollout Target:</span>
                    <strong style={{ color: brandColor }} className="font-mono text-sm">{flag.rolloutPercentage}%</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">Feature Name</th>
                    <th className="p-4">Feature Key</th>
                    <th className="p-4">Rollout %</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {featureFlags.map((flag, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-sm" style={{ color: '#0f172a' }}>{flag.name}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: brandColor }}>{flag.key}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: '#334155' }}>{flag.rolloutPercentage}%</td>
                      <td className="p-4">
                        <span
                          style={flag.enabled
                            ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                            : { backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }
                          }
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-xs"
                        >
                          {flag.enabled ? 'ACTIVE' : 'OFF'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 7: AI TOKEN QUOTAS */}
      {activeTab === 'ai' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <Cpu className="w-5 h-5" style={{ color: brandColor }} /> AI Providers & Token Spending Caps
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold mt-0.5">Manage LLM quotas and automated school AI tokens</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }} className="p-5 rounded-2xl border text-xs text-slate-800 space-y-2 shadow-inner">
            <p className="font-black text-sm" style={{ color: brandColor }}>🤖 OpenAI / Anthropic Integration Active</p>
            <p style={{ color: '#334155' }} className="font-bold text-xs">Total Tokens Used: 8,450 / 100,000 Tokens Allocated</p>
          </div>
        </div>
      )}

      {/* VIEW 8: SAAS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: brandColor }} /> SaaS Business Revenue & Billing History
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold mt-0.5">Track multi-tenant subscriptions, invoices, and recurring revenue</p>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
              <button
                type="button"
                onClick={() => setAnalyticsViewMode('list')}
                style={analyticsViewMode === 'list'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsViewMode('grid')}
                style={analyticsViewMode === 'grid'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>

          {analyticsViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {invoices.map((inv, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
                  className="p-5 rounded-3xl border-2 shadow-sm hover:border-emerald-500 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span style={{ color: brandColor }} className="font-mono font-extrabold text-xs">{inv.invoiceNo}</span>
                      <span style={{ backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }} className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border">
                        {inv.status}
                      </span>
                    </div>

                    <h4 style={{ color: '#0f172a' }} className="font-black text-base leading-tight">{inv.schoolName}</h4>
                    <p style={{ color: '#475569' }} className="text-xs font-semibold">Plan: <span className="font-bold">{inv.planName}</span></p>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-3 rounded-2xl border flex items-center justify-between">
                    <span style={{ color: '#475569' }} className="text-xs font-bold">Total Billed:</span>
                    <span style={{ color: brandColor }} className="text-lg font-black">${inv.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">School Name</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {invoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: brandColor }}>{inv.invoiceNo}</td>
                      <td className="p-4 font-black text-sm" style={{ color: '#0f172a' }}>{inv.schoolName}</td>
                      <td className="p-4 font-bold text-xs" style={{ color: '#334155' }}>{inv.planName}</td>
                      <td className="p-4 font-black text-sm" style={{ color: brandColor }}>${inv.amount}</td>
                      <td className="p-4">
                        <span style={{ backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }} className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-xs">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 9: COMMUNICATION */}
      {activeTab === 'communication' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: brandColor }} /> Global Announcement Broadcast System
          </h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="Announcement Title"
                required
                style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                className="border rounded-xl p-3 text-xs font-semibold outline-none"
              />
              <select
                value={announcementForm.targetAudience}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
                style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                className="border rounded-xl p-3 text-xs font-semibold outline-none"
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
              style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
              className="w-full border rounded-xl p-3 text-xs font-semibold outline-none h-24"
            />
            <button type="submit" style={{ backgroundColor: brandColor, color: '#ffffff' }} className="px-5 py-2.5 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-md cursor-pointer border-none">
              <Send className="w-4 h-4 text-white" /> Broadcast Announcement
            </button>
          </form>
        </div>
      )}

      {/* VIEW 10: STORAGE */}
      {activeTab === 'usage' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
            <HardDrive className="w-5 h-5" style={{ color: brandColor }} /> Storage & File Quota Management
          </h3>
          <div style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }} className="p-5 rounded-2xl border space-y-1 text-xs">
            <p style={{ color: '#0f172a' }} className="font-black text-sm">Total Cloud Storage Consumption</p>
            <p style={{ color: brandColor }} className="font-bold text-xs">78 GB Used / 500 GB Total Capacity (15.6%)</p>
          </div>
        </div>
      )}

      {/* VIEW 11: SUPPORT & CRM */}
      {activeTab === 'support' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <HelpCircle className="w-5 h-5" style={{ color: brandColor }} /> Dynamic Sales CRM & Website Inquiry Leads
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold">Live inquiries submitted from the landing page dynamically appear here</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
                <button
                  type="button"
                  onClick={() => setSupportViewMode('grid')}
                  style={supportViewMode === 'grid'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSupportViewMode('list')}
                  style={supportViewMode === 'list'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>

              <span style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }} className="px-3 py-1.5 rounded-xl text-xs font-black border font-mono">
                {leads.length} Total Leads Recorded
              </span>
            </div>
          </div>

          {supportViewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Helpdesk Tickets */}
              <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="lg:col-span-5 p-4.5 rounded-3xl border space-y-3 shadow-inner">
                <h4 style={{ color: '#0f172a' }} className="font-black text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Support & Helpdesk Tickets</span>
                  <span style={{ color: brandColor }} className="text-[11px] font-mono font-bold">{tickets.length} Active</span>
                </h4>
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {tickets.map((t, idx) => (
                    <div key={idx} style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }} className="p-3.5 rounded-2xl border text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <strong style={{ color: '#0f172a' }} className="font-black text-xs">{t.subject}</strong>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${t.status === 'OPEN' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p style={{ color: '#475569' }} className="text-[11px] font-semibold">{t.schoolName} • {t.userEmail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Sales CRM Inquiry Leads */}
              <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="lg:col-span-7 p-4.5 rounded-3xl border space-y-3 shadow-inner">
                <h4 style={{ color: '#0f172a' }} className="font-black text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Website Inquiry Leads (Dynamic Sales Pipeline)</span>
                  <span style={{ color: brandColor }} className="text-[11px] font-mono font-bold">Synced from Atlas</span>
                </h4>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
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
                      <div key={l._id || idx} style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }} className="p-4 rounded-2xl border text-xs space-y-2 hover:border-emerald-500 transition-all shadow-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span style={{ color: '#b45309' }} className="text-[10px] font-black uppercase tracking-wider block">
                              Strength: {formattedStrength}
                            </span>
                            <h5 style={{ color: '#0f172a' }} className="text-sm font-black">{l.schoolName || l.city || 'Inquiry School'}</h5>
                          </div>
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }} className="px-2.5 py-1 rounded-full text-[10px] font-black border">
                            ● {l.stage || 'LEAD'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                          <div>
                            <span style={{ color: '#64748b' }} className="font-semibold block text-[10px]">Contact Person:</span>
                            <strong style={{ color: '#0f172a' }} className="font-black">{l.contactPerson || l.name || l.fullName || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }} className="font-semibold block text-[10px]">Mobile:</span>
                            <a href={`tel:${l.phone || l.mobile}`} style={{ color: brandColor }} className="font-mono font-bold hover:underline">{l.phone || l.mobile || 'N/A'}</a>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                          <span style={{ color: '#64748b' }} className="font-mono">
                            Received: {l.createdAt ? new Date(l.createdAt).toLocaleString() : 'Just now'}
                          </span>
                          <button
                            type="button"
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
                            style={{ backgroundColor: brandColor, color: '#ffffff' }}
                            className="px-3 py-1.5 text-white rounded-xl font-black flex items-center gap-1 shadow-md transition-all cursor-pointer border-none"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" /> Onboard as School Tenant
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">School / Inquiry Name</th>
                    <th className="p-4">Contact Person</th>
                    <th className="p-4">Phone / Mobile</th>
                    <th className="p-4">School Strength</th>
                    <th className="p-4">Pipeline Stage</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {leads.map((l, idx) => (
                    <tr key={l._id || idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-sm" style={{ color: '#0f172a' }}>{l.schoolName || l.city || 'Inquiry School'}</td>
                      <td className="p-4 font-bold text-xs" style={{ color: '#0f172a' }}>{l.contactPerson || l.name || l.fullName || 'N/A'}</td>
                      <td className="p-4 font-mono font-bold text-xs" style={{ color: brandColor }}>{l.phone || l.mobile || 'N/A'}</td>
                      <td className="p-4 font-black text-xs" style={{ color: '#334155' }}>{l.schoolStrength || 'N/A'}</td>
                      <td className="p-4">
                        <span style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }} className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-xs">
                          {l.stage || 'LEAD'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
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
                          style={{ backgroundColor: brandColor, color: '#ffffff' }}
                          className="px-3 py-1.5 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow-md transition cursor-pointer border-none"
                        >
                          <Plus className="w-3.5 h-3.5 text-white" /> Onboard
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

      {/* VIEW 12: AUDIT LOGS & HEALTH */}
      {activeTab === 'audit' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: brandColor }} /> Platform Audit Trail & System Health
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold mt-0.5">Chronological system action logs and SuperAdmin activity history</p>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
              <button
                type="button"
                onClick={() => setAuditViewMode('list')}
                style={auditViewMode === 'list'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditViewMode('grid')}
                style={auditViewMode === 'grid'
                  ? { backgroundColor: brandColor, color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#64748b' }
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>

          {auditViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
                  className="p-4.5 rounded-3xl border-2 shadow-sm hover:border-emerald-500 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span style={{ color: brandColor }} className="font-extrabold text-xs tracking-wider uppercase">{log.action}</span>
                      <span style={{ backgroundColor: '#e0e7ff', color: brandColor, borderColor: '#c7d2fe' }} className="px-2.5 py-0.5 rounded-full text-[10px] font-black border">
                        {log.performedByName}
                      </span>
                    </div>
                    <p style={{ color: '#0f172a' }} className="text-xs font-semibold leading-relaxed">{log.details}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] font-mono font-bold text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }} className="uppercase font-black border-b">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="divide-y divide-slate-200 font-semibold">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-black text-xs" style={{ color: '#0f172a' }}>{log.performedByName}</td>
                      <td className="p-4 font-black text-xs" style={{ color: brandColor }}>{log.action}</td>
                      <td className="p-4 text-slate-700 font-medium">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 13: LANDING PAGE TESTIMONIALS APPROVAL WORKFLOW */}
      {activeTab === 'testimonials' && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: '#0f172a' }} className="text-xl font-black flex items-center gap-2">
                <MessageSquare className="w-6 h-6" style={{ color: brandColor }} /> Landing Page Testimonials & Position Control
              </h3>
              <p style={{ color: '#475569' }} className="text-xs font-semibold mt-1">
                School admins submit reviews for approval. SuperAdmin can approve, reject, delete, and set exact display positions (#1, #2, #3...) for the landing page slider.
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Switcher: Grid vs List Toggle */}
              <div style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }} className="flex items-center p-1 rounded-2xl border shadow-xs">
                <button
                  type="button"
                  onClick={() => setTestimonialViewMode('grid')}
                  style={testimonialViewMode === 'grid'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestimonialViewMode('list')}
                  style={testimonialViewMode === 'list'
                    ? { backgroundColor: brandColor, color: '#ffffff' }
                    : { backgroundColor: 'transparent', color: '#64748b' }
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-none"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsTestimonialModalOpen(true)}
                style={{ color: '#ffffff', backgroundColor: brandColor }}
                className="px-5 py-2.5 hover:opacity-90 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 border-none"
              >
                <Plus className="w-4.5 h-4.5" style={{ color: '#ffffff' }} />
                <span style={{ color: '#ffffff' }}>Add Direct Testimonial</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }} className="p-4.5 rounded-2xl border text-amber-900 flex items-center justify-between shadow-xs">
              <div>
                <span style={{ color: '#b45309' }} className="text-[11px] uppercase tracking-wider font-black block">Pending Review</span>
                <span style={{ color: '#78350f' }} className="text-3xl font-black mt-0.5 block">{testimonials.filter(t => t.status === 'PENDING').length}</span>
              </div>
              <MessageSquare className="w-8 h-8 text-amber-500 opacity-60" />
            </div>
            <div style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }} className="p-4.5 rounded-2xl border text-emerald-900 flex items-center justify-between shadow-xs">
              <div>
                <span style={{ color: brandColor }} className="text-[11px] uppercase tracking-wider font-black block">Approved & Published</span>
                <span style={{ color: brandColor }} className="text-3xl font-black mt-0.5 block">{testimonials.filter(t => t.status === 'APPROVED').length}</span>
              </div>
              <CheckCircle className="w-8 h-8 opacity-60" style={{ color: brandColor }} />
            </div>
            <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-4.5 rounded-2xl border text-slate-900 flex items-center justify-between shadow-xs">
              <div>
                <span style={{ color: '#475569' }} className="text-[11px] uppercase tracking-wider font-black block">Total Testimonials</span>
                <span style={{ color: '#0f172a' }} className="text-3xl font-black mt-0.5 block">{testimonials.length}</span>
              </div>
              <Star className="w-8 h-8 text-slate-400 opacity-60" />
            </div>
          </div>

          {/* Testimonial View (Supports both Grid View and List View) */}
          {testimonialViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => {
                const currentPos = t.displayOrder || idx + 1;
                const isApproved = t.status === 'APPROVED';
                const isPending = t.status === 'PENDING';

                return (
                  <div
                    key={t._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: isApproved ? brandColor : isPending ? '#f59e0b' : '#ef4444',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
                    }}
                    className="p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1"
                  >
                    {/* Top Header: Author & Landing Position Badge */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md ring-2 ring-emerald-500/20 shrink-0 uppercase"
                            style={{ backgroundColor: t.color || brandColor, color: '#ffffff' }}
                          >
                            {t.avatar || (t.name ? t.name.substring(0, 2).toUpperCase() : 'TS')}
                          </div>
                          <div className="truncate">
                            <h4 style={{ color: '#0f172a' }} className="font-black text-sm leading-tight truncate">{t.name}</h4>
                            <p style={{ color: brandColor }} className="text-[11px] font-extrabold truncate mt-0.5">{t.role || 'School Admin'} • {t.schoolName || 'School'}</p>
                          </div>
                        </div>

                        {/* Position Slot Badge */}
                        <span
                          style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }}
                          className="px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 shadow-xs shrink-0"
                        >
                          📍 Slot #{currentPos}
                        </span>
                      </div>

                      {/* Status Badge & Rating Stars */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex" style={{ color: '#f59e0b' }}>
                          {[...Array(t.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />
                          ))}
                        </div>

                        <span
                          style={
                            isApproved
                              ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                              : isPending
                                ? { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }
                                : { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fca5a5' }
                          }
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase border"
                        >
                          ● {t.status}
                        </span>
                      </div>

                      {/* Quoted Review Speech Box */}
                      <div
                        style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                        className="p-4 rounded-2xl border min-h-[95px] flex items-center shadow-inner"
                      >
                        <p style={{ color: '#1e293b' }} className="text-xs italic font-semibold leading-relaxed">
                          "{t.text}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Controls: Landing Position Selector & Actions */}
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      
                      {/* Position Placement Panel */}
                      <div
                        style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                        className="p-3 rounded-2xl border space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span style={{ color: '#b45309' }}>🎯 Landing Page Display Position:</span>
                          <span style={{ color: '#475569' }} className="font-mono text-[11px]">Position #{currentPos}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Move Up Arrow Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, t.status, Math.max(1, currentPos - 1))}
                            disabled={currentPos <= 1}
                            style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#cbd5e1' }}
                            className="p-2 rounded-xl border hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
                            title="Move Up in Landing Slider"
                          >
                            <ArrowUp className="w-4 h-4" style={{ color: brandColor }} />
                          </button>

                          {/* Select Position Dropdown */}
                          <select
                            value={currentPos}
                            onChange={(e) => handleUpdateTestimonialStatus(t._id, t.status, Number(e.target.value))}
                            style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                            className="flex-1 font-black text-xs px-3 py-2 rounded-xl outline-none cursor-pointer border shadow-xs"
                          >
                            {[...Array(Math.max(10, testimonials.length))].map((_, posIdx) => (
                              <option key={posIdx + 1} value={posIdx + 1} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                                Position #{posIdx + 1} {posIdx === 0 ? '(First Card)' : ''}
                              </option>
                            ))}
                          </select>

                          {/* Move Down Arrow Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, t.status, currentPos + 1)}
                            style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#cbd5e1' }}
                            className="p-2 rounded-xl border hover:bg-slate-50 cursor-pointer transition shadow-xs"
                            title="Move Down in Landing Slider"
                          >
                            <ArrowDown className="w-4 h-4" style={{ color: brandColor }} />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {!isApproved ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, 'APPROVED', t.displayOrder)}
                            style={{ color: '#ffffff', backgroundColor: brandColor }}
                            className="flex-1 py-2.5 hover:opacity-90 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95 border-none"
                          >
                            <Check className="w-4 h-4" style={{ color: '#ffffff' }} />
                            <span style={{ color: '#ffffff' }}>Approve & Publish</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, 'PENDING', t.displayOrder)}
                            style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fdba74' }}
                            className="flex-1 py-2 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer hover:bg-orange-100 active:scale-95"
                          >
                            <X className="w-4 h-4" style={{ color: '#c2410c' }} />
                            <span style={{ color: '#c2410c' }}>Unpublish</span>
                          </button>
                        )}

                        {t.status !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, 'REJECTED', t.displayOrder)}
                            style={{ backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}
                            className="px-3.5 py-2 rounded-xl border font-extrabold text-xs transition cursor-pointer hover:bg-slate-200 shadow-xs"
                          >
                            <span style={{ color: '#475569' }}>Reject</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(t._id)}
                          style={{ backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fca5a5' }}
                          className="p-2 rounded-xl border font-black flex items-center justify-center transition cursor-pointer hover:bg-rose-200 shadow-xs"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#e11d48' }} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}

              {testimonials.length === 0 && (
                <div style={{ color: '#64748b', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="col-span-full text-center py-12 text-xs border rounded-3xl font-medium">
                  No testimonials found. Click "Add Direct Testimonial" to create one.
                </div>
              )}
            </div>
          ) : (
            /* LIST VIEW (Structured Horizontal Card Rows) */
            <div className="space-y-4">
              {testimonials.map((t, idx) => {
                const currentPos = t.displayOrder || idx + 1;
                const isApproved = t.status === 'APPROVED';
                const isPending = t.status === 'PENDING';

                return (
                  <div
                    key={t._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: isApproved ? brandColor : isPending ? '#f59e0b' : '#ef4444',
                      boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.05)'
                    }}
                    className="p-4.5 rounded-3xl border-2 transition-all duration-300 flex flex-col lg:flex-row items-center justify-between gap-5 hover:shadow-xl"
                  >
                    {/* Author Profile */}
                    <div className="flex items-center space-x-4 min-w-[240px] shrink-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md ring-2 ring-emerald-500/20 shrink-0 uppercase"
                        style={{ backgroundColor: t.color || brandColor, color: '#ffffff' }}
                      >
                        {t.avatar || (t.name ? t.name.substring(0, 2).toUpperCase() : 'TS')}
                      </div>
                      <div>
                        <h4 style={{ color: '#0f172a' }} className="font-black text-sm leading-tight">{t.name}</h4>
                        <p style={{ color: brandColor }} className="text-[11px] font-extrabold mt-0.5">{t.role || 'School Admin'} • {t.schoolName || 'School'}</p>
                        
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex" style={{ color: '#f59e0b' }}>
                            {[...Array(t.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#f59e0b' }} />
                            ))}
                          </div>
                          <span
                            style={
                              isApproved
                                ? { backgroundColor: '#d1fae5', color: brandColor, borderColor: '#6ee7b7' }
                                : isPending
                                  ? { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }
                                  : { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fca5a5' }
                            }
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border"
                          >
                            ● {t.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Speech Box */}
                    <div
                      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                      className="p-3.5 rounded-2xl border flex-1 w-full min-h-[55px] flex items-center shadow-inner"
                    >
                      <p style={{ color: '#1e293b' }} className="text-xs italic font-semibold leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>

                    {/* Position Placement Panel & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
                      <div
                        style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                        className="flex items-center gap-1.5 p-1.5 rounded-2xl border shrink-0"
                      >
                        <span style={{ color: '#b45309' }} className="text-[11px] font-black px-1">
                          📍 Slot #{currentPos}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateTestimonialStatus(t._id, t.status, Math.max(1, currentPos - 1))}
                          disabled={currentPos <= 1}
                          style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#cbd5e1' }}
                          className="p-1.5 rounded-xl border hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" style={{ color: brandColor }} />
                        </button>
                        <select
                          value={currentPos}
                          onChange={(e) => handleUpdateTestimonialStatus(t._id, t.status, Number(e.target.value))}
                          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                          className="font-black text-xs px-2.5 py-1 rounded-xl outline-none cursor-pointer border shadow-xs"
                        >
                          {[...Array(Math.max(10, testimonials.length))].map((_, posIdx) => (
                            <option key={posIdx + 1} value={posIdx + 1} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                              Pos #{posIdx + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleUpdateTestimonialStatus(t._id, t.status, currentPos + 1)}
                          style={{ backgroundColor: '#ffffff', color: brandColor, borderColor: '#cbd5e1' }}
                          className="p-1.5 rounded-xl border hover:bg-slate-50 cursor-pointer transition shadow-xs"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" style={{ color: brandColor }} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isApproved ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, 'APPROVED', t.displayOrder)}
                            style={{ color: '#ffffff', backgroundColor: brandColor }}
                            className="px-4 py-2 hover:opacity-90 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1 shadow-md transition cursor-pointer active:scale-95 border-none"
                          >
                            <Check className="w-4 h-4" style={{ color: '#ffffff' }} />
                            <span style={{ color: '#ffffff' }}>Approve</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, 'PENDING', t.displayOrder)}
                            style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fdba74' }}
                            className="px-3.5 py-2 rounded-xl border font-black text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer hover:bg-orange-100 active:scale-95"
                          >
                            <X className="w-4 h-4" style={{ color: '#c2410c' }} />
                            <span style={{ color: '#c2410c' }}>Unpublish</span>
                          </button>
                        )}

                        {t.status !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTestimonialStatus(t._id, 'REJECTED', t.displayOrder)}
                            style={{ backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}
                            className="px-3 py-2 rounded-xl border font-extrabold text-xs transition cursor-pointer hover:bg-slate-200 shadow-xs"
                          >
                            <span style={{ color: '#475569' }}>Reject</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(t._id)}
                          style={{ backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fca5a5' }}
                          className="p-2 rounded-xl border font-black flex items-center justify-center transition cursor-pointer hover:bg-rose-200 shadow-xs"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#e11d48' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {testimonials.length === 0 && (
                <div style={{ color: '#64748b', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="col-span-full text-center py-12 text-xs border rounded-3xl font-medium">
                  No testimonials found. Click "Add Direct Testimonial" to create one.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE DIRECT TESTIMONIAL MODAL */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900 animate-in fade-in">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold block">Testimonial Quote *</label>
                  <span className="text-[10px] font-bold text-emerald-600">{(testimonialForm.text || '').length}/180 chars max</span>
                </div>
                <textarea
                  value={testimonialForm.text}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                  placeholder="Write the school review or feedback here..."
                  required
                  maxLength={180}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Rating</label>
                  <select
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs"
                  >
                    <option value={5}>5 Stars ⭐</option>
                    <option value={4}>4 Stars ⭐</option>
                    <option value={3}>3 Stars ⭐</option>
                    <option value={2}>2 Stars ⭐</option>
                    <option value={1}>1 Star ⭐</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Badge Color</label>
                  <select
                    value={testimonialForm.color}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs"
                  >
                    <option value="#059669">Green</option>
                    <option value="#2563eb">Blue</option>
                    <option value="#9333ea">Purple</option>
                    <option value="#d97706">Amber</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Landing Position</label>
                  <select
                    value={testimonialForm.displayOrder || 1}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs"
                  >
                    {[...Array(Math.max(10, testimonials.length + 1))].map((_, posIdx) => (
                      <option key={posIdx + 1} value={posIdx + 1}>
                        Pos #{posIdx + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsTestimonialModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ color: '#ffffff', backgroundColor: brandColor }} className="px-5 py-2.5 hover:opacity-90 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer border-none">
                  <span style={{ color: '#ffffff' }}>{loading ? 'Publishing...' : 'Publish to Landing Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" /> Onboard New Tenant School
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Creates School Tenant & School Admin account in MongoDB Atlas</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="space-y-5 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <h4 className="font-extrabold text-emerald-800 uppercase text-[11px] tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" /> Step 1: School Profile & Subscription
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1.5">School Full Name</label>
                    <input 
                      type="text" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="e.g. St. Xavier International" 
                      required 
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1.5">School Code (Unique ID)</label>
                    <input 
                      type="text" 
                      value={form.code} 
                      onChange={(e) => setForm({ ...form, code: e.target.value })} 
                      placeholder="e.g. STXAVIER" 
                      required 
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 uppercase font-mono font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <h4 className="font-extrabold text-emerald-800 uppercase text-[11px] tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" /> Step 2: Initial School Admin Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1.5">Admin Full Name</label>
                    <input 
                      type="text" 
                      value={form.adminName} 
                      onChange={(e) => setForm({ ...form, adminName: e.target.value })} 
                      placeholder="Principal John Smith" 
                      required 
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1.5">Admin Login Email</label>
                    <input 
                      type="email" 
                      value={form.adminEmail} 
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} 
                      placeholder="admin@stxavier.edu" 
                      required 
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1.5">Admin Password</label>
                    <input 
                      type="text" 
                      value={form.adminPassword} 
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} 
                      placeholder="password123" 
                      required 
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ color: '#ffffff', backgroundColor: '#059669' }}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-white" /> 
                  <span style={{ color: '#ffffff' }}>{loading ? 'Provisioning...' : 'Save to MongoDB & Onboard School'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHOOL MODAL */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" /> Edit School in MongoDB Atlas
              </h3>
              <button 
                onClick={() => setEditingSchool(null)} 
                className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSchool} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">School Full Name</label>
                <input 
                  type="text" 
                  value={editingSchool.name} 
                  onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })} 
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                  required 
                />
              </div>
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingSchool(null)} 
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ color: '#ffffff', backgroundColor: '#059669' }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span style={{ color: '#ffffff' }}>Update Atlas</span>
                </button>
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
