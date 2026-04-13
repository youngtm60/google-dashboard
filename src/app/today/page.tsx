'use client';

import TodayWidget from "@/components/TodayWidget";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

export default function TodayPage() {
  return (
    <div className="animate-fade-in" style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <header style={{ marginBottom: "32px", flexShrink: 0 }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginBottom: "16px",
            textDecoration: "none"
          }}
          className="hover-opacity"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Edit3 size={32} style={{ color: "var(--accent-rose)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-rose)" }}>Daily Scratchpad</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Your persistent, local-only notes for today's focus.
        </p>
      </header>

      <div style={{ flex: 1, minHeight: 0, paddingBottom: "40px" }}>
        <TodayWidget />
      </div>
    </div>
  );
}
