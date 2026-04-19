export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import TodayWidget from '@/components/TodayWidget';
import TasksWidget from '@/components/TasksWidget';
import NotionWidget from '@/components/NotionWidget';
import GmailWidget from '@/components/GmailWidget';
import CalendarWidget from '@/components/CalendarWidget';
import DriveWidget from '@/components/DriveWidget';
import DashboardHeader from '@/components/DashboardHeader';
import LoginScreen from '@/components/auth/LoginScreen';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="animate-fade-in" style={{ minHeight: "100%", paddingBottom: "40px" }}>
      <DashboardHeader />

      {/* Widget Grid - Flat Layout using CSS Grid for auto wrapping */}
      <div className="dashboard-grid">
        <TodayWidget />
        <CalendarWidget />
        <GmailWidget limit={10} />
        <TasksWidget />
        <NotionWidget />
        <DriveWidget />
      </div>
    </div>
  );
}
