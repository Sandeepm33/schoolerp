'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, Building2, Users, GraduationCap, Calendar, 
  FileText, DollarSign, BookOpen, Clock, Award, Box, 
  LogOut, ShieldCheck, Sliders, Shield, Cpu, HardDrive, Activity,
  Sparkles, Bell, HelpCircle, Key, CheckSquare, Library, Bus, Home,
  Stethoscope, AlertTriangle, Megaphone, Ticket, FileBadge2,
  BarChart3, Settings, HeartHandshake, UserCog, BookMarked,
  Calculator, TrendingUp, MapPin, Scroll, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const themeContext = useTheme();
  const accentColor = themeContext?.currentTheme?.accentPrimary || '#02563d';
  
  const [currentUser, setCurrentUser] = useState(user);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      try {
        const saved = localStorage.getItem('erp_user');
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, [user, pathname]);

  if (pathname === '/login') return null;

  let activeRole = currentUser?.role;
  if (!activeRole) {
    if (pathname.startsWith('/saas-admin')) activeRole = 'SAAS_SUPER_ADMIN';
    else if (pathname.startsWith('/admin')) activeRole = 'SCHOOL_ADMIN';
    else if (pathname.startsWith('/accountant')) activeRole = 'ACCOUNTANT';
    else if (pathname.startsWith('/teacher')) activeRole = 'TEACHER';
    else if (pathname.startsWith('/parent')) activeRole = 'PARENT';
    else if (pathname.startsWith('/student')) activeRole = 'STUDENT';
  }

  const getNavSections = () => {
    switch (activeRole) {
      case 'SAAS_SUPER_ADMIN':
        return [
          { label: 'Platform & Tenancy', items: [
            { label: 'Platform Overview', href: '/saas-admin?tab=overview', tab: 'overview', icon: Activity },
            { label: 'School Directory', href: '/saas-admin?tab=schools', tab: 'schools', icon: Building2 },
            { label: 'Plans & Features Matrix', href: '/saas-admin?tab=plans', tab: 'plans', icon: Sliders },
            { label: 'Global Users & RBAC', href: '/saas-admin?tab=users', tab: 'users', icon: Users },
          ]},
          { label: 'Security & Limits', items: [
            { label: 'Security & IP Controls', href: '/saas-admin?tab=security', tab: 'security', icon: Shield },
            { label: 'Storage & Document Quotas', href: '/saas-admin?tab=usage', tab: 'usage', icon: HardDrive },
            { label: 'Feature Flags Engine', href: '/saas-admin?tab=modules', tab: 'modules', icon: Box },
            { label: 'AI Token Quotas & Costs', href: '/saas-admin?tab=ai', tab: 'ai', icon: Cpu },
          ]},
          { label: 'Business & Support', items: [
            { label: 'SaaS Business Analytics', href: '/saas-admin?tab=analytics', tab: 'analytics', icon: DollarSign },
            { label: 'Broadcast Communication', href: '/saas-admin?tab=communication', tab: 'communication', icon: Bell },
            { label: 'Support Tickets & Sales CRM', href: '/saas-admin?tab=support', tab: 'support', icon: HelpCircle },
            { label: 'System Health & Audit Logs', href: '/saas-admin?tab=audit', tab: 'audit', icon: FileText },
          ]}
        ];

      case 'SCHOOL_ADMIN':
      case 'PRINCIPAL':
      case 'VICE_PRINCIPAL':
      case 'HEADMASTER':
      case 'HEAD_MASTER':
        return [
          { label: '🚀 EXECUTIVE MENU', items: [
            { label: 'Executive Overview', href: '/admin/dashboard?tab=overview', tab: 'overview', icon: LayoutDashboard },
            { label: 'All Services', href: '/admin/dashboard?tab=services', tab: 'services', icon: Box },
            { label: 'Leadership Profile', href: '/admin/dashboard?tab=profile', tab: 'profile', icon: UserCog },
            { label: 'School Settings', href: '/admin/dashboard?tab=settings', tab: 'settings', icon: Settings },
          ]}
        ];


      case 'ACCOUNTANT':
        return [
          { label: 'Finance', items: [
            { label: 'Fee Management', href: '/accountant?tab=fees', tab: 'fees', icon: DollarSign },
            { label: 'All Services', href: '/accountant?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'TEACHER':
        return [
          { label: 'Teaching', items: [
            { label: 'My Timetable', href: '/teacher?tab=timetable', tab: 'timetable', icon: BookOpen },
            { label: 'Mark Attendance', href: '/teacher?tab=attendance', tab: 'attendance', icon: CheckSquare },
            { label: 'Homework & LMS', href: '/teacher?tab=homework', tab: 'homework', icon: Calendar },
            { label: 'All Services', href: '/teacher?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'PARENT':
        return [
          { label: '👨‍👩‍👧 Parent Portal', items: [
            { label: 'Dashboard Overview', href: '/parent?tab=overview', tab: 'overview', icon: LayoutDashboard },
            { label: 'Assigned Homework', href: '/parent?tab=homework', tab: 'homework', icon: BookOpen },
            { label: 'Exam Results', href: '/parent?tab=results', tab: 'results', icon: Award },
            { label: 'Class Timetable', href: '/parent?tab=timetable', tab: 'timetable', icon: Clock },
            { label: 'Live Bus Tracker', href: '/parent?tab=transport', tab: 'transport', icon: Bus },
            { label: 'Attendance Meter', href: '/parent?tab=attendance', tab: 'attendance', icon: Calendar },
            { label: 'Apply Sick Leave', href: '/parent?tab=leave', tab: 'leave', icon: FileText },
            { label: 'All Services', href: '/parent?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'STUDENT':
        return [
          { label: '🎓 Student Portal', items: [
            { label: 'Dashboard Overview', href: '/student?tab=overview', tab: 'overview', icon: LayoutDashboard },
            { label: 'Assigned Homework', href: '/student?tab=homework', tab: 'homework', icon: BookOpen },
            { label: 'Exam Results', href: '/student?tab=results', tab: 'results', icon: Award },
            { label: 'Class Timetable', href: '/student?tab=timetable', tab: 'timetable', icon: Clock },
            { label: 'Live Bus Tracker', href: '/student?tab=transport', tab: 'transport', icon: Bus },
            { label: 'Attendance Meter', href: '/student?tab=attendance', tab: 'attendance', icon: Calendar },
            { label: 'Apply Sick Leave', href: '/student?tab=leave', tab: 'leave', icon: FileText },
            { label: 'All Services', href: '/student?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      default:
        return [
          { label: 'Main Menu', items: [
            { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          ]}
        ];
    }
  };

  const navSections = getNavSections();

  const handleNavClick = (e, item) => {
    if (item.href) {
      e.preventDefault();
      router.push(item.href);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 transition-colors">

      
      {/* BRANDING HEADER */}
      <div className="p-5 border-b border-slate-200 flex items-center space-x-3 bg-white">
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-black text-slate-900 tracking-wide">AI SCHOOL ERP</h1>
          <p 
            className="text-[10px] font-extrabold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {activeRole === 'SAAS_SUPER_ADMIN' ? 'SaaS Master Control' : activeRole === 'STUDENT' ? 'Student Portal' : activeRole === 'PARENT' ? 'Parent Portal' : 'Campus OS v2.0'}
          </p>
        </div>
      </div>

      {/* USER BADGE CARD */}
      <Link 
        href="/admin/dashboard?tab=profile"
        onClick={(e) => {
          e.preventDefault();
          router.push('/admin/dashboard?tab=profile');
        }}
        className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center space-x-3 transition-all cursor-pointer group"
      >
        <img 
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'} 
          alt="User Avatar"
          className="w-9 h-9 rounded-xl object-cover border border-slate-300 group-hover:scale-105 transition-transform"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate transition-colors">{currentUser?.name || 'User Account'}</h4>
          <span 
            className="text-[10px] font-extrabold block truncate uppercase"
            style={{ color: accentColor }}
          >
            {currentUser?.designation ? currentUser.designation.toUpperCase() : (currentUser?.role || activeRole)}
          </span>

          {currentUser?.schoolName && (
            <span className="text-[9px] text-slate-500 block truncate">{currentUser.schoolName}</span>
          )}
        </div>
      </Link>

      {/* NAVIGATION ITEMS */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar bg-white">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              {section.label}
            </span>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                let isActive = false;

                if (item.tab) {
                  isActive = currentTab === item.tab;
                } else {
                  isActive = pathname === item.href;
                }

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    style={isActive ? { backgroundColor: accentColor } : {}}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-md font-bold scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all border border-slate-200 hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}

export default function AppSidebar(props) {
  return (
    <React.Suspense fallback={<aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0" />}>

      <SidebarContent {...props} />
    </React.Suspense>
  );
}
