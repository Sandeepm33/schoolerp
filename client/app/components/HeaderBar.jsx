'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ShieldCheck, Search, Bell, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AIChatModal from './AIChatModal';

export default function HeaderBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    <header className="h-16 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,8,13,0.6)] backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-20">
      
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-[15px] font-bold text-white tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{getPageSubtitle()}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Search */}
        <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'w-64' : 'w-48'}`}>
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-[rgba(17,24,39,0.5)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-12 py-2 text-xs text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 focus:bg-[rgba(17,24,39,0.8)] transition-all"
          />
          <div className="absolute right-2 flex items-center space-x-0.5 px-1.5 py-0.5 bg-[rgba(255,255,255,0.05)] rounded-md">
            <Command className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-[10px] text-[var(--text-muted)]">K</span>
          </div>
        </div>

        {currentUser?.role === 'PARENT' && (
          <span className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0% Fee Access</span>
          </span>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-[rgba(17,24,39,0.5)] border border-[rgba(255,255,255,0.06)] text-[var(--text-muted)] hover:text-white hover:border-[rgba(255,255,255,0.12)] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-indigo-400/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Assistant</span>
        </button>

        {/* Admin Profile Pill */}
        <a
          href="/admin/dashboard?tab=profile"
          className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[rgba(17,24,39,0.5)] border border-[rgba(255,255,255,0.06)] hover:border-indigo-500/30 text-white text-xs font-semibold hover:bg-slate-900 transition-all"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop'}
            alt="User Avatar"
            className="w-6 h-6 rounded-lg object-cover border border-indigo-500/30"
          />
          <span className="hidden sm:inline text-[11px] max-w-[100px] truncate">{currentUser?.name || 'Admin Profile'}</span>
        </a>
      </div>

      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

    </header>
  );
}
