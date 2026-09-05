'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ShieldCheck, Search, Bell, Command, Palette, PanelLeftClose, PanelLeftOpen, Menu, Zap, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AIChatModal from './AIChatModal';
import ThemeSelectorModal from './ThemeSelectorModal';
import GlobalSearchModal from './GlobalSearchModal';
import NotificationModal from './NotificationModal';
import SubmitTestimonialModal from './SubmitTestimonialModal';

export default function HeaderBar({ isSidebarCollapsed, onToggleSidebar }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(user);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.unreadCount !== undefined) {
            setUnreadNotificationsCount(data.unreadCount);
          }
        }
      } catch (e) {}
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
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

  // Global Keyboard Listener for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (pathname === '/login') return null;

  const getPageTitle = () => {
    if (pathname.startsWith('/saas-admin')) return 'SaaS Control Panel';
    if (pathname.startsWith('/admin/admissions')) return 'Admissions Pipeline';
    if (pathname.startsWith('/admin/students')) return 'Student Directory';
    if (pathname.startsWith('/admin/timetable')) return 'AI Timetable';
    if (pathname.startsWith('/admin/hrms')) return 'Staff HRMS';
    if (pathname.startsWith('/admin/inventory')) return 'Assets & Inventory';
    if (pathname.startsWith('/admin/certificates')) return 'Certificates Generator';
    if (pathname.startsWith('/admin')) return 'School Administration';
    if (pathname.startsWith('/accountant')) return 'Fee Management';
    if (pathname.startsWith('/teacher')) return 'Teacher Portal';
    if (pathname.startsWith('/parent')) return 'Parent Portal';
    if (pathname.startsWith('/student')) return 'Student Portal';
    return 'School ERP';
  };

  const getPageSubtitle = () => {
    if (pathname.startsWith('/saas-admin')) return 'Multi-tenant management';
    if (pathname.startsWith('/admin/admissions')) return 'Direct enrollment pipeline';
    if (pathname.startsWith('/admin/students')) return 'Complete student profiles';
    if (pathname.startsWith('/admin/timetable')) return 'AI scheduling system';
    if (pathname.startsWith('/admin/hrms')) return 'GPS attendance & staff';
    if (pathname.startsWith('/admin/inventory')) return 'Asset tracking system';
    if (pathname.startsWith('/admin/certificates')) return 'Automated issuance';
    if (pathname.startsWith('/accountant')) return 'Ledger & receipts';
    if (pathname.startsWith('/teacher')) return 'Attendance & marks';
    if (pathname.startsWith('/parent')) return 'Fee & performance';
    if (pathname.startsWith('/student')) return 'Academic portal';
    return 'Complete school management suite';
  };

  return (
    <header 
      style={{ backgroundColor: 'var(--accent-primary, #02563d)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
      className="app-header h-14 sm:h-16 px-2.5 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 shadow-md text-white border-b w-full max-w-full overflow-hidden"
    >
      
      {/* LEFT SECTION: SIDEBAR TOGGLE & TITLE */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 shrink-0">
        
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="p-1.5 sm:p-2 rounded-xl border hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white shrink-0 cursor-pointer shadow-xs"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </button>

        <img 
          src="/track360_logo.png" 
          alt="Track 360 Logo" 
          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-xl object-cover border border-white/30 shadow-md shrink-0 hidden min-[360px]:block" 
        />

        <div className="min-w-0 truncate">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 style={{ color: '#ffffff' }} className="text-xs sm:text-sm lg:text-base font-black tracking-tight leading-none text-white truncate max-w-[90px] min-[380px]:max-w-[140px] min-[480px]:max-w-[200px] sm:max-w-none">
              {getPageTitle()}
            </h2>
            <span 
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#ffffff' }}
              className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest hidden xl:inline-flex items-center gap-1 text-white shrink-0 shadow-xs"
              title="Multi-User Live Server Synchronization Active"
            >
              <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300 animate-pulse" />
              LIVE SERVER SYNC
            </span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="text-[10px] sm:text-[11px] flex items-center gap-1.5 mt-0.5 font-semibold text-white truncate hidden md:flex">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="truncate">{getPageSubtitle()}</span>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: CONTROLS & ACTIONS */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 ml-auto">
        
        {/* Search Icon Button (<640px) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="sm:hidden p-1.5 rounded-full border hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center shadow-xs text-white cursor-pointer"
          title="Search System (Cmd+K)"
        >
          <Search className="w-4 h-4 text-white" />
        </button>

        {/* Global Search Button (>=640px) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="hidden sm:flex relative items-center w-28 md:w-40 lg:w-52 xl:w-64 border hover:bg-white/25 focus-within:border-white rounded-full pl-7 md:pl-8 pr-2 lg:pr-12 py-1.5 text-xs text-white placeholder-white/70 focus:outline-none transition-all cursor-pointer shadow-xs group text-left"
        >
          <Search style={{ color: '#ffffff' }} className="absolute left-2.5 w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
          <span style={{ color: '#ffffff' }} className="font-medium truncate text-white text-[11px] sm:text-xs">Search...</span>
          <div 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff' }}
            className="absolute right-2 hidden lg:flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md border shadow-2xs text-white"
          >
            <Command style={{ color: '#ffffff' }} className="w-2.5 h-2.5 text-white" />
            <span style={{ color: '#ffffff' }} className="text-[10px] font-bold text-white">K</span>
          </div>
        </button>

        {currentUser?.role === 'PARENT' && (
          <span 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
            className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs text-white"
          >
            <ShieldCheck style={{ color: '#ffffff' }} className="w-3.5 h-3.5 text-white" />
            <span style={{ color: '#ffffff' }}>0% Fee Access</span>
          </span>
        )}

        {/* Give Feedback Button */}
        <button
          onClick={() => setIsTestimonialOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border hover:bg-white/25 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs text-white cursor-pointer"
          title="Submit School Review for Landing Page"
        >
          <MessageSquare style={{ color: '#6ee7b7' }} className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span style={{ color: '#ffffff' }} className="hidden lg:inline text-[11px] font-bold text-white whitespace-nowrap">Give Feedback</span>
        </button>

        {/* Theme Customizer Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="p-1.5 sm:p-2 rounded-full border hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs group relative text-white cursor-pointer"
          title="Customize Theme & Brand Color"
        >
          <Palette style={{ color: '#ffffff' }} className="w-3.5 h-3.5 text-white group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* Notifications Button */}
        <button 
          onClick={() => setIsNotificationOpen(prev => !prev)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="relative p-1.5 sm:p-2 rounded-full border hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs text-white cursor-pointer"
          title="Notifications"
        >
          <Bell style={{ color: '#ffffff' }} className="w-3.5 h-3.5 text-white" />
          {unreadNotificationsCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 text-[9px] font-black bg-amber-400 text-slate-950 border border-slate-900 shadow-xs">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            </span>
          ) : (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          )}
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.9)' }}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-full transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 border cursor-pointer text-slate-900"
          title="AI Assistant"
        >
          <Sparkles style={{ color: '#0f172a' }} className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span style={{ color: '#0f172a' }} className="font-black text-xs hidden md:inline whitespace-nowrap">AI Assistant</span>
        </button>

        {/* Profile Pill */}
        <a
          href="/admin/dashboard?tab=profile"
          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.9)' }}
          className="flex items-center gap-1.5 p-1 pr-1 xl:pr-2.5 rounded-full border text-xs font-black transition-all hover:bg-slate-100 hover:scale-105 shadow-md group cursor-pointer text-slate-900 shrink-0"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'}
            alt="User Avatar"
            className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full object-cover ring-2 ring-emerald-600 shadow-xs"
          />
          <span style={{ color: '#0f172a' }} className="hidden xl:inline text-xs font-black max-w-[90px] truncate">
            {currentUser?.name || 'svm admin'}
          </span>
        </a>
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <ThemeSelectorModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
      <SubmitTestimonialModal isOpen={isTestimonialOpen} onClose={() => setIsTestimonialOpen(false)} />
      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        onUnreadCountChange={setUnreadNotificationsCount} 
      />

    </header>
  );
}
