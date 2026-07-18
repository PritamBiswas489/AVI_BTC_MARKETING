import { Search, Calendar, ChevronDown, Bell } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid #E7EAF3", background: "#FFFFFF", flexShrink: 0 }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, margin: 0, color: "#0F1424" }}>{title}</h1>
        <p style={{ fontFamily: "Inter", fontSize: 12.5, color: "#8A93B0", margin: "3px 0 0" }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #E7EAF3", borderRadius: 10, padding: "8px 12px", fontFamily: "Inter", fontSize: 13, color: "#4A5170" }}>
          <Search size={14} color="#9AA3C2" /> Search
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #E7EAF3", borderRadius: 10, padding: "8px 12px", fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#4A5170" }}>
          <Calendar size={14} color="#2F6FED" /> Jul 1 – Jul 31, 2026 <ChevronDown size={14} />
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E7EAF3", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={15} color="#4A5170" />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2F6FED,#17B893)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 13 }}>NA</div>
      </div>
    </div>
  );
}
