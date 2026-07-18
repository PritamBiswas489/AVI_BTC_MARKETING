import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, Wrench } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CustomTooltip } from "../../components/ui";
import { matchRateTrend, dataChecks, axisStyle } from "../../lib/data";

export default function DataQualityPage() {
  const iconFor = (s) => s === "good" ? <CheckCircle2 size={16} color="#17B893" /> : s === "warn" ? <AlertTriangle size={16} color="#F6A93B" /> : <XCircle size={16} color="#E15A5A" />;
  return (
    <DashboardLayout title="Data Quality" subtitle="Health checks across the pipeline, from click to booking.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.4fr", gap: 14, marginBottom: 14 }}>
        <Card title="Data Health Score">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 170 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 40, color: "#17B893" }}>91</div>
            <div style={{ fontFamily: "Inter", fontSize: 12.5, color: "#8A93B0", marginTop: 2 }}>out of 100 · Good</div>
          </div>
        </Card>
        <Card title="Match Rate Trend (30 Days)">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={matchRateTrend} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[80, 100]} />
              <Tooltip content={<CustomTooltip prefix="" />} />
              <Line type="monotone" dataKey="rate" name="Match Rate %" stroke="#17B893" strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Pipeline Checks">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {dataChecks.map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 4px", borderTop: i === 0 ? "none" : "1px solid #F0F2F8" }}>
              {iconFor(c.status)}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13.5, color: "#0F1424" }}>{c.name}</div>
                <div style={{ fontFamily: "Inter", fontSize: 12, color: "#8A93B0", marginTop: 1 }}>{c.detail}</div>
              </div>
              <Wrench size={14} color="#C7CEE3" />
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
