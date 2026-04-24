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
        width: isOpen ? '950px' : '0px',
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
      <div style={{ width: '950px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', gap: '12px' }}>
          <a 
            href="https://app.nowsta.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              background: '#319AB5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '20px', 
              padding: '8px 16px', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#29829A'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#319AB5'}
          >
            Open Nowsta
          </a>
          <button 
            onClick={closeNowsta}
            style={{ 
              background: '#319AB5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '20px', 
              padding: '8px 16px', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#29829A'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#319AB5'}
          >
            Close
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
