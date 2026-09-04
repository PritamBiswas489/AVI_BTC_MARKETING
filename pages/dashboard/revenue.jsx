import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, HBarList, CustomTooltip } from "../../components/ui";
import { axisStyle } from "../../lib/data";
import { useFilters } from "../../context/FilterContext";
import { API_URL } from "../../enviroment";

/* ---------------- formatting helpers ---------------- */

const fmtCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  if (Math.abs(value) >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}M`;
  return `฿${Math.round(value).toLocaleString("en-US")}`;
};

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
  const queryParams = new URLSearchParams();
  if (options.source) queryParams.append("source", options.source === "all" ? "" : options.source);
  if (options.dateRange) {
    queryParams.append("dateFrom", toLocalISODate(options.dateRange.start));
    queryParams.append("dateTo", toLocalISODate(options.dateRange.end));
  }
  const fullUrl = `${url}?${queryParams.toString()}`;

  const res = await fetch(`${API_URL}${fullUrl}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request to ${url} failed`);
  }
  return body.data;
}

export default function RevenuePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { source, dateRange } = useFilters();

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);
        const summaryData = await fetchJson("/api/revenue-profit-summary", { source, dateRange });

        if (cancelled) return;
        setData(summaryData);
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
  }, [source, dateRange]);

  if (loading) {
    return (
      <DashboardLayout title="Revenue & Profit" subtitle="Where the money comes from, and what's left after spend.">
        <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280" }}>Loading dashboard…</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Revenue & Profit" subtitle="Where the money comes from, and what's left after spend.">
        <div style={{ padding: 40, fontFamily: "Inter", color: "#E15A5A" }}>Couldn't load dashboard data: {error}</div>
      </DashboardLayout>
    );
  }

  const { summary, trend, roas_by_campaign: roasByCampaign } = data;
  const cmpMonth = monthLabel(summary.compared_to.dateFrom);

  const kpiItemsTop = [
    {
      label: "Total Revenue",
      value: fmtCurrency(summary.total_revenue.value),
      delta: `${fmtPercent(Math.abs(summary.total_revenue.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.total_revenue.change_pct ?? 0) >= 0,
      accent: "#17B893",
    },
    {
      label: "Total Ad Spend",
      value: fmtCurrency(summary.total_ad_spend.value),
      delta: `${fmtPercent(Math.abs(summary.total_ad_spend.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.total_ad_spend.change_pct ?? 0) >= 0,
    },
    {
      label: "Gross Profit (Est.)",
      value: fmtCurrency(summary.gross_profit.value),
      delta: `${fmtPercent(Math.abs(summary.gross_profit.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.gross_profit.change_pct ?? 0) >= 0,
      accent: "#2F6FED",
    },
    {
      label: "ROAS",
      value: fmtRoas(summary.roas.value),
      delta: `${fmtPercent(Math.abs(summary.roas.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.roas.change_pct ?? 0) >= 0,
    },
    {
      label: "ROI",
      value: fmtPercent(summary.roi.value ?? 0, 0),
      delta: `${fmtPercent(Math.abs(summary.roi.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.roi.change_pct ?? 0) >= 0,
    },
  ];

  const kpiItemsBottom = [
    {
      label: "Cost Per Sale",
      value: fmtCurrency(summary.cost_per_sale.value),
      delta: `${fmtPercent(Math.abs(summary.cost_per_sale.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.cost_per_sale.change_pct ?? 0) >= 0,
    },
    {
      label: "Revenue Per Lead",
      value: fmtCurrency(summary.revenue_per_lead.value),
      delta: `${fmtPercent(Math.abs(summary.revenue_per_lead.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.revenue_per_lead.change_pct ?? 0) >= 0,
    },
    {
      label: "Profit Margin",
      value: fmtPercent(summary.profit_margin.value, 1),
      delta: `${fmtPercent(Math.abs(summary.profit_margin.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.profit_margin.change_pct ?? 0) >= 0,
    },
    {
      label: "Break-even ROAS",
      value: fmtRoas(summary.break_even_roas.value),
      delta: `${fmtPercent(Math.abs(summary.break_even_roas.change_pct ?? 0), 1)} vs ${cmpMonth}`,
      up: (summary.break_even_roas.change_pct ?? 0) >= 0,
    },
  ];

  const revProfit = (trend || []).map((t) => ({
    d: fmtShortDate(t.date),
    revenue: t.revenue,
    spend: t.spend,
    profit: t.profit,
  }));

  const maxRoas = Math.max(1, ...(roasByCampaign || []).map((c) => c.roas ?? 0));
  const roasItems = (roasByCampaign || []).map((c) => ({
    label: c.campaign_name,
    value: fmtRoas(c.roas),
    pct: (Math.max(c.roas ?? 0, 0) / maxRoas) * 100,
    color: (c.roas ?? 0) > maxRoas / 2 ? "#2F6FED" : "#17B893",
  }));

  return (
    <DashboardLayout title="Revenue & Profit" subtitle="Where the money comes from, and what's left after spend.">
      <KPIGrid cols={5} items={kpiItemsTop} />
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
          <HBarList items={roasItems} />
        </Card>
      </div>
      <KPIGrid cols={4} items={kpiItemsBottom} />
    </DashboardLayout>
  );
}
