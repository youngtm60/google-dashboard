'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isNowstaOpen: boolean;
  toggleNowsta: () => void;
  closeNowsta: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isNowstaOpen, setIsNowstaOpen] = useState(false);

  const toggleNowsta = () => setIsNowstaOpen(prev => !prev);
  const closeNowsta = () => setIsNowstaOpen(false);

  return (
    <SidebarContext.Provider value={{ isNowstaOpen, toggleNowsta, closeNowsta }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
