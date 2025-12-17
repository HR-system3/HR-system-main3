'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUserRole, isManager } from '@/lib/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireManager?: boolean;
}

export default function ProtectedRoute({ children, requireManager = false }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      router.push('/login');
      return;
    }

    // If manager role required, check it
    if (requireManager) {
      if (!isManager()) {
        router.push('/attendance');
        return;
      }
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, requireManager]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

