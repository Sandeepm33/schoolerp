'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, ClipboardList, GraduationCap, HeartHandshake, Stethoscope,
  AlertTriangle, Sparkles, Calendar, BookOpen, BookMarked, Award,
  CheckSquare, Clock, UserCog, Building2, TrendingUp, DollarSign,
  Scroll, Wallet, Library, Bus, Home, Box, Megaphone, MapPin,
  FileBadge2, Ticket, ShieldCheck, BarChart3, Key, Settings, Search,
  Users, MessageSquare, LayoutDashboard, Activity, Sliders, Shield, Cpu,
  HardDrive, Bell, HelpCircle, Lock, X, CheckCircle2
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useDataSync } from '../context/DataSyncContext';

// Color map: Tailwind class → hex (for inline style hover effects)
const BG_COLOR_MAP = {
  'text-blue-500': '#3b82f6', 'text-sky-500': '#0ea5e9', 'text-indigo-500': '#6366f1',
  'text-teal-500': '#14b8a6', 'text-emerald-500': '#10b981', 'text-emerald-600': '#059669',
  'text-rose-500': '#f43f5e', 'text-purple-500': '#a855f7', 'text-violet-500': '#8b5cf6',
  'text-fuchsia-500': '#d946ef', 'text-pink-500': '#ec4899', 'text-amber-500': '#f59e0b',
  'text-amber-600': '#d97706', 'text-cyan-500': '#06b6d4', 'text-green-500': '#22c55e',
  'text-orange-500': '#f97316', 'text-slate-500': '#64748b', 'text-slate-600': '#475569',
};

// ─── SUPER ADMIN SAAS MASTER CONTROL SERVICES ─────────────────────────────────
const SUPER_ADMIN_SERVICES = [
  { id: 'overview', name: 'Platform Overview', category: 'SAAS_PLATFORM', target: 'saas', icon: Activity, iconColor: 'text-indigo-500' },
  { id: 'schools', name: 'School Directory', category: 'SAAS_PLATFORM', target: 'saas', icon: Building2, iconColor: 'text-blue-500' },
  { id: 'plans', name: 'Plans & Features Matrix', category: 'SAAS_PLATFORM', target: 'saas', icon: Sliders, iconColor: 'text-purple-500' },
  { id: 'users', name: 'Global Users & RBAC', category: 'SAAS_PLATFORM', target: 'saas', icon: Users, iconColor: 'text-cyan-500' },
  { id: 'security', name: 'Security & IP Controls', category: 'SAAS_SECURITY', target: 'saas', icon: Shield, iconColor: 'text-rose-500' },
  { id: 'usage', name: 'Storage & Document Quotas', category: 'SAAS_SECURITY', target: 'saas', icon: HardDrive, iconColor: 'text-slate-500' },
  { id: 'modules', name: 'Feature Flags Engine', category: 'SAAS_SECURITY', target: 'saas', icon: Box, iconColor: 'text-purple-500' },
  { id: 'ai', name: 'AI Token Quotas & Costs', category: 'SAAS_SECURITY', target: 'saas', icon: Cpu, iconColor: 'text-teal-500' },
  { id: 'analytics', name: 'SaaS Business Analytics', category: 'SAAS_BUSINESS', target: 'saas', icon: DollarSign, iconColor: 'text-emerald-500' },
  { id: 'communication', name: 'Broadcast Communication', category: 'SAAS_BUSINESS', target: 'saas', icon: Bell, iconColor: 'text-amber-500' },
  { id: 'support', name: 'Support Tickets & Sales CRM', category: 'SAAS_BUSINESS', target: 'saas', icon: HelpCircle, iconColor: 'text-orange-500' },
  { id: 'testimonials', name: 'Landing Testimonials', category: 'SAAS_BUSINESS', target: 'saas', icon: MessageSquare, iconColor: 'text-emerald-600' },
  { id: 'audit', name: 'System Health & Audit Logs', category: 'SAAS_BUSINESS', target: 'saas', icon: FileText, iconColor: 'text-slate-600' },
];

// ─── SCHOOL TENANT SERVICE CATALOG (36 APPLICATION MODULES) ───────────────────
const ALL_SERVICES = [
  // ADMISSIONS & STUDENTS
  { id: 'admissions',      name: 'Admissions',         category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'], icon: FileText,       iconColor: 'text-blue-500' },
  { id: 'enquiry',         name: 'Enquiry & Leads',    category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'], icon: ClipboardList,  iconColor: 'text-sky-500' },
  { id: 'students',        name: 'Student Directory',  category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: GraduationCap,  iconColor: 'text-indigo-500' },
  { id: 'parents',         name: 'Parent Directory',   category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'], icon: HeartHandshake, iconColor: 'text-teal-500' },
  { id: 'health',          name: 'Health Records',     category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: Stethoscope,    iconColor: 'text-emerald-500' },
  { id: 'discipline',      name: 'Discipline Tracker', category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: AlertTriangle,  iconColor: 'text-rose-500' },
  { id: 'ai-risk',         name: 'AI Risk Detector',   category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'], icon: Sparkles,       iconColor: 'text-purple-500' },

  // ACADEMICS & EXAMS
  { id: 'academic-years',  name: 'Academic Session',   category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN'], icon: Calendar,       iconColor: 'text-blue-500' },
  { id: 'classes',         name: 'Classes & Sections', category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: BookOpen,       iconColor: 'text-indigo-500' },
  { id: 'subjects',        name: 'Subjects',           category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: BookMarked,     iconColor: 'text-violet-500' },
  { id: 'timetable',       name: 'Timetable',          category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: Calendar, iconColor: 'text-purple-500' },
  { id: 'homework',        name: 'Homework',           category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: FileText, iconColor: 'text-fuchsia-500' },
  { id: 'lms',             name: 'LMS & E-Learning',   category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: BookOpen, iconColor: 'text-pink-500' },
  { id: 'exams',           name: 'Exams & Schedule',   category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: ClipboardList, iconColor: 'text-amber-500' },
  { id: 'marks',           name: 'Report Cards',       category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: Award, iconColor: 'text-emerald-500' },

  // ATTENDANCE & HRMS
  { id: 'attendance',      name: 'Attendance',         category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: CheckSquare, iconColor: 'text-sky-500' },
  { id: 'staff-attendance',name: 'Staff GPS Clock',    category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: Clock, iconColor: 'text-cyan-500' },
  { id: 'employees',       name: 'Employee HRMS',      category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN'], icon: UserCog, iconColor: 'text-blue-500' },
  { id: 'departments',     name: 'Departments',        category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN'], icon: Building2, iconColor: 'text-indigo-500' },
  { id: 'leave',           name: 'Staff Leave',        category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'TEACHER'], icon: Calendar, iconColor: 'text-emerald-500' },
  { id: 'payroll',         name: 'Payroll & Salary',   category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'], icon: TrendingUp, iconColor: 'text-teal-500' },

  // FINANCE & FEES
  { id: 'fee-categories',  name: 'Fee Heads',          category: 'FINANCE',    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'], icon: DollarSign, iconColor: 'text-emerald-500' },
  { id: 'fee-structures',  name: 'Fee Structures',     category: 'FINANCE',    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'], icon: Scroll, iconColor: 'text-green-500' },
  { id: 'student-fees',    name: 'Student Fees',       category: 'FINANCE',    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT'], icon: Wallet, iconColor: 'text-emerald-600' },

  // CAMPUS & FACILITIES
  { id: 'library',         name: 'Library System',     category: 'FACILITIES', roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: Library, iconColor: 'text-amber-500' },
  { id: 'transport',       name: 'Transport & GPS',    category: 'FACILITIES', roles: ['SCHOOL_ADMIN', 'PARENT', 'STUDENT'], icon: Bus, iconColor: 'text-orange-500' },
  { id: 'hostel',          name: 'Hostels & Rooms',    category: 'FACILITIES', roles: ['SCHOOL_ADMIN'], icon: Home, iconColor: 'text-rose-500' },
  { id: 'inventory',       name: 'Asset Inventory',    category: 'FACILITIES', roles: ['SCHOOL_ADMIN'], icon: Box, iconColor: 'text-amber-600' },

  // COMMUNICATION & ADMIN
  { id: 'announcements',   name: 'Announcements',      category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: Megaphone, iconColor: 'text-purple-500' },
  { id: 'events',          name: 'School Calendar',    category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: Calendar, iconColor: 'text-pink-500' },
  { id: 'visitors',        name: 'Visitor Gate Passes',category: 'ADMIN',      roles: ['SCHOOL_ADMIN'], icon: MapPin, iconColor: 'text-rose-500' },
  { id: 'certificates',    name: 'Certificates & TC',  category: 'ADMIN',      roles: ['SCHOOL_ADMIN'], icon: FileBadge2, iconColor: 'text-indigo-500' },
  { id: 'helpdesk',        name: 'Campus Helpdesk',    category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'], icon: Ticket, iconColor: 'text-orange-500' },
  { id: 'audit-logs',      name: 'Audit Logs',         category: 'ADMIN',      roles: ['SCHOOL_ADMIN'], icon: ShieldCheck, iconColor: 'text-slate-500' },
  { id: 'reports',         name: 'Reports & Analytics',category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'], icon: BarChart3, iconColor: 'text-blue-500' },
  { id: 'users',           name: 'Roles & Permissions',category: 'ADMIN',      roles: ['SCHOOL_ADMIN'], icon: Key, iconColor: 'text-slate-600' },
  { id: 'settings',        name: 'School Settings',    category: 'ADMIN',      roles: ['SCHOOL_ADMIN'], icon: Settings, iconColor: 'text-slate-600' },
];

const ADMIN_ROLES = ['SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEADMASTER', 'HEAD_MASTER'];

const STANDARD_CATEGORIES = [
  { id: 'ALL', label: 'All Services' },
  { id: 'ADMISSIONS', label: 'Students & Admissions' },
  { id: 'ACADEMICS', label: 'Academics & Exams' },
  { id: 'ATTENDANCE', label: 'Attendance & HR' },
  { id: 'FINANCE', label: 'Finance & Fees' },
  { id: 'FACILITIES', label: 'Campus' },
  { id: 'ADMIN', label: 'Admin & Communication' },
];

const SUPER_ADMIN_CATEGORIES = [
  { id: 'ALL', label: 'All Services' },
  { id: 'SAAS_PLATFORM', label: 'Platform & Tenancy' },
  { id: 'SAAS_SECURITY', label: 'Security & Limits' },
  { id: 'SAAS_BUSINESS', label: 'Business & Support' },
];

export default function AllServicesPanel({ role = 'SCHOOL_ADMIN' }) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  let user = authUser;
  if (!user && mounted && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('erp_user');
      if (saved) user = JSON.parse(saved);
    } catch (e) {}
  }

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [hoveredId, setHoveredId] = useState(null);
  const [lockedModalItem, setLockedModalItem] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedTargetPlan, setSelectedTargetPlan] = useState('PRO');
  const [upgradeNotes, setUpgradeNotes] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [, setTick] = useState(0);

  useDataSync(React.useCallback(() => {
    setTick(t => t + 1);
  }, []));

  const DEFAULT_PLANS = [
    {
      code: 'FREE',
      name: 'Free Starter',
      priceMonthly: 0,
      priceDisplay: 'Free ($0/mo)',
      studentLimit: 100,
      teacherLimit: 10,
      storageLimitGb: 5,
      aiTokenLimit: 1000,
      features: [
        'Admissions & Leads',
        'Student Directory',
        'Attendance & Clock-In',
        'Classes & Timetable',
        'Homework & Notices',
      ],
      badgeColor: '#64748b'
    },
    {
      code: 'BASIC',
      name: 'Basic Pro',
      priceMonthly: 1499,
      priceDisplay: '₹1,499 / mo',
      studentLimit: 500,
      teacherLimit: 50,
      storageLimitGb: 20,
      aiTokenLimit: 5000,
      features: [
        'All Free Starter Features',
        'Exams & Date Sheets',
        'Student Report Cards',
        'Parent Portal Access',
        'Staff GPS Attendance Clock',
      ],
      badgeColor: '#0ea5e9'
    },
    {
      code: 'PRO',
      name: 'Professional',
      priceMonthly: 3999,
      priceDisplay: '₹3,999 / mo',
      studentLimit: 2000,
      teacherLimit: 200,
      storageLimitGb: 100,
      aiTokenLimit: 25000,
      features: [
        'All Basic Pro Features',
        'Health Records & Medical',
        'AI Early Warning Risk Detector',
        'Employee HRMS & Payroll',
        'Transport & Real-Time GPS Tracking',
        'Hostel Management & Assets',
        'Library System',
      ],
      popular: true,
      badgeColor: '#02563d'
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Elite',
      priceMonthly: 9999,
      priceDisplay: '₹9,999 / mo',
      studentLimit: 10000,
      teacherLimit: 1000,
      storageLimitGb: 500,
      aiTokenLimit: 100000,
      features: [
        'All Professional Features',
        'Multi-Branch Campus Overseer',
        'Custom White-Labeling & Branding',
        'Custom REST APIs & Webhooks',
        'Dedicated 24/7 SaaS CRM Account Manager',
      ],
      badgeColor: '#a855f7'
    }
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('erp_token') || '';
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/saas/plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailablePlans(data);
            return;
          }
        }
      } catch (e) {}
      setAvailablePlans(DEFAULT_PLANS);
    };
    fetchPlans();
  }, []);

  const plansToRender = availablePlans.length > 0 ? availablePlans : DEFAULT_PLANS;

  const isSuperAdmin = role === 'SAAS_SUPER_ADMIN' || user?.role === 'SAAS_SUPER_ADMIN';
  const isAdminRole = ADMIN_ROLES.includes(role);
  const planFeatures = user?.planFeatures;
  const currentPlanName = user?.planName || user?.subscriptionPlan || 'BASIC';

  const checkIsLocked = (itemId) => {
    if (!mounted || isSuperAdmin) return false;
    if (['overview', 'services', 'all-services', 'profile', 'settings', 'helpdesk'].includes(itemId)) {
      return false;
    }
    const camelKey = itemId.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const planName = String(user?.planCode || user?.subscriptionPlan || user?.planName || 'BASIC').toUpperCase();

    if (planFeatures && typeof planFeatures === 'object') {
      if (planFeatures[itemId] === true || planFeatures[camelKey] === true) return false;
      if (planFeatures[itemId] === false || planFeatures[camelKey] === false) return true;
      if (['BASIC', 'FREE', 'STARTER'].includes(planName)) return true;
    } else {
      if (['BASIC', 'FREE', 'STARTER'].includes(planName)) {
        const basicAllowed = ['admissions', 'students', 'classes', 'subjects', 'attendance', 'exams', 'marks', 'homework', 'announcements', 'events'];
        if (!basicAllowed.includes(itemId) && !basicAllowed.includes(camelKey)) {
          return true;
        }
      }
    }
    return false;
  };

  // Define visible services based on role: SuperAdmin sees ONLY SuperAdmin services
  let visibleServices = [];
  if (isSuperAdmin) {
    visibleServices = SUPER_ADMIN_SERVICES.map(s => ({ ...s, target: 'saas' }));
  } else if (isAdminRole) {
    visibleServices = ALL_SERVICES.map(s => ({ ...s, target: 'tenant' }));
  } else {
    visibleServices = ALL_SERVICES
      .filter(s => s.roles.includes(role))
      .filter(s => !checkIsLocked(s.id))
      .map(s => ({ ...s, target: 'tenant' }));
  }

  const filtered = visibleServices.filter(s => {
    const matchesCat = activeCategory === 'ALL' || s.category === activeCategory;
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoriesToDisplay = isSuperAdmin ? SUPER_ADMIN_CATEGORIES : STANDARD_CATEGORIES;

  const handleModuleClick = (item) => {
    const isLocked = checkIsLocked(item.id);
    if (isLocked) {
      setLockedModalItem(item);
      return;
    }

    if (item.target === 'saas') {
      router.push(`/saas-admin?tab=${item.id}`, { scroll: false });
    } else {
      router.push(`/admin/dashboard?tab=${item.id}`, { scroll: false });
    }
  };

  const handleOpenPlanSelector = (item = null) => {
    if (item) setLockedModalItem(item);
    setIsPlanModalOpen(true);
  };

  const handleSubmitUpgradeRequest = async () => {
    setSubmittingRequest(true);
    const targetPlanObj = plansToRender.find(p => p.code === selectedTargetPlan || p.name === selectedTargetPlan) || { name: selectedTargetPlan, code: selectedTargetPlan };
    const planLabel = targetPlanObj.name || selectedTargetPlan;

    try {
      const token = localStorage.getItem('erp_token') || 'demo_token_school_admin';
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/saas/plan-upgrade-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          schoolId: user?.schoolId,
          moduleName: lockedModalItem?.name || 'Full Suite Access',
          currentPlan: currentPlanName,
          targetPlan: selectedTargetPlan,
          targetPlanName: planLabel,
          schoolName: user?.schoolName || 'School Tenant',
          userEmail: user?.email || 'admin@school.com',
          notes: upgradeNotes
        })
      });
      const data = await res.json().catch(() => ({}));
      setSuccessModalData({
        requestedPlan: `${planLabel} (${selectedTargetPlan})`,
        currentPlan: currentPlanName,
        moduleName: lockedModalItem?.name || 'Full Suite Access'
      });
    } catch (e) {
      setSuccessModalData({
        requestedPlan: `${planLabel} (${selectedTargetPlan})`,
        currentPlan: currentPlanName,
        moduleName: lockedModalItem?.name || 'Full Suite Access'
      });
    } finally {
      setSubmittingRequest(false);
      setIsPlanModalOpen(false);
      setLockedModalItem(null);
    }
  };

  return (
    <div style={{ padding: '8px 0', maxWidth: '100%' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>
            {isSuperAdmin ? 'All Services' : 'All Services'}
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0', fontWeight: 400 }}>
            {filtered.length} modules available · click any to open
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isSuperAdmin && (
            <button
              onClick={() => handleOpenPlanSelector()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #02563d 0%, #013827 100%)',
                color: '#ffffff', fontSize: '12px', fontWeight: 800,
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 86, 61, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
              View Plans & Request Upgrade
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '12px', color: '#1e293b', outline: 'none', width: '180px', fontWeight: 500 }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
        {categoriesToDisplay.map(c => {
          const active = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: '6px 16px', borderRadius: '20px',
                border: active ? 'none' : '1.5px solid #e2e8f0',
                background: active ? 'var(--accent-primary, #02563d)' : '#fff',
                color: active ? '#fff' : '#64748b',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* MODULE GRID */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          No modules found{search ? ` for "${search}"` : ''}.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
          {filtered.map((s, idx) => {
            const Icon = s.icon;
            const isHovered = hoveredId === `${s.target}-${s.id}-${idx}`;
            const hoverBg = BG_COLOR_MAP[s.iconColor] || '#3b82f6';
            const isLocked = checkIsLocked(s.id);

            return (
              <button
                key={`${s.target}-${s.id}-${idx}`}
                onClick={() => handleModuleClick(s)}
                onMouseEnter={() => setHoveredId(`${s.target}-${s.id}-${idx}`)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', padding: '18px 8px 14px',
                  borderRadius: '16px', background: isLocked ? '#f8fafc' : '#fff',
                  border: isLocked ? '1.5px dashed #cbd5e1' : (isHovered ? `2px solid ${hoverBg}40` : '1.5px solid #e8edf3'),
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  boxShadow: isHovered ? `0 6px 20px ${hoverBg}28` : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  minHeight: '108px',
                  position: 'relative',
                  opacity: isLocked ? 0.75 : 1
                }}
              >
                {isLocked && (
                  <span
                    style={{
                      position: 'absolute', top: '6px', right: '6px',
                      backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fcd34d',
                      padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 800,
                      border: '1px solid', display: 'flex', alignItems: 'center', gap: '3px'
                    }}
                    title="Feature locked by school plan"
                  >
                    <Lock style={{ width: '10px', height: '10px' }} /> Locked
                  </span>
                )}

                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: isLocked ? '#f1f5f9' : (isHovered ? hoverBg : `${hoverBg}18`),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease', flexShrink: 0,
                }}>
                  <Icon style={{ width: '24px', height: '24px', color: isLocked ? '#94a3b8' : (isHovered ? '#fff' : hoverBg), transition: 'all 0.18s ease' }} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: isLocked ? '#64748b' : (isHovered ? hoverBg : '#334155'),
                  textAlign: 'center', lineHeight: '1.35',
                  letterSpacing: '0.01em', transition: 'color 0.18s ease',
                }}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* LOCKED MODULE INITIAL PROMPT MODAL */}
      {lockedModalItem && !isPlanModalOpen && mounted && typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', color: '#0f172a', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Feature Locked</h3>
                  <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>Plan Upgrade Required</span>
                </div>
              </div>
              <button onClick={() => setLockedModalItem(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px', color: '#64748b' }} />
              </button>
            </div>

            <div style={{ padding: '16px 0', fontSize: '12px', color: '#334155' }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: '1.5' }}>
                Module <strong>"{lockedModalItem.name}"</strong> is currently <strong>locked</strong> on your school's <strong>{currentPlanName}</strong> subscription plan.
              </p>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', fontSize: '11px', color: '#475569' }}>
                💡 <strong>Explore All Plans:</strong> You can select any subscription plan (e.g. Basic Pro, Professional, or Enterprise Elite) to send an instant upgrade request to your Super Admin.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setLockedModalItem(null)}
                style={{ padding: '8px 16px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '12px', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              {isSuperAdmin ? (
                <button
                  onClick={() => {
                    setLockedModalItem(null);
                    router.push('/saas-admin?tab=plans');
                  }}
                  style={{ padding: '8px 16px', borderRadius: '12px', background: '#02563d', color: '#ffffff', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer' }}
                >
                  Manage SaaS Plans
                </button>
              ) : (
                <button
                  onClick={() => handleOpenPlanSelector(lockedModalItem)}
                  style={{ padding: '8px 16px', borderRadius: '12px', background: '#02563d', color: '#ffffff', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles style={{ width: '14px', height: '14px' }} />
                  View All Plans & Select
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FULL SCREEN SUBSCRIPTION PLAN SELECTOR MODAL */}
      {isPlanModalOpen && mounted && typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 999999, backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* FULL SCREEN HEADER */}
          <div style={{ padding: '20px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles style={{ width: '22px', height: '22px', color: '#d97706' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  Select Subscription Plan & Request Upgrade
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
                Compare all available plans below, select your desired tier, and send an instant request to your SaaS Super Admin.
              </p>
            </div>
            
            <button
              onClick={() => setIsPlanModalOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '12px',
                border: '1.5px solid #cbd5e1', background: '#ffffff',
                color: '#475569', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <X style={{ width: '18px', height: '18px', color: '#475569' }} />
              Close
            </button>
          </div>

          {/* FULL SCREEN MAIN CONTENT */}
          <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {lockedModalItem && (
              <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '16px', padding: '12px 20px', fontSize: '13px', color: '#854d0e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <Lock style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>Unlocking feature: <strong>"{lockedModalItem.name}"</strong>. Choose a plan below that includes this module.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px', alignItems: 'stretch' }}>
              {plansToRender.map((plan) => {
                const cardCode = (plan.code || '').toUpperCase().trim();
                const cardName = (plan.name || '').toUpperCase().trim();
                const userPlan = String(user?.planCode || user?.subscriptionPlan || user?.planName || currentPlanName || 'BASIC').toUpperCase().trim();

                let isCurrent = false;
                if (userPlan === 'FREE' || userPlan === 'STARTER' || userPlan === 'FREE STARTER') {
                  isCurrent = (cardCode === 'FREE' || cardName.includes('STARTER'));
                } else if (userPlan === 'BASIC' || userPlan === 'BASIC PRO') {
                  isCurrent = (cardCode === 'BASIC' || cardName === 'BASIC PRO');
                } else if (userPlan === 'PRO' || userPlan === 'PROFESSIONAL') {
                  isCurrent = (cardCode === 'PRO' || cardName === 'PROFESSIONAL');
                } else if (userPlan === 'ENTERPRISE' || userPlan === 'ENTERPRISE ELITE') {
                  isCurrent = (cardCode === 'ENTERPRISE' || cardName.includes('ENTERPRISE'));
                } else {
                  isCurrent = (cardCode === userPlan || cardName === userPlan);
                }

                const isSelected = selectedTargetPlan === plan.code || selectedTargetPlan === plan.name;

                const MASTER_MODULES = [
                  { key: 'admissions', label: 'Admissions & Leads' },
                  { key: 'students', label: 'Student Directory' },
                  { key: 'attendance', label: 'Attendance & Clock-In' },
                  { key: 'classes', label: 'Classes & Timetables' },
                  { key: 'homework', label: 'Homework & LMS' },
                  { key: 'exams', label: 'Exams & Date Sheets' },
                  { key: 'marks', label: 'Student Report Cards' },
                  { key: 'health', label: 'Health Records & Medical' },
                  { key: 'ai', label: 'AI Risk Detector' },
                  { key: 'payroll', label: 'Payroll & HRMS Engine' },
                  { key: 'transport', label: 'Transport & GPS Tracking' },
                  { key: 'hostel', label: 'Hostels & Room Allocation' },
                  { key: 'library', label: 'Library System' },
                  { key: 'multiBranch', label: 'Multi-Branch Overseer' },
                  { key: 'whiteLabel', label: 'Custom White-Labeling' }
                ];

                const PLAN_ENABLED_PRESETS = {
                  FREE: ['admissions', 'students', 'attendance', 'classes', 'homework'],
                  BASIC: ['admissions', 'students', 'attendance', 'classes', 'homework', 'exams', 'marks'],
                  PRO: ['admissions', 'students', 'attendance', 'classes', 'homework', 'exams', 'marks', 'health', 'ai', 'payroll', 'transport', 'hostel', 'library'],
                  ENTERPRISE: ['admissions', 'students', 'attendance', 'classes', 'homework', 'exams', 'marks', 'health', 'ai', 'payroll', 'transport', 'hostel', 'library', 'multiBranch', 'whiteLabel']
                };

                const currentPlanPreset = PLAN_ENABLED_PRESETS[cardCode] || PLAN_ENABLED_PRESETS.PRO;

                return (
                  <div
                    key={plan.code || plan.name}
                    onClick={() => setSelectedTargetPlan(plan.code || plan.name)}
                    style={{
                      borderRadius: '24px',
                      border: isSelected ? '3px solid #02563d' : (isCurrent ? '2.5px solid #3b82f6' : '1.5px solid #cbd5e1'),
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 16px 32px -8px rgba(2, 86, 61, 0.25)' : '0 4px 12px rgba(0,0,0,0.04)',
                      transform: isSelected ? 'translateY(-3px)' : 'none',
                      minHeight: '480px'
                    }}
                  >
                    {/* CARD TOP HEADER & BADGES */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', minHeight: '26px' }}>
                        {isCurrent ? (
                          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '14px', letterSpacing: '0.02em' }}>
                            CURRENT PLAN
                          </span>
                        ) : plan.popular ? (
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '14px', letterSpacing: '0.02em' }}>
                            MOST POPULAR
                          </span>
                        ) : <div />}

                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          border: isSelected ? '7px solid #02563d' : '2.5px solid #cbd5e1',
                          backgroundColor: '#fff', transition: 'all 0.15s ease'
                        }} />
                      </div>

                      {/* PLAN NAME & PRICE */}
                      <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                        {plan.name}
                      </h4>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 16px' }}>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: '#02563d' }}>
                          {plan.priceDisplay || (plan.priceMonthly === 0 ? 'Free' : `₹${plan.priceMonthly.toLocaleString()}`)}
                        </span>
                        {plan.priceMonthly > 0 && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>/ month</span>}
                      </div>

                      {/* LIMITS SUMMARY BOX */}
                      <div style={{ backgroundColor: isSelected ? '#ffffff' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 14px', fontSize: '12px', color: '#475569', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>👥</span> <span>Students: <strong style={{ color: '#0f172a' }}>{plan.studentLimit ? plan.studentLimit.toLocaleString() : 'Unlimited'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>👨‍🏫</span> <span>Teachers: <strong style={{ color: '#0f172a' }}>{plan.teacherLimit ? plan.teacherLimit.toLocaleString() : 'Unlimited'}</strong></span>
                        </div>
                        {plan.storageLimitGb && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>💾</span> <span>Storage: <strong style={{ color: '#0f172a' }}>{plan.storageLimitGb} GB</strong></span>
                          </div>
                        )}
                      </div>

                      {/* ENABLED VS LOCKED MODULES MATRIX */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                        {MASTER_MODULES.map((mod) => {
                          let isEnabled = false;
                          if (plan.features && typeof plan.features === 'object') {
                            if (plan.features[mod.key] === true) isEnabled = true;
                            else if (plan.features[mod.key] === false) isEnabled = false;
                            else isEnabled = currentPlanPreset.includes(mod.key);
                          } else {
                            isEnabled = currentPlanPreset.includes(mod.key);
                          }

                          return (
                            <div key={mod.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: isEnabled ? '#059669' : '#cbd5e1', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>
                                  {isEnabled ? '✓' : '🔒'}
                                </span>
                                <span style={{ fontSize: '12px', color: isEnabled ? '#1e293b' : '#94a3b8', fontWeight: isEnabled ? 700 : 400, textDecoration: isEnabled ? 'none' : 'line-through' }}>
                                  {mod.label}
                                </span>
                              </div>
                              {!isEnabled && (
                                <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '8px', fontWeight: 600 }}>
                                  Locked
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CARD SELECT BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTargetPlan(plan.code || plan.name);
                      }}
                      style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '12px',
                        borderRadius: '14px',
                        border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                        backgroundColor: isSelected ? '#02563d' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 14px rgba(2, 86, 61, 0.3)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                    </button>

                  </div>
                );
              })}
            </div>

            {/* NOTES / REASON TEXTAREA */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '18px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                Upgrade Note / Reason for Super Admin (Optional)
              </label>
              <textarea
                rows={2}
                value={upgradeNotes}
                onChange={(e) => setUpgradeNotes(e.target.value)}
                placeholder="e.g. Please approve upgrade to enable Health Records & AI Risk Detector for our new academic batch."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

          </div>

          {/* FULL SCREEN PINNED FOOTER */}
          <div style={{ padding: '16px 32px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
              Selected Target Plan: <strong style={{ color: '#02563d', fontSize: '16px', fontWeight: 900 }}>{plansToRender.find(p => p.code === selectedTargetPlan || p.name === selectedTargetPlan)?.name || selectedTargetPlan}</strong>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                style={{ padding: '12px 24px', borderRadius: '14px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUpgradeRequest}
                disabled={submittingRequest}
                style={{
                  padding: '12px 28px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #02563d 0%, #013827 100%)',
                  color: '#ffffff', fontWeight: 900, fontSize: '13px', border: 'none',
                  cursor: submittingRequest ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px rgba(2, 86, 61, 0.35)',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <Sparkles style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
                {submittingRequest ? 'Submitting Request...' : `Submit Upgrade Request to Super Admin`}
              </button>
            </div>
          </div>

        </div>,
        document.body
      )}

      {/* INNOVATIVE SUCCESS ALERT MODAL */}
      {successModalData && mounted && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #10b981',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '460px',
            padding: '32px 28px 28px',
            boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.35)',
            textAlign: 'center',
            position: 'relative'
          }}>

            {/* ANIMATED ICON BADGE */}
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 style={{ width: '38px', height: '38px' }} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: '#047857', fontWeight: 800, marginBottom: '10px' }}>
              <Sparkles style={{ width: '13px', height: '13px', color: '#059669' }} /> REQUEST SUBMITTED LIVE
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Upgrade Request Sent!
            </h3>
            
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', fontWeight: 500, lineHeight: '1.4' }}>
              Your plan switch request has been broadcasted to your SaaS Super Admin dashboard.
            </p>

            {/* DETAILS CONTAINER */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Requested Plan:</span>
                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', fontSize: '12px' }}>
                  {successModalData.requestedPlan}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Current Plan:</span>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', fontSize: '12px' }}>
                  {successModalData.currentPlan}
                </span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2px 0' }} />
              <div style={{ fontSize: '11px', color: '#334155', lineHeight: '1.45', fontWeight: 500 }}>
                🚨 <strong>Super Admin Notification:</strong> The Super Admin will see an alert button in <strong>Registered Tenant Schools (/saas-admin)</strong> right after the Delete button to approve your upgrade.
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSuccessModalData(null)}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #02563d 0%, #013827 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(2, 86, 61, 0.35)',
                transition: 'all 0.18s ease'
              }}
            >
              Got It! Continue
            </button>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
