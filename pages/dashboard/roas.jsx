import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, HBarList, CustomTooltip } from "../../components/ui";
import { roasTrend, campaigns, axisStyle } from "../../lib/data";

export default function RoasPage() {
  return (
    <DashboardLayout title="ROAS & ROI" subtitle="Return on every baht spent, by campaign and over time.">
      <KPIGrid cols={4} items={[
        { label: "Blended ROAS", value: "15.5x", delta: "7.2% vs Jun", up: true, accent: "#2F6FED" },
        { label: "Blended ROI", value: "325%", delta: "26.1% vs Jun", up: true, accent: "#17B893" },
        { label: "Best Campaign", value: "18.6x", delta: "Family Thailand", up: true },
        { label: "Break-even ROAS", value: "2.6x", delta: "6.2% vs Jun", up: false },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <Card title="ROAS Trend (30 Days)">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={roasTrend} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs><linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2F6FED" stopOpacity={0.3} /><stop offset="100%" stopColor="#2F6FED" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
              <Tooltip content={<CustomTooltip prefix="" />} />
              <Area type="monotone" dataKey="roas" name="ROAS" stroke="#2F6FED" strokeWidth={2.4} fill="url(#roasGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="ROAS by Campaign">
          <HBarList items={campaigns.map((c) => ({ label: c.name, value: c.roas, pct: parseFloat(c.roas) * 4.5, color: "#2F6FED" }))} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
