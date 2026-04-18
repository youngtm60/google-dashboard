import TodayWidget from '@/components/TodayWidget';
import TasksWidget from '@/components/TasksWidget';
import NotionWidget from '@/components/NotionWidget';
import GmailWidget from '@/components/GmailWidget';
import CalendarWidget from '@/components/CalendarWidget';
import DriveWidget from '@/components/DriveWidget';
import DashboardHeader from '@/components/DashboardHeader';

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ minHeight: "100%", paddingBottom: "40px" }}>
      <DashboardHeader />

      {/* Widget Grid - 3 Column Layout using CSS Grid */}
      <div className="dashboard-grid">
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
