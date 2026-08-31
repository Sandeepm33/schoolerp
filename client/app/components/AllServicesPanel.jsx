'use client';

import React, { useState } from 'react';
import {
  FileText, ClipboardList, GraduationCap, HeartHandshake, Stethoscope,
  AlertTriangle, Sparkles, Calendar, BookOpen, BookMarked, Award,
  CheckSquare, Clock, UserCog, Building2, TrendingUp, DollarSign,
  Scroll, Wallet, Library, Bus, Home, Box, Megaphone, MapPin,
  FileBadge2, Ticket, ShieldCheck, BarChart3, Key, Settings, Search,
  Users, MessageSquare, LayoutDashboard
} from 'lucide-react';

import { useRouter } from 'next/navigation';

// Color map: Tailwind class → hex (for inline style hover effects)
const BG_COLOR_MAP = {
  'text-blue-500': '#3b82f6', 'text-sky-500': '#0ea5e9', 'text-indigo-500': '#6366f1',
  'text-teal-500': '#14b8a6', 'text-emerald-500': '#10b981', 'text-emerald-600': '#059669',
  'text-rose-500': '#f43f5e', 'text-purple-500': '#a855f7', 'text-violet-500': '#8b5cf6',
  'text-fuchsia-500': '#d946ef', 'text-pink-500': '#ec4899', 'text-amber-500': '#f59e0b',
  'text-amber-600': '#d97706', 'text-cyan-500': '#06b6d4', 'text-green-500': '#22c55e',
  'text-orange-500': '#f97316', 'text-slate-500': '#64748b', 'text-slate-600': '#475569',
};

// ─── MASTER SERVICE CATALOG ───────────────────────────────────────────────────
// SCHOOL_ADMIN bypasses role filter and always sees ALL services.
const ALL_SERVICES = [
  // ADMISSIONS & STUDENTS
  { id: 'admissions',      name: 'Admissions',         category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'],                                     icon: FileText,       iconColor: 'text-blue-500' },
  { id: 'enquiry',         name: 'Enquiry & Leads',    category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'],                                     icon: ClipboardList,  iconColor: 'text-sky-500' },
  { id: 'students',        name: 'Student Directory',  category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: GraduationCap,  iconColor: 'text-indigo-500' },
  { id: 'parents',         name: 'Parent Directory',   category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'],                                     icon: HeartHandshake, iconColor: 'text-teal-500' },
  { id: 'health',          name: 'Health Records',     category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: Stethoscope,    iconColor: 'text-emerald-500' },
  { id: 'discipline',      name: 'Discipline Tracker', category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: AlertTriangle,  iconColor: 'text-rose-500' },
  { id: 'ai-risk',         name: 'AI Risk Detector',   category: 'ADMISSIONS', roles: ['SCHOOL_ADMIN'],                                     icon: Sparkles,       iconColor: 'text-purple-500' },

  // ACADEMICS & EXAMS
  { id: 'academic-years',  name: 'Academic Session',   category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN'],                                     icon: Calendar,       iconColor: 'text-blue-500' },
  { id: 'classes',         name: 'Classes & Sections', category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: BookOpen,       iconColor: 'text-indigo-500' },
  { id: 'subjects',        name: 'Subjects',           category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: BookMarked,     iconColor: 'text-violet-500' },
  { id: 'timetable',       name: 'Timetable',          category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: Calendar,       iconColor: 'text-purple-500' },
  { id: 'homework',        name: 'Homework',           category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: FileText,       iconColor: 'text-fuchsia-500' },
  { id: 'lms',             name: 'LMS & E-Learning',   category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: BookOpen,       iconColor: 'text-pink-500' },
  { id: 'exams',           name: 'Exams & Schedule',   category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: ClipboardList,  iconColor: 'text-amber-500' },
  { id: 'marks',           name: 'Report Cards',       category: 'ACADEMICS',  roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: Award,          iconColor: 'text-emerald-500' },

  // ATTENDANCE & HRMS
  { id: 'attendance',      name: 'Attendance',         category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: CheckSquare,    iconColor: 'text-sky-500' },
  { id: 'staff-attendance',name: 'Staff GPS Clock',    category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: Clock,          iconColor: 'text-cyan-500' },
  { id: 'employees',       name: 'Employee HRMS',      category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN'],                                     icon: UserCog,        iconColor: 'text-blue-500' },
  { id: 'departments',     name: 'Departments',        category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN'],                                     icon: Building2,      iconColor: 'text-indigo-500' },
  { id: 'leave',           name: 'Staff Leave',        category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'TEACHER'],                          icon: Calendar,       iconColor: 'text-emerald-500' },
  { id: 'payroll',         name: 'Payroll & Salary',   category: 'ATTENDANCE', roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],                       icon: TrendingUp,     iconColor: 'text-teal-500' },

  // FINANCE & FEES
  { id: 'fee-categories',  name: 'Fee Heads',          category: 'FINANCE',    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],                       icon: DollarSign,     iconColor: 'text-emerald-500' },
  { id: 'fee-structures',  name: 'Fee Structures',     category: 'FINANCE',    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],                       icon: Scroll,         iconColor: 'text-green-500' },
  { id: 'student-fees',    name: 'Student Fees',       category: 'FINANCE',    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT'],  icon: Wallet,         iconColor: 'text-emerald-600' },

  // CAMPUS & FACILITIES
  { id: 'library',         name: 'Library System',     category: 'FACILITIES', roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: Library,        iconColor: 'text-amber-500' },
  { id: 'transport',       name: 'Transport & GPS',    category: 'FACILITIES', roles: ['SCHOOL_ADMIN', 'PARENT', 'STUDENT'],                icon: Bus,            iconColor: 'text-orange-500' },
  { id: 'hostel',          name: 'Hostels & Rooms',    category: 'FACILITIES', roles: ['SCHOOL_ADMIN'],                                     icon: Home,           iconColor: 'text-rose-500' },
  { id: 'inventory',       name: 'Asset Inventory',    category: 'FACILITIES', roles: ['SCHOOL_ADMIN'],                                     icon: Box,            iconColor: 'text-amber-600' },

  // COMMUNICATION & ADMIN
  { id: 'announcements',   name: 'Announcements',      category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: Megaphone,      iconColor: 'text-purple-500' },
  { id: 'events',          name: 'School Calendar',    category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: Calendar,       iconColor: 'text-pink-500' },
  { id: 'visitors',        name: 'Visitor Gate Passes',category: 'ADMIN',      roles: ['SCHOOL_ADMIN'],                                     icon: MapPin,         iconColor: 'text-rose-500' },
  { id: 'certificates',    name: 'Certificates & TC',  category: 'ADMIN',      roles: ['SCHOOL_ADMIN'],                                     icon: FileBadge2,     iconColor: 'text-indigo-500' },
  { id: 'helpdesk',        name: 'Campus Helpdesk',    category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],     icon: Ticket,         iconColor: 'text-orange-500' },
  { id: 'audit-logs',      name: 'Audit Logs',         category: 'ADMIN',      roles: ['SCHOOL_ADMIN'],                                     icon: ShieldCheck,    iconColor: 'text-slate-500' },
  { id: 'reports',         name: 'Reports & Analytics',category: 'ADMIN',      roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],                       icon: BarChart3,      iconColor: 'text-blue-500' },
  { id: 'users',           name: 'Roles & Permissions',category: 'ADMIN',      roles: ['SCHOOL_ADMIN'],                                     icon: Key,            iconColor: 'text-slate-600' },
  { id: 'settings',        name: 'School Settings',    category: 'ADMIN',      roles: ['SCHOOL_ADMIN'],                                     icon: Settings,       iconColor: 'text-slate-600' },
];

const ADMIN_ROLES = ['SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEADMASTER', 'HEAD_MASTER'];

// Role → base route
const ROUTE_MAP = {
  SCHOOL_ADMIN: (tab) => `/admin/dashboard?tab=${tab}`,
  PRINCIPAL:    (tab) => `/admin/dashboard?tab=${tab}`,
  VICE_PRINCIPAL:(tab) => `/admin/dashboard?tab=${tab}`,
  HEADMASTER:   (tab) => `/admin/dashboard?tab=${tab}`,
  HEAD_MASTER:  (tab) => `/admin/dashboard?tab=${tab}`,
  TEACHER:      (tab) => `/teacher?tab=${tab}`,
  PARENT:       (tab) => `/parent?tab=${tab}`,
  STUDENT:      (tab) => `/student?tab=${tab}`,
  ACCOUNTANT:   (tab) => `/accountant?tab=${tab}`,
};

const CATEGORIES = [
  { id: 'ALL',        label: 'All Services' },
  { id: 'ADMISSIONS', label: 'Students & Admissions' },
  { id: 'ACADEMICS',  label: 'Academics & Exams' },
  { id: 'ATTENDANCE', label: 'Attendance & HR' },
  { id: 'FINANCE',    label: 'Finance & Fees' },
  { id: 'FACILITIES', label: 'Campus' },
  { id: 'ADMIN',      label: 'Admin & Communication' },
];

export default function AllServicesPanel({ role = 'SCHOOL_ADMIN' }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [hoveredId, setHoveredId] = useState(null);

  const isAdminRole = ADMIN_ROLES.includes(role);

  // Executive leadership roles see ALL services — all other roles see allowed ones
  const visibleServices = isAdminRole
    ? ALL_SERVICES
    : ALL_SERVICES.filter(s => s.roles.includes(role));


  const getRoute = ROUTE_MAP[role] || ROUTE_MAP.SCHOOL_ADMIN;

  const filtered = visibleServices.filter(s => {
    const matchesCat = activeCategory === 'ALL' || s.category === activeCategory;
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Only show category tabs that have visible services
  const visibleCategories = CATEGORIES.filter(c =>
    c.id === 'ALL' || visibleServices.some(s => s.category === c.id)
  );

  return (
    <div style={{ padding: '8px 0', maxWidth: '100%' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>
            All Services
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0', fontWeight: 400 }}>
            {visibleServices.length} modules available · click any to open
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '12px', color: '#1e293b', outline: 'none', width: '200px', fontWeight: 500 }}
          />
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
        {visibleCategories.map(c => {
          const active = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: '6px 16px', borderRadius: '20px',
                border: active ? 'none' : '1.5px solid #e2e8f0',
                background: active ? 'var(--accent-primary, #237dd1)' : '#fff',
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
          {filtered.map(s => {
            const Icon = s.icon;
            const isHovered = hoveredId === s.id;
            const hoverBg = BG_COLOR_MAP[s.iconColor] || '#3b82f6';
            return (
              <button
                key={s.id}
                onClick={() => { router.push(getRoute(s.id), { scroll: false }); }}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', padding: '18px 8px 14px',
                  borderRadius: '16px', background: '#fff',
                  border: isHovered ? `2px solid ${hoverBg}40` : '1.5px solid #e8edf3',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  boxShadow: isHovered ? `0 6px 20px ${hoverBg}28` : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  minHeight: '108px',
                }}
              >
                {/* Soft bg at rest → full color on hover, icon turns white */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: isHovered ? hoverBg : `${hoverBg}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease', flexShrink: 0,
                }}>
                  <Icon style={{ width: '24px', height: '24px', color: isHovered ? '#fff' : hoverBg, transition: 'all 0.18s ease' }} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: isHovered ? hoverBg : '#334155',
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

    </div>
  );
}
