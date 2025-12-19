'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function TimeManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="app-shell">
        <Sidebar />
        <div className="flex-1 ml-[280px]">
          <Header />
          <main className="app-main">
            <div className="page">
              <div className="page-inner">
                <div className="panel">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

