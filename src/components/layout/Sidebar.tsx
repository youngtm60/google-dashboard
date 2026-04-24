"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/lib/SidebarContext";
import { 
  LayoutDashboard, 
  Mail, 
  CheckSquare, 
  HardDrive, 
  LogOut, 
  User,
  Settings,
  Notebook,
  Edit3,
  Briefcase,
  Calendar,
  Layers,
  Bell
} from "lucide-react";

import MiniCalendar from "../widgets/MiniCalendar";

import PomodoroWidget from "../widgets/PomodoroWidget";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "var(--accent-primary)" },
  { href: "/calendar", label: "Calendar", icon: Calendar, color: "var(--accent-sky)" },
  { href: "/drive", label: "Drive", icon: HardDrive, color: "var(--accent-emerald)" },
  { href: "/gmail", label: "Gmail", icon: Mail, color: "#4A5568" },
  { href: "/notion", label: "Notes", icon: Notebook, color: "var(--accent-amber)" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "var(--accent-cyan)" },
];

export default function Sidebar() {
  const { isNowstaOpen } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [persistedPaths, setPersistedPaths] = useState<Record<string, string>>({});

  // Capture and save current path to localStorage
  useEffect(() => {
    if (pathname && pathname !== '/') {
      const baseRoute = '/' + pathname.split('/')[1];
      const fullPath = window.location.pathname + window.location.search;
      localStorage.setItem(`last_path_${baseRoute}`, fullPath);
      
      setPersistedPaths(prev => ({
        ...prev,
        [baseRoute]: fullPath
      }));
    }
  }, [pathname, searchParams]);

  // Load initial persisted paths
  useEffect(() => {
    const paths: Record<string, string> = {};
    navItems.forEach(item => {
      if (item.href !== '/') {
        const saved = localStorage.getItem(`last_path_${item.href}`);
        if (saved) paths[item.href] = saved;
      }
    });
    setPersistedPaths(paths);
  }, []);

  if (!session) return null;

  return (
    <aside 
      className="sidebar-container"
      style={{
        transform: isNowstaOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ 
          background: "var(--accent-primary)", 
          width: "36px", 
          height: "36px", 
          borderRadius: "8px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "white" 
        }}>
          <Layers size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Digital Planner</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 500 }}>Cloud Workspace</p>
        </div>
      </div>

      <div style={{ marginBottom: "24px", paddingLeft: "4px" }}>
        <MiniCalendar />
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          const Icon = item.icon;
          const href = persistedPaths[item.href] || item.href;
          
          return (
            <Link 
              key={item.href} 
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                color: item.color,
                background: isActive ? `rgba(107, 90, 237, 0.08)` : "transparent",
                transition: "all 0.2s ease",
                textDecoration: "none"
              }}
            >
              <Icon 
                size={18} 
                style={{ 
                  color: item.color,
                }} 
              />
              <span style={{ 
                fontWeight: isActive ? 600 : 500, 
                fontSize: "0.9rem",
                color: item.color
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginBottom: "24px" }}>
        <PomodoroWidget />
      </div>

      <div style={{ flex: 1 }}></div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid var(--glass-border)"
        }}>
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              style={{ width: "36px", height: "36px", borderRadius: "8px" }} 
            />
          ) : (
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "8px", 
              background: "var(--glass-highlight)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <User size={18} color="var(--text-muted)" />
            </div>
          )}
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session.user?.name || "Tim Atelier"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Premium Plan
            </p>
          </div>
        </div>

        <button 
          onClick={() => signOut()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 16px",
            color: "var(--text-secondary)",
            width: "100%",
            borderRadius: "8px",
            background: "transparent"
          }}
        >
          <LogOut size={18} />
          <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
