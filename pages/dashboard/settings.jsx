import { Plug } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import { integrations } from "../../lib/data";

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" subtitle="Workspace preferences and integrations.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Profile">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#2F6FED,#17B893)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 17 }}>NA</div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: "#0F1424" }}>Nadia Aroon</div>
              <div style={{ fontFamily: "Inter", fontSize: 12.5, color: "#8A93B0" }}>Growth Lead · Voyage Travel Co.</div>
            </div>
          </div>
          {["Full name", "Email", "Time zone"].map((label) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#4A5170", display: "block", marginBottom: 6 }}>{label}</label>
              <div style={{ border: "1px solid #E7EAF3", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0F1424", fontFamily: "Inter" }}>
                {label === "Full name" ? "Nadia Aroon" : label === "Email" ? "nadia@voyage-growth.com" : "Bangkok (UTC+7)"}
              </div>
            </div>
          ))}
          <button style={{ background: "linear-gradient(90deg,#2F6FED,#2557C7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save changes</button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card title="Connected integrations">
            {integrations.map((it, i) => (
              <div key={it.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderTop: i === 0 ? "none" : "1px solid #F0F2F8" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#F5F7FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plug size={15} color="#2F6FED" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13.5, color: "#0F1424" }}>{it.name}</div>
                  <div style={{ fontFamily: "Inter", fontSize: 12, color: "#8A93B0" }}>{it.detail}</div>
                </div>
                <button style={{
                  border: it.connected ? "1px solid #E7EAF3" : "none", borderRadius: 9, padding: "7px 14px",
                  background: it.connected ? "#fff" : "#2F6FED", color: it.connected ? "#6B7280" : "#fff",
                  fontFamily: "Inter", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}>{it.connected ? "Connected" : "Connect"}</button>
              </div>
            ))}
          </Card>
          <Card title="Notifications">
            {["Weekly performance email", "Data quality alerts", "Booking confirmations"].map((n, i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderTop: i === 0 ? "none" : "1px solid #F0F2F8" }}>
                <span style={{ fontFamily: "Inter", fontSize: 13.5, color: "#0F1424", fontWeight: 600 }}>{n}</span>
                <span style={{ width: 38, height: 21, borderRadius: 999, background: "#2F6FED", position: "relative", display: "inline-block" }}>
                  <span style={{ width: 15, height: 15, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, right: 3 }} />
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
