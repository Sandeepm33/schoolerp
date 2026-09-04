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
  Calculator, TrendingUp, MapPin, Scroll, ClipboardList,
  ChevronLeft, ChevronRight, Bot, Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AIChatModal from './AIChatModal';

function SidebarContent({ isCollapsed, onToggle }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const themeContext = useTheme();
  const accentColor = themeContext?.currentTheme?.accentPrimary || '#02563d';
  
  const [currentUser, setCurrentUser] = useState(user);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    setMounted(true);
  }, []);

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
          { label: '👑 SAAS MASTER CONTROL', items: [
            { label: 'Platform Overview', shortLabel: 'Overview', href: '/saas-admin?tab=overview', tab: 'overview', icon: Activity },
            { label: 'All Services', shortLabel: 'Services', href: '/saas-admin?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'SCHOOL_ADMIN':
      case 'PRINCIPAL':
      case 'VICE_PRINCIPAL':
      case 'HEADMASTER':
      case 'HEAD_MASTER':
        return [
          { label: '🚀 EXECUTIVE MENU', items: [
            { label: 'Executive Overview', shortLabel: 'Overview', href: '/admin/dashboard?tab=overview', tab: 'overview', icon: LayoutDashboard },
            { label: 'All Services', shortLabel: 'Services', href: '/admin/dashboard?tab=services', tab: 'services', icon: Box },
            { label: 'Leadership Profile', shortLabel: 'Profile', href: '/admin/dashboard?tab=profile', tab: 'profile', icon: UserCog },
            { label: 'School Settings', shortLabel: 'Settings', href: '/admin/dashboard?tab=settings', tab: 'settings', icon: Settings },
          ]}
        ];

      case 'ACCOUNTANT':
        return [
          { label: 'Finance', items: [
            { label: 'Fee Management', shortLabel: 'Fees', href: '/accountant?tab=fees', tab: 'fees', icon: DollarSign },
            { label: 'All Services', shortLabel: 'Services', href: '/accountant?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'TEACHER':
        return [
          { label: 'Teaching', items: [
            { label: 'My Timetable', shortLabel: 'Schedule', href: '/teacher?tab=timetable', tab: 'timetable', icon: BookOpen },
            { label: 'Mark Attendance', shortLabel: 'Mark', href: '/teacher?tab=attendance', tab: 'attendance', icon: CheckSquare },
            { label: 'Homework & LMS', shortLabel: 'LMS', href: '/teacher?tab=homework', tab: 'homework', icon: Calendar },
            { label: 'All Services', shortLabel: 'Services', href: '/teacher?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'PARENT':
        return [
          { label: '👨‍👩‍👧 Parent Portal', items: [
            { label: 'Dashboard Overview', shortLabel: 'Home', href: '/parent?tab=overview', tab: 'overview', icon: Home },
            { label: 'Assigned Homework', shortLabel: 'Homework', href: '/parent?tab=homework', tab: 'homework', icon: BookOpen },
            { label: 'Exam Results', shortLabel: 'Results', href: '/parent?tab=results', tab: 'results', icon: Award },
            { label: 'Class Timetable', shortLabel: 'Timetable', href: '/parent?tab=timetable', tab: 'timetable', icon: Clock },
            { label: 'Live Bus Tracker', shortLabel: 'Transport', href: '/parent?tab=transport', tab: 'transport', icon: Bus },
            { label: 'Attendance Meter', shortLabel: 'Attendance', href: '/parent?tab=attendance', tab: 'attendance', icon: Calendar },
            { label: 'Apply Sick Leave', shortLabel: 'Leave', href: '/parent?tab=leave', tab: 'leave', icon: FileText },
            { label: 'All Services', shortLabel: 'Services', href: '/parent?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      case 'STUDENT':
        return [
          { label: '🎓 Student Portal', items: [
            { label: 'Dashboard Overview', shortLabel: 'Home', href: '/student?tab=overview', tab: 'overview', icon: Home },
            { label: 'Assigned Homework', shortLabel: 'Homework', href: '/student?tab=homework', tab: 'homework', icon: BookOpen },
            { label: 'Exam Results', shortLabel: 'Results', href: '/student?tab=results', tab: 'results', icon: Award },
            { label: 'Class Timetable', shortLabel: 'Timetable', href: '/student?tab=timetable', tab: 'timetable', icon: Clock },
            { label: 'Live Bus Tracker', shortLabel: 'Transport', href: '/student?tab=transport', tab: 'transport', icon: Bus },
            { label: 'Attendance Meter', shortLabel: 'Attendance', href: '/student?tab=attendance', tab: 'attendance', icon: Calendar },
            { label: 'Apply Sick Leave', shortLabel: 'Leave', href: '/student?tab=leave', tab: 'leave', icon: FileText },
            { label: 'All Services', shortLabel: 'Services', href: '/student?tab=services', tab: 'services', icon: Box },
          ]}
        ];

      default:
        return [
          { label: 'Main Menu', items: [
            { label: 'Dashboard', shortLabel: 'Home', href: '/admin/dashboard', icon: Home },
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

  const currentAccent = mounted ? accentColor : '#02563d';

  // ----------------------------------------------------
  // MODE A: COMPACT COLLAPSED RAIL SIDEBAR (isCollapsed === true)
  // ----------------------------------------------------
  if (isCollapsed) {
    return (
      <aside className="w-18 sm:w-20 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 transition-all duration-300 shadow-xs">
        
        {/* Compact Logo Header */}
        <div className="p-2.5 border-b border-slate-100 flex flex-col items-center justify-center bg-white shrink-0">
          <img 
            onClick={onToggle}
            src="/track360_logo.png" 
            alt="Track 360 Logo" 
            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0" 
            title="Expand Sidebar"
          />
          <span 
            className="text-[8px] font-black tracking-wider mt-1 text-center truncate max-w-full uppercase"
            style={{ color: currentAccent }}
          >
            Track 360
          </span>
        </div>

        {/* Compact Nav Items (Icon top w-4 h-4, short name below) */}
        <div className="flex-1 overflow-y-auto px-1 py-2 space-y-2 custom-scrollbar bg-white flex flex-col items-center">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="w-full space-y-1.5 flex flex-col items-center">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                let isActive = false;
                if (mounted) {
                  if (item.tab) isActive = currentTab === item.tab;
                  else isActive = pathname === item.href;
                }

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    title={item.label}
                    onClick={(e) => handleNavClick(e, item)}
                    style={
                      isActive 
                        ? { backgroundColor: `${currentAccent}15`, color: currentAccent, borderColor: currentAccent } 
                        : {}
                    }
                    className={`w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group border ${
                      isActive
                        ? 'shadow-2xs font-black scale-105'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon 
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? '' : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                      style={isActive ? { color: currentAccent } : {}}
                    />
                    <span 
                      className="text-[9px] font-bold mt-0.5 text-center truncate w-full px-0.5 leading-tight"
                      style={isActive ? { color: currentAccent } : {}}
                    >
                      {item.shortLabel || item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Compact Bottom Avatars */}
        <div className="p-2 border-t border-slate-100 bg-white flex flex-col items-center space-y-2 shrink-0">
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
            title="Open AI Assistant"
          >
            <Bot className="w-4 h-4 text-white" />
          </button>

          <a
            href="/admin/dashboard?tab=profile"
            title={currentUser?.name || 'User Profile'}
            className="relative group cursor-pointer hover:scale-105 transition-transform"
          >
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'} 
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-600 p-0.5 shadow-2xs"
            />
          </a>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      </aside>
    );
  }

  // ----------------------------------------------------
  // MODE B: DEFAULT OPEN SIDEBAR (isCollapsed === false) - ORIGINAL FULL SIDEBAR VIEW
  // ----------------------------------------------------
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 transition-all duration-300">
      
      {/* FULL BRANDING HEADER */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img 
            src="/track360_logo.png" 
            alt="Track 360 Logo" 
            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-md shrink-0" 
          />
          <div className="truncate">
            <h1 className="text-sm font-black text-slate-900 tracking-wide truncate">Track 360</h1>
            <p 
              className="text-[10px] font-extrabold uppercase tracking-widest truncate"
              style={{ color: currentAccent }}
            >
              {activeRole === 'SAAS_SUPER_ADMIN' ? 'SaaS Master Control' : activeRole === 'STUDENT' ? 'Student Portal' : activeRole === 'PARENT' ? 'Parent Portal' : 'Campus OS v2.0'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* FULL USER BADGE CARD */}
      <Link 
        href="/admin/dashboard?tab=profile"
        onClick={(e) => {
          e.preventDefault();
          router.push('/admin/dashboard?tab=profile');
        }}
        title={currentUser?.name || 'User Profile'}
        className="p-3 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center space-x-3 transition-all cursor-pointer group"
      >
        <img 
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'} 
          alt="User Avatar"
          className="w-9 h-9 rounded-xl object-cover border border-slate-300 group-hover:scale-105 transition-transform shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate transition-colors">{currentUser?.name || 'User Account'}</h4>
          <span 
            className="text-[10px] font-extrabold block truncate uppercase"
            style={{ color: currentAccent }}
          >
            {currentUser?.designation ? currentUser.designation.toUpperCase() : (currentUser?.role || activeRole)}
          </span>
          {currentUser?.schoolName && (
            <span className="text-[9px] text-slate-500 block truncate">{currentUser.schoolName}</span>
          )}
        </div>
      </Link>

      {/* FULL NAVIGATION ITEMS */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar bg-white">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 block truncate">
              {section.label}
            </span>
            <div className="space-y-1 pt-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                let isActive = false;
                if (mounted) {
                  if (item.tab) isActive = currentTab === item.tab;
                  else isActive = pathname === item.href;
                }

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    title={item.label}
                    onClick={(e) => handleNavClick(e, item)}
                    style={isActive ? { backgroundColor: currentAccent } : {}}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-md font-bold scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FULL FOOTER & LOGOUT */}
      <div className="p-3 border-t border-slate-200 bg-white space-y-2">
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all border border-slate-200 hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

    </aside>
  );
}

export default function AppSidebar(props) {
  return (
    <React.Suspense fallback={<aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0" />}>
      <SidebarContent {...props} />
    </React.Suspense>
  );
}
