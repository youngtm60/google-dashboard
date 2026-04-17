'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Notebook, Clock, ExternalLink, Search, Plus, Loader2 } from 'lucide-react';
import WidgetSkeleton from './WidgetSkeleton';
import NotionNoteEditor from './widgets/NotionNoteEditor';
import { createNotionPage } from '@/lib/actions/notion-actions';
import { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotionWidget({ limit = 100 }: { limit?: number }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteNotebook, setNewNoteNotebook] = useState('Personal');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    setIsCreating(true);
    const res = await createNotionPage(newNoteTitle, newNoteNotebook);
    setIsCreating(false);
    
    if (res.success && res.pageId) {
      setNewNoteTitle('');
      setShowCreateForm(false);
      // Immediately tell SWR to refetch so the list updates
      mutate(`/api/workspace/notion${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ''}`);
      
      // Auto open the newly created note in the editor
      // We set activeNoteId to the returned ID
      setActiveNoteId(res.pageId);
    } else {
      alert("Failed to create note: " + res.error);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: notes, error, isLoading } = useSWR(`/api/workspace/notion${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ''}`, fetcher, {
    refreshInterval: 1000 * 60 * 10, // 10 minutes polling
  });

  if (isLoading) return <WidgetSkeleton />;

  // We no longer need client-side filtering because notion.search handles full-text search!
  const displayNotes = notes || [];

  const finalNotes = viewMode === 'recent' 
    ? displayNotes.slice(0, 10) 
    : [...displayNotes].sort((a: any, b: any) => a.title.localeCompare(b.title));

  if (activeNoteId) {
    
    let activeNote = notes?.find((n: any) => n.id === activeNoteId);
    // Fallback if SWR hasn't updated yet for newly created notes
    if (!activeNote && activeNoteId) {
      activeNote = { id: activeNoteId, title: "New Note", notebook: "Personal", icon: "📄" };
    }

    if (activeNote) {
      return (
        <section className="glass-panel" style={{ padding: "20px", borderRadius: "24px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <NotionNoteEditor 
            note={activeNote} 
            onBack={() => {
              setActiveNoteId(null);
              setViewMode('recent');
            }} 
          />
        </section>
      );
    }
  }

  return (
    <section className="glass-panel" style={{ padding: "20px", borderRadius: "24px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-amber)" }}>
          <Notebook size={20} />
          <h3 style={{ fontWeight: 600 }}>Notion Notes</h3>
        </div>
        

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* View Mode Toggle */}
          <div style={{ 
            background: "rgba(255,255,255,0.05)", 
            padding: "2px", 
            borderRadius: "8px", 
            display: "flex",
            border: "1px solid var(--glass-border)"
          }}>
            <button 
              onClick={() => { setViewMode('recent'); setSearchQuery(''); }}
              style={{ 
                padding: "4px 10px", 
                borderRadius: "6px", 
                fontSize: "0.7rem", 
                fontWeight: 600,
                background: viewMode === 'recent' ? "var(--accent-amber)" : "transparent",
                color: viewMode === 'recent' ? "var(--text-primary)" : "var(--text-muted)",
                transition: "all 0.2s"
              }}
            >
              Recent
            </button>
            <button 
              onClick={() => { setViewMode('all'); setSearchQuery(''); }}
              style={{ 
                padding: "4px 10px", 
                borderRadius: "6px", 
                fontSize: "0.7rem", 
                fontWeight: 600,
                background: viewMode === 'all' ? "var(--accent-amber)" : "transparent",
                color: viewMode === 'all' ? "var(--text-primary)" : "var(--text-muted)",
                transition: "all 0.2s"
              }}
            >
              All
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="hover-opacity glass-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "1px solid var(--glass-border)",
              color: "var(--accent-amber)"
            }}
          >
            <Plus size={16} />
          </button>
        </div>

      </div>

      
      {showCreateForm && (
        <div style={{ marginBottom: "16px", background: "var(--bg-deep)", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }} className="animate-fade-in">
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="New Note Title..."
            disabled={isCreating}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              padding: "4px 4px 8px 4px",
              outline: "none",
              marginBottom: "12px"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <select
              value={newNoteNotebook}
              onChange={(e) => setNewNoteNotebook(e.target.value)}
              disabled={isCreating}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="Personal">Personal</option>
              <option value="BYU Notes">BYU Notes</option>
            </select>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setShowCreateForm(false)}
                disabled={isCreating}
                style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNote}
                disabled={isCreating || !newNoteTitle.trim()}
                style={{ 
                  background: "var(--accent-amber)", 
                  color: "var(--text-primary)", 
                  padding: "4px 12px", 
                  borderRadius: "6px", 
                  fontSize: "0.75rem", 
                  fontWeight: 600,
                  border: "none",
                  cursor: (isCreating || !newNoteTitle.trim()) ? "default" : "pointer",
                  opacity: (isCreating || !newNoteTitle.trim()) ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {isCreating && <Loader2 size={12} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes or notebooks..."
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
        gap: "12px", 
        overflowY: "auto",
        paddingRight: "4px" 
      }}>
        {finalNotes.map((note: any) => (
          <div 
            key={note.id} 
            onClick={() => setActiveNoteId(note.id)}
            className="glass-card hover-opacity" 
            style={{ 
              padding: "16px", 
              display: "block",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1rem" }}>{note.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  {note.title}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(note.url, '_blank', 'noopener,noreferrer');
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Open in Notion"
              >
                <ExternalLink size={13} style={{ color: "var(--text-muted)" }} className="hover-opacity" />
              </button>
            </div>
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ 
                fontSize: "0.65rem", 
                background: note.notebook === 'Personal' ? "rgba(129, 140, 248, 0.1)" : "rgba(244, 63, 94, 0.1)",
                color: note.notebook === 'Personal' ? "var(--accent-primary)" : "var(--accent-rose)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                {note.notebook}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={11} />
                {new Date(note.lastEdited).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {finalNotes.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
            <Notebook size={32} style={{ opacity: 0.2, marginBottom: "12px" }} />
            <p style={{ fontSize: "0.85rem" }}>No matching notes found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
