import { useState } from 'react';
import { ArrowLeft, Plus, MapPin, AlignLeft, Clock } from 'lucide-react';
import { useSWRConfig } from 'swr';

interface CalendarEventCreateProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CalendarEventCreate({ onBack, onSuccess }: CalendarEventCreateProps) {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default to today, next nearest hour
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().substring(0, 5);

  const [formData, setFormData] = useState({
    title: '',
    date: defaultDate,
    startTime: defaultTime,
    durationHours: '1',
    location: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setErrorMsg("Title is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Build ISO strings correctly using local time assumption
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseFloat(formData.durationHours) * 60 * 60 * 1000);

      const payload = {
        summary: formData.title,
        location: formData.location,
        description: formData.description,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString()
      };

      const res = await fetch('/api/workspace/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      // Success! Refresh list and navigate back.
      mutate('/api/workspace/calendar');
      onSuccess();

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header / Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button 
          onClick={onBack}
          className="hover-opacity"
          style={{ 
            background: "rgba(255,255,255,0.05)", 
            border: "1px solid var(--glass-border)", 
            padding: "8px", 
            borderRadius: "10px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          disabled={isSubmitting}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-sky)" }}>
          <Plus size={18} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Create New Event</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }} className="custom-scrollbar animate-fade-in">
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px", borderRadius: "8px", color: "#fca5a5", fontSize: "0.8rem", fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <div>
          <input 
            type="text"
            name="title"
            placeholder="Event Title..."
            value={formData.title}
            onChange={handleChange}
            autoFocus
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
              padding: "8px 4px",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              outline: "none",
              marginBottom: "4px"
            }}
            required
          />
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "120px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>DATE</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: "100px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>TIME</label>
            <input 
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                outline: "none"
              }}
              required
            />
          </div>

          <div style={{ width: "100px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>DURATION</label>
            <select 
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                outline: "none"
              }}
            >
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
          <input 
            type="text"
            name="location"
            placeholder="E.g., Google Meet, Conference Room A..."
            value={formData.location}
            onChange={handleChange}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
              outline: "none"
            }}
          />
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
            <AlignLeft size={12} /> DESCRIPTION
          </label>
          <textarea 
            name="description"
            placeholder="Add details about the event..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
              outline: "none",
              resize: "vertical"
            }}
          />
        </div>

        <button 
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
          style={{
            marginTop: "12px",
            justifyContent: "center",
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "wait" : "pointer"
          }}
        >
          {isSubmitting ? "Scheduling..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
