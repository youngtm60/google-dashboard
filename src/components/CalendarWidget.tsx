'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Video, 
  Clock,
  Plus,
  Settings2,
  Check
} from 'lucide-react';
import CalendarEventDetail from './widgets/CalendarEventDetail';
import CalendarEventCreate from './widgets/CalendarEventCreate';
import { fetchCalendarList } from '@/lib/actions/calendar-actions';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  hangoutLink?: string;
  calendarId?: string;
}

interface CalendarInfo {
  id: string;
  summary: string;
  colorId: string;
}

export default function CalendarWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['primary']);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [calendarList, setCalendarList] = useState<CalendarInfo[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dash_selected_cal_ids');
    if (saved) {
      try {
        setSelectedCalendars(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggleCalendar = (id: string) => {
    let newSelection = [...selectedCalendars];
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(c => c !== id);
    } else {
      newSelection.push(id);
    }
    if (newSelection.length === 0) newSelection = ['primary']; // ensure never completely empty
    setSelectedCalendars(newSelection);
    localStorage.setItem('dash_selected_cal_ids', JSON.stringify(newSelection));
  };

  const loadCalendars = async () => {
    const res = await fetchCalendarList();
    if (res.success && res.calendars) {
      setCalendarList(res.calendars as CalendarInfo[]);
    }
  };

  const toggleSettings = () => {
    if (!isSettingsOpen && calendarList.length === 0) loadCalendars();
    setIsSettingsOpen(!isSettingsOpen);
  };

  const { data: events, error, isLoading } = useSWR<CalendarEvent[]>(
    `/api/workspace/calendar?calendars=${encodeURIComponent(selectedCalendars.join(','))}`, 
    fetcher, 
    { refreshInterval: 600000 }
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    
    let filtered = events;
    if (debouncedQuery) {
      filtered = filtered.filter(event => 
        event.summary?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }
    return filtered;
  }, [events, debouncedQuery]);

  const formatTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return 'All Day';
    return new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (isCreating) {
    return (
      <section className="glass-panel animate-fade-in" style={{padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullPage ? "100%" : "450px"}}>
        <CalendarEventCreate onBack={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
      </section>
    );
  }

  if (activeEventId && events) {
    const activeEvent = events.find((e: CalendarEvent) => e.id === activeEventId);
    if (activeEvent) {
      return (
        <section className="glass-panel animate-fade-in" style={{padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullPage ? "100%" : "450px"}}>
          <CalendarEventDetail event={activeEvent} onBack={() => setActiveEventId(null)} />
        </section>
      );
    }
  }

  return (
    <section className="glass-panel animate-fade-in" style={{ padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullPage ? "100%" : "450px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-sky)" }}>
          <Calendar size={20} />
          <h3 style={{ fontWeight: 600 }}>Schedule</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button 
            onClick={toggleSettings}
            className="hover-opacity"
            style={{ 
              background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid var(--glass-border)", 
              borderRadius: "8px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center"
            }}
            title="Select Calendars"
          >
            <Settings2 size={16} />
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="hover-opacity"
            style={{ 
              background: "#7DD3FC", color: "white", border: "none", borderRadius: "8px", 
              padding: "4px", display: "flex", alignItems: "center", justifyContent: "center"
            }}
            title="Create new event"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div style={{ background: "var(--glass-border)", borderRadius: "12px", padding: "12px", marginBottom: "16px", border: "1px solid var(--glass-border)" }} className="animate-fade-in">
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px", fontWeight: 600 }}>Caldendars in View</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }} className="custom-scrollbar">
            {calendarList.length === 0 ? (
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>Loading calendars...</p>
            ) : (
              calendarList.map(cal => {
                const isSelected = selectedCalendars.includes(cal.id);
                return (
                  <div 
                    key={cal.id} 
                    onClick={() => handleToggleCalendar(cal.id)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                  >
                    <div style={{ 
                      width: "16px", height: "16px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: isSelected ? cal.colorId : "transparent",
                      border: `1.5px solid ${cal.colorId}`
                    }}>
                      {isSelected && <Check size={12} color={cal.colorId === '#ffffff' ? "black" : "white"} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: isSelected ? "white" : "var(--text-muted)" }}>{cal.summary}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input 
          type="text" 
          placeholder="Search upcoming events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)",
            borderRadius: "10px", padding: "8px 12px 8px 36px", fontSize: "0.8rem", color: "var(--text-primary)", outline: "none"
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
        {isLoading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", marginTop: "20px" }}>Syncing schedule...</p>
        ) : events && !Array.isArray(events) && (events as any).error ? (
          <p style={{ color: "#ef4444", fontSize: "0.8rem", textAlign: "center", marginTop: "20px", padding: "10px" }}>
            API Error: {(events as any).error}
          </p>
        ) : filteredEvents.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", marginTop: "20px" }}>
            {searchQuery ? 'No matching events found.' : 'No events scheduled for this period (next 90 days).'}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredEvents.map((event, index) => (
              <div 
                key={`${event.id}-${index}`}
                onClick={() => setActiveEventId(event.id)}
                className="glass-card hover-opacity"
                style={{ 
                  padding: "12px", 
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  cursor: "pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      event.hangoutLink && window.open(event.hangoutLink, '_blank');
                    }}
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
                      width: "100%",
                      cursor: "pointer"
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
