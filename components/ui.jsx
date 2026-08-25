import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function Card({ title, action, children, style }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E7EAF3", borderRadius: 16, padding: "18px 20px", ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          {title && <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: "#0F1424" }}>{title}</span>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function KPI({ label, value, delta, up, accent, valueils }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E7EAF3", borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <span style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: "#6B7280", letterSpacing: 0.2 }}>{label}</span>
      <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 23, fontWeight: 800, color: accent || "#0F1424" }}>{value}</span>
      {valueils && (
        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 16, fontWeight: 600, color: accent || "#0F1424" }}>{valueils}</span>
      )}
      {delta && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: up ? "#17B893" : "#E15A5A", width: "fit-content" }}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {delta}
        </span>
      )}
    </div>
  );
}

export function KPIGrid({ items, cols }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols || items.length}, 1fr)`, gap: 14, marginBottom: 14 }}>
      {items.map((it) => <KPI key={it.label} {...it} />)}
    </div>
  );
}

export function Donut({ data, centerValue, centerLabel, height = 170 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={3} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerValue && (
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, color: "#0F1424" }}>{centerValue}</div>
            <div style={{ fontFamily: "Inter", fontSize: 11, color: "#8A93B0" }}>{centerLabel}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Inter", fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A5170", fontWeight: 600 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: d.color, flexShrink: 0 }} /> {d.name}
            </span>
            <span style={{ fontWeight: 700, color: "#0F1424" }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBarList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((it) => (
        <div key={it.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter", fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#4A5170", fontWeight: 600 }}>{it.label}</span>
            <span style={{ color: "#0F1424", fontWeight: 700 }}>{it.value}</span>
          </div>
          <div style={{ height: 8, borderRadius: 6, background: "#EEF1F8" }}>
            <div style={{ height: 8, borderRadius: 6, width: `${it.pct}%`, background: it.color || "#2F6FED" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Th({ children }) { return <th style={{ padding: "8px 6px", fontSize: 11.5, color: "#9AA3C2", fontWeight: 700, letterSpacing: 0.3, textAlign: "left" }}>{children}</th>; }
export function Td({ children, strong, color }) { return <td style={{ padding: "12px 6px", fontSize: 13, color: color || (strong ? "#0F1424" : "#4A5170"), fontWeight: strong ? 700 : 500 }}>{children}</td>; }

export function StatusPill({ status }) {
  const map = {
    "Open": { bg: "#E9F1FF", fg: "#2F6FED" },
    "Qualified": { bg: "#E7FBF4", fg: "#17B893" },
    "Closed (Booked)": { bg: "#FFF4E3", fg: "#C9821F" },
    "Closed (No Booking)": { bg: "#EEF1F8", fg: "#6B7280" },
  };
  const s = map[status] || { bg: "#EEF1F8", fg: "#6B7280" };
  return <span style={{ background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{status}</span>;
}

export function CustomTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#0B1330", borderRadius: 10, padding: "10px 13px", fontFamily: "Inter", fontSize: 12, color: "#fff", boxShadow: "0 8px 24px rgba(11,19,48,0.25)" }}>
      <div style={{ color: "#8A93B0", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
          <span style={{ color: "#C9CFE4" }}>{p.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 700 }}>{typeof p.value === "number" && prefix ? `${prefix}${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  );
}
