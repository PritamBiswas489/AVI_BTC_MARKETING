import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, Th, Td } from "../../components/ui";
import { API_URL } from "../../enviroment";

/* ---------------- constants ---------------- */

const ENDPOINT = "/api/ad-spending/track";

const DEFAULT_QUERY = {
  page: 1,
  limit: 50,
  search: "",
  platform: "",
  spendDateFrom: "",
  spendDateTo: "",
  accountId: "",
  campaignId: "",
  adsetId: "",
  adgroupId: "",
  adId: "",
  sourceType: "",
  sortBy: "spend_date",
  sortOrder: "DESC",
};

const SORTABLE_COLUMNS = ["id", "spend_date", "spend", "impressions", "clicks"];

const SORT_OPTIONS = ["spend_date", "spend", "impressions", "clicks", "created_at", "updated_at"];

const PLATFORM_OPTIONS = ["meta", "google", "tiktok", "instagram", "linkedin", "bing"];

/* ---------------- formatting helpers ---------------- */

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const v = (val) => (val === null || val === undefined || val === "" ? "—" : val);

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

const fmtMoney = (n, currency) => {
  if (n === null || n === undefined || n === "") return "—";
  const value = Number(n);
  if (Number.isNaN(value)) return "—";
  return `${currency || ""} ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim();
};

const fmtNum = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const value = Number(n);
  return Number.isNaN(value) ? "—" : value.toLocaleString("en-IN");
};

const fmtFixed2 = (n) => {
  if (n === null || n === undefined || n === "") return "0.00";
  const value = Number(n);
  return Number.isNaN(value) ? "0.00" : value.toFixed(2);
};

const fmtPct = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const value = Number(n);
  return Number.isNaN(value) ? "—" : `${value.toFixed(2)}%`;
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

const computeDerived = (row) => {
  const impressions = num(row.impressions);
  const clicks = num(row.clicks);
  const spend = num(row.spend);
  const conversions = num(row.platform_conversions);

  const ctr = row.ctr !== undefined && row.ctr !== null ? row.ctr : impressions ? (clicks / impressions) * 100 : null;
  const cpc = row.cpc !== undefined && row.cpc !== null ? row.cpc : clicks ? spend / clicks : null;
  const cpm = row.cpm !== undefined && row.cpm !== null ? row.cpm : impressions ? (spend / impressions) * 1000 : null;
  const costPerConversion =
    row.cost_per_conversion !== undefined && row.cost_per_conversion !== null
      ? row.cost_per_conversion
      : conversions
      ? spend / conversions
      : null;

  return { ctr, cpc, cpm, costPerConversion };
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

async function fetchAdSpendTrack(query) {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(parseInt(query.page, 10) || 1, 1)));
  params.set("limit", String(Math.max(parseInt(query.limit, 10) || 50, 1)));
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.platform) params.set("platform", query.platform);
  if (query.spendDateFrom) params.set("spend_date_from", query.spendDateFrom);
  if (query.spendDateTo) params.set("spend_date_to", query.spendDateTo);
  if (query.accountId.trim()) params.set("account_id", query.accountId.trim());
  if (query.campaignId.trim()) params.set("campaign_id", query.campaignId.trim());
  if (query.adsetId.trim()) params.set("adset_id", query.adsetId.trim());
  if (query.adgroupId.trim()) params.set("adgroup_id", query.adgroupId.trim());
  if (query.adId.trim()) params.set("ad_id", query.adId.trim());
  if (query.sourceType.trim()) params.set("source_type", query.sourceType.trim());
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

export default function AdSpendTrackingPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [draft, setDraft] = useState(DEFAULT_QUERY);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [modal, setModal] = useState(null); // { title, content }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const body = await fetchAdSpendTrack(query);
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

  const toggleSort = (key) => {
    setDraft((d) => ({
      ...d,
      sortBy: key,
      sortOrder: query.sortBy === key && query.sortOrder === "DESC" ? "ASC" : "DESC",
    }));
    setQuery((q) => ({
      ...q,
      page: 1,
      sortBy: key,
      sortOrder: q.sortBy === key && q.sortOrder === "DESC" ? "ASC" : "DESC",
    }));
  };

  const tableRows = useMemo(() => rows.map((r) => ({ ...r, ...computeDerived(r) })), [rows]);

  const pageItems = pagination ? buildPageItems(pagination.page, pagination.totalPages) : [];

  const openRawPayload = (row) => {
    const data = row.raw_payload;
    const isEmptyObj = typeof data === "object" && data !== null && !Array.isArray(data) && Object.keys(data).length === 0;
    const isEmptyArr = Array.isArray(data) && data.length === 0;
    if (data === null || data === undefined || isEmptyObj || isEmptyArr) return;
    let content;
    try {
      content = JSON.stringify(data, null, 2);
    } catch {
      content = String(data);
    }
    setModal({ title: `Raw Payload — Ad Spend #${row.id}`, content });
  };

  const copyModalContent = () => {
    if (!modal) return;
    navigator.clipboard
      .writeText(modal.content)
      .then(() => alert("Copied to clipboard."))
      .catch(() => alert("Could not copy automatically — please select and copy manually."));
  };

  return (
    <DashboardLayout title="Ad Spending Tracking" subtitle="Filter, sort, and audit daily ad spend by platform and campaign.">
      <Card title="Filters">
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", fontFamily: "Inter" }}>
          <Field label="Search">
            <input
              type="text"
              placeholder="Search…"
              value={draft.search}
              onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Platform">
            <select
              value={draft.platform}
              onChange={(e) => setDraft((d) => ({ ...d, platform: e.target.value }))}
              style={inputStyle}
            >
              <option value="">ALL</option>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Spend From">
            <input
              type="date"
              value={draft.spendDateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, spendDateFrom: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Spend To">
            <input
              type="date"
              value={draft.spendDateTo}
              onChange={(e) => setDraft((d) => ({ ...d, spendDateTo: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Limit">
            <input
              type="number"
              min={1}
              value={draft.limit}
              onChange={(e) => setDraft((d) => ({ ...d, limit: Number(e.target.value) || 50 }))}
              onKeyDown={handleEnterKey}
              style={{ ...inputStyle, minWidth: 80 }}
            />
          </Field>

          <button onClick={commitDraft} style={btnPrimaryStyle}>
            Search
          </button>
          <button onClick={handleReset} style={btnStyle}>
            Clear
          </button>
          <button onClick={() => setShowMoreFilters((s) => !s)} style={moreFiltersBtnStyle}>
            {showMoreFilters ? "− Fewer Filters" : "+ More Filters"}
          </button>

          {pagination && (
            <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
              Total: {pagination.total.toLocaleString()} | Page: {pagination.page} / {pagination.totalPages}
            </div>
          )}

          {showMoreFilters && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end", width: "100%", paddingTop: 10, borderTop: "1px dashed #e5e7eb" }}>
              <GroupLabel first>Model Identifiers</GroupLabel>

              <Field label="Account ID">
                <input
                  type="text"
                  placeholder="act_123456"
                  value={draft.accountId}
                  onChange={(e) => setDraft((d) => ({ ...d, accountId: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  style={inputStyle}
                />
              </Field>
              <Field label="Campaign ID">
                <input
                  type="text"
                  placeholder="Campaign ID"
                  value={draft.campaignId}
                  onChange={(e) => setDraft((d) => ({ ...d, campaignId: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  style={inputStyle}
                />
              </Field>
              <Field label="Adset ID">
                <input
                  type="text"
                  placeholder="Adset ID"
                  value={draft.adsetId}
                  onChange={(e) => setDraft((d) => ({ ...d, adsetId: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  style={inputStyle}
                />
              </Field>
              <Field label="Adgroup ID">
                <input
                  type="text"
                  placeholder="Adgroup ID"
                  value={draft.adgroupId}
                  onChange={(e) => setDraft((d) => ({ ...d, adgroupId: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  style={inputStyle}
                />
              </Field>
              <Field label="Ad ID">
                <input
                  type="text"
                  placeholder="Ad ID"
                  value={draft.adId}
                  onChange={(e) => setDraft((d) => ({ ...d, adId: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  style={inputStyle}
                />
              </Field>
              <Field label="Source Type">
                <input
                  type="text"
                  placeholder="e.g. api_sync"
                  value={draft.sourceType}
                  onChange={(e) => setDraft((d) => ({ ...d, sourceType: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  style={inputStyle}
                />
              </Field>

              <GroupLabel>Sorting</GroupLabel>

              <Field label="Sort By">
                <select
                  value={draft.sortBy}
                  onChange={(e) => setDraft((d) => ({ ...d, sortBy: e.target.value }))}
                  style={inputStyle}
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Sort Order">
                <select
                  value={draft.sortOrder}
                  onChange={(e) => setDraft((d) => ({ ...d, sortOrder: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="DESC">DESC</option>
                  <option value="ASC">ASC</option>
                </select>
              </Field>
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
          <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280", textAlign: "center" }}>No ad spend records found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter", fontSize: 12, minWidth: 2600 }}>
              <thead>
                <tr>
                  <SortableTh label="ID" sortKey="id" query={query} onSort={toggleSort} />
                  <SortableTh label="Spend Date" sortKey="spend_date" query={query} onSort={toggleSort} />
                  <Th>Platform</Th>
                  <Th>Account ID</Th>
                  <Th>Campaign ID</Th>
                  <Th>Adset ID</Th>
                  <Th>Adgroup ID</Th>
                  <Th>Ad ID</Th>
                  <Th>Source Type</Th>
                  <SortableTh label="Spend THB" sortKey="spend" query={query} onSort={toggleSort} />
                  <Th>Spend ILS</Th>
                  <Th>Currency Rate</Th>
                  <SortableTh label="Impressions" sortKey="impressions" query={query} onSort={toggleSort} />
                  <SortableTh label="Clicks" sortKey="clicks" query={query} onSort={toggleSort} />
                  <Th>CTR</Th>
                  <Th>CPC</Th>
                  <Th>CPM</Th>
                  <Th>Conversions</Th>
                  <Th>Cost / Conv.</Th>
                  <Th>Raw Data</Th>
                  <Th>Updated At</Th>
                  <Th>Created At</Th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => {
                  const pStyle = platformStyle(row.platform);
                  const hasRaw = (() => {
                    const data = row.raw_payload;
                    const isEmptyObj = typeof data === "object" && data !== null && !Array.isArray(data) && Object.keys(data).length === 0;
                    const isEmptyArr = Array.isArray(data) && data.length === 0;
                    return !(data === null || data === undefined || isEmptyObj || isEmptyArr);
                  })();

                  return (
                    <tr key={row.id ?? i} style={{ borderTop: "1px solid #F0F2F8" }}>
                      <Td strong>{v(row.id)}</Td>
                      <Td>{fmtDateOnly(row.spend_date)}</Td>
                      <Td>
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
                      <Td>{v(row.account_id)}</Td>
                      <Td title={row.campaign_name || ""}>{v(row.campaign_id)}</Td>
                      <Td>{v(row.adset_id)}</Td>
                      <Td>{v(row.adgroup_id)}</Td>
                      <Td>{v(row.ad_id)}</Td>
                      <Td>
                        {row.source_type ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 600,
                              background: "#f3ecff",
                              color: "#6d28d9",
                            }}
                          >
                            {row.source_type}
                          </span>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td color="#065f46" strong>
                        {fmtFixed2(row.spend)}
                      </Td>
                      <Td color="#065f46" strong>
                        {fmtFixed2(row.spend_ils)}
                      </Td>
                      <Td>{v(row.currency_rate)}</Td>
                      <Td>{fmtNum(row.impressions)}</Td>
                      <Td>{fmtNum(row.clicks)}</Td>
                      <Td>{fmtPct(row.ctr)}</Td>
                      <Td>
                        {fmtFixed2(row.cpc)} {row.currency}
                      </Td>
                      <Td>
                        {fmtFixed2(row.cpm)} {row.currency}
                      </Td>
                      <Td>{fmtNum(row.platform_conversions)}</Td>
                      <Td>{fmtMoney(row.costPerConversion, row.currency)}</Td>
                      <Td>
                        {hasRaw ? (
                          <button onClick={() => openRawPayload(row)} style={jsonBtnStyle}>
                            {"{ }"} View
                          </button>
                        ) : (
                          <span style={jsonBtnMutedStyle}>— View</span>
                        )}
                      </Td>
                      <Td>{fmtDate(row.updated_at)}</Td>
                      <Td>{fmtDate(row.created_at)}</Td>
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

      {modal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.30)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              width: 640,
              maxWidth: "92vw",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(15,23,42,.25)",
              overflow: "hidden",
              fontFamily: "Inter",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid #e5e7eb",
                background: "#f8fafc",
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{modal.title}</h3>
              <button
                onClick={() => setModal(null)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "16px 18px", overflow: "auto" }}>
              <pre style={{ fontFamily: "Consolas, Menlo, monospace", fontSize: 12, color: "#1f2937", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {modal.content}
              </pre>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                padding: "12px 18px",
                borderTop: "1px solid #e5e7eb",
                background: "#f8fafc",
              }}
            >
              <button onClick={copyModalContent} style={jsonBtnStyle}>
                📋 Copy
              </button>
              <button onClick={() => setModal(null)} style={jsonBtnStyle}>
                Close
              </button>
            </div>
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

function GroupLabel({ children, first }) {
  return (
    <div
      style={{
        width: "100%",
        fontSize: 10,
        fontWeight: 800,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginTop: first ? 0 : 6,
        borderTop: first ? "none" : "1px dashed #e5e7eb",
        paddingTop: first ? 0 : 8,
      }}
    >
      {children}
    </div>
  );
}

function SortableTh({ label, sortKey, query, onSort }) {
  const active = query.sortBy === sortKey;
  return (
    <Th>
      <span onClick={() => onSort(sortKey)} style={{ cursor: "pointer", userSelect: "none" }}>
        {label}
        <span style={{ marginLeft: 4, fontSize: 10, color: active ? "#1d4ed8" : "#9ca3af" }}>
          {active ? (query.sortOrder === "ASC" ? "↑" : "↓") : "↕"}
        </span>
      </span>
    </Th>
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

const moreFiltersBtnStyle = {
  height: 34,
  background: "#eef2ff",
  color: "#1e40af",
  border: "1px solid #c7d2fe",
  padding: "0 14px",
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "Inter",
};

const jsonBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#fff",
  color: "#1f2937",
  border: "1px solid #d1d5db",
  padding: "3px 10px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontFamily: "Inter",
};

const jsonBtnMutedStyle = {
  ...jsonBtnStyle,
  background: "#f3f4f6",
  borderColor: "#e5e7eb",
  color: "#9ca3af",
  cursor: "default",
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
