import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, HBarList, CustomTooltip } from "../../components/ui";
import { revProfit, campaigns, axisStyle } from "../../lib/data";

export default function RevenuePage() {
  return (
    <DashboardLayout title="Revenue & Profit" subtitle="Where the money comes from, and what's left after spend.">
      <KPIGrid cols={5} items={[
        { label: "Total Revenue", value: "฿4,832,000", delta: "32.1% vs Jun", up: true, accent: "#17B893" },
        { label: "Total Ad Spend", value: "฿312,450", delta: "18.4% vs Jun", up: true },
        { label: "Gross Profit (Est.)", value: "฿1,932,800", delta: "28.7% vs Jun", up: true, accent: "#2F6FED" },
        { label: "ROAS", value: "15.5x", delta: "2.8x vs Jun", up: true },
        { label: "ROI", value: "325%", delta: "41.3% vs Jun", up: true },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="Revenue vs Spend vs Profit" action={
          <div style={{ display: "flex", gap: 12, fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#17B893", marginRight: 6 }} />Revenue</span>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#2F6FED", marginRight: 6 }} />Spend</span>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#8B6BF0", marginRight: 6 }} />Profit</span>
          </div>}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={revProfit} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#17B893" strokeWidth={2.4} dot={false} />
              <Line type="monotone" dataKey="spend" name="Spend" stroke="#2F6FED" strokeWidth={2.4} dot={false} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#8B6BF0" strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="ROAS by Campaign">
          <HBarList items={campaigns.map((c) => ({ label: c.name, value: c.roas, pct: parseFloat(c.roas) * 4.5, color: parseFloat(c.roas) > 16 ? "#2F6FED" : "#17B893" }))} />
        </Card>
      </div>
      <KPIGrid cols={4} items={[
        { label: "Cost Per Sale", value: "฿1,679", delta: "12.4% vs Jun", up: false },
        { label: "Revenue Per Lead", value: "฿3,874", delta: "7.5% vs Jun", up: true },
        { label: "Profit Margin", value: "40.0%", delta: "3.6% vs Jun", up: true },
        { label: "Break-even ROAS", value: "2.6x", delta: "6.2% vs Jun", up: false },
      ]} />
    </DashboardLayout>
  );
}
