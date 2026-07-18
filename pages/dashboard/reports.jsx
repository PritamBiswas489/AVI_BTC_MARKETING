import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import { reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports & Exports" subtitle="Pre-built and scheduled reports, ready to share.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 }}>
        {reports.map((r) => (
          <Card key={r.title}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: r.tint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <r.icon size={19} color="#2F6FED" />
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14.5, color: "#0F1424", marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontFamily: "Inter", fontSize: 12.5, color: "#8A93B0", marginBottom: 16, lineHeight: 1.5 }}>{r.desc}</div>
            <button style={{ border: "1px solid #E7EAF3", background: "#fff", borderRadius: 9, padding: "8px 16px", fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: "#2F6FED", cursor: "pointer" }}>View report</button>
          </Card>
        ))}
      </div>
      <Card title="Scheduled Reports">
        {[
          { name: "Weekly Summary (Every Monday)", to: "management@voyage-growth.com" },
          { name: "Monthly Performance (1st of month)", to: "finance@voyage-growth.com" },
        ].map((s, i) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 4px", borderTop: i === 0 ? "none" : "1px solid #F0F2F8" }}>
            <div>
              <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13.5, color: "#0F1424" }}>{s.name}</div>
              <div style={{ fontFamily: "Inter", fontSize: 12, color: "#8A93B0", marginTop: 1 }}>{s.to}</div>
            </div>
            <span style={{ background: "#E7FBF4", color: "#17B893", fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>ON</span>
          </div>
        ))}
      </Card>
    </DashboardLayout>
  );
}
