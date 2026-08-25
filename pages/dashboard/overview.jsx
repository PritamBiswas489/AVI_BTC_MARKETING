import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, Th, Td, CustomTooltip } from "../../components/ui";
import { axisStyle } from "../../lib/data";
import { useFilters } from "../../context/FilterContext";
import { API_URL } from "../../enviroment";

/* ---------------- formatting helpers ---------------- */

const fmtCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  if (Math.abs(value) >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}M`;
  return `฿${Math.round(value).toLocaleString("en-US")}`;
};

const fmtCurrencyIls = (value) => {
  if (value === null || value === undefined) return "—";
  if (Math.abs(value) >= 1_000_000) return `₪${(value / 1_000_000).toFixed(2)}M`;
  return `₪${Math.round(value).toLocaleString("en-US")}`;
};

const fmtNumber = (value) => (value === null || value === undefined ? "—" : Math.round(value).toLocaleString("en-US"));

const fmtPercent = (value, decimals = 0) => (value === null || value === undefined ? "—" : `${value.toFixed(decimals)}%`);

const fmtRoas = (value) => (value === null || value === undefined ? "—" : `${value.toFixed(1)}x`);

const fmtShortDate = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

const monthLabel = (isoDate) => new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

const toLocalISODate = (dateValue) => {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ---------------- data fetching ---------------- */

async function fetchJson(url, options = {}) {
  console.log("fetchJson called with url:", url, "and options:", options);
  const queryParams = new URLSearchParams();
  if (options.source) queryParams.append("source", options.source === 'all' ? '' : options.source);
  if (options.dateRange) {
    queryParams.append("fromDate", toLocalISODate(options.dateRange.start));
    queryParams.append("toDate", toLocalISODate(options.dateRange.end));
  }
  if(options.limit) queryParams.append("limit", options.limit);
  const fullUrl = `${url}?${queryParams.toString()}`;
  console.log("Constructed full URL:", fullUrl);
   
 
  const res = await fetch(`${API_URL}${fullUrl}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(options),
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request to ${url} failed`);
  }
  return body.data;
}

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState(null);
  const [platforms, setPlatforms] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const {  source, dateRange } = useFilters();

  




  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);
        const [statsData, trendData, platformData, campaignData] = await Promise.all([
          fetchJson("/api/executive-overview/statistics", { source, dateRange }),
          fetchJson("/api/executive-overview/ad-spend-vs-revenue", { source, dateRange }),
          fetchJson("/api/executive-overview/leads-by-platform", { source, dateRange }),
          fetchJson("/api/executive-overview/top-booking-campaigns", { source, dateRange, limit:10 }),
        ]);

        if (cancelled) return;
        setStats(statsData);
        setTrend(trendData);
        setPlatforms(platformData);
        setCampaigns(campaignData);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [ source, dateRange]);

  if (loading) {
    return (
      <DashboardLayout title="Executive Overview" subtitle="Every campaign, every lead, one clear picture.">
        <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280" }}>Loading dashboard…</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Executive Overview" subtitle="Every campaign, every lead, one clear picture.">
        <div style={{ padding: 40, fontFamily: "Inter", color: "#E15A5A" }}>Couldn't load dashboard data: {error}</div>
      </DashboardLayout>
    );
  }

  const cmpMonth = monthLabel(stats.comparedTo.from);

  const kpiItems = [
    {
      label: "Total Ad Spend",
      value: fmtCurrency(stats.cards.totalAdSpend.value),
      valueils: fmtCurrencyIls(stats.cards.totalAdSpend.valueIls),
      delta: `${fmtPercent(Math.abs(stats.cards.totalAdSpend.changePercent ?? 0), 1)} vs ${cmpMonth}`,
      up: (stats.cards.totalAdSpend.changePercent ?? 0) >= 0,
    },
    {
      label: "Total Leads",
      value: fmtNumber(stats.cards.totalLeads.value),
      delta: `${fmtPercent(Math.abs(stats.cards.totalLeads.changePercent ?? 0), 1)} vs ${cmpMonth}`,
      up: (stats.cards.totalLeads.changePercent ?? 0) >= 0,
    },
    {
      label: "Cost Per Lead",
      value: fmtCurrency(stats.cards.costPerLead.value),
      delta: `${fmtPercent(Math.abs(stats.cards.costPerLead.changePercent ?? 0), 1)} vs ${cmpMonth}`,
      up: (stats.cards.costPerLead.changePercent ?? 0) >= 0,
    },
    {
      label: "Bookings",
      value: fmtNumber(stats.cards.bookings.value),
      delta: `${fmtPercent(Math.abs(stats.cards.bookings.changePercent ?? 0), 1)} vs ${cmpMonth}`,
      up: (stats.cards.bookings.changePercent ?? 0) >= 0,
    },
    {
      label: "Revenue",
      value: fmtCurrency(stats.cards.revenue.value),
      delta: `${fmtPercent(Math.abs(stats.cards.revenue.changePercent ?? 0), 1)} vs ${cmpMonth}`,
      up: (stats.cards.revenue.changePercent ?? 0) >= 0,
      accent: "#17B893",
    },
    {
      label: "ROI",
      value: fmtPercent(stats.cards.roi.value ?? 0, 0),
      delta: `${fmtPercent(Math.abs(stats.cards.roi.changePercent ?? 0), 1)} vs ${cmpMonth}`,
      up: (stats.cards.roi.changePercent ?? 0) >= 0,
      accent: "#2F6FED",
    },
  ];
  console.log("KPI Items:", kpiItems);

  const spendRevenue = trend.series.map((point) => ({
    d: fmtShortDate(point.date),
    spend: (point.adSpend),
    spendIls: (point.adSpendIls),
    revenue: (point.revenue),
  }));

  const platformDonut = platforms.platforms.map((p) => ({
    name: p.label,
    value: p.percent,
    color: p.color,
  }));

  const campaignRows = campaigns.campaigns.map((c) => ({
    name: c.campaignName,
    platform: c.platform,
    spend: fmtCurrency(c.spend),
    spendIls: fmtCurrencyIls(c.spendIls),
    bookings: fmtNumber(c.bookings),
    roas: fmtRoas(c.roas),
  }));

  return (
    <DashboardLayout title="Executive Overview" subtitle="Every campaign, every lead, one clear picture.">
      <KPIGrid cols={6} items={kpiItems} />
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
                  <linearGradient id="spendGradIls" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2F6FED" stopOpacity={0.28} /><stop offset="100%" stopColor="#2F6FED" stopOpacity={0} /></linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#17B893" stopOpacity={0.3} /><stop offset="100%" stopColor="#17B893" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF1F8" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="spend" name="Ad Spend (THB)" stroke="#2F6FED" strokeWidth={2.4} fill="url(#spendGrad)" />
              <Area type="monotone" dataKey="spendIls" name="Ad Spend (ILS)" stroke="#2F6FED" strokeWidth={2.4} fill="url(#spendGradIls)" />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#17B893" strokeWidth={2.4} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Leads by Platform"><Donut data={platformDonut} centerValue={fmtNumber(platforms.totalLeads)} centerLabel="Total Leads" /></Card>
      </div>
      <Card title="Top Booking Campaigns">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Campaign</Th><Th>Platform</Th><Th>Spend</Th><Th>Spend (ILS)</Th><Th>Bookings</Th><Th>ROAS</Th></tr></thead>
          <tbody>{campaignRows.map((c) => (
            <tr key={c.name} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong>{c.name}</Td>
              <Td>{c.platform}</Td>
              <Td>{c.spend}</Td>
              <Td>{c.spendIls}</Td>
              <Td>{c.bookings}</Td>
              <Td color="#17B893" strong>{c.roas}</Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
