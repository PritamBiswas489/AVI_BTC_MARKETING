import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, Th, Td } from "../../components/ui";
import { API_URL } from "../../enviroment";

/* ---------------- constants ---------------- */

const ENDPOINT = "/api/campaign-reconciled-cost-allocation";

const DEFAULT_QUERY = {
  page: 1,
  limit: 50,
  search: "",
  spendDateFrom: "",
  spendDateTo: "",
};

const PREFERRED_COLUMNS = [
  "id",
  "spend_date",
  "platform",
  "account_id",
  "campaign_id",
  "campaign_name",
  "currency",
  "spend",
  "spend_ils",
  "clicks",
  "impressions",
  "real_leads",
  "cpl",
  "created_at",
  "updated_at",
];

const MONO_COLUMNS = new Set(["id", "spend", "spend_ils", "clicks", "impressions", "real_leads", "cpl"]);
const MONEY_COLUMNS = new Set(["spend", "spend_ils", "cpl"]);
const NUM_COLUMNS = new Set(["clicks", "impressions", "real_leads"]);
const DATE_ONLY_COLUMNS = new Set(["spend_date"]);
const DATE_TIME_COLUMNS = new Set(["created_at", "updated_at"]);

const COLUMN_LABELS = {
  id: "ID",
  spend_date: "Spend Date",
  platform: "Platform",
  account_id: "Account ID",
  campaign_id: "Campaign ID",
  campaign_name: "Campaign Name",
  currency: "Currency",
  spend: "Spend",
  spend_ils: "Spend ILS",
  clicks: "Clicks",
  impressions: "Impressions",
  real_leads: "Real Leads",
  cpl: "CPL",
  created_at: "Created At",
  updated_at: "Updated At",
};

const humanizeKey = (key) =>
  String(key)
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

/* ---------------- formatting helpers ---------------- */

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDateOnly = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtFixed2 = (n) => {
  if (n === null || n === undefined || n === "") return "0.00";
  const value = Number(n);
  return Number.isNaN(value) ? "0.00" : value.toFixed(2);
};

const fmtNum = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const value = Number(n);
  return Number.isNaN(value) ? "—" : value.toLocaleString("en-IN");
};

const formatCellValue = (value, key) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  if (DATE_ONLY_COLUMNS.has(key)) return fmtDateOnly(value);
  if (DATE_TIME_COLUMNS.has(key)) return fmtDate(value);
  if (MONEY_COLUMNS.has(key)) return fmtFixed2(value);
  if (NUM_COLUMNS.has(key)) return fmtNum(value);
  return String(value);
};

const platformStyle = (platform) => {
  const key = String(platform || "").toLowerCase();
  const map = {
    facebook: { background: "#eaf3ff", color: "#1d4ed8" },
    meta: { background: "#eaf3ff", color: "#1d4ed8" },
    google: { background: "#fef3e8", color: "#b45309" },
    tiktok: { background: "#f3f4f6", color: "#111827" },
    instagram: { background: "#fdf1f8", color: "#be185d" },
    linkedin: { background: "#eaf6ff", color: "#0369a1" },
    bing: { background: "#eef7ee", color: "#166534" },
  };
  return map[key] || { background: "#f3f4f6", color: "#374151" };
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

async function fetchCampaignReconciledCostAllocation(query) {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(parseInt(query.page, 10) || 1, 1)));
  params.set("limit", String(Math.max(parseInt(query.limit, 10) || 50, 1)));
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.spendDateFrom) params.set("spend_date_from", query.spendDateFrom);
  if (query.spendDateTo) params.set("spend_date_to", query.spendDateTo);

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

export default function CampaignReconciledCostAllocationPage() {
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
        const body = await fetchCampaignReconciledCostAllocation(query);
        if (cancelled) return;

        setRows(Array.isArray(body.data) ? body.data : []);
        const p = body.pagination || {};
        setPagination({
          total: Number(p.total || 0),
          page: Number(p.page || query.page || 1),
          totalPages: Number(p.total_pages || Math.ceil(Number(p.total || 0) / Number(p.limit || query.limit || 50)) || 1),
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

  const columns = useMemo(() => {
    if (!rows.length) return [];
    const rowKeys = Object.keys(rows[0]);
    return [...PREFERRED_COLUMNS.filter((k) => rowKeys.includes(k)), ...rowKeys.filter((k) => !PREFERRED_COLUMNS.includes(k))];
  }, [rows]);

  const pageItems = pagination ? buildPageItems(pagination.page, pagination.totalPages) : [];

  return (
    <DashboardLayout
      title="Campaign Reconciled Cost Allocation"
      subtitle="Filter and audit reconciled campaign-level cost allocation across platforms."
    >
      <Card title="Filters">
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", fontFamily: "Inter" }}>
          <Field label="Search">
            <input
              type="text"
              placeholder="campaign, account, platform"
              value={draft.search}
              onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Spend Date From">
            <input
              type="date"
              value={draft.spendDateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, spendDateFrom: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Spend Date To">
            <input
              type="date"
              value={draft.spendDateTo}
              onChange={(e) => setDraft((d) => ({ ...d, spendDateTo: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Limit">
            <select
              value={draft.limit}
              onChange={(e) => {
                const next = Number(e.target.value) || 50;
                setDraft((d) => ({ ...d, limit: next }));
                setQuery((q) => ({ ...q, limit: next, page: 1 }));
              }}
              style={inputStyle}
            >
              {[25, 50, 100, 200].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <button onClick={commitDraft} style={btnPrimaryStyle}>
            Apply
          </button>
          <button onClick={handleReset} style={btnStyle}>
            Reset
          </button>

          {pagination && (
            <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
              Total: {pagination.total.toLocaleString()} | Page: {pagination.page} / {pagination.totalPages}
            </div>
          )}
        </div>
      </Card>

      <Card title="Results">
        {loading ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280" }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#E15A5A" }}>Couldn't load data: {error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280", textAlign: "center" }}>No data found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter", fontSize: 12, minWidth: 1300 }}>
              <thead>
                <tr>
                  {columns.map((key) => (
                    <Th key={key}>{COLUMN_LABELS[key] || humanizeKey(key)}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const pStyle = platformStyle(row.platform);
                  return (
                    <tr key={row.id ?? i} style={{ borderTop: "1px solid #F0F2F8" }}>
                      {columns.map((key) => {
                        if (key === "platform") {
                          return (
                            <Td key={key}>
                              {row.platform ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "3px 10px",
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: "capitalize",
                                    ...pStyle,
                                  }}
                                >
                                  {row.platform}
                                </span>
                              ) : (
                                "—"
                              )}
                            </Td>
                          );
                        }
                        const cellValue = formatCellValue(row[key], key);
                        return (
                          <Td key={key} strong={key === "id"} color={MONEY_COLUMNS.has(key) ? "#065f46" : undefined}>
                            {MONO_COLUMNS.has(key) ? (
                              <span style={{ fontFamily: "Menlo, Monaco, Consolas, monospace" }}>{cellValue}</span>
                            ) : (
                              cellValue
                            )}
                          </Td>
                        );
                      })}
                    </tr>
                  );
                })}
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

            <span style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, padding: "0 6px" }}>
              {pagination.total.toLocaleString()} rows
            </span>

            {pageItems.map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, padding: "0 4px" }}>
                  …
                </span>
              ) : (
                <button key={item} onClick={() => goToPage(item)} style={pageBtnStyle(item === pagination.page, false)}>
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

/* ---------------- styles ---------------- */

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
  background: "#1D4ED8",
  borderColor: "#1D4ED8",
  color: "#fff",
};

const pageBtnStyle = (active, disabled) => ({
  border: "1px solid transparent",
  background: active ? "#1D4ED8" : "transparent",
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
