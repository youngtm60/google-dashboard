'use client';

import { useState, useEffect } from "react";
import GmailWidget from "@/components/GmailWidget";
import { ArrowLeft, Mail, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GmailPageContent() {
  const [isComposing, setIsComposing] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'unread'>('all');
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('messageId');

  useEffect(() => {
    const saved = localStorage.getItem('dash_gmail_view');
    if (saved === 'all' || saved === 'unread') {
      setViewMode(saved as 'all' | 'unread');
    }
  }, []);

  const handleSetViewMode = (mode: 'all' | 'unread') => {
    setViewMode(mode);
    localStorage.setItem('dash_gmail_view', mode);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "100px" }}>
      <header style={{ marginBottom: "20px" }}>
        <Link 
          href={messageId ? "/gmail" : "/"} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "#000",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "16px",
            textDecoration: "none"
          }}
          className="hover-opacity"
        >
          <ArrowLeft size={16} />
          {messageId ? "Back to Inbox" : "Back to Dashboard"}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Mail size={32} style={{ color: "var(--accent-primary)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-primary)" }}>Gmail</h1>
        </div>
      </header>

      {/* Unified Gmail Interface */}
      <div className="glass-panel" style={{ padding: "32px", borderRadius: "32px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Mail size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Inbox</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="hover-opacity"
                style={{ 
                  background: "var(--accent-primary)", 
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
                title="Open official Gmail site"
              >
                <ExternalLink size={16} />
                Open Gmail
              </button>
              <button 
                onClick={() => setIsComposing(true)}
                className="hover-opacity"
                style={{ 
                  background: "var(--accent-primary)", 
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
                title="Compose new email"
              >
                <Plus size={18} />
                Compose
              </button>
            </div>

            {/* View Toggle (Unified Pattern) */}
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
                  background: viewMode === 'all' ? "var(--accent-primary)" : "transparent",
                  color: viewMode === 'all' ? "white" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                All
              </button>
              <button 
                onClick={() => handleSetViewMode('unread')}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: viewMode === 'unread' ? "var(--accent-primary)" : "transparent",
                  color: viewMode === 'unread' ? "white" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Unread
              </button>
            </div>
          </div>
        </div>

        <div style={{ minHeight: "1000px" }}>
          <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading Inbox...</div>}>
            <GmailWidget 
              limit={50} 
              fullPage={true} 
              showHeader={false} 
              fullHeight={true}
              externalIsComposing={isComposing}
              onResetComposing={() => setIsComposing(false)}
              onStartComposing={() => setIsComposing(true)}
              viewMode={viewMode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function GmailPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading Gmail...</div>}>
      <GmailPageContent />
    </Suspense>
  );
}
