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
  Calendar
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
    <aside className="glass-panel" style={{
      width: "var(--sidebar-width)",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      padding: "32px 12px",
      zIndex: 50
    }}>
      <div style={{ marginBottom: "48px", padding: "0 12px" }}>
        <h2 className="accent-text-gradient" style={{ fontSize: "1.25rem", fontWeight: 800 }}>Nebula</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Workspace</p>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="glass-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
                color: isActive ? "white" : "var(--text-secondary)",
                borderLeft: isActive ? `3px solid ${item.color}` : "1px solid var(--glass-border)",
                background: isActive ? `linear-gradient(90deg, ${item.color}15 0%, transparent 100%)` : "transparent",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <Icon 
                size={18} 
                style={{ 
                  color: item.color,
                  opacity: isActive ? 1 : 0.7,
                  filter: isActive ? `drop-shadow(0 0 8px ${item.color}44)` : "none"
                }} 
              />
              <span style={{ 
                fontWeight: isActive ? 700 : 500, 
                fontSize: "0.85rem",
                color: isActive ? "white" : "var(--text-secondary)"
              }}>
                {item.label}
              </span>
              
              {isActive && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "100%",
                  background: `linear-gradient(90deg, ${item.color}10 0%, transparent 100%)`,
                  pointerEvents: "none"
                }} />
              )}
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
          borderTop: "1px solid var(--glass-border)"
        }}>
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              style={{ width: "30px", height: "30px", borderRadius: "50%" }} 
            />
          ) : (
            <div style={{ 
              width: "30px", 
              height: "30px", 
              borderRadius: "50%", 
              background: "var(--glass-highlight)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <User size={16} color="var(--text-muted)" />
            </div>
          )}
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session.user?.name}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session.user?.email}
            </p>
          </div>
        </div>

        <button 
          onClick={() => signOut()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            color: "var(--accent-rose)",
            width: "100%",
            borderRadius: "12px"
          }}
          className="glass-card"
        >
          <LogOut size={20} />
          <span style={{ fontWeight: 500 }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
