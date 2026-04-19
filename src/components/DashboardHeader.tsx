'use client';

import useSWR from 'swr';
import { Loader2, Menu, Calendar } from 'lucide-react';
import PomodoroWidget from './widgets/PomodoroWidget';
import MiniCalendar from './widgets/MiniCalendar';
import { useSidebar } from '@/lib/SidebarContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardHeader() {
  const { data: tasks, isLoading: tasksLoading } = useSWR('/api/workspace/tasks', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const { data: messages, isLoading: messagesLoading } = useSWR('/api/workspace/gmail?limit=50&q=is:unread', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const { toggleNowsta } = useSidebar();

  const isLoading = tasksLoading || messagesLoading;
  
  // Calculate counts
  const activeTasksCount = tasks ? tasks.filter((t: any) => t.status !== 'completed').length : 0;
  const unreadEmailsCount = messages && Array.isArray(messages) ? messages.length : 0;
  
  const emailsText = unreadEmailsCount >= 50 ? '50+ unread emails' : `${unreadEmailsCount} unread email${unreadEmailsCount !== 1 ? 's' : ''}`;
  const tasksText = `${activeTasksCount} active task${activeTasksCount !== 1 ? 's' : ''}`;

  return (
    <header style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "flex-start", 
      marginBottom: "32px",
      padding: "10px 0"
    }}>
      <div>
        <h1 style={{ 
          fontSize: "2.8rem", 
          fontWeight: 800, 
          letterSpacing: "-0.5px",
          marginBottom: "8px",
          color: "var(--accent-primary)"
        }}>
          Dashboard
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "24px" }}>
          {isLoading ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
              Welcome back. Fetching your updates... <Loader2 size={12} className="animate-spin" />
            </p>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Welcome back. You have <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{tasksText}</span> and <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{emailsText}</span>.
            </p>
          )}
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
        
        {/* Left Column Stack */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
          
          {/* Date Button (Calendar Button) */}
          <div style={{ 
            background: 'var(--glass-bg)', 
            padding: '8px 16px', 
            borderRadius: '20px',
            border: '1px solid var(--glass-border)',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            height: '38px'
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          {/* Timer Row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            {/* Outlook Button */}
            <a
              href="https://outlook.cloud.microsoft/calendar/view/week"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'background-color 0.2s',
                height: '38px',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--glass-bg)'}
            >
              <Calendar size={16} />
              Outlook
            </a>
            
            {/* Nowsta Button */}
            <button
              onClick={toggleNowsta}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'background-color 0.2s',
                height: '38px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--glass-bg)'}
            >
              <Menu size={16} />
              Nowsta
            </button>
            
            <PomodoroWidget />
          </div>
        </div>
        
        {/* Right Column */}
        <MiniCalendar />

      </div>
    </header>
  );
}
