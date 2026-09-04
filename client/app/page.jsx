'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Show landing page for unauthenticated users
      router.push('/landing');
      return;
    }
    switch (user.role) {
      case 'SAAS_SUPER_ADMIN':
        router.push('/saas-admin');
        break;
      case 'SCHOOL_ADMIN':
      case 'PRINCIPAL':
      case 'VICE_PRINCIPAL':
      case 'HEADMASTER':
      case 'HEAD_MASTER':
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
        router.push('/student');
        break;
      default:
        router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-xs">
      Loading...
    </div>
  );
}
