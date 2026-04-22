'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Check, Trash2 } from 'lucide-react';
import { mutate } from 'swr';
import { getNotionPageBlocks, updateNotionBlock, deleteNotionPage } from '@/lib/actions/notion-actions';

interface NotionNoteEditorProps {
  note: any;
  onBack: () => void;
}

function BlockEditor({ block, onOpenSubPage }: { block: any, onOpenSubPage?: () => void }) {
  const [text, setText] = useState(block.text);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (block.type === 'child_page') {
    return (
      <div 
        onClick={onOpenSubPage}
        className="glass-card hover-opacity"
        style={{ padding: '6px 10px', cursor: 'pointer', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ fontSize: '0.9rem' }}>📄</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {block.text.replace('[Sub-page]: ', '').trim()}
        </span>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setStatus('idle');

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      const res = await updateNotionBlock(block.id, newText, block.type);
      if (res.success) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000); // clear saved after 2s
      } else {
        setStatus('error');
      }
    }, 3000); // 3 second debounce
  };

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div style={{ position: 'relative', marginBottom: '2px' }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid transparent',
          color: 'var(--text-primary)',
          fontSize: '0.75rem',
          lineHeight: '1.3',
          resize: 'none',
          padding: '2px 6px',
          borderRadius: '6px',
          outline: 'none',
          transition: 'border 0.2s',
          overflow: 'hidden',
          opacity: block.type === 'bookmark' ? 0.6 : 1
        }}
        readOnly={block.type === 'bookmark'}
        onFocus={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
        onBlur={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.border = '1px solid transparent';
        }}
      />
      
      {/* Status indicator */}
      {status !== 'idle' && (
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          fontSize: '0.65rem',
          color: status === 'error' ? 'var(--accent-rose)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none'
        }}>
          {status === 'saving' && <Loader2 size={10} className="animate-spin" />}
          {status === 'saved' && <Check size={10} style={{ color: 'var(--accent-emerald)' }}/>}
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Error'}
        </div>
      )}
    </div>
  );
}

export default function NotionNoteEditor({ note, onBack }: NotionNoteEditorProps) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    setIsDeleting(true);
    const res = await deleteNotionPage(currentNote.id);
    setIsDeleting(false);
    if (res.success) {
      mutate(key => typeof key === 'string' && key.startsWith('/api/workspace/notion'));
      onBack();
    } else {
      alert("Failed to delete: " + res.error);
    }
  };
  
  // Navigation stack to drill down into sub-pages without losing original context
  const [currentNote, setCurrentNote] = useState(note);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      const res = await getNotionPageBlocks(currentNote.id);
      if (res.success) {
        setBlocks(res.blocks || []);
      }
      setIsLoading(false);
    }
    fetchContent();
  }, [currentNote.id]);

  const handleBack = () => {
    if (history.length > 0) {
      // Pop last note from history
      const prev = history[history.length - 1];
      setCurrentNote(prev);
      setHistory(history.slice(0, -1));
    } else {
      // Execute original onBack to return to Dashboard view
      onBack();
    }
  };

  const handleOpenSubPage = (block: any) => {
    setHistory([...history, currentNote]);
    setCurrentNote({
      id: block.id,
      title: block.text.replace('[Sub-page]: ', '').trim(),
      icon: '📄',
      notebook: currentNote.notebook // Inherit notebook context visually
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <button 
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            className="hover-opacity"
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ overflow: 'hidden' }}>
            {history.length > 0 && (
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', marginBottom: '2px', fontWeight: 600 }}>
                {history[history.length - 1].title.length > 20 ? history[history.length - 1].title.substring(0, 20) + '...' : history[history.length - 1].title} /
              </div>
            )}
            <h3 style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentNote.icon} {currentNote.title}
            </h3>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="hover-opacity"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--accent-rose)',
            cursor: isDeleting ? 'default' : 'pointer',
            opacity: isDeleting ? 0.5 : 1,
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          title="Delete Note"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>

      {/* Editor Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : blocks.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontSize: '0.85rem' }}>
            <p>This note is empty or contains unsupported blocks.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {blocks.map((block) => (
              <BlockEditor 
                key={block.id} 
                block={block} 
                onOpenSubPage={() => handleOpenSubPage(block)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
