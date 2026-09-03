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

const fmtNumber = (value) => (value === null || value === undefined ? "—" : Math.round(value).toLocaleString("en-US"));

const fmtPercent = (value, decimals = 1) => (value === null || value === undefined ? "—" : `${value.toFixed(decimals)}%`);

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

const PLATFORM_COLORS = {
  Meta: "#2F6FED",
  Google: "#17B893",
};

/* ---------------- data fetching ---------------- */

async function fetchBookingsSales({ source, dateRange } = {}) {
  const queryParams = new URLSearchParams();
  if (source) queryParams.append("source", source === "all" ? "all" : source);
  if (dateRange) {
    queryParams.append("startDate", toLocalISODate(dateRange.start));
    queryParams.append("endDate", toLocalISODate(dateRange.end));
  }

  const res = await fetch(`${API_URL}/api/bookings-sales?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || "Request to /api/bookings-sales failed");
  }
  return body.data;
}

export default function BookingsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { source, dateRange } = useFilters();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchBookingsSales({ source, dateRange });
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load bookings & sales data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [source, dateRange]);

  if (loading) {
    return (
      <DashboardLayout title="Bookings & Sales" subtitle="Confirmed bookings, revenue and campaign contribution.">
        <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280" }}>Loading dashboard…</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Bookings & Sales" subtitle="Confirmed bookings, revenue and campaign contribution.">
        <div style={{ padding: 40, fontFamily: "Inter", color: "#E15A5A" }}>Couldn't load dashboard data: {error}</div>
      </DashboardLayout>
    );
  }

  const cmpMonth = monthLabel(data.previousDateRange.startDate);

  const kpiItems = [
    {
      label: "Total Bookings",
      value: fmtNumber(data.kpis.totalBookings.value),
      delta: `${fmtPercent(Math.abs(data.kpis.totalBookings.changePct ?? 0))} vs ${cmpMonth}`,
      up: (data.kpis.totalBookings.changePct ?? 0) >= 0,
    },
    {
      label: "Total Revenue",
      value: fmtCurrency(data.kpis.totalRevenue.value),
      delta: `${fmtPercent(Math.abs(data.kpis.totalRevenue.changePct ?? 0))} vs ${cmpMonth}`,
      up: (data.kpis.totalRevenue.changePct ?? 0) >= 0,
      accent: "#17B893",
    },
    {
      label: "Avg. Booking Value",
      value: fmtCurrency(data.kpis.avgBookingValue.value),
      delta: `${fmtPercent(Math.abs(data.kpis.avgBookingValue.changePct ?? 0))} vs ${cmpMonth}`,
      up: (data.kpis.avgBookingValue.changePct ?? 0) >= 0,
    },
    {
      label: "Total Profit (Est.)",
      value: fmtCurrency(data.kpis.totalProfit.value),
      delta: `${fmtPercent(Math.abs(data.kpis.totalProfit.changePct ?? 0))} vs ${cmpMonth}`,
      up: (data.kpis.totalProfit.changePct ?? 0) >= 0,
      accent: "#2F6FED",
    },
    {
      label: "Cost Per Booking",
      value: fmtCurrency(data.kpis.costPerBooking.value),
      delta: `${fmtPercent(Math.abs(data.kpis.costPerBooking.changePct ?? 0))} vs ${cmpMonth}`,
      up: (data.kpis.costPerBooking.changePct ?? 0) >= 0,
    },
  ];

  const bookingsOverTime = data.bookingsOverTime.map((point) => ({
    d: fmtShortDate(point.date),
    bookings: point.bookings,
  }));

  const bookingsDonut = data.bookingsByPlatform.map((p) => ({
    name: p.platform,
    value: p.percentage,
    color: PLATFORM_COLORS[p.platform] || "#8B6BF0",
  }));

  const campaignRows = data.topBookingCampaigns.map((c) => ({
    name: c.campaign,
    platform: c.platform,
    bookings: fmtNumber(c.bookings),
    revenue: fmtCurrency(c.revenue),
    spend: fmtCurrency(c.cost),
    roas: fmtRoas(c.roas),
  }));

  return (
    <DashboardLayout title="Bookings & Sales" subtitle="Confirmed bookings, revenue and campaign contribution.">
      <KPIGrid cols={5} items={kpiItems} />
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
        <Card title="Bookings by Platform">
          <Donut data={bookingsDonut} centerValue={fmtNumber(data.kpis.totalBookings.value)} centerLabel="Total Bookings" />
        </Card>
      </div>
      <Card title="Top Booking Campaigns">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter" }}>
          <thead><tr><Th>Campaign</Th><Th>Platform</Th><Th>Bookings</Th><Th>Revenue</Th><Th>Cost</Th><Th>ROAS</Th></tr></thead>
          <tbody>{campaignRows.map((c) => (
            <tr key={c.name} style={{ borderTop: "1px solid #F0F2F8" }}>
              <Td strong>{c.name}</Td><Td>{c.platform}</Td><Td>{c.bookings}</Td><Td>{c.revenue}</Td><Td>{c.spend}</Td>
              <Td color="#17B893" strong>{c.roas}</Td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}