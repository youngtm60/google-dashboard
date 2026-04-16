import { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Video, AlignLeft, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useSWRConfig } from 'swr';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  hangoutLink?: string;
}

interface CalendarEventDetailProps {
  event: CalendarEvent;
  onBack: () => void;
}

export default function CalendarEventDetail({ event, onBack }: CalendarEventDetailProps) {
  const { mutate } = useSWRConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form payload mapper
  const [formData, setFormData] = useState(() => {
    let d = '', t = '', dur = '1';
    if (event.start.dateTime) {
      const startD = new Date(event.start.dateTime);
      d = startD.toISOString().split('T')[0];
      t = startD.toTimeString().substring(0, 5);
      if (event.end.dateTime) {
        const endD = new Date(event.end.dateTime);
        dur = ((endD.getTime() - startD.getTime()) / (1000 * 60 * 60)).toString();
      }
    } else if (event.start.date) {
      d = event.start.date;
      t = '00:00';
      dur = '24';
    }

    return {
      title: event.summary || '',
      date: d,
      startTime: t,
      durationHours: dur,
      location: event.location || '',
      description: event.description || ''
    };
  });

  const formatDateTime = (dateTimeStr?: string, isEnd?: boolean) => {
    if (!dateTimeStr) return isEnd ? '' : 'All Day';
    const date = new Date(dateTimeStr);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this event? This action cannot be undone.")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workspace/calendar?eventId=${event.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');
      mutate('/api/workspace/calendar');
      onBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Deletion failed');
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseFloat(formData.durationHours) * 60 * 60 * 1000);

      const payload = {
        summary: formData.title,
        location: formData.location,
        description: formData.description,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString()
      };

      const res = await fetch(`/api/workspace/calendar?eventId=${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');

      mutate('/api/workspace/calendar');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const hasTimes = !!(event.start.dateTime || event.end.dateTime);
  const startTimeStr = formatDateTime(event.start.dateTime || event.start.date);
  const endTimeStr = formatDateTime(event.end.dateTime || event.end.date, true);

  if (isEditing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => setIsEditing(false)} className="hover-opacity" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "8px", borderRadius: "10px", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={isSubmitting}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-amber)" }}>
            <Edit2 size={18} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Editing Event</span>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }} className="custom-scrollbar animate-fade-in">
          {errorMsg && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px", borderRadius: "8px", color: "#fca5a5", fontSize: "0.8rem", fontWeight: 500 }}>
              {errorMsg}
            </div>
          )}

          <div>
            <input type="text" name="title" placeholder="Event Title..." value={formData.title} onChange={handleChange} autoFocus style={{ width: "100%", background: "transparent", border: "none", borderBottom: "2px solid rgba(255,255,255,0.1)", padding: "8px 4px", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", outline: "none", marginBottom: "4px" }} required />
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>DATE</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "10px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }} required />
            </div>
            
            <div style={{ flex: 1, minWidth: "100px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>TIME</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "10px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }} required />
            </div>

            <div style={{ width: "100px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>DURATION</label>
              <select name="durationHours" value={formData.durationHours} onChange={handleChange} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "10px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}>
                <option value="0.5">30 min</option>
                <option value="1">1 hr</option>
                <option value="1.5">1.5 hrs</option>
                <option value="2">2 hrs</option>
                <option value="3">3 hrs</option>
                <option value="24">All Day</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
              <MapPin size={12} /> LOCATION
            </label>
            <input type="text" name="location" placeholder="Location..." value={formData.location} onChange={handleChange} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "10px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }} />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
              <AlignLeft size={12} /> DESCRIPTION
            </label>
            <textarea name="description" placeholder="Notes..." value={formData.description} onChange={handleChange} rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "10px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none", resize: "vertical" }} />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ marginTop: "12px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "white", padding: "12px", borderRadius: "8px", fontWeight: 600, display: "flex", justifyContent: "center", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "wait" : "pointer", border: "none" }}>
            {isSubmitting ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    );
  }

  // READ-ONLY DETAIL VIEW
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header / Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} className="hover-opacity" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "8px", borderRadius: "10px", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-sky)" }}>
            <Calendar size={18} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Event Details</span>
          </div>
        </div>

        {/* Edit and Delete Action Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button 
            onClick={() => setIsEditing(true)}
            title="Edit event"
            disabled={isSubmitting}
            className="hover-opacity"
            style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)", padding: "8px", borderRadius: "10px", color: "var(--accent-amber)", cursor: isSubmitting ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={handleDelete}
            title="Delete event"
            disabled={isSubmitting}
            className="hover-opacity"
            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "8px", borderRadius: "10px", color: "#fca5a5", cursor: isSubmitting ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px", borderRadius: "8px", color: "#fca5a5", fontSize: "0.8rem", fontWeight: 500, marginBottom: "16px" }}>
            {errorMsg}
          </div>
        )}

        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          {event.summary || '(No Title)'}
        </h2>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px", color: "var(--text-secondary)" }}>
          <Clock size={16} style={{ marginTop: "2px", flexShrink: 0, color: "var(--accent-sky)" }} />
          <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
            <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{startTimeStr}</div>
            {hasTimes && endTimeStr && (
              <div style={{ color: "var(--text-muted)" }}>until {endTimeStr}</div>
            )}
          </div>
        </div>

        {event.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", color: "var(--text-secondary)" }}>
            <MapPin size={16} style={{ flexShrink: 0, color: "var(--accent-emerald)" }} />
            <span style={{ fontSize: "0.85rem", lineHeight: 1.4, color: "var(--text-primary)" }}>{event.location}</span>
          </div>
        )}

        {(event.hangoutLink || event.location?.includes('Meet')) && (
          <button onClick={() => event.hangoutLink && window.open(event.hangoutLink, '_blank')} className="hover-opacity" style={{ background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-sky)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "12px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", marginBottom: "24px", cursor: "pointer", transition: "all 0.2s" }}>
            <Video size={18} /> Join Google Meet
          </button>
        )}

        {event.description && (
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--text-muted)" }}>
              <AlignLeft size={16} />
              <h4 style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</h4>
            </div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--glass-border)", whiteSpace: "pre-wrap", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>
        )}
      </div>
    </div>
  );
}
