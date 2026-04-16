'use client';

import { useState, useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { sendGmailMessage } from '@/lib/actions/gmail-actions';
import { searchGoogleContacts } from '@/lib/actions/contacts-actions';

interface GmailComposeProps {
  onBack: () => void;
}

interface Contact {
  name: string;
  email: string;
}

export default function GmailCompose({ onBack }: GmailComposeProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!to.trim() || to.includes('<') || to.includes('@')) {
      // Don't search if it's empty, or already formatted, or an explicit email
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingContacts(true);
      const res = await searchGoogleContacts(to);
      if (res.success && res.results && res.results.length > 0) {
        setSuggestions(res.results);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
      setIsLoadingContacts(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [to]);

  const selectContact = (contact: Contact) => {
    setTo(`${contact.name} <${contact.email}>`);
    setShowDropdown(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !body.trim()) return;

    setIsSending(true);
    setError(null);

    const result = await sendGmailMessage(to, subject, body);
    
    if (result.success) {
      setIsSending(false);
      onBack();
    } else {
      setError(result.error || 'Failed to send message');
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={onBack}
            className="hover-opacity"
            style={{ background: "transparent", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={20} />
          </button>
          <h3 style={{ fontWeight: 600, fontSize: "0.95rem" }}>New Message</h3>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }} className="custom-scrollbar">
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", fontSize: "0.8rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }} ref={dropdownRef}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, paddingLeft: "4px" }}>To</label>
            <input 
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              placeholder="Name or recipient@example.com"
              required
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "0.85rem", outline: "none", width: "100%" }}
            />
            {isLoadingContacts && (
               <Loader2 size={14} className="animate-spin" style={{ position: "absolute", right: "12px", top: "36px", color: "var(--text-muted)" }} />
            )}
            {showDropdown && suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "rgba(20, 20, 25, 0.95)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", borderRadius: "10px", marginTop: "4px", padding: "4px", zIndex: 50, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", maxHeight: "150px", overflowY: "auto" }} className="custom-scrollbar">
                {suggestions.map((contact, i) => (
                  <div 
                    key={i}
                    onClick={() => selectContact(contact)}
                    style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "50%", padding: "4px" }}>
                      <User size={12} color="var(--text-secondary)" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 500 }}>{contact.name}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{contact.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, paddingLeft: "4px" }}>Subject</label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Meeting agenda..."
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "0.85rem", outline: "none", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, paddingLeft: "4px" }}>Message</label>
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Hi there,"
              style={{ flex: 1, minHeight: "200px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "12px 14px", color: "white", fontSize: "0.85rem", outline: "none", width: "100%", resize: "none" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSending || !to.trim() || !body.trim()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--accent-primary)", color: "black", padding: "12px", borderRadius: "10px", fontWeight: 600, fontSize: "0.9rem", marginTop: "10px", opacity: (isSending || !to.trim() || !body.trim()) ? 0.6 : 1, transition: "opacity 0.2s" }}
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
