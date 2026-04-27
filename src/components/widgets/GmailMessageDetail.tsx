'use client';

import { useState, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { ArrowLeft, Trash2, Archive, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGmailMessageDetails, trashGmailMessage, archiveGmailMessage, markGmailAsRead } from '@/lib/actions/gmail-actions';

interface GmailMessageDetailProps {
  messageId: string;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function GmailMessageDetail({ messageId, onBack, onNext, onPrevious }: GmailMessageDetailProps) {
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
      // Optimistically remove the item from the cache to prevent Gmail API's delayed search index 
      // from returning the item again if we revalidated immediately.
      mutate(
        (key: string) => typeof key === 'string' && key.startsWith('/api/workspace/gmail'),
        (currentData: any) => {
          if (Array.isArray(currentData)) {
            return currentData.filter((msg: any) => msg.id !== messageId);
          }
          return currentData;
        },
        { revalidate: false }
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
      <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", marginBottom: "24px", width: "100%", flexShrink: 0 }}>
        <button 
          onClick={onBack}
          className="hover-opacity"
          style={{ background: "transparent", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", fontWeight: 500, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}
        >
          <ArrowLeft size={18} /> Back to Inbox
        </button>
        
        <div style={{ flex: 1 }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginRight: "12px" }}>
            <button 
              onClick={onPrevious}
              disabled={!onPrevious}
              className="hover-opacity"
              title="Newer Email"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", background: "var(--bg-deep)", border: "1px solid var(--glass-border)", borderRadius: "8px", color: "var(--text-primary)", opacity: !onPrevious ? 0.3 : 1, cursor: !onPrevious ? "default" : "pointer" }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={onNext}
              disabled={!onNext}
              className="hover-opacity"
              title="Older Email"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", background: "var(--bg-deep)", border: "1px solid var(--glass-border)", borderRadius: "8px", color: "var(--text-primary)", opacity: !onNext ? 0.3 : 1, cursor: !onNext ? "default" : "pointer" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={() => handleAction('archive')}
            disabled={!!processingAction}
            className="hover-opacity"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "var(--bg-deep)", border: "1px solid var(--glass-border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500, opacity: processingAction ? 0.5 : 1 }}
          >
            {processingAction === 'archive' ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
            Archive
          </button>
          <button 
            onClick={() => { if(window.confirm("Move this message to the trash?")) handleAction('trash') }}
            disabled={!!processingAction}
            className="hover-opacity"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.9rem", fontWeight: 500, opacity: processingAction ? 0.5 : 1 }}
          >
            {processingAction === 'trash' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
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
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest('a');
          if (anchor && anchor.href) {
            e.preventDefault();
            window.open(anchor.href, '_blank', 'noopener,noreferrer');
          }
        }}
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
