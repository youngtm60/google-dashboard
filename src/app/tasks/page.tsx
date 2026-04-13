"use client";

import TasksWidget from "@/components/TasksWidget";
import { ArrowLeft, CheckSquare } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
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
          <CheckSquare size={32} style={{ color: "var(--accent-secondary)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-secondary)" }}>Tasks Overview</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Manage your daily objectives and sync progress with Google Tasks.
        </p>
      </header>

      <div style={{ maxWidth: "800px" }}>
        <TasksWidget />
      </div>
    </div>
  );
}
