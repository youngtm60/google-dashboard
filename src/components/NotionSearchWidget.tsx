'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Notebook, Clock, ExternalLink, Loader2, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotionSearchWidget() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => clearTimeout(handler);
  }, [query]);

  const { data: notes, error, isLoading } = useSWR(
    `/api/workspace/notion${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ''}`, 
    fetcher
  );

  return (
    <div className="glass-panel" style={{ padding: "32px", borderRadius: "32px", width: "100%" }}>
      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <div style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none"
        }}>
          <Search size={20} />
        </div>
        
        <input
          type="text"
          className="search-input"
          placeholder="Search in Personal or BYU Notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "18px 54px",
            fontSize: "1.05rem"
          }}
        />

        {query && (
          <button 
            onClick={() => setQuery('')}
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results Section */}
      <div style={{ minHeight: "200px" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent-amber)" }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "var(--accent-rose)", padding: "40px" }}>
            Failed to fetch notes. Please check your integration.
          </div>
        ) : notes?.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {notes.map((note: any) => (
              <a 
                key={note.id} 
                href={note.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-card hover-opacity" 
                style={{ 
                  padding: "18px", 
                  display: "block",
                  textDecoration: "none",
                  border: "1px solid var(--glass-border)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.1rem" }}>{note.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {note.title}
                    </span>
                  </div>
                  <ExternalLink size={15} style={{ color: "var(--text-muted)" }} />
                </div>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ 
                    fontSize: "0.65rem", 
                    background: note.notebook === 'Personal' ? "rgba(129, 140, 248, 0.1)" : "rgba(244, 63, 64, 0.1)",
                    color: note.notebook === 'Personal' ? "var(--accent-primary)" : "var(--accent-rose)",
                    padding: "3px 8px",
                    borderRadius: "5px",
                    fontWeight: 700,
                    textTransform: "uppercase"
                  }}>
                    {note.notebook}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={13} />
                    {new Date(note.lastEdited).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px" }}>
            <Notebook size={48} style={{ opacity: 0.1, marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem" }}>No notes found matching "{debouncedQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
