'use client';

import {  useState , useEffect } from 'react';
import useSWR from 'swr';
import { Send, Clock, Mail, Search, Plus, Loader2, ExternalLink } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import WidgetSkeleton from './WidgetSkeleton';
import GmailMessageDetail from './widgets/GmailMessageDetail';
import GmailCompose from './widgets/GmailCompose';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GmailWidget({ 
  limit = 10, 
  fullPage = false, 
  showHeader = true, 
  fullHeight = false,
  externalIsComposing,
  onResetComposing,
  viewMode = 'all'
}: { 
  limit?: number, 
  fullPage?: boolean, 
  showHeader?: boolean, 
  fullHeight?: boolean,
  externalIsComposing?: boolean,
  onResetComposing?: () => void,
  viewMode?: 'all' | 'unread'
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMessageId = searchParams?.get('messageId');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const [internalIsComposing, setInternalIsComposing] = useState(false);
  const isComposing = externalIsComposing !== undefined ? externalIsComposing : internalIsComposing;

  const handleResetComposing = () => {
    if (onResetComposing) {
      onResetComposing();
    } else {
      setInternalIsComposing(false);
    }
  };

  // Use broader inbox fetch
  const gmailQuery = viewMode === 'unread' ? 'is:unread' : 'label:INBOX';
  const fetchLimit = fullPage ? 50 : limit;

  const { data: messages, isLoading } = useSWR(`/api/workspace/gmail?limit=${fetchLimit}&q=${encodeURIComponent(gmailQuery)}`, fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

    // Local filtering for search and sort by date
  // MOVE THIS UP so we have access to it for the detail view
  const displayMessages = (messages || [])
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((msg: any) => {
    const q = debouncedQuery.toLowerCase();
    return msg.subject.toLowerCase().includes(q) || 
           msg.from.toLowerCase().includes(q) ||
           msg.snippet.toLowerCase().includes(q);
  });

  // Render Full Page Message Detail
  if (fullPage && urlMessageId) {
    const activeIndex = displayMessages.findIndex((m: any) => m.id === urlMessageId);
    const nextMsgId = (activeIndex >= 0 && activeIndex < displayMessages.length - 1) ? displayMessages[activeIndex + 1].id : null;
    const prevMsgId = (activeIndex > 0) ? displayMessages[activeIndex - 1].id : null;

    return (
      <section className={showHeader ? "glass-panel" : ""} style={{padding: showHeader ? "40px" : "0", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullHeight ? "600px" : (fullPage ? "100%" : "450px"), minHeight: "600px"}}>
        <GmailMessageDetail 
          messageId={urlMessageId} 
          onBack={() => router.push('/gmail')}
          onNext={nextMsgId ? () => router.push('/gmail?messageId=' + nextMsgId) : undefined}
          onPrevious={prevMsgId ? () => router.push('/gmail?messageId=' + prevMsgId) : undefined}
        />
      </section>
    );
  }

  // Render Sub-Views If Active
  if (isComposing) {
    return (
      <section className={showHeader ? "glass-panel" : ""} style={{padding: showHeader ? "24px" : "0", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullHeight ? "600px" : (fullPage ? "100%" : "450px")}}>
        <GmailCompose onBack={handleResetComposing} />
      </section>
    );
  }

  const handleEmailClick = (msgId: string) => {
    router.push('/gmail?messageId=' + msgId);
  };

  return (
    <section className={showHeader ? "glass-panel" : ""} style={{padding: showHeader ? "24px" : "0", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullHeight ? "600px" : (fullPage ? "100%" : "450px")}}>
      {showHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-primary)" }}>
            <Mail size={20} />
            <h3 style={{ fontWeight: 600 }}>Gmail</h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Action Buttons */}
            <button 
              onClick={() => window.open('https://mail.google.com', '_blank')}
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
              title="Open official Gmail site"
            >
              <ExternalLink size={14} />
              Open Gmail
            </button>

            <button 
              onClick={() => setIsComposing(true)}
              className="hover-opacity"
              title="Compose Email"
              style={{ 
                background: "var(--accent-primary)", 
                color: "white", 
                padding: "0 12px",
                height: "32px", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                fontWeight: 600,
                fontSize: "0.8rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <Plus size={16} strokeWidth={3} /> Compose
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "20px", flexShrink: 0 }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emails, senders, or subjects..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "10px",
            padding: "8px 12px 8px 34px",
            color: "var(--text-primary)",
            fontSize: "0.85rem",
            outline: "none"
          }}
        />
      </div>

      <div 
        className="custom-scrollbar"
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: "12px",
          overflowY: "auto",
          paddingRight: "4px"
        }}
      >
        {displayMessages.map((msg: any) => (
          <div 
            key={msg.id} 
            onClick={() => handleEmailClick(msg.id)}
            className="glass-card hover-opacity" 
            style={{ 
              padding: "14px 16px", 
              display: "block",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: msg.isUnread ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {msg.from.split('<')[0].trim()}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={11} />
                {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", fontWeight: msg.isUnread ? 500 : 400, color: "var(--text-primary)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {msg.subject}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {msg.snippet}
            </p>
          </div>
        ))}
        {displayMessages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
            <Mail size={32} style={{ opacity: 0.2, marginBottom: "12px", margin: "0 auto" }} />
            <p style={{ fontSize: "0.85rem" }}>No matching emails found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
