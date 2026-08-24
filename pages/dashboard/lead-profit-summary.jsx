import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, Th, Td } from "../../components/ui";
import { API_URL } from "../../enviroment";

/* ---------------- constants ---------------- */

const ENDPOINT = "/api/lead-profit-summary";

const DEFAULT_QUERY = {
  page: 1,
  limit: 50,
  search: "",
  utmSource: "",
  leadDateFrom: "",
  leadDateTo: "",
  updatedFrom: "",
  updatedTo: "",
  sortBy: "lead_created_date",
  sortOrder: "DESC",
};

const PREFERRED_ORDER = [
  "id", "lead_created_date", "utm_source", "campaign_id", "campaign_name",
  "total_leads", "total_sell_count", "total_revenue_thb", "total_profit_thb",
  "total_spend", "total_clicks", "total_impressions", "cpl",
  "roas", "profit_after_ad", "marketing_roi", "cost_per_sale", "revenue_per_lead", "profit_per_lead",
  "updated_at",
];

const COMPUTED_KEYS = ["roas", "profit_after_ad", "marketing_roi", "cost_per_sale", "revenue_per_lead", "profit_per_lead"];

const MONO_COLS = [
  "id", "total_sell_count", "total_revenue_thb", "total_profit_thb",
  "total_leads", "total_spend", "total_clicks", "total_impressions", "cpl",
];

const FIXED2_KEYS = [
  "total_revenue_thb", "total_profit_thb", "total_spend",
  "profit_after_ad", "cost_per_sale", "revenue_per_lead", "profit_per_lead", "cpl",
];

/* ---------------- formatting helpers ---------------- */

const num = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const fmtFixed2 = (n) => {
  if (n === null || n === undefined || n === "") return "0.00";
  const value = Number(n);
  return Number.isNaN(value) ? "0.00" : value.toFixed(2);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatRatio = (value) => (value === null || value === undefined || Number.isNaN(value) ? "—" : `${value.toFixed(2)}x`);

const formatPercent = (value) => (value === null || value === undefined || Number.isNaN(value) ? "—" : `${value.toFixed(1)}%`);

const signColor = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "#6B7280";
  if (value > 0) return "#17B893";
  if (value < 0) return "#E15A5A";
  return "#6B7280";
};

const formatMetricCell = (key, value) => {
  if (key === "roas") return { text: formatRatio(value), color: signColor(value === null ? null : value - 1) };
  if (key === "marketing_roi") return { text: formatPercent(value), color: signColor(value) };
  if (key === "profit_after_ad") return { text: formatCurrency(value), color: signColor(value) };
  return { text: formatCurrency(value), color: null };
};

const formatCellValue = (value, key) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  if (FIXED2_KEYS.includes(key)) return fmtFixed2(value);
  return String(value);
};

const computeMetrics = (row) => {
  const spend = num(row.total_spend);
  const revenue = num(row.total_revenue_thb);
  const profit = num(row.total_profit_thb);
  const leads = num(row.total_leads);
  const sales = num(row.total_sell_count);

  return {
    roas: spend > 0 ? revenue / spend : null,
    profit_after_ad: profit - spend,
    marketing_roi: spend > 0 ? ((profit - spend) / spend) * 100 : null,
    cost_per_sale: sales > 0 ? spend / sales : null,
    revenue_per_lead: leads > 0 ? revenue / leads : null,
    profit_per_lead: leads > 0 ? profit / leads : null,
  };
};

const pillStyle = (value) => {
  if (value === "meta") return { background: "#E0EDFF", color: "#1447E6" };
  if (value === "google") return { background: "#FDE8E8", color: "#C81E1E" };
  return { background: "#EEF0F3", color: "#374151" };
};

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);
  return pages;
}

/* ---------------- data fetching ---------------- */

async function fetchLeadProfitSummary(query) {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(parseInt(query.page, 10) || 1, 1)));
  params.set("limit", String(Math.max(parseInt(query.limit, 10) || 50, 1)));
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.utmSource) params.set("utm_source", query.utmSource);
  if (query.leadDateFrom) params.set("lead_created_date_from", query.leadDateFrom);
  if (query.leadDateTo) params.set("lead_created_date_to", query.leadDateTo);
  if (query.updatedFrom) params.set("updated_at_from", query.updatedFrom);
  if (query.updatedTo) params.set("updated_at_to", query.updatedTo);
  if (query.sortBy) params.set("sort_by", query.sortBy);
  if (query.sortOrder) params.set("sort_order", query.sortOrder);

  const res = await fetch(`${API_URL}${ENDPOINT}?${params.toString()}`, {
    method: "GET",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json();
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.error || "Request failed");
  }
  return body;
}

/* ---------------- page ---------------- */

export default function LeadProfitSummaryPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [draft, setDraft] = useState(DEFAULT_QUERY);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const body = await fetchLeadProfitSummary(query);
        if (cancelled) return;

        setRows(Array.isArray(body.data) ? body.data : []);
        const p = body.pagination || {};
        setPagination({
          total: Number(p.total || 0),
          page: Number(p.page || query.page || 1),
          totalPages: Number(p.total_pages || 1),
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setRows([]);
        setPagination(null);
        setError(err.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const commitDraft = () => {
    setQuery((q) => ({ ...q, ...draft, page: 1 }));
  };

  const handleReset = () => {
    setDraft(DEFAULT_QUERY);
    setQuery(DEFAULT_QUERY);
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") commitDraft();
  };

  const goToPage = (page) => {
    setQuery((q) => ({ ...q, page: Math.max(parseInt(page, 10) || 1, 1) }));
  };

  const toggleSort = (key) => {
    setQuery((q) => ({
      ...q,
      page: 1,
      sortBy: key,
      sortOrder: q.sortBy === key && q.sortOrder === "DESC" ? "ASC" : q.sortBy === key ? "DESC" : "DESC",
    }));
  };

  const tableRows = useMemo(() => rows.map((r) => ({ ...r, ...computeMetrics(r) })), [rows]);

  const columns = useMemo(() => {
    if (!tableRows.length) return [];
    const rowKeys = Object.keys(tableRows[0]);
    return [
      ...PREFERRED_ORDER.filter((k) => rowKeys.includes(k)),
      ...rowKeys.filter((k) => !PREFERRED_ORDER.includes(k)),
    ];
  }, [tableRows]);

  const pageItems = pagination ? buildPageItems(pagination.page, pagination.totalPages) : [];

  return (
    <DashboardLayout title="Lead Profit Summary" subtitle="Filter, sort, and audit lead-to-revenue performance by campaign.">
      <Card title="Filters">
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", fontFamily: "Inter" }}>
          <Field label="Search">
            <input
              type="text"
              placeholder="campaign, campaign id"
              value={draft.search}
              onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="UTM Source">
            <select
              value={query.utmSource}
              onChange={(e) => setQuery((q) => ({ ...q, page: 1, utmSource: e.target.value }))}
              style={inputStyle}
            >
              <option value="">--</option>
              <option value="meta">meta</option>
              <option value="google">google</option>
            </select>
          </Field>

          <Field label="Lead Date From">
            <input
              type="date"
              value={draft.leadDateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, leadDateFrom: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Lead Date To">
            <input
              type="date"
              value={draft.leadDateTo}
              onChange={(e) => setDraft((d) => ({ ...d, leadDateTo: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Updated From">
            <input
              type="date"
              value={draft.updatedFrom}
              onChange={(e) => setDraft((d) => ({ ...d, updatedFrom: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Updated To">
            <input
              type="date"
              value={draft.updatedTo}
              onChange={(e) => setDraft((d) => ({ ...d, updatedTo: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Limit">
            <select
              value={query.limit}
              onChange={(e) => setQuery((q) => ({ ...q, page: 1, limit: Number(e.target.value) }))}
              style={inputStyle}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </Field>

          <button onClick={commitDraft} style={btnPrimaryStyle}>Apply</button>
          <button onClick={handleReset} style={btnStyle}>Reset</button>

          {pagination && (
            <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
              Total: {pagination.total} | Page: {pagination.page} / {pagination.totalPages}
            </div>
          )}
        </div>
      </Card>

      <Card title="Results">
        {loading ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280" }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#E15A5A" }}>Couldn't load data: {error}</div>
        ) : tableRows.length === 0 ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280", textAlign: "center" }}>No data found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter", fontSize: 12, minWidth: 1400 }}>
              <thead>
                <tr>
                  {columns.map((key) =>
                    COMPUTED_KEYS.includes(key) ? (
                      <Th key={key}>
                        <span style={{ color: "#7C3AED" }}>{key}</span>
                      </Th>
                    ) : (
                      <Th key={key}>
                        <span onClick={() => toggleSort(key)} style={{ cursor: "pointer", userSelect: "none" }}>
                          {key}
                          {query.sortBy === key && (
                            <span style={{ marginLeft: 4, fontSize: 10, color: "#2F6FED" }}>
                              {query.sortOrder === "ASC" ? "▲" : "▼"}
                            </span>
                          )}
                        </span>
                      </Th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={row.id ?? i} style={{ borderTop: "1px solid #F0F2F8" }}>
                    {columns.map((key) => {
                      if (COMPUTED_KEYS.includes(key)) {
                        const m = formatMetricCell(key, row[key]);
                        return (
                          <Td key={key} color={m.color} strong={!!m.color}>
                            {m.text}
                          </Td>
                        );
                      }
                      if (key === "utm_source") {
                        const style = pillStyle(row[key]);
                        return (
                          <Td key={key}>
                            {row[key] ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  ...style,
                                }}
                              >
                                {formatCellValue(row[key])}
                              </span>
                            ) : (
                              "—"
                            )}
                          </Td>
                        );
                      }
                      return <Td key={key}>{formatCellValue(row[key], key)}</Td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 999,
              boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
              fontFamily: "Inter",
            }}
          >
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={pageBtnStyle(false, pagination.page <= 1)}
            >
              Prev
            </button>

            {pageItems.map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, padding: "0 4px" }}>…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  style={pageBtnStyle(item === pagination.page, false)}
                >
                  {item}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={pageBtnStyle(false, pagination.page >= pagination.totalPages)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ---------------- small pieces ---------------- */

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: "#6B7280", fontWeight: 700 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  height: 34,
  padding: "6px 10px",
  border: "1px solid #D1D5DB",
  borderRadius: 6,
  minWidth: 120,
  background: "#fff",
  fontFamily: "Inter",
  fontSize: 13,
};

const btnStyle = {
  height: 34,
  borderRadius: 6,
  border: "1px solid #D1D5DB",
  background: "#fff",
  color: "#111827",
  fontWeight: 700,
  padding: "0 14px",
  cursor: "pointer",
  fontFamily: "Inter",
  fontSize: 13,
};

const btnPrimaryStyle = {
  ...btnStyle,
  background: "#2F6FED",
  borderColor: "#2F6FED",
  color: "#fff",
};

const pageBtnStyle = (active, disabled) => ({
  border: "1px solid transparent",
  background: active ? "#2F6FED" : "transparent",
  color: active ? "#fff" : "#1F2937",
  height: 30,
  minWidth: 30,
  borderRadius: 999,
  padding: "0 10px",
  cursor: disabled ? "default" : "pointer",
  fontSize: 12,
  fontWeight: 700,
  opacity: disabled ? 0.35 : 1,
});
