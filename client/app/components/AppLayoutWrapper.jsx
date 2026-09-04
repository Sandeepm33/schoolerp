'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AppSidebar from './AppSidebar';
import HeaderBar from './HeaderBar';

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('erp_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('erp_sidebar_collapsed', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const isShellFree = pathname === '/login' || pathname === '/landing' || (!user && pathname === '/');

  if (isShellFree) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] text-slate-900 transition-colors">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-slate-900 transition-colors">
      <AppSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6f8] overflow-x-hidden">
        <HeaderBar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in bg-[#f4f6f8]">
          {children}
        </main>
      </div>
    </div>
  );
}
