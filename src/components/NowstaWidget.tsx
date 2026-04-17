'use client';

import { Briefcase, ExternalLink, ShieldAlert } from 'lucide-react';

export default function NowstaWidget() {
  const launchNowsta = () => {
    window.open('https://app.nowsta.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="glass-panel" style={{ 
      padding: "24px", 
      borderRadius: "24px", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center"
    }}>
      <div style={{ color: "var(--accent-cyan)", marginBottom: "20px" }}>
        <div style={{ 
          width: "64px", 
          height: "64px", 
          borderRadius: "16px", 
          background: "rgba(34, 211, 238, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          <Briefcase size={32} />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--accent-cyan)" }}>Nowsta Portal</h3>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6", maxWidth: "240px", marginBottom: "24px" }}>
        Workforce management and specialized shift tracking for your business operations.
      </p>

      <button 
        onClick={launchNowsta}
        className="btn-primary"
        style={{ 
          background: "linear-gradient(135deg, var(--accent-cyan), #0891b2)",
          padding: "12px 24px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "200px"
        }}
      >
        Launch Portal
        <ExternalLink size={16} />
      </button>

      <div style={{ 
        marginTop: "24px", 
        padding: "12px", 
        background: "var(--bg-deep)", 
        borderRadius: "12px", 
        border: "1px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <ShieldAlert size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "left" }}>
          External portal mode active. Direct window embedding is restricted by security provider.
        </p>
      </div>
    </section>
  );
}
