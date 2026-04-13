'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, HardDrive, Clock, ExternalLink, Loader2, X, FileText } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DriveSearchWidget() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400); // 400ms delay for Drive (as API can be slower)

    return () => clearTimeout(handler);
  }, [query]);

  const { data: files, error, isLoading } = useSWR(
    `/api/workspace/drive${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ''}`, 
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
          placeholder="Search your Google Drive..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            padding: "18px 54px",
            color: "var(--text-primary)",
            fontSize: "1.05rem",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow: query ? "0 8px 32px rgba(0, 0, 0, 0.2)" : "none"
          }}
          className="focus-glow"
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
            Failed to fetch files. Please check your connection.
          </div>
        ) : files?.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {files.map((file: any) => (
              <a 
                key={file.id} 
                href={file.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-card hover-opacity" 
                style={{ 
                  padding: "18px", 
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  textDecoration: "none",
                  border: "1px solid var(--glass-border)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "7px", 
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {file.iconLink ? (
                        <img src={file.iconLink} alt="" style={{ width: "16px", height: "16px" }} />
                      ) : (
                        <FileText size={16} color="var(--text-muted)" />
                      )}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {file.name}
                    </span>
                  </div>
                  <ExternalLink size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={12} />
                    {new Date(file.modifiedTime).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    {file.size || '---'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px" }}>
            <HardDrive size={48} style={{ opacity: 0.1, marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem" }}>No files found matching "{debouncedQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
