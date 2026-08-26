'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AppSidebar from './AppSidebar';
import HeaderBar from './HeaderBar';

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isLoginPage = pathname === '/login' || (!user && pathname === '/');

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#06080d] text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#06080d] text-white">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar />
        <main className="flex-1 p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
