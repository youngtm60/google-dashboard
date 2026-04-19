'use client';

import React from 'react';
import { useSidebar } from '@/lib/SidebarContext';
import { X } from 'lucide-react';

export default function NowstaSidebar() {
  const { isNowstaOpen, closeNowsta } = useSidebar();
  const isOpen = isNowstaOpen;

  return (
    <div 
      style={{
        width: isOpen ? '450px' : '0px',
        height: '100vh',
        backgroundColor: '#ffffff',
        borderLeft: isOpen ? '1px solid var(--glass-border)' : 'none',
        boxShadow: isOpen ? '-4px 0 15px rgba(0,0,0,0.02)' : 'none',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10
      }}
    >
      <div style={{ width: '450px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Nowsta</h2>
          <button 
            onClick={closeNowsta}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          <iframe 
            src="https://app.nowsta.com"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Nowsta"
          />
        </div>
      </div>
    </div>
  );
}
