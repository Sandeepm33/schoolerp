'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'SAAS_SUPER_ADMIN':
          router.push('/saas-admin');
          break;
        case 'SCHOOL_ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'ACCOUNTANT':
          router.push('/accountant');
          break;
        case 'TEACHER':
          router.push('/teacher');
          break;
        case 'PARENT':
          router.push('/parent');
          break;
        case 'STUDENT':
          router.push('/parent');
          break;
        default:
          router.push('/login');
      }
    }
  }, [user, router]);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-xs">
      Redirecting to your dedicated ERP Dashboard...
    </div>
  );
}
