import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, Th, Td, StatusPill, CustomTooltip } from "../../components/ui";
import { paidLeadsOverTime, platformDonut, recentLeads, axisStyle } from "../../lib/data";

export default function LeadsPage() {
  return (
    <DashboardLayout title="Leads" subtitle="Paid leads captured, matched and moving toward booking.">
      <KPIGrid cols={5} items={[
        { label: "Total Paid Leads", value: "1,248", delta: "18.6% vs Jun", up: true },
        { label: "Meta Leads", value: "842 (67.5%)", delta: "18.3% vs Jun", up: true },
        { label: "Google Leads", value: "406 (32.5%)", delta: "19.2% vs Jun", up: true },
        { label: "Lead → Ticket Rate", value: "92.1%", delta: "2.4pp vs Jun", up: true },
        { label: "Lead → Booking Rate", value: "14.9%", delta: "2.6pp vs Jun", up: true },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="Paid Leads Over Time" action={
          <div style={{ display: "flex", gap: 14, fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#2F6FED", marginRight: 6 }} />Meta</span>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#17B893", marginRight: 6 }} />Google</span>
          </div>}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paidLeadsOverTime} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="" />} />
              <Bar dataKey="Meta" stackId="a" fill="#2F6FED" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Google" stackId="a" fill="#17B893" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Leads by Source"><Donut data={platformDonut} centerValue="1,248" centerLabel="Total Leads" /></Card>
      </div>
      <Card title="Recent Leads">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Lead ID</Th><Th>Date</Th><Th>Source</Th><Th>Campaign</Th><Th>Cost</Th><Th>Status</Th></tr></thead>
          <tbody>{recentLeads.map((l) => (
            <tr key={l.id} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong color="#2F6FED">{l.id}</Td><Td>{l.date}</Td><Td>{l.source}</Td><Td>{l.campaign}</Td><Td>{l.cost}</Td>
              <td style={{ padding: "10px 6px" }}><StatusPill status={l.status} /></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
