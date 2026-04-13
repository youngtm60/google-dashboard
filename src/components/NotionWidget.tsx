'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Notebook, Clock, ExternalLink, Search } from 'lucide-react';
import WidgetSkeleton from './WidgetSkeleton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotionWidget({ limit = 100 }: { limit?: number }) {
  const { data: notes, error, isLoading } = useSWR('/api/workspace/notion', fetcher, {
    refreshInterval: 1000 * 60 * 10, // 10 minutes polling
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');

  if (isLoading) return <WidgetSkeleton />;

  // Filter notes based on search query
  const displayNotes = (notes || []).filter((note: any) => {
    const query = searchQuery.toLowerCase();
    return note.title.toLowerCase().includes(query) || 
           (note.notebook && note.notebook.toLowerCase().includes(query));
  });

  const finalNotes = viewMode === 'recent' ? displayNotes.slice(0, 10) : displayNotes;

  return (
    <section className="glass-panel" style={{ padding: "20px", borderRadius: "24px", minHeight: "300px", maxHeight: "400px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-amber)" }}>
          <Notebook size={20} />
          <h3 style={{ fontWeight: 600 }}>Notion Notes</h3>
        </div>
        
        {/* View Mode Toggle */}
        <div style={{ 
          background: "rgba(255,255,255,0.05)", 
          padding: "2px", 
          borderRadius: "8px", 
          display: "flex",
          border: "1px solid var(--glass-border)"
        }}>
          <button 
            onClick={() => { setViewMode('recent'); setSearchQuery(''); }}
            style={{ 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "0.7rem", 
              fontWeight: 600,
              background: viewMode === 'recent' ? "var(--accent-amber)" : "transparent",
              color: viewMode === 'recent' ? "black" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            Recent
          </button>
          <button 
            onClick={() => { setViewMode('all'); setSearchQuery(''); }}
            style={{ 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "0.7rem", 
              fontWeight: 600,
              background: viewMode === 'all' ? "var(--accent-amber)" : "transparent",
              color: viewMode === 'all' ? "black" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            All
          </button>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes or notebooks..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--glass-border)",
            borderRadius: "10px",
            padding: "8px 12px 8px 34px",
            color: "white",
            fontSize: "0.8rem",
            outline: "none"
          }}
        />
      </div>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        gap: "12px", 
        overflowY: "auto",
        paddingRight: "4px" 
      }}>
        {finalNotes.map((note: any) => (
          <a 
            key={note.id} 
            href={note.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card hover-opacity" 
            style={{ 
              padding: "16px", 
              display: "block",
              textDecoration: "none",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1rem" }}>{note.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  {note.title}
                </span>
              </div>
              <ExternalLink size={13} style={{ color: "var(--text-muted)" }} />
            </div>
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ 
                fontSize: "0.65rem", 
                background: note.notebook === 'Personal' ? "rgba(129, 140, 248, 0.1)" : "rgba(244, 63, 94, 0.1)",
                color: note.notebook === 'Personal' ? "var(--accent-primary)" : "var(--accent-rose)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                {note.notebook}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={11} />
                {new Date(note.lastEdited).toLocaleDateString()}
              </span>
            </div>
          </a>
        ))}
        {finalNotes.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
            <Notebook size={32} style={{ opacity: 0.2, marginBottom: "12px" }} />
            <p style={{ fontSize: "0.85rem" }}>No matching notes found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
