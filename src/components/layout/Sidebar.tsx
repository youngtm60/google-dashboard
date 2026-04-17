"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "var(--accent-primary)" },
  { href: "/calendar", label: "Calendar", icon: Calendar, color: "var(--accent-sky)" },
  { href: "/drive", label: "Drive", icon: HardDrive, color: "var(--accent-emerald)" },
  { href: "/gmail", label: "Gmail", icon: Mail, color: "var(--accent-primary)" },
  { href: "/notion", label: "Notes", icon: Notebook, color: "var(--accent-amber)" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "var(--accent-secondary)" },
  { href: "/today", label: "Today", icon: Edit3, color: "var(--accent-rose)" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <aside style={{
      width: "var(--sidebar-width)",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      padding: "32px 20px",
      zIndex: 50,
      background: "var(--glass-bg)",
      borderRight: "1px solid var(--glass-border)",
      overflowY: "auto",
    }}>
      <div style={{ marginBottom: "48px", display: "flex", alignItems: "center", gap: "12px" }}>
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

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                color: isActive ? item.color : "var(--text-secondary)",
                background: isActive ? `rgba(107, 90, 237, 0.08)` : "transparent",
                transition: "all 0.2s ease",
                textDecoration: "none"
              }}
            >
              <Icon 
                size={18} 
                style={{ 
                  color: isActive ? item.color : "var(--text-secondary)",
                }} 
              />
              <span style={{ 
                fontWeight: isActive ? 600 : 500, 
                fontSize: "0.9rem",
                color: isActive ? item.color : "var(--text-secondary)"
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

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
