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

export default function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
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
        return [
          { label: '🏠 Dashboard', items: [
            { label: 'Executive Overview', href: '/admin/dashboard?tab=overview', tab: 'overview', icon: LayoutDashboard },
            { label: 'AI Risk Detector', href: '/admin/dashboard?tab=ai-risk', tab: 'ai-risk', icon: Sparkles },
          ]},
          { label: '📋 Admissions', items: [
            { label: 'Admissions Pipeline', href: '/admin/dashboard?tab=admissions', tab: 'admissions', icon: FileText },
            { label: 'Enquiry & Application', href: '/admin/dashboard?tab=enquiry', tab: 'enquiry', icon: ClipboardList },
          ]},
          { label: '🎓 Student Lifecycle', items: [
            { label: 'Student Directory', href: '/admin/dashboard?tab=students', tab: 'students', icon: GraduationCap },
            { label: 'Parent Directory', href: '/admin/dashboard?tab=parents', tab: 'parents', icon: HeartHandshake },
            { label: 'Health Records', href: '/admin/dashboard?tab=health', tab: 'health', icon: Stethoscope },
            { label: 'Discipline Tracker', href: '/admin/dashboard?tab=discipline', tab: 'discipline', icon: AlertTriangle },
          ]},
          { label: '🏫 Academic Setup', items: [
            { label: 'Academic Years', href: '/admin/dashboard?tab=academic-years', tab: 'academic-years', icon: Calendar },
            { label: 'Classes & Sections', href: '/admin/dashboard?tab=classes', tab: 'classes', icon: BookOpen },
            { label: 'Subjects', href: '/admin/dashboard?tab=subjects', tab: 'subjects', icon: BookMarked },
            { label: 'Timetable Builder', href: '/admin/dashboard?tab=timetable', tab: 'timetable', icon: Calendar },
          ]},
          { label: '📚 Academic Operations', items: [
            { label: 'Student Attendance', href: '/admin/dashboard?tab=attendance', tab: 'attendance', icon: CheckSquare },
            { label: 'Exams & Scheduling', href: '/admin/dashboard?tab=exams', tab: 'exams', icon: ClipboardList },
            { label: 'Marks & Report Cards', href: '/admin/dashboard?tab=marks', tab: 'marks', icon: Award },
            { label: 'Homework Manager', href: '/admin/dashboard?tab=homework', tab: 'homework', icon: FileText },
            { label: 'LMS & Course Content', href: '/admin/dashboard?tab=lms', tab: 'lms', icon: BookOpen },
          ]},
          { label: '💰 Finance', items: [
            { label: 'Fee Categories', href: '/admin/dashboard?tab=fee-categories', tab: 'fee-categories', icon: DollarSign },
            { label: 'Fee Structures', href: '/admin/dashboard?tab=fee-structures', tab: 'fee-structures', icon: Scroll },
            { label: 'Student Fees & Payments', href: '/admin/dashboard?tab=student-fees', tab: 'student-fees', icon: Calculator },
          ]},
          { label: '👨‍💼 HR & Payroll', items: [
            { label: 'Employee Directory', href: '/admin/dashboard?tab=employees', tab: 'employees', icon: UserCog },
            { label: 'Departments & Designations', href: '/admin/dashboard?tab=departments', tab: 'departments', icon: Building2 },
            { label: 'Staff Attendance', href: '/admin/dashboard?tab=staff-attendance', tab: 'staff-attendance', icon: Clock },
            { label: 'Leave Management', href: '/admin/dashboard?tab=leave', tab: 'leave', icon: Calendar },
            { label: 'Payroll & Payslips', href: '/admin/dashboard?tab=payroll', tab: 'payroll', icon: TrendingUp },
          ]},
          { label: '🏗️ Campus Services', items: [
            { label: 'Library', href: '/admin/dashboard?tab=library', tab: 'library', icon: Library },
            { label: 'Transport', href: '/admin/dashboard?tab=transport', tab: 'transport', icon: Bus },
            { label: 'Hostel', href: '/admin/dashboard?tab=hostel', tab: 'hostel', icon: Home },
            { label: 'Inventory & Assets', href: '/admin/dashboard?tab=inventory', tab: 'inventory', icon: Box },
          ]},
          { label: '📣 Communication', items: [
            { label: 'Announcements', href: '/admin/dashboard?tab=announcements', tab: 'announcements', icon: Megaphone },
            { label: 'Events & Calendar', href: '/admin/dashboard?tab=events', tab: 'events', icon: Calendar },
            { label: 'Visitor Log', href: '/admin/dashboard?tab=visitors', tab: 'visitors', icon: MapPin },
          ]},
          { label: '🎫 Admin & Compliance', items: [
            { label: 'Certificates & TCs', href: '/admin/dashboard?tab=certificates', tab: 'certificates', icon: FileBadge2 },
            { label: 'Campus Helpdesk', href: '/admin/dashboard?tab=helpdesk', tab: 'helpdesk', icon: Ticket },
            { label: 'Audit Logs', href: '/admin/dashboard?tab=audit-logs', tab: 'audit-logs', icon: ShieldCheck },
          ]},
          { label: '📊 Intelligence', items: [
            { label: 'Reports & Analytics', href: '/admin/dashboard?tab=reports', tab: 'reports', icon: BarChart3 },
            { label: 'User Roles & Logins', href: '/admin/dashboard?tab=users', tab: 'users', icon: Key },
            { label: 'School Settings', href: '/admin/dashboard?tab=settings', tab: 'settings', icon: Settings },
          ]},
        ];

      case 'ACCOUNTANT':
        return [
          { label: 'Finance', items: [
            { label: 'Fee Management', href: '/accountant', icon: DollarSign },
          ]}
        ];

      case 'TEACHER':
        return [
          { label: 'Teaching', items: [
            { label: 'Class Marker', href: '/teacher', icon: BookOpen },
          ]}
        ];

      case 'PARENT':
        return [
          { label: 'Portal', items: [
            { label: 'Parent App', href: '/parent', icon: Users },
          ]}
        ];

      case 'STUDENT':
        return [
          { label: 'Learning', items: [
            { label: 'Student Portal', href: '/parent', icon: GraduationCap },
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
    if ((activeRole === 'SAAS_SUPER_ADMIN' || activeRole === 'SCHOOL_ADMIN') && item.href) {
      e.preventDefault();
      router.push(item.href);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#06080d] border-r border-slate-800/80 flex flex-col h-screen shrink-0 select-none z-30">
      
      {/* BRANDING HEADER */}
      <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-black text-white tracking-wide">AI SCHOOL ERP</h1>
          <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">
            {activeRole === 'SAAS_SUPER_ADMIN' ? 'SaaS Master Control' : 'Campus OS v2.0'}
          </p>
        </div>
      </div>

      {/* USER BADGE CARD */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
        <img 
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'} 
          alt="User Avatar"
          className="w-9 h-9 rounded-xl object-cover border border-indigo-500/30"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white truncate">{currentUser?.name || 'School Principal'}</h4>
          <span className="text-[10px] font-extrabold text-indigo-400 block truncate uppercase">
            {currentUser?.role || activeRole}
          </span>
          {currentUser?.schoolName && (
            <span className="text-[9px] text-slate-500 block truncate">{currentUser.schoolName}</span>
          )}
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              {section.label}
            </span>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                let isActive = false;

                if (activeRole === 'SAAS_SUPER_ADMIN' || activeRole === 'SCHOOL_ADMIN') {
                  isActive = currentTab === item.tab;
                } else {
                  isActive = pathname === item.href;
                }

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'gradient-primary text-white shadow-lg shadow-indigo-500/25 font-bold scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 text-xs font-bold transition-all border border-slate-800 hover:border-rose-500/30"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}
