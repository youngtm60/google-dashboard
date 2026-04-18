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

      {/* Widget Grid - Flat Layout using CSS Grid for auto wrapping */}
      <div className="dashboard-grid">
        <TodayWidget />
        <NotionWidget />
        <GmailWidget limit={10} />
        <TasksWidget />
        <CalendarWidget />
        <DriveWidget />
      </div>
    </div>
  );
}
