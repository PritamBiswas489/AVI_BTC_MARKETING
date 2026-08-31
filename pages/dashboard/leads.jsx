import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, KPIGrid, Donut, Th, Td, StatusPill, CustomTooltip } from "../../components/ui";
import { axisStyle } from "../../lib/data";
import { API_URL } from "../../enviroment";
import { useFilters } from "../../context/FilterContext";

/* ---------------------------------------------------------------
   Config
------------------------------------------------------------------ */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const SOURCE_COLORS = { Meta: "#2F6FED", Google: "#17B893" };

/* ---------------------------------------------------------------
   API call
------------------------------------------------------------------ */

async function fetchLeadsDashboard({ startDate, endDate, recentLeadsLimit =20, signal }) {
    const params = new URLSearchParams({ startDate, endDate });
    if (recentLeadsLimit) params.set("recentLeadsLimit", String(recentLeadsLimit));
    const url = `${API_URL}/api/lead-statistics/dashboard?${params.toString()}`;
    console.log("Fetching leads dashboard from:", url);
    const res = await fetch(url, { signal });
    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
        throw new Error(body?.message || `Failed to fetch leads dashboard (status ${res.status})`);
    }

    return body.data;
}

/* ---------------------------------------------------------------
   Formatters
------------------------------------------------------------------ */

function formatNumber(value) {
    if (value === null || value === undefined) return "—";
    return Number(value).toLocaleString("en-US");
}

function formatDeltaPct(value, suffix = "vs previous period") {
    if (value === null || value === undefined) return { text: `— ${suffix}`, up: true };
    const up = value >= 0;
    return { text: `${Math.abs(value).toFixed(1)}% ${suffix}`, up };
}

function formatDeltaPp(value, suffix = "vs previous period") {
    if (value === null || value === undefined) return { text: `— ${suffix}`, up: true };
    const up = value >= 0;
    return { text: `${Math.abs(value).toFixed(1)}pp ${suffix}`, up };
}

function formatShortDate(isoOrDateString) {
    const date = new Date(isoOrDateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLongDate(isoOrDateString) {
    const date = new Date(isoOrDateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(amount, currency) {
    if (amount === null || amount === undefined) return "—";
    const symbol = !currency || currency === "THB" ? "฿" : `${currency} `;
    return `${symbol}${Number(amount).toLocaleString("en-US")}`;
}

/** Default range: 1st of the current month through today (inclusive). */
function getDefaultRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // exclusive upper bound
    const toIso = (d) => d.toISOString().slice(0, 10);
    return { startDate: toIso(start), endDate: toIso(end) };
}

/* ---------------------------------------------------------------
   Page
------------------------------------------------------------------ */
const toLocalISODate = (dateValue) => {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function LeadsPage() {
     const {  source, dateRange } = useFilters();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(
        async (signal) => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchLeadsDashboard({ startDate: toLocalISODate(dateRange.start), endDate: toLocalISODate(dateRange.end), recentLeadsLimit: 20, signal });
                setData(result);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Failed to load dashboard data");
                }
            } finally {
                setLoading(false);
            }
        },
        [dateRange.start, dateRange.end],
    );

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const kpiItems = useMemo(() => {
        if (!data) return [];
        const { kpis } = data;

        const totalDelta = formatDeltaPct(kpis.totalPaidLeads.vsPreviousPeriodPct);
        const metaDelta = formatDeltaPct(kpis.metaLeads.vsPreviousPeriodPct);
        const googleDelta = formatDeltaPct(kpis.googleLeads.vsPreviousPeriodPct);
        const ticketDelta = formatDeltaPp(kpis.leadToTicketRate.vsPreviousPeriodPp);
        const bookingDelta = formatDeltaPp(kpis.leadToBookingRate.vsPreviousPeriodPp);

        return [
            {
                label: "Total Paid Leads",
                value: formatNumber(kpis.totalPaidLeads.value),
                delta: totalDelta.text,
                up: totalDelta.up,
            },
            {
                label: "Meta Leads",
                value: `${formatNumber(kpis.metaLeads.value)} (${kpis.metaLeads.sharePct}%)`,
                delta: metaDelta.text,
                up: metaDelta.up,
            },
            {
                label: "Google Leads",
                value: `${formatNumber(kpis.googleLeads.value)} (${kpis.googleLeads.sharePct}%)`,
                delta: googleDelta.text,
                up: googleDelta.up,
            },
            {
                label: "Lead → Ticket Rate",
                value: `${kpis.leadToTicketRate.valuePct}%`,
                delta: ticketDelta.text,
                up: ticketDelta.up,
            },
            {
                label: "Lead → Booking Rate",
                value: `${kpis.leadToBookingRate.valuePct}%`,
                delta: bookingDelta.text,
                up: bookingDelta.up,
            },
        ];
    }, [data]);

    const chartData = useMemo(() => {
        if (!data) return [];
        return data.paidLeadsOverTime.map((point) => ({
            d: formatShortDate(point.date),
            Meta: point.meta,
            Google: point.google,
        }));
    }, [data]);

    const donutData = useMemo(() => {
        if (!data) return [];
        return data.leadsBySource.segments.map((segment) => ({
            name: segment.source,
            value: segment.pct,
            color: SOURCE_COLORS[segment.source] || "#8B6BF0",
        }));
    }, [data]);

    const recentLeads = useMemo(() => {
        if (!data) return [];
        console.log("Raw recent leads data:", data.recentLeads);
        return data.recentLeads.map((lead) => ({
            id: lead.leadId,
            date: formatLongDate(lead.date),
            source: lead.source,
            campaign: lead.campaign || "—",
            campaignId: lead.campaign_id || null,
            cost: formatCurrency(lead.cost, lead.costCurrency),
            cost_ils_per_lead: formatCurrency(lead.cost_ils_per_lead, "ILS"),
            status: lead.status,
        }));
    }, [data]);

    return (
      <DashboardLayout
        title="Leads"
        subtitle="Paid leads captured, matched and moving toward booking."
      >
        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#FDECEC",
              color: "#E15A5A",
              fontFamily: "Inter",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Couldn't load dashboard data: {error}
          </div>
        )}

        <KPIGrid cols={5} items={loading ? [] : kpiItems} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Card
            title="Paid Leads Over Time"
            action={
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  fontFamily: "Inter",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                }}
              >
                <span>
                  <i
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#2F6FED",
                      marginRight: 6,
                    }}
                  />
                  Meta
                </span>
                <span>
                  <i
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#17B893",
                      marginRight: 6,
                    }}
                  />
                  Google
                </span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#EEF1F8" />
                <XAxis
                  dataKey="d"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip prefix="" />} />
                <Bar
                  dataKey="Meta"
                  stackId="a"
                  fill="#2F6FED"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Google"
                  stackId="a"
                  fill="#17B893"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Leads by Source">
            <Donut
              data={donutData}
              centerValue={formatNumber(data?.leadsBySource?.total)}
              centerLabel="Total Leads"
            />
          </Card>
        </div>

        <Card title="Recent Leads">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Inter",
            }}
          >
            <thead>
              <tr>
                <Th>Lead ID</Th>
                <Th>Date</Th>
                <Th>Source</Th>
                <Th>Campaign</Th>
                <Th>Campaign ID</Th>
                <Th>Cost</Th>
                <Th>Cost ils</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid #F0F2F8" }}>
                  <Td strong color="#2F6FED">
                    {l.id}
                  </Td>
                  <Td>{l.date}</Td>
                  <Td>{l.source}</Td>
                  <Td>{l.campaign}</Td>
                  <Td>{l.campaignId}</Td>
                  <Td>{l.cost}</Td>
                  <Td>{l.cost_ils_per_lead}</Td>
                  <Td>
                    <StatusPill status={l.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </DashboardLayout>
    );
}
