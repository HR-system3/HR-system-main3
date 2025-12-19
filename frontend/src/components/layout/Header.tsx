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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">
                  {user.name}
                </div>
                <div className="text-xs text-neutral-500">{user.role}</div>
              </div>
              <div className="nav-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn-ghost text-sm px-3 py-1.5"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

