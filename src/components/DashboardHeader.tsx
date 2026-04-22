'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Loader2, Menu, Calendar } from 'lucide-react';
import { useSidebar } from '@/lib/SidebarContext';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardHeader() {
  const [greeting, setGreeting] = useState('Hello');
  const [dailySnark, setDailySnark] = useState('');

  const snarkyComments = [
    "Most of those are probably meetings that could have been emails.",
    "The inbox isn't going to clear itself, Tim.",
    "Is 'checking the dashboard' technically a task now?",
    "Bold of you to assume you'll finish all those today.",
    "Maybe one more Diet Coke will solve the task list problem.",
    "Focus, Tim. The internet will still be there later.",
    "Efficiency is just a fancy word for 'doing it faster next time'.",
    "That's a lot of unread mail. Have you tried turning it off and on again?",
    "I'm sure you'll get to those tasks... eventually.",
    "A clean inbox is a sign of a cluttered mind. Or something.",
    "Don't look at me, I just display the numbers.",
    "The tasks are patient. They'll be there tomorrow too.",
    "Procrastination is just the art of keeping up with yesterday.",
    "If 'Thinking about work' were a task, you'd be done by now.",
    "Are you working hard, or just making the dashboard look busy?",
    "Your inbox called. It's disappointed in you.",
    "Rome wasn't built in a day, but they didn't have 50 unread emails.",
    "Just pick one, Tim. Any one. It's better than staring.",
    "That notification sound? That's the sound of more work.",
    "Deep breaths. The unread count is just a number. A big, scary number.",
    "Statistics say 80% of those tasks are actually avoidable."
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const day = new Date().getDate();
    setDailySnark(snarkyComments[day % snarkyComments.length]);
  }, []);

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
      alignItems: "center", 
      marginBottom: "10px",
      padding: "0 12px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <h1 style={{ 
          fontSize: "2.2rem", 
          fontWeight: 800, 
          letterSpacing: "-0.5px",
          color: "var(--accent-primary)",
          margin: 0
        }}>
          {greeting}, Tim.
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "24px" }}>
          {isLoading ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
              Fetching your updates... <Loader2 size={12} className="animate-spin" />
            </p>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              You have <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{tasksText}</span> and <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{emailsText}</span>.
              {dailySnark && <span style={{ color: "var(--text-secondary)", fontStyle: "italic", marginLeft: "12px" }}>— {dailySnark}</span>}
            </p>
          )}
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        
        {/* Actions Row */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
          
          {/* Actions Row (Outlook, Nowsta, Date, Timer) */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Outlook Button */}
            <a
              href="https://outlook.cloud.microsoft/calendar/view/week"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0078D4',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                transition: 'background-color 0.2s',
                height: '38px',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#005A9E'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0078D4'}
            >
              <Calendar size={16} />
              Outlook
            </a>
            
            {/* Nowsta Button */}
            <button
              onClick={toggleNowsta}
              style={{
                background: '#319AB5',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                transition: 'background-color 0.2s',
                height: '38px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#29829A'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#319AB5'}
            >
              <Menu size={16} />
              Nowsta
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
