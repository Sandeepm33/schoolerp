'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import AppSidebar from './AppSidebar';
import HeaderBar from './HeaderBar';

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isLoginPage = pathname === '/login' || (!user && pathname === '/');

  if (isLoginPage) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[#f4f6f8] text-slate-900 transition-colors">
          {children}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[#f4f6f8] text-slate-900 transition-colors">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6f8]">
          <HeaderBar />
          <main className="flex-1 p-6 lg:p-8 animate-fade-in bg-[#f4f6f8]">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
