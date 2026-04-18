'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Send, Clock, Mail, Search, Plus } from 'lucide-react';
import WidgetSkeleton from './WidgetSkeleton';
import GmailMessageDetail from './widgets/GmailMessageDetail';
import GmailCompose from './widgets/GmailCompose';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GmailWidget({ limit = 10 }: { limit?: number }) {
    const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Use broader inbox fetch
  const gmailQuery = 'label:INBOX';
  const fetchLimit = 50;

  const { data: messages, isLoading } = useSWR(`/api/workspace/gmail?limit=${fetchLimit}&q=${encodeURIComponent(gmailQuery)}`, fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  if (isLoading) return <WidgetSkeleton />;

  // Render Sub-Views If Active
  if (isComposing) {
    return (
      <section className="glass-panel" style={{padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", height: "450px"}}>
        <GmailCompose onBack={() => setIsComposing(false)} />
      </section>
    );
  }

  if (selectedMessageId) {
    return (
      <section className="glass-panel" style={{padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", height: "450px"}}>
        <GmailMessageDetail messageId={selectedMessageId} onBack={() => setSelectedMessageId(null)} />
      </section>
    );
  }

  // Local filtering for search and sort by date
  const displayMessages = (messages || [])
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((msg: any) => {
    const q = searchQuery.toLowerCase();
    return msg.subject.toLowerCase().includes(q) || 
           msg.from.toLowerCase().includes(q) ||
           msg.snippet.toLowerCase().includes(q);
  });

  return (
    <section className="glass-panel" style={{padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", height: "450px"}}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-primary)" }}>
          <Mail size={20} />
          <h3 style={{ fontWeight: 600 }}>Gmail Inbox</h3>
          <button 
            onClick={() => setIsComposing(true)}
            className="hover-opacity"
            title="Compose Email"
            style={{ 
              background: "rgba(255,255,255,0.1)", 
              color: "white", 
              width: "24px", 
              height: "24px", 
              borderRadius: "6px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginLeft: "4px"
            }}
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "none" /* hidden on mobile typically, let's keep it clean */ }}>
            {messages?.filter((m: any) => m.isUnread).length} Unread
          </span>


        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emails, senders, or subjects..."
          style={{
            width: "100%",
            background: "var(--bg-deep)",
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
            onClick={() => setSelectedMessageId(msg.id)} // Launch detail view
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
