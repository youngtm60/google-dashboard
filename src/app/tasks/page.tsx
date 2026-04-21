'use client';

import { useState, useEffect } from "react";
import TasksWidget from "@/components/TasksWidget";
import { ArrowLeft, CheckSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('dash_tasks_view');
    if (saved === 'all' || saved === 'recent') {
      setViewMode(saved as 'all' | 'recent');
    }
  }, []);

  const handleSetViewMode = (mode: 'all' | 'recent') => {
    setViewMode(mode);
    localStorage.setItem('dash_tasks_view', mode);
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
          <CheckSquare size={32} style={{ color: "var(--accent-cyan)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-cyan)" }}>Tasks Overview</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Manage your daily objectives and sync progress with Google Tasks.
        </p>
      </header>

      {/* Unified Tasks Interface */}
      <div className="glass-panel" style={{ padding: "32px", borderRadius: "32px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <CheckSquare size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {viewMode === 'all' ? 'All Tasks' : 'Recently Updated'}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => window.open('https://tasks.google.com', '_blank')}
                className="hover-opacity"
                style={{ 
                  background: "var(--accent-cyan)", 
                  color: "black", 
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
                title="Open official Google Tasks"
              >
                <ExternalLink size={16} />
                Open Tasks
              </button>
            </div>

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
                  background: viewMode === 'all' ? "var(--accent-cyan)" : "transparent",
                  color: viewMode === 'all' ? "black" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                All
              </button>
              <button 
                onClick={() => handleSetViewMode('recent')}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === 'recent' ? "var(--accent-cyan)" : "transparent",
                  color: viewMode === 'recent' ? "black" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        <TasksWidget 
          initialLimit={viewMode === 'recent' ? 10 : undefined} 
          showHeader={false} 
          fullHeight={true}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}
