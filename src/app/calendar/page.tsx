'use client';

import { useState, useEffect, Suspense } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import { ArrowLeft, Calendar, Settings2, Plus } from "lucide-react";
import Link from "next/link";

function CalendarPageContent() {
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dash_calendar_view');
    if (saved === 'all' || saved === 'recent') {
      setViewMode(saved as 'all' | 'recent');
    }
  }, []);

  const handleSetViewMode = (mode: 'all' | 'recent') => {
    setViewMode(mode);
    localStorage.setItem('dash_calendar_view', mode);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "100px" }}>
      <header style={{ marginBottom: "40px" }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginBottom: "16px",
            textDecoration: "none"
          }}
          className="hover-opacity"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Calendar size={32} style={{ color: "var(--accent-sky)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-sky)" }}>Scheduling Overview</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Real-time access to your personal and professional Google Calendar events.
        </p>
      </header>

      {/* Unified Scheduling Interface */}
      <div className="glass-panel" style={{ padding: "32px", borderRadius: "32px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Calendar size={24} color="var(--accent-sky)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {viewMode === 'all' ? 'Past & Upcoming' : 'Upcoming Calendar'}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* View Toggle */}
            <div style={{ 
              display: "flex", 
              background: "rgba(255,255,255,0.05)",
              padding: "4px",
              borderRadius: "12px",
              border: "1px solid var(--glass-border)",
              gap: "4px"
            }}>
              <button 
                onClick={() => handleSetViewMode('all')}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === 'all' ? "var(--accent-sky)" : "transparent",
                  color: viewMode === 'all' ? "white" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Past
              </button>
              <button 
                onClick={() => handleSetViewMode('recent')}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === 'recent' ? "var(--accent-sky)" : "transparent",
                  color: viewMode === 'recent' ? "white" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Upcoming
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="hover-opacity"
                style={{ 
                  background: "var(--accent-sky)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "10px", 
                  padding: "0 16px",
                  height: "36px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                <Settings2 size={16} />
                Calendars
              </button>
              <button 
                onClick={() => setIsCreating(true)}
                className="hover-opacity"
                style={{ 
                  background: "var(--accent-sky)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "10px", 
                  padding: "0 16px",
                  height: "36px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                <Plus size={18} />
                Add Event
              </button>
            </div>
          </div>
        </div>

        <CalendarWidget 
          initialLimit={viewMode === 'recent' ? 10 : undefined} 
          fullPage={true}
          showHeader={false} 
          fullHeight={true}
          viewMode={viewMode}
          externalShowSettings={showSettings}
          externalIsCreating={isCreating}
          onResetCreating={() => setIsCreating(false)}
          onStartCreating={() => setIsCreating(true)}
        />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading Calendar...</div>}>
      <CalendarPageContent />
    </Suspense>
  );
}
