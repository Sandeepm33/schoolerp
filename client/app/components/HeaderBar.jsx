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
    if (pathname.startsWith('/saas-admin')) return 'SaaS Master Control Panel';
    if (pathname.startsWith('/admin/admissions')) return 'Direct Admissions Pipeline';
    if (pathname.startsWith('/admin/students')) return 'Student 360° Directory';
    if (pathname.startsWith('/admin/timetable')) return 'AI Conflict-Free Timetable';
    if (pathname.startsWith('/admin/hrms')) return 'Staff HRMS & GPS Clock-In';
    if (pathname.startsWith('/admin/inventory')) return 'School Assets & Inventory';
    if (pathname.startsWith('/admin/certificates')) return 'Certificates Generator';
    if (pathname.startsWith('/admin')) return 'School Administration';
    if (pathname.startsWith('/accountant')) return 'Fee Management Ledger';
    if (pathname.startsWith('/teacher')) return 'Teacher App & Class Marker';
    if (pathname.startsWith('/parent')) return 'Parent Mobile Portal';
    if (pathname.startsWith('/student')) return 'Student Learning Portal';
    return 'School ERP Operating System';
  };

  const getPageSubtitle = () => {
    if (pathname.startsWith('/saas-admin')) return 'Multi-tenant platform management';
    if (pathname.startsWith('/admin/admissions')) return 'No interview flow';
    if (pathname.startsWith('/admin/students')) return 'Complete student profiles';
    if (pathname.startsWith('/admin/timetable')) return 'AI-powered scheduling';
    if (pathname.startsWith('/admin/hrms')) return 'Mobile attendance tracking';
    if (pathname.startsWith('/admin/inventory')) return 'Asset tracking system';
    if (pathname.startsWith('/admin/certificates')) return 'Automated generation';
    if (pathname.startsWith('/accountant')) return 'Payment entry & receipts';
    if (pathname.startsWith('/teacher')) return 'Class attendance marking';
    if (pathname.startsWith('/parent')) return '0% fee visibility';
    if (pathname.startsWith('/student')) return 'Academic portal';
    return 'Complete school management suite';
  };

  return (
    <header 
      style={{ backgroundColor: 'var(--accent-primary, #02563d)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
      className="app-header h-14 sm:h-16 px-2.5 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 shadow-md text-white border-b min-w-0"
    >
      
      {/* LEFT SECTION: SIDEBAR TOGGLE & BRANDING / PAGE TITLE */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 shrink-0">
        
        {/* Sidebar Open/Close Toggle Button */}
        <button
          onClick={onToggleSidebar}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="p-1.5 sm:p-2 rounded-xl border hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white shrink-0 cursor-pointer shadow-xs"
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
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-white/30 shadow-md shrink-0 hidden xs:block" 
        />
        <div className="min-w-0 truncate">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 style={{ color: '#ffffff' }} className="text-xs sm:text-base font-black tracking-tight leading-none text-white truncate max-w-[110px] min-[380px]:max-w-[160px] sm:max-w-none">
              {getPageTitle()}
            </h2>
            <span 
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#ffffff' }}
              className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest hidden md:inline-flex items-center gap-1 text-white shrink-0 shadow-xs"
              title="Multi-User Live Server Synchronization Active"
            >
              <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300 animate-pulse" />
              LIVE SERVER SYNC
            </span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="text-[10px] sm:text-[11px] flex items-center gap-1.5 mt-0.5 font-semibold text-white truncate hidden sm:flex">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="truncate">{getPageSubtitle()}</span>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: CONTROLS & ACTIONS */}
      <div className="flex items-center space-x-1 sm:space-x-2.5 shrink-0 ml-1 sm:ml-2">
        
        {/* Search Icon Button on Mobile (<480px) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="min-[480px]:hidden p-2 rounded-full border hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center shadow-xs text-white cursor-pointer"
          title="Search System"
        >
          <Search className="w-4 h-4 text-white" />
        </button>

        {/* Dynamic Global Search Button (>=480px) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="hidden min-[480px]:flex relative items-center w-28 xs:w-36 sm:w-64 border hover:bg-white/25 focus-within:border-white rounded-full pl-7 xs:pl-8 sm:pl-9 pr-2 sm:pr-12 py-1.5 text-xs text-white placeholder-white/70 focus:outline-none transition-all cursor-pointer shadow-xs group text-left"
        >
          <Search style={{ color: '#ffffff' }} className="absolute left-2.5 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:scale-110 transition-transform" />
          <span style={{ color: '#ffffff' }} className="font-medium truncate text-white text-[11px] sm:text-xs">Search...</span>
          <div 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff' }}
            className="absolute right-2 hidden sm:flex items-center space-x-0.5 px-2 py-0.5 rounded-md border shadow-2xs text-white"
          >
            <Command style={{ color: '#ffffff' }} className="w-3 h-3 text-white" />
            <span style={{ color: '#ffffff' }} className="text-[10px] font-bold text-white">K</span>
          </div>
        </button>

        {currentUser?.role === 'PARENT' && (
          <span 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-xs text-white"
          >
            <ShieldCheck style={{ color: '#ffffff' }} className="w-3.5 h-3.5 text-white" />
            <span style={{ color: '#ffffff' }}>0% Fee Access</span>
          </span>
        )}

        {/* Submit Testimonial / Review Button */}
        <button
          onClick={() => setIsTestimonialOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-full border hover:bg-white/25 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs text-white cursor-pointer"
          title="Submit School Review for Landing Page"
        >
          <MessageSquare style={{ color: '#6ee7b7' }} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
          <span style={{ color: '#ffffff' }} className="hidden xl:inline text-[11px] font-bold text-white">Give Feedback</span>
        </button>

        {/* Dynamic Theme Customizer Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="p-1.5 sm:p-2 rounded-full border hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs group relative text-white cursor-pointer"
          title="Customize Theme & Brand Color"
        >
          <Palette style={{ color: '#ffffff' }} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* Notifications */}
        <button 
          onClick={() => setIsNotificationOpen(prev => !prev)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
          className="relative p-1.5 sm:p-2 rounded-full border hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs text-white cursor-pointer"
          title="Notifications"
        >
          <Bell style={{ color: '#ffffff' }} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          {unreadNotificationsCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center">
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

        {/* AI ASSISTANT BUTTON */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.9)' }}
          className="hover:bg-slate-100 text-xs font-black p-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 border cursor-pointer text-slate-900"
          title="AI Assistant"
        >
          <Sparkles style={{ color: '#0f172a' }} className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span style={{ color: '#0f172a' }} className="font-black hidden sm:inline text-xs">AI Assistant</span>
        </button>

        {/* PROFILE PILL */}
        <a
          href="/admin/dashboard?tab=profile"
          style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.9)' }}
          className="flex items-center gap-1.5 p-1 pr-1 sm:pr-3 rounded-full border text-xs font-black transition-all hover:bg-slate-100 hover:scale-105 shadow-md group cursor-pointer text-slate-900 shrink-0"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'}
            alt="User Avatar"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-emerald-600 shadow-xs"
          />
          <span style={{ color: '#0f172a' }} className="hidden md:inline text-xs font-black max-w-[110px] truncate">
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
