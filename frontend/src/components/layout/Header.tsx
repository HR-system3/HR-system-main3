'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import { authService } from '@/services/api/auth.service';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <div className="top-nav-logo">HR</div>
        <div>
          <div className="top-nav-title">HR System</div>
          <div className="top-nav-sub">Complete Management</div>
        </div>
      </div>
      <div className="top-nav-right">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '500' }}>
                  {user.name}
                </div>
                <div className="top-nav-sub">{user.role}</div>
              </div>
              <div className="nav-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '13px', padding: '6px 14px' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

