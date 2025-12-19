'use client';

import React from 'react';
import Navigation from './Navigation';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-30" style={{ background: 'var(--navy)', borderRight: '1px solid var(--border-subtle)' }}>
      <Navigation />
    </aside>
  );
}