import NotionWidget from "@/components/NotionWidget";
import NotionSearchWidget from "@/components/NotionSearchWidget";
import { ArrowLeft, Notebook, Search } from "lucide-react";
import Link from "next/link";

export default function NotionPage() {
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
          <Notebook size={32} style={{ color: "var(--accent-amber)" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-amber)" }}>Notes Overview</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Instant search across your Personal and BYU study notebooks.
        </p>
      </header>

      {/* Main Search Interface */}
      <div style={{ marginBottom: "60px" }}>
        <NotionSearchWidget />
      </div>

      {/* Recent Notes Background View */}
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Notebook size={20} color="var(--accent-amber)" />
          Recently Modified
        </h2>
        <div style={{ maxWidth: "1000px" }}>
          <NotionWidget limit={10} />
        </div>
      </div>
    </div>
  );
}
