"use client";

import { useState } from "react";

import { useSession, signIn, signOut } from "next-auth/react";
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Search,
  Bell,
  Settings
} from "lucide-react";
import { useSWRConfig } from 'swr';
import Link from "next/link";
import GmailWidget from "@/components/GmailWidget";
import TasksWidget from "@/components/TasksWidget";
import DriveWidget from "@/components/DriveWidget";
import NotionWidget from "@/components/NotionWidget";
import TodayWidget from "@/components/TodayWidget";
import NowstaWidget from "@/components/NowstaWidget";
import CalendarWidget from "@/components/CalendarWidget";
import { ExternalLink } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const { mutate } = useSWRConfig();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    
    // Mutate all workspace data sources
    const mutations = [
      mutate('/api/workspace/gmail'),
      mutate('/api/workspace/tasks'),
      mutate('/api/workspace/drive'),
      mutate('/api/workspace/notion'),
      mutate('/api/workspace/calendar'),
    ];

    await Promise.all(mutations);
    
    // Artificial delay for visual feedback pulse
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (status === "loading") {
    return (
      <div style={{ 
        height: "80vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          border: "3px solid rgba(129, 140, 248, 0.1)",
          borderTopColor: "var(--accent-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading your workspace...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ 
        maxWidth: "1000px", 
        margin: "100px auto", 
        textAlign: "center" 
      }} className="animate-fade-in">
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px", 
          padding: "8px 16px",
          background: "rgba(129, 140, 248, 0.1)",
          borderRadius: "20px",
          color: "var(--accent-primary)",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "24px"
        }}>
          <Sparkles size={14} />
          <span>The Next Generation of Workspace</span>
        </div>

        <h1 style={{ 
          fontSize: "4rem", 
          fontWeight: 800, 
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          marginBottom: "24px",
          color: "var(--text-primary)"
        }}>
          All your Google tools. <br />
          <span className="accent-text-gradient">One unified vision.</span>
        </h1>

        <p style={{ 
          color: "var(--text-secondary)", 
          fontSize: "1.25rem", 
          maxWidth: "600px", 
          margin: "0 auto 48px auto",
          lineHeight: 1.6
        }}>
          Experience a high-performance, glassmorphic dashboard for your Gmail, 
          Tasks, and Drive. Built for focus, speed, and aesthetics.
        </p>

        <button 
          onClick={() => signIn("google")}
          className="btn-primary"
          style={{ 
            fontSize: "1.1rem", 
            padding: "16px 32px", 
            margin: "0 auto",
            borderRadius: "14px"
          }}
        >
          Get Started with Google
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "32px"
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "4px", color: "var(--text-primary)" }}>
            Greetings, {session.user?.name?.split(" ")[0] || "Tim"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            You have 4 upcoming tasks for today and 2 unread emails.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button 
            onClick={() => window.open('https://app.nowsta.com/', '_blank')}
            className="glass-card hover-opacity" 
            style={{ 
              padding: "10px 16px", 
              borderRadius: "12px", 
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--glass-border)",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            <ExternalLink size={18} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Nowsta Portal</span>
          </button>
        </div>


      </header>

      {/* Widget Grid - 3 Column Layout */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexWrap: "wrap",
        gap: "24px", 
        minHeight: "min-content", 
        height: "auto",
        marginBottom: "40px"
      }}>
        {/* Left Column (Today + Tasks) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: "320px", height: "auto" }}>
          <TodayWidget />
          <TasksWidget />
        </div>

        {/* Center Column (Notes + Calendar) */}
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "16px", minWidth: "320px", height: "auto" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <NotionWidget />
          </div>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <CalendarWidget />
          </div>
        </div>

        {/* Right Column (Gmail + Drive) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: "320px", height: "auto" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <GmailWidget limit={10} />
          </div>
          <DriveWidget />
        </div>
      </div>

      <footer style={{ marginTop: "12px", textAlign: "center", opacity: 0.4 }}>
        <p style={{ fontSize: "0.75rem" }}>Built with Precision & Glass. Next.js 16 + Google Workspace API</p>
      </footer>
    </div>
  );
}
