'use client';

import {  useState , useEffect } from 'react';
import useSWR from 'swr';
import { Cloud, FileText, Image as ImageIcon, FileJson, File as FileIcon, Clock, Search, ListFilter, ExternalLink , Loader2 } from 'lucide-react';
import WidgetSkeleton from './WidgetSkeleton';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return <FileText size={18} />;
  if (mimeType.includes('image')) return <ImageIcon size={18} />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('document')) return <FileText size={18} />;
  return <FileIcon size={18} />;
};

export default function DriveWidget({ 
  initialLimit, 
  showHeader = true, 
  fullHeight = false,
  externalViewMode,
  onViewModeChange
}: { 
  initialLimit?: number, 
  showHeader?: boolean, 
  fullHeight?: boolean,
  externalViewMode?: 'all' | 'recent',
  onViewModeChange?: (mode: 'all' | 'recent') => void
}) {
  const [internalViewMode, setInternalViewMode] = useState<'all' | 'recent'>('recent');
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;

  useEffect(() => {
    if (showHeader) {
      const saved = localStorage.getItem('dash_drive_view');
      if (saved === 'all' || saved === 'recent') {
        setInternalViewMode(saved);
      }
    }
  }, [showHeader]);

  const handleSetViewMode = (mode: 'all' | 'recent') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
      localStorage.setItem('dash_drive_view', mode);
    }
  };

  const { data: files, isLoading } = useSWR('/api/workspace/drive', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and mode logic (sorted by modified date descending)
  const displayFiles = (files || [])
    .sort((a: any, b: any) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())
    .filter((file: any) => {
      const query = debouncedQuery.toLowerCase();
      return file.name.toLowerCase().includes(query);
    });

  const fetchLimit = viewMode === 'recent' ? (initialLimit || 10) : undefined;

  return (
    <section className={showHeader ? "glass-panel" : ""} style={{padding: showHeader ? "20px" : "0", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullHeight ? "600px" : "450px"}}>
      {showHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white" }}>
            <Cloud size={20} />
            <h3 style={{ fontWeight: 600, color: "white" }}>Drive</h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Action Buttons */}
            <button 
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="hover-opacity"
              style={{ 
                background: "var(--accent-primary)", 
                color: "white", 
                border: "none", 
                borderRadius: "10px", 
                padding: "0 12px",
                height: "32px", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600
              }}
              title="Open official Google Drive"
            >
              <ExternalLink size={14} />
              Open Drive
            </button>

            {/* View Toggle */}
            <div style={{ 
              display: "flex", 
              background: "rgba(0,0,0,0.03)",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid var(--glass-border)",
              gap: "3px"
            }}>
              <button 
                onClick={() => handleSetViewMode('all')}
                style={{
                  padding: "4px 12px",
                  borderRadius: "7px",
                  border: "none",
                  background: viewMode === 'all' ? "var(--accent-primary)" : "transparent",
                  color: viewMode === 'all' ? "white" : "var(--text-muted)",
                  fontSize: "0.75rem",
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
                  padding: "4px 12px",
                  borderRadius: "7px",
                  border: "none",
                  background: viewMode === 'recent' ? "var(--accent-primary)" : "transparent",
                  color: viewMode === 'recent' ? "white" : "var(--text-muted)",
                  fontSize: "0.75rem",
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
      )}

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
        />
      </div>

      <div style={{ 
        flex: 1,
        display: "flex", 
        flexDirection: "column", 
        gap: "10px",
        overflowY: "auto",
        paddingRight: "4px"
      }}>
        {isLoading && !files ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : displayFiles.slice(0, fetchLimit).map((file: any) => (
          <a 
            key={file.id} 
            href={file.webViewLink} 
            target="DriveTab"
            className="glass-card hover-opacity" 
            style={{ 
              padding: "12px 16px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              textDecoration: "none",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                width: "28px", 
                height: "28px", 
                borderRadius: "6px", 
                background: "rgba(255,255,255,0.05)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                {file.iconLink ? (
                  <img src={file.iconLink} alt={file.name} style={{ width: "16px", height: "16px" }} />
                ) : (
                  getFileIcon(file.mimeType)
                )}
              </div>
              <div style={{ maxWidth: "160px" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={10} style={{ color: "var(--text-muted)" }} />
                  <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    {new Date(file.modifiedTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </a>
        ))}
        {displayFiles.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
            <Cloud size={32} style={{ opacity: 0.2, marginBottom: "12px" }} />
            <p style={{ fontSize: "0.85rem" }}>No matching files found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
