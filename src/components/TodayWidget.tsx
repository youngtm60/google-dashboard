'use client';

import { useState, useEffect } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TodayWidget() {
  const { data, error, isLoading } = useSWR('/api/today', fetcher);
  const [notes, setNotes] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load initial notes from API
  useEffect(() => {
    if (data?.notes !== undefined && !isMounted) {
      setNotes(data.notes);
      setIsMounted(true);
    } else if (data?.fallback && !isMounted) {
      // Local development fallback
      const savedNotes = localStorage.getItem('nebula_today_notes');
      if (savedNotes) setNotes(savedNotes);
      setIsMounted(true);
    }
  }, [data, isMounted]);

  // Debounced save
  useEffect(() => {
    if (!isMounted) return;

    setSaveStatus('saving');
    
    // If fallback is active, also save to local storage
    if (data?.fallback) {
      localStorage.setItem('nebula_today_notes', notes);
    }

    const timeoutId = setTimeout(async () => {
      try {
        await fetch('/api/today', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save notes:', error);
        setSaveStatus('idle');
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [notes, isMounted, data?.fallback]);

  const clearNotes = () => {
    if (confirm("Clear Today's notes?")) {
      setNotes('');
    }
  };

  return (
    <section className="glass-panel" style={{ 
      padding: "20px", 
      borderRadius: "24px", 
      minHeight: "300px", 
      maxHeight: "400px", 
      flex: 1, 
      display: "flex", 
      flexDirection: "column" 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-rose)" }}>
          <Edit3 size={20} />
          <h3 style={{ fontWeight: 600 }}>Today</h3>
        </div>
        
        <button 
          onClick={clearNotes}
          className="hover-opacity"
          style={{ 
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Trash2 size={14} />
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Clear</span>
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={isLoading ? "Loading your notes..." : "What's on your mind today? Type here for quick, persistent notes..."}
          disabled={isLoading}
          style={{
            flex: 1,
            width: "100%",
            background: "var(--bg-deep)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            padding: "16px",
            color: "var(--text-primary)",
            fontSize: "0.85rem",
            lineHeight: "1.6",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            transition: "all 0.3s ease",
            opacity: isLoading ? 0.6 : 1
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--accent-rose)"}
          onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
        />
      </div>

      <div style={{ marginTop: "12px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>
          * Notes are persistent across your devices securely.
        </p>
        {isMounted && (
          <span style={{ fontSize: "0.65rem", color: saveStatus === 'saving' ? "var(--accent-secondary)" : "var(--text-muted)", fontWeight: 600 }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Synced' : ''}
          </span>
        )}
      </div>
    </section>
  );
}
