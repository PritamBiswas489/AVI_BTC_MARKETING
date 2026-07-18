import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, Th, Td, CustomTooltip } from "../../components/ui";
import { bookingsOverTime, bookingsDonut, campaigns, axisStyle } from "../../lib/data";

export default function BookingsPage() {
  return (
    <DashboardLayout title="Bookings & Sales" subtitle="Confirmed bookings, revenue and campaign contribution.">
      <KPIGrid cols={5} items={[
        { label: "Total Bookings", value: "186", delta: "22.2% vs Jun", up: true },
        { label: "Total Revenue", value: "฿4,832,000", delta: "28.7% vs Jun", up: true, accent: "#17B893" },
        { label: "Avg. Booking Value", value: "฿25,977", delta: "5.3% vs Jun", up: true },
        { label: "Total Profit (Est.)", value: "฿1,932,800", delta: "26.1% vs Jun", up: true, accent: "#2F6FED" },
        { label: "Cost Per Booking", value: "฿1,679", delta: "7.3% vs Jun", up: false },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="Bookings Over Time">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bookingsOverTime} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs><linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#17B893" stopOpacity={0.3} /><stop offset="100%" stopColor="#17B893" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="" />} />
              <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#17B893" strokeWidth={2.4} fill="url(#bookGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Bookings by Platform"><Donut data={bookingsDonut} centerValue="186" centerLabel="Total Bookings" /></Card>
      </div>
      <Card title="Top Booking Campaigns">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Campaign</Th><Th>Platform</Th><Th>Bookings</Th><Th>Revenue</Th><Th>Cost</Th><Th>ROAS</Th></tr></thead>
          <tbody>{campaigns.map((c) => (
            <tr key={c.name} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong>{c.name}</Td><Td>{c.platform}</Td><Td>{c.bookings}</Td><Td>{c.revenue}</Td><Td>{c.spend}</Td><Td color="#17B893" strong>{c.roas}</Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
