'use client';

import React from 'react';
import { useSidebar } from '@/lib/SidebarContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isNowstaOpen } = useSidebar();

  return (
    <main 
      className="main-content"
      style={{
        marginLeft: isNowstaOpen ? '0px' : 'var(--sidebar-width)',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </main>
  );
}
