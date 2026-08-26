'use client';

export const dynamic = 'force-dynamic';

import AdminDashboard from '../../components/AdminDashboard';

export default function Page() {
  return <AdminDashboard initialTab="hrms" />;
}
