'use client';

import React from 'react';
import Navigation from './Navigation';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] z-30 bg-green-500 border-r border-neutral-200">
      <Navigation />
    </aside>
  );
}