"use client";

import GmailWidget from "@/components/GmailWidget";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function GmailPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: "100px" }}>
      <header style={{ marginBottom: "40px" }}>
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
          <Mail size={32} style={{ color: "var(--accent-primary)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-primary)" }}>Gmail Overview</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Full view of your recent communications. Syncing in real-time.
        </p>
      </header>

      <div style={{ maxWidth: "1000px" }}>
        <GmailWidget limit={20} />
      </div>
    </div>
  );
}
