export default function WidgetSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card" style={{ padding: "16px", background: "var(--bg-deep)" }}>
          <div className="skeleton-line" style={{ width: "40%", height: "12px", background: "rgba(255,255,255,0.08)", borderRadius: "6px", marginBottom: "10px" }}></div>
          <div className="skeleton-line" style={{ width: "80%", height: "10px", background: "rgba(255,255,255,0.04)", borderRadius: "5px" }}></div>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        .skeleton-line {
          animation: pulse 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
