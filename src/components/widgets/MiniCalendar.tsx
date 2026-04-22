'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '6px 8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      width: '160px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={prevMonth}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '50%'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft size={12} />
        </button>
        <span style={{ fontWeight: 600, fontSize: '0.6rem', color: 'var(--text-primary)' }}>
          {monthName} {year}
        </span>
        <button 
          onClick={nextMonth}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '50%'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronRight size={12} />
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '1px',
        textAlign: 'center'
      }}>
        {days.map(day => (
          <div key={day} style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday = isCurrentMonth && day === today.getDate();
          
          return (
            <div 
              key={day} 
              style={{ 
                fontSize: '0.65rem', 
                padding: '1px 0',
                borderRadius: '50%',
                backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                color: isToday ? '#ffffff' : 'var(--text-primary)',
                fontWeight: isToday ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)';
              }}
              onMouseOut={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
