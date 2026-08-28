'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ShieldCheck, Search, Bell, Command, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AIChatModal from './AIChatModal';
import ThemeSelectorModal from './ThemeSelectorModal';
import GlobalSearchModal from './GlobalSearchModal';

export default function HeaderBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(user);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const brandColor = currentTheme?.accentPrimary || '#02563d';

  return (
    <header 
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors shadow-md text-white border-b border-white/10"
      style={{ backgroundColor: brandColor }}
    >
      
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-[15px] font-bold text-white tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-[11px] text-white/80 flex items-center gap-2 mt-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span>{getPageSubtitle()}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Dynamic Global Search Button / Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative flex items-center w-48 sm:w-64 bg-white/20 hover:bg-white/25 border border-white/30 rounded-xl pl-9 pr-12 py-2 text-xs text-white placeholder-white/70 focus:outline-none transition-all cursor-pointer shadow-sm group text-left"
        >
          <Search className="absolute left-3 w-4 h-4 text-white/80 group-hover:scale-110 transition-transform" />
          <span className="text-white/80 font-medium">Search...</span>
          <div className="absolute right-2 flex items-center space-x-0.5 px-1.5 py-0.5 bg-black/25 rounded-md border border-white/10">
            <Command className="w-3 h-3 text-white/90" />
            <span className="text-[10px] text-white/90 font-bold">K</span>
          </div>
        </button>

        {currentUser?.role === 'PARENT' && (
          <span className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/20 text-white border border-white/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0% Fee Access</span>
          </span>
        )}

        {/* Dynamic Theme Customizer Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="relative p-2 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm group"
          title="Customize Theme & Brand Color"
        >
          <Palette className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-300" />
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-white/20 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>AI Assistant</span>
        </button>

        {/* Profile Pill */}
        <a
          href="/admin/dashboard?tab=profile"
          className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 text-white text-xs font-semibold transition-all"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'}
            alt="User Avatar"
            className="w-6 h-6 rounded-lg object-cover border border-white/40"
          />
          <span className="hidden sm:inline text-[11px] max-w-[100px] truncate">{currentUser?.name || 'User Profile'}</span>
        </a>
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <ThemeSelectorModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />

    </header>
  );
}
