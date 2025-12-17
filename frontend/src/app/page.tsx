'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUserRole } from '@/lib/utils/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();

    if (!token) {
      // Not logged in, redirect to login
      router.push('/login');
      return;
    }

    // Logged in, redirect based on role
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('manager') || roleLower.includes('head') || roleLower.includes('admin')) {
      router.push('/manager/attendance');
    } else {
      router.push('/attendance');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

