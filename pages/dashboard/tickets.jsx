import React from "react";
import { Users, MessageSquare, CheckCircle2, Calendar, ArrowUpRight } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, Th, Td, StatusPill } from "../../components/ui";
import { ticketStatusDonut, recentTickets } from "../../lib/data";

export default function TicketsPage() {
  const steps = [
    { icon: Users, label: "Leads", value: "1,248", pct: "100%" },
    { icon: MessageSquare, label: "Tickets Created", value: "1,149", pct: "92.1%" },
    { icon: CheckCircle2, label: "Qualified", value: "462", pct: "40.2%" },
    { icon: Calendar, label: "Booked", value: "166", pct: "14.4%" },
  ];
  return (
    <DashboardLayout title="LiveAgent Tickets" subtitle="Conversation funnel from lead to booked.">
      <KPIGrid cols={5} items={[
        { label: "Total Tickets", value: "1,149", delta: "18.6% vs Jun", up: true },
        { label: "Open Tickets", value: "312 (27.2%)", delta: "12.4% vs Jun", up: true },
        { label: "Closed (No Booking)", value: "671 (58.4%)", delta: "8.7% vs Jun", up: true },
        { label: "Closed (Booked)", value: "166 (14.4%)", delta: "14.1% vs Jun", up: true, accent: "#17B893" },
        { label: "Avg. Response Time", value: "8m 24s", delta: "5.3% vs Jun", up: false },
      ]} />
      <Card title="Ticket Funnel" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={{ flex: 1, background: "#F5F7FB", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E9F1FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <s.icon size={17} color="#2F6FED" />
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 19, color: "#0F1424" }}>{s.value}</div>
                <div style={{ fontFamily: "Inter", fontSize: 12, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "Inter", fontSize: 11, color: "#9AA3C2", marginTop: 2 }}>({s.pct})</div>
              </div>
              {i < steps.length - 1 && <ArrowUpRight size={16} color="#C7CEE3" style={{ transform: "rotate(45deg)", flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <Card title="Tickets by Status"><Donut data={ticketStatusDonut} /></Card>
        <Card title="Recent Tickets">
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
            <thead><tr><Th>Ticket ID</Th><Th>Lead ID</Th><Th>Status</Th><Th>Agent</Th><Th>Last Update</Th></tr></thead>
            <tbody>{recentTickets.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid #F0F2F8" }}>
                <Td strong color="#2F6FED">{t.id}</Td><Td>{t.lead}</Td>
                <td style={{ padding: "10px 6px" }}><StatusPill status={t.status} /></td>
                <Td>{t.agent}</Td><Td>{t.updated}</Td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
