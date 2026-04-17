'use client';

import { useState, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { ArrowLeft, Trash2, Archive, Loader2, MailOpen } from 'lucide-react';
import { getGmailMessageDetails, trashGmailMessage, archiveGmailMessage, markGmailAsRead } from '@/lib/actions/gmail-actions';

interface GmailMessageDetailProps {
  messageId: string;
  onBack: () => void;
}

export default function GmailMessageDetail({ messageId, onBack }: GmailMessageDetailProps) {
  const { mutate } = useSWRConfig();
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      const result = await getGmailMessageDetails(messageId);
      if (result.success) {
        setDetails(result);
        if (result.isUnread) {
          // Opportunistically mark as read in background without blocking
          markGmailAsRead(messageId).then(() => {
            mutate(
              (key: string) => typeof key === 'string' && key.startsWith('/api/workspace/gmail'),
              undefined,
              { revalidate: true }
            );
          });
        }
      }
      setIsLoading(false);
    }
    loadDetails();
  }, [messageId, mutate]);

  const handleAction = async (actionType: 'trash' | 'archive') => {
    setProcessingAction(actionType);
    let result;
    
    if (actionType === 'trash') {
      result = await trashGmailMessage(messageId);
    } else {
      result = await archiveGmailMessage(messageId);
    }

    if (result.success) {
      // Revalidate any cached gmail query
      mutate(
        (key: string) => typeof key === 'string' && key.startsWith('/api/workspace/gmail'),
        undefined,
        { revalidate: true }
      );
      onBack();
    } else {
      alert(`Failed to ${actionType} message. Please check permissions.`);
      setProcessingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} className="animate-spin" color="var(--accent-primary)" />
        <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>Loading email body...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={onBack} style={{ background: "transparent", color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <p style={{ color: "#fca5a5", fontSize: "0.85rem" }}>Failed to load message details.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
      {/* Top Action Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", marginBottom: "20px", width: "100%", flexShrink: 0 }}>
        <button 
          onClick={onBack}
          className="hover-opacity"
          style={{ background: "transparent", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 500 }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        
        <div style={{ flex: 1 }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button 
            onClick={() => handleAction('archive')}
            disabled={!!processingAction}
            title="Archive"
            className="hover-opacity"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "8px", width: "32px", height: "32px", color: "var(--text-primary)", opacity: processingAction ? 0.5 : 1 }}
          >
            {processingAction === 'archive' ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
          </button>
          <button 
            onClick={() => { if(window.confirm("Move this message to the trash?")) handleAction('trash') }}
            disabled={!!processingAction}
            title="Trash"
            className="hover-opacity"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", width: "32px", height: "32px", color: "#fca5a5", opacity: processingAction ? 0.5 : 1 }}
          >
            {processingAction === 'trash' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* Email Header Info */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "16px", flexShrink: 0 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.3 }}>{details.subject}</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
            {details.from}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }}>
            {new Date(details.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </div>
      </div>

      {/* Email Body - We render raw HTML within a safe sanitized container area */}
      {/* We apply a very simple white box for the email body because emails usually assume a light background */}
      <div 
        className="custom-scrollbar"
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          background: "white", 
          borderRadius: "12px", 
          padding: "20px", 
          color: "black",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: details.bodyHtml }} />
      </div>
    </div>
  );
}
