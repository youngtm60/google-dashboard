"use client";

import GmailWidget from "@/components/GmailWidget";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function GmailPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: "100px", height: "100%", display: "flex", flexDirection: "column" }}>
      <header style={{ marginBottom: "20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Mail size={32} style={{ color: "var(--accent-primary)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-primary)" }}>Gmail</h1>
        </div>
      </header>

      <div style={{ flex: 1, width: "100%", height: "100%", minHeight: "600px" }}>
        <Suspense fallback={<div>Loading...</div>}>
          <GmailWidget limit={50} fullPage={true} />
        </Suspense>
      </div>
    </div>
  );
}
