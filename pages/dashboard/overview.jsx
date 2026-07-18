import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, Th, Td, CustomTooltip } from "../../components/ui";
import { spendRevenue, platformDonut, campaigns, axisStyle } from "../../lib/data";

export default function OverviewPage() {
  return (
    <DashboardLayout title="Executive Overview" subtitle="Every campaign, every lead, one clear picture.">
      <KPIGrid cols={6} items={[
        { label: "Total Ad Spend", value: "฿312,450", delta: "24.8% vs Jun", up: true },
        { label: "Total Leads", value: "1,248", delta: "18.6% vs Jun", up: true },
        { label: "Cost Per Lead", value: "฿250", delta: "5.7% vs Jun", up: false },
        { label: "Bookings", value: "186", delta: "22.2% vs Jun", up: true },
        { label: "Revenue", value: "฿4.83M", delta: "28.7% vs Jun", up: true, accent: "#17B893" },
        { label: "ROI", value: "325%", delta: "26.1% vs Jun", up: true, accent: "#2F6FED" },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="Ad Spend vs Revenue" action={
          <div style={{ display: "flex", gap: 14, fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#2F6FED", marginRight: 6 }} />Ad Spend</span>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#17B893", marginRight: 6 }} />Revenue</span>
          </div>}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={spendRevenue} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2F6FED" stopOpacity={0.28} /><stop offset="100%" stopColor="#2F6FED" stopOpacity={0} /></linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#17B893" stopOpacity={0.3} /><stop offset="100%" stopColor="#17B893" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="spend" name="Ad Spend" stroke="#2F6FED" strokeWidth={2.4} fill="url(#spendGrad)" />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#17B893" strokeWidth={2.4} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Leads by Platform"><Donut data={platformDonut} centerValue="1,248" centerLabel="Total Leads" /></Card>
      </div>
      <Card title="Top Booking Campaigns">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Campaign</Th><Th>Platform</Th><Th>Spend</Th><Th>Bookings</Th><Th>ROAS</Th></tr></thead>
          <tbody>{campaigns.map((c) => (
            <tr key={c.name} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong>{c.name}</Td><Td>{c.platform}</Td><Td>{c.spend}</Td><Td>{c.bookings}</Td><Td color="#17B893" strong>{c.roas}</Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
