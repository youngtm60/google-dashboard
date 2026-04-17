'use client';

import { useState, useEffect } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

export default function TodayWidget() {
  const [notes, setNotes] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Persistence logic
  useEffect(() => {
    const savedNotes = localStorage.getItem('nebula_today_notes');
    if (savedNotes) setNotes(savedNotes);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('nebula_today_notes', notes);
    }
  }, [notes, isMounted]);

  const clearNotes = () => {
    if (confirm('Clear Today\'s notes?')) {
      setNotes('');
    }
  };

  return (
    <section className="glass-panel" style={{ 
      padding: "20px", 
      borderRadius: "24px", 
      minHeight: "300px", 
      maxHeight: "400px", 
      height: "100%", 
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
          placeholder="What's on your mind today? Type here for quick, persistent notes..."
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
            transition: "all 0.3s ease"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--accent-rose)"}
          onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
        />
      </div>

      <div style={{ marginTop: "12px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>
          * Notes are persistent and stored locally on this device.
        </p>
      </div>
    </section>
  );
}
