import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, HBarList, Th, Td, CustomTooltip } from "../../components/ui";
import { campaigns, spendDonut, cplTrend, axisStyle } from "../../lib/data";

export default function AdPerformancePage() {
  const [tab, setTab] = useState("Campaigns");
  return (
    <DashboardLayout title="Ad Performance" subtitle="Campaign, ad set and ad level results across Meta & Google.">
      <KPIGrid cols={6} items={[
        { label: "Total Spend", value: "฿312,450", delta: "24.8% vs Jun", up: true },
        { label: "Total Clicks", value: "12,540", delta: "18.6% vs Jun", up: true },
        { label: "Total Leads", value: "1,248", delta: "18.6% vs Jun", up: true },
        { label: "Avg. CPL", value: "฿250", delta: "5.7% vs Jun", up: false },
        { label: "Total Bookings", value: "186", delta: "22.2% vs Jun", up: true },
        { label: "Avg. ROAS", value: "15.5x", delta: "7.2% vs Jun", up: true, accent: "#2F6FED" },
      ]} />
      <Card style={{ marginBottom: 14 }} action={
        <div style={{ display: "flex", gap: 4, background: "#F5F7FB", padding: 4, borderRadius: 10 }}>
          {["Campaigns", "Ad Groups / Ad Sets", "Ads"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              background: tab === t ? "#fff" : "transparent", boxShadow: tab === t ? "0 1px 3px rgba(15,20,36,0.12)" : "none",
              fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: tab === t ? "#0F1424" : "#8A93B0",
            }}>{t}</button>
          ))}
        </div>}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Campaign</Th><Th>Platform</Th><Th>Spend</Th><Th>Clicks</Th><Th>Leads</Th><Th>CPL</Th><Th>Bookings</Th><Th>ROAS</Th></tr></thead>
          <tbody>{campaigns.map((c) => (
            <tr key={c.name} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong>{c.name}</Td><Td>{c.platform}</Td><Td>{c.spend}</Td><Td>{c.clicks}</Td><Td>{c.leads}</Td><Td>{c.cpl}</Td><Td>{c.bookings}</Td><Td color="#17B893" strong>{c.roas}</Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 14 }}>
        <Card title="Spend by Platform"><Donut data={spendDonut} centerValue="฿312K" centerLabel="Total Spend" height={150} /></Card>
        <Card title="CPL Trend (30 Days)" action={
          <div style={{ display: "flex", gap: 14, fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#2F6FED", marginRight: 6 }} />Meta</span>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#17B893", marginRight: 6 }} />Google</span>
          </div>}>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={cplTrend} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Meta" stroke="#2F6FED" strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="Google" stroke="#17B893" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Top Campaigns by ROAS">
          <HBarList items={campaigns.slice(0, 5).map((c) => ({ label: c.name, value: c.roas, pct: parseFloat(c.roas) * 4.5, color: "#17B893" }))} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
