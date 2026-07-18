import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, HBarList, Donut, Th, Td } from "../../components/ui";
import { matchQualityLevels, unmatchedDonut, unmatchedLeads } from "../../lib/data";

export default function AttributionPage() {
  return (
    <DashboardLayout title="Attribution & Match Quality" subtitle="How confidently leads are tied back to the ad that drove them.">
      <KPIGrid cols={5} items={[
        { label: "Lead Match Rate", value: "95.0%", delta: "3.2% vs Jun", up: true, accent: "#17B893" },
        { label: "Leads w/ Cost", value: "1,186", delta: "12.8% vs Jun", up: true },
        { label: "Unmatched Leads", value: "62 (5.0%)", delta: "1.1% vs Jun", up: true },
        { label: "Spend w/o Leads", value: "฿24,350 (7.8%)", delta: "4.6% vs Jun", up: false },
        { label: "Avg. Confidence", value: "86%", delta: "2.8% vs Jun", up: true },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="Match Quality by Level">
          <HBarList items={matchQualityLevels.map((m) => ({ label: m.label, value: `${m.pct}% (${m.count})`, pct: m.pct, color: m.color }))} />
        </Card>
        <Card title="Unmatched Leads by Reason"><Donut data={unmatchedDonut} centerValue="62" centerLabel="Unmatched Leads" /></Card>
      </div>
      <Card title="Unmatched Leads (Sample)">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Lead ID</Th><Th>Date</Th><Th>Source</Th><Th>Reason</Th><Th>Campaign</Th></tr></thead>
          <tbody>{unmatchedLeads.map((u) => (
            <tr key={u.id} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong color="#2F6FED">{u.id}</Td><Td>{u.date}</Td><Td>{u.source}</Td><Td>{u.reason}</Td><Td>{u.campaign}</Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
