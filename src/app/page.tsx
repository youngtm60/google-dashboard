"use client";

import { useState } from "react";

import { useSession, signIn, signOut } from "next-auth/react";
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  LogOut,
  LayoutDashboard
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
          color: "#fff"
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
        alignItems: "flex-start",
        marginBottom: "24px" /* Reduced from 48px */
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <LayoutDashboard size={20} style={{ color: "var(--accent-primary)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Workspace Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px" }}>
            Greetings, {session.user?.name?.split(" ")[0]} 🌌
          </h1>
          <p style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
            {!session?.accessToken && (
              <span style={{ 
                background: "rgba(251, 191, 36, 0.1)", 
                color: "var(--accent-amber)", 
                padding: "2px 8px", 
                borderRadius: "4px", 
                fontSize: "0.7rem",
                fontWeight: 600
              }}>
                MOCK MODE ACTIVE
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="glass-card" 
            style={{ 
              padding: "10px", 
              borderRadius: "12px", 
              color: isRefreshing ? "var(--accent-primary)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isRefreshing ? 0.7 : 1,
              transition: "all 0.3s ease",
              cursor: isRefreshing ? "default" : "pointer"
            }}
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? "animate-spin" : ""} 
              style={{ transition: "all 0.5s ease" }}
            />
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              {isRefreshing ? "Syncing..." : "Refresh All"}
            </span>
          </button>
          
          <button 
            onClick={() => window.open('https://app.nowsta.com/', '_blank')}
            className="glass-card" 
            style={{ 
              padding: "10px 16px", 
              borderRadius: "12px", 
              color: "var(--accent-cyan)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--accent-cyan)"
            }}
          >
            <ExternalLink size={18} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Nowsta Portal</span>
          </button>
          <button 
            onClick={() => signOut()}
            className="glass-card" 
            style={{ 
              padding: "10px", 
              borderRadius: "12px", 
              color: "var(--accent-rose)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Widget Grid */}
      {/* Top Row: Today, Tasks, Notion, Drive (Force 4 columns) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: "16px",
        marginBottom: "16px",
        flexShrink: 0
      }}>
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <TodayWidget />
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <TasksWidget />
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <NotionWidget />
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <DriveWidget />
        </div>
      </div>

      {/* Row 2: Gmail & Calendar (50/50 Split) */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        gap: "24px", 
        minHeight: 0, 
        height: "100%",
        marginBottom: "0px",
        overflow: "hidden" // Ensure no overflow from the row itself
      }}>
        <div style={{ flex: 1, height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <GmailWidget limit={10} />
        </div>
        <div style={{ flex: 1, height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <CalendarWidget />
        </div>
      </div>

      <footer style={{ marginTop: "12px", textAlign: "center", opacity: 0.4 }}>
        <p style={{ fontSize: "0.75rem" }}>Built with Precision & Glass. Next.js 16 + Google Workspace API</p>
      </footer>
    </div>
  );
}
