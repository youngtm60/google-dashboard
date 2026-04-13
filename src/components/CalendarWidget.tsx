'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Video, 
  Clock, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  hangoutLink?: string;
}

export default function CalendarWidget() {
  const { data: events, error, isLoading } = useSWR<CalendarEvent[]>('/api/workspace/calendar', fetcher, {
    refreshInterval: 600000, // 10 minutes
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');

  // Auto-clear search on toggle
  useEffect(() => {
    setSearchQuery('');
  }, [viewMode]);

  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    
    let filtered = events;

    // View mode filtering
    if (viewMode === 'recent') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      filtered = events.filter(event => {
        const start = new Date(event.start.dateTime || event.start.date || '');
        return start <= today;
      });
    }

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [events, viewMode, searchQuery]);

  const formatTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return 'All Day';
    return new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <section className="glass-panel" style={{ 
      padding: "20px", 
      borderRadius: "24px", 
      height: "100%", 
      minHeight: 0,
      display: "flex", 
      flexDirection: "column" 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-sky)" }}>
          <Calendar size={20} />
          <h3 style={{ fontWeight: 600 }}>Schedule</h3>
        </div>
        
        <div style={{ 
          background: "rgba(255,255,255,0.05)", 
          padding: "2px", 
          borderRadius: "8px", 
          display: "flex",
          border: "1px solid var(--glass-border)"
        }}>
          <button 
            onClick={() => setViewMode('recent')}
            style={{ 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "0.7rem", 
              fontWeight: 600,
              background: viewMode === 'recent' ? "var(--accent-sky)" : "transparent",
              color: viewMode === 'recent' ? "black" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            Today
          </button>
          <button 
            onClick={() => setViewMode('all')}
            style={{ 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "0.7rem", 
              fontWeight: 600,
              background: viewMode === 'all' ? "var(--accent-sky)" : "transparent",
              color: viewMode === 'all' ? "black" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            All
          </button>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input 
          type="text" 
          placeholder={`Search ${viewMode === 'recent' ? 'today\'s' : 'weekly'} events...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "10px",
            padding: "8px 12px 8px 36px",
            fontSize: "0.8rem",
            color: "var(--text-primary)",
            outline: "none"
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", pr: "4px" }} className="custom-scrollbar">
        {isLoading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", marginTop: "20px" }}>Syncing schedule...</p>
        ) : filteredEvents.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", marginTop: "20px" }}>
            {searchQuery ? 'No matching events found.' : 'No events scheduled for this period.'}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                className="glass-card"
                style={{ 
                  padding: "12px", 
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{event.summary}</h4>
                  <div style={{ 
                    fontSize: "0.7rem", 
                    color: "var(--accent-sky)", 
                    background: "rgba(56, 189, 248, 0.1)", 
                    padding: "2px 6px", 
                    borderRadius: "4px" 
                  }}>
                    {formatTime(event.start.dateTime)}
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} />
                    <span>{formatDate(event.start.dateTime || event.start.date)}</span>
                  </div>
                  {event.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} />
                      <span style={{ maxWidth: "120px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {event.location}
                      </span>
                    </div>
                  )}
                </div>

                {(event.hangoutLink || event.location?.includes('Meet')) && (
                  <button 
                    onClick={() => event.hangoutLink && window.open(event.hangoutLink, '_blank')}
                    style={{ 
                      marginTop: "4px",
                      background: "rgba(56, 189, 248, 0.1)",
                      color: "var(--accent-sky)",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      padding: "6px",
                      borderRadius: "8px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      width: "100%"
                    }}
                  >
                    <Video size={14} />
                    Join Meeting
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
