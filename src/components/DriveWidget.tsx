'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Cloud, FileText, Image as ImageIcon, FileJson, File as FileIcon, Clock, Search, ListFilter } from 'lucide-react';
import WidgetSkeleton from './WidgetSkeleton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return <FileText size={18} />;
  if (mimeType.includes('image')) return <ImageIcon size={18} />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('document')) return <FileText size={18} />;
  return <FileIcon size={18} />;
};

export default function DriveWidget() {
  const { data: files, isLoading } = useSWR('/api/workspace/drive', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

    const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) return <WidgetSkeleton />;

  // Filter and mode logic (sorted by modified date descending)
  const displayFiles = (files || [])
    .sort((a: any, b: any) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())
    .filter((file: any) => {
      const query = searchQuery.toLowerCase();
      return file.name.toLowerCase().includes(query);
    });

  return (
    <section className="glass-panel" style={{padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", height: "450px"}}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-emerald)" }}>
          <Cloud size={20} />
          <h3 style={{ fontWeight: 600 }}>Google Drive</h3>
        </div>
        

      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          style={{
            width: "100%",
            background: "var(--bg-deep)",
            border: "1px solid var(--glass-border)",
            borderRadius: "10px",
            padding: "8px 12px 8px 34px",
            color: "var(--text-primary)",
            fontSize: "0.8rem",
            outline: "none"
          }}
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
        {displayFiles.map((file: any) => (
          <a 
            key={file.id} 
            href={file.webViewLink} 
            target="_blank" 
            rel="noopener noreferrer"
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
