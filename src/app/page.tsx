import TodayWidget from '@/components/TodayWidget';
import TasksWidget from '@/components/TasksWidget';
import NotionWidget from '@/components/NotionWidget';
import GmailWidget from '@/components/GmailWidget';
import CalendarWidget from '@/components/CalendarWidget';
import DriveWidget from '@/components/DriveWidget';

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ minHeight: "100%", paddingBottom: "40px" }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "32px",
        padding: "10px 0"
      }}>
        <div>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 800, 
            letterSpacing: "-0.5px",
            marginBottom: "8px",
            color: "var(--foreground)"
          }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Welcome back. Here's what's happening today.
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ 
            background: "var(--glass-bg)", 
            padding: "8px 16px", 
            borderRadius: "20px",
            border: "1px solid var(--glass-border)",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Widget Grid - 3 Column Layout using CSS Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1.2fr 1fr",
        gap: "24px",
        alignItems: "start"
      }}>
        {/* Left Column (Today + Tasks) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <TodayWidget />
          <TasksWidget />
        </div>

        {/* Center Column (Notes + Calendar) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <NotionWidget />
          <CalendarWidget />
        </div>

        {/* Right Column (Gmail + Drive) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <GmailWidget limit={10} />
          <DriveWidget />
        </div>
      </div>
    </div>
  );
}
