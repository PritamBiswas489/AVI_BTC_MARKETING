import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, Th, Td } from "../../components/ui";
import { API_URL } from "../../enviroment";

/* ---------------- constants ---------------- */

const ENDPOINT = "/api/it-tracking/leads";

const DEFAULT_FILTERS = {
  leadId: "",
  customerPhone: "",
  customerEmail: "",
  utmSource: "",
  fromDate: "",
  toDate: "",
  visitorId: "",
  sessionId: "",
  utmCampaign: "",
  campaignId: "",
  adId: "",
  gclid: "",
  fbclid: "",
  intakeLeadId: "",
  intakePhone: "",
  intakeEmail: "",
  intakeVisitorId: "",
  intakeSessionId: "",
  intakeStatus: "",
  intakeFromDate: "",
  intakeToDate: "",
  ticketTicketId: "",
  ticketStatus: "",
};

const DEFAULT_QUERY = {
  ...DEFAULT_FILTERS,
  page: 1,
  limit: 20,
};

/* draft key -> API filter param */
const FILTER_PARAM_MAP = {
  leadId: "lead_id",
  customerPhone: "customer_phone",
  customerEmail: "customer_email",
  utmSource: "utm_source",
  fromDate: "fromDate",
  toDate: "toDate",
  visitorId: "visitor_id",
  sessionId: "session_id",
  utmCampaign: "utm_campaign",
  campaignId: "campaign_id",
  adId: "ad_id",
  gclid: "gclid",
  fbclid: "fbclid",
  intakeLeadId: "intake_lead_id",
  intakePhone: "intake_customer_phone_normalized",
  intakeEmail: "intake_customer_email",
  intakeVisitorId: "intake_visitor_id",
  intakeSessionId: "intake_session_id",
  intakeStatus: "intake_status",
  intakeFromDate: "intake_fromDate",
  intakeToDate: "intake_toDate",
  ticketTicketId: "ticket_ticket_id",
  ticketStatus: "ticket_status",
};

/* column definitions, in display order. `field` is used by the "touch" type
   to reach into raw_payload.tracking.attribution.current_touch */
const COLUMNS = [
  { key: "id", label: "ID", sticky: true, width: 80 },
  { key: "raw_payload", label: "Raw Payload", type: "json", width: 102 },
  { key: "ticketLeads", label: "Ticket Leads", type: "ticketLeads", width: 190 },
  { key: "sellPrice", label: "Sell Price", type: "ticketMoney", field: "sellPrice", currencyField: "sellCurrency", width: 145 },
  { key: "profitPrice", label: "Profit Price", type: "ticketMoney", field: "profitPrice", currencyField: "profitCurrency", width: 145 },
  { key: "lead_id", label: "Lead ID", width: 290 },
  { key: "lead_status_auto", label: "Status", type: "status", width: 120 },
  { key: "channel", label: "Channel", type: "channel", width: 90 },
  { key: "source_site", label: "Source Site", width: 160 },
  { key: "business_unit", label: "Business Unit", width: 110 },
  { key: "form", label: "Form", type: "form", width: 170 },
  { key: "source_url", label: "Source URL", type: "link", width: 190 },
  { key: "customer_name", label: "Customer Name", width: 150 },
  { key: "customer_phone", label: "Phone", width: 140 },
  { key: "customer_email", label: "Email", width: 190 },
  { key: "customer_message", label: "Message", width: 240 },
  { key: "visitor_id", label: "Visitor ID", width: 170 },
  { key: "session_id", label: "Session ID", width: 170 },
  { key: "utm_source", label: "UTM Source", width: 110 },
  { key: "utm_medium", label: "UTM Medium", width: 110 },
  { key: "utm_campaign", label: "UTM Campaign", width: 130 },
  { key: "utm_content", label: "UTM Content", width: 130 },
  { key: "utm_term", label: "UTM Term", width: 110 },
  { key: "utm_id", label: "UTM ID", width: 90 },
  { key: "campaign_id", label: "Campaign ID", width: 150 },
  { key: "adset_id", label: "Adset ID", width: 150 },
  { key: "adgroup_id", label: "Adgroup ID", width: 150 },
  { key: "ad_id", label: "Ad ID", width: 130 },
  { key: "creative_id", label: "Creative ID", width: 130 },
  { key: "placement", label: "Placement", width: 130 },
  { key: "keyword_value", label: "Keyword", width: 170 },
  { key: "matchtype", label: "Match Type", width: 100 },
  { key: "device", label: "Device", width: 90 },
  { key: "network", label: "Network", width: 90 },
  { key: "gclid", label: "GCLID", width: 130 },
  { key: "gbraid", label: "GBRAID", width: 130 },
  { key: "wbraid", label: "WBRAID", width: 130 },
  { key: "fbclid", label: "FBCLID", width: 130 },
  { key: "ttclid", label: "TTCLID", width: 130 },
  { key: "msclkid", label: "MSCLKID", width: 130 },
  { key: "lead_source_type", label: "Source Type", width: 110 },
  { key: "source_confidence", label: "Confidence", width: 110 },
  { key: "is_paid_marketing", label: "Paid?", type: "flag", width: 90 },
  { key: "is_returning_customer", label: "Returning?", type: "flag", width: 100 },
  { key: "device_type", label: "Device Type", type: "touch", field: "device_type", width: 140 },
  { key: "language", label: "Browser Language", type: "touch", field: "language", width: 140 },
  { key: "timezone", label: "Timezone", type: "touch", field: "timezone", width: 340 },
  { key: "user_agent", label: "User Agent", type: "touch", field: "user_agent", tooltip: true, width: 100 },
  { key: "screen_width", label: "Screen W", type: "touch", field: "screen_width", width: 100 },
  { key: "screen_height", label: "Screen H", type: "touch", field: "screen_height", width: 100 },
  { key: "viewport_width", label: "Viewport W", type: "touch", field: "viewport_width", width: 100 },
  { key: "viewport_height", label: "Viewport H", type: "touch", field: "viewport_height", width: 90 },
  { key: "first_touch", label: "First Touch", type: "json", width: 90 },
  { key: "last_touch", label: "Last Touch", type: "json", width: 90 },
  { key: "current_touch", label: "Current Touch", type: "json", width: 90 },
  { key: "attribution", label: "Attribution", type: "json", width: 90 },
  { key: "intakeEvents", label: "Intake Events", type: "json", width: 100 },
  { key: "updated_at", label: "Updated At", type: "date", width: 160 },
  { key: "created_at", label: "Created At", type: "date", width: 160 },
];

/* ---------------- formatting helpers ---------------- */

const v = (val) => (val === null || val === undefined || val === "" ? "—" : String(val));

const truncate = (str, n) => (!str ? "" : str.length > n ? `${str.slice(0, n)}…` : str);

const fmtMoney = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const safeString = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

const isEmptyJson = (data) => {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object") return Object.keys(data).length === 0;
  return false;
};

const statusClass = (status) => {
  if (!status) return { background: "#F3F4F6", color: "#374151" };
  const key = String(status).toLowerCase();
  if (key === "lead_received") return { background: "#EAF3FF", color: "#1D4ED8" };
  if (key === "received") return { background: "#E8F7ED", color: "#166534" };
  if (key === "failed") return { background: "#FEECEB", color: "#B91C1C" };
  return { background: "#F3F4F6", color: "#374151" };
};

const ticketStatusInfo = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "sell") return { label: "Sale", background: "#DCFCE7", color: "#166534", border: "#86EFAC" };
  if (key === "nosell") return { label: "No sell", background: "#FFE4E6", color: "#B91C1C", border: "#FDA4AF" };
  if (key === "processing") return { label: "Processing", background: "#DBEAFE", color: "#1D4ED8", border: "#93C5FD" };
  return null;
};

const currentTouch = (row) =>
  row?.raw_payload?.tracking?.attribution?.current_touch || {};

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

async function fetchLeads(query) {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(parseInt(query.page, 10) || 1, 1)));
  params.set("limit", String(Math.max(parseInt(query.limit, 10) || 20, 1)));

  Object.entries(FILTER_PARAM_MAP).forEach(([queryKey, paramKey]) => {
    const val = query[queryKey];
    if (val && String(val).trim()) params.set(paramKey, String(val).trim());
  });

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

export default function TrackingLeadsPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { title, content }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const body = await fetchLeads(query);
        if (cancelled) return;

        setRows(Array.isArray(body.data) ? body.data : []);
        const p = body.pagination || {};
        setPagination({
          total: Number(p.total ?? (Array.isArray(body.data) ? body.data.length : 0)),
          page: Number(p.page || query.page || 1),
          limit: Number(p.limit || query.limit || 20),
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

  const handleClear = () => {
    setDraft(DEFAULT_FILTERS);
    setQuery(DEFAULT_QUERY);
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") commitDraft();
  };

  const goToPage = (page) => {
    setQuery((q) => ({ ...q, page: Math.max(parseInt(page, 10) || 1, 1) }));
  };

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const pageItems = pagination ? buildPageItems(pagination.page, totalPages) : [];

  const openModal = (title, data) => setModal({ title, content: safeString(data) });
  const closeModal = () => setModal(null);
  const copyModalContent = () => {
    if (!modal) return;
    navigator.clipboard
      .writeText(modal.content)
      .then(() => alert("Copied to clipboard."))
      .catch(() => alert("Could not copy automatically — please select and copy manually."));
  };

  const jsonCell = (label, data, title) => {
    if (isEmptyJson(data)) {
      return <span style={jsonMutedStyle}>— {label}</span>;
    }
    const count = Array.isArray(data) ? data.length : null;
    return (
      <button onClick={() => openModal(title, data)} style={jsonBtnStyle}>
        {"{ }"} {label}
        {count !== null && <span style={countPillStyle}>{count}</span>}
      </button>
    );
  };

  const renderCell = (col, row) => {
    switch (col.type) {
      case "json":
        return jsonCell("View", row[col.key], `${col.label} — Lead #${row.id}`);

      case "ticketLeads": {
        const tickets = row.ticketLeads || null;
        const loopData = tickets
          ? tickets.map((t) => ({
              phoneNumber: t?.phoneNumber,
              status: t.status,
              created_at: t.created_at,
              updated_at: t.updated_at,
              sellData: t?.sellData ? JSON.parse(t.sellData) : null,
            }))
          : null;
        const info = ticketStatusInfo(tickets?.[0]?.status);
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: "100%" }}>
            {info && (
              <span
                style={{
                  ...ticketStatusBadgeStyle,
                  background: info.background,
                  color: info.color,
                  borderColor: info.border,
                }}
              >
                {info.label}
              </span>
            )}
            {jsonCell("View", loopData, `Ticket Leads — Lead #${row.id}`)}
          </span>
        );
      }

      case "ticketMoney": {
        const price = row.ticketLeads?.[0]?.[col.field];
        const currency = row.ticketLeads?.[0]?.[col.currencyField];
        return (
          <span style={moneyCellStyle}>
            <span style={moneyValueStyle}>{fmtMoney(price)}</span>
            <span style={moneyCurrencyStyle}>{currency || ""}</span>
          </span>
        );
      }

      case "status": {
        const status = row[col.key];
        if (!status) return "—";
        return <span style={{ ...statusBadgeStyle, ...statusClass(status) }}>{String(status).replace(/_/g, " ")}</span>;
      }

      case "channel":
        return row[col.key] ? <span style={channelBadgeStyle}>{v(row[col.key])}</span> : "—";

      case "form":
        return <span title={row.form_id || ""}>{v(row.form_name || row.form_id)}</span>;

      case "flag":
        return (
          <span style={{ ...flagPillStyle, ...(row[col.key] ? flagTrueStyle : flagFalseStyle) }}>
            {row[col.key] ? "YES" : "NO"}
          </span>
        );

      case "touch": {
        const ct = currentTouch(row);
        const val = ct[col.field];
        if (col.tooltip) {
          return <span title={val || ""} style={{ display: "block" }}>{v(val)}</span>;
        }
        return v(val);
      }

      case "date":
        return <span style={{ color: "#4B5563" }}>{fmtDate(row[col.key])}</span>;

      case "link": {
        const url = row[col.key];
        if (!url) return "—";
        try {
          // eslint-disable-next-line no-new
          new URL(url);
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" title={url} style={linkBtnStyle}>
              🔗 {truncate(url, 56)}
            </a>
          );
        } catch {
          return <span>{url}</span>;
        }
      }

      default:
        return v(row[col.key]);
    }
  };

  return (
    <DashboardLayout title="🧲 LT Tracking Leads" subtitle="Inspect leads, attribution, intake events, and ticket outcomes.">
      <Card title="Filters">
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", fontFamily: "Inter" }}>
          <Field label="Lead ID">
            <input
              type="text"
              placeholder="lead UUID"
              value={draft.leadId}
              onChange={(e) => setDraft((d) => ({ ...d, leadId: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Customer Phone">
            <input
              type="text"
              placeholder="phone number"
              value={draft.customerPhone}
              onChange={(e) => setDraft((d) => ({ ...d, customerPhone: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Customer Email">
            <input
              type="text"
              placeholder="name@example.com"
              value={draft.customerEmail}
              onChange={(e) => setDraft((d) => ({ ...d, customerEmail: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="UTM Source">
            <input
              type="text"
              placeholder="google"
              value={draft.utmSource}
              onChange={(e) => setDraft((d) => ({ ...d, utmSource: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="From Date">
            <input
              type="datetime-local"
              value={draft.fromDate}
              onChange={(e) => setDraft((d) => ({ ...d, fromDate: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="To Date">
            <input
              type="datetime-local"
              value={draft.toDate}
              onChange={(e) => setDraft((d) => ({ ...d, toDate: e.target.value }))}
              onKeyDown={handleEnterKey}
              style={inputStyle}
            />
          </Field>

          <Field label="Limit">
            <input
              type="number"
              min={1}
              max={100}
              value={query.limit}
              onChange={(e) => setQuery((q) => ({ ...q, page: 1, limit: Number(e.target.value) || 20 }))}
              style={{ ...inputStyle, minWidth: 80 }}
            />
          </Field>

          <button onClick={() => setShowMoreFilters((s) => !s)} style={moreFiltersBtnStyle}>
            {showMoreFilters ? "− Fewer Filters" : "+ More Filters"}
          </button>

          <button onClick={commitDraft} style={btnPrimaryStyle}>Search</button>
          <button onClick={handleClear} style={btnStyle}>Clear</button>

          {pagination && (
            <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
              Total: {pagination.total.toLocaleString()}
            </div>
          )}

          {showMoreFilters && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%", paddingTop: 4 }}>
              <GroupLabel first>Lead Attribution</GroupLabel>
              <Field label="Visitor ID">
                <input type="text" placeholder="vis_xxxxxxxx" value={draft.visitorId} onChange={(e) => setDraft((d) => ({ ...d, visitorId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Session ID">
                <input type="text" placeholder="sess_xxxxxxxx" value={draft.sessionId} onChange={(e) => setDraft((d) => ({ ...d, sessionId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="UTM Campaign">
                <input type="text" placeholder="summer_sale" value={draft.utmCampaign} onChange={(e) => setDraft((d) => ({ ...d, utmCampaign: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Campaign ID">
                <input type="text" placeholder="CMP-2026-0042" value={draft.campaignId} onChange={(e) => setDraft((d) => ({ ...d, campaignId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Ad ID">
                <input type="text" placeholder="AD-55291" value={draft.adId} onChange={(e) => setDraft((d) => ({ ...d, adId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Google Click ID">
                <input type="text" placeholder="gclid" value={draft.gclid} onChange={(e) => setDraft((d) => ({ ...d, gclid: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Facebook Click ID">
                <input type="text" placeholder="fbclid" value={draft.fbclid} onChange={(e) => setDraft((d) => ({ ...d, fbclid: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>

              <GroupLabel>Intake Events</GroupLabel>
              <Field label="Intake Lead ID">
                <input type="text" placeholder="lead UUID" value={draft.intakeLeadId} onChange={(e) => setDraft((d) => ({ ...d, intakeLeadId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Intake Phone">
                <input type="text" placeholder="normalized phone" value={draft.intakePhone} onChange={(e) => setDraft((d) => ({ ...d, intakePhone: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Intake Email">
                <input type="text" placeholder="name@example.com" value={draft.intakeEmail} onChange={(e) => setDraft((d) => ({ ...d, intakeEmail: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Intake Visitor ID">
                <input type="text" placeholder="vis_xxxxxxxx" value={draft.intakeVisitorId} onChange={(e) => setDraft((d) => ({ ...d, intakeVisitorId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Intake Session ID">
                <input type="text" placeholder="sess_xxxxxxxx" value={draft.intakeSessionId} onChange={(e) => setDraft((d) => ({ ...d, intakeSessionId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Intake Status">
                <select value={draft.intakeStatus} onChange={(e) => setDraft((d) => ({ ...d, intakeStatus: e.target.value }))} style={inputStyle}>
                  <option value="">ALL</option>
                  <option value="received">received</option>
                  <option value="failed">failed</option>
                </select>
              </Field>
              <Field label="Intake From Date">
                <input type="datetime-local" value={draft.intakeFromDate} onChange={(e) => setDraft((d) => ({ ...d, intakeFromDate: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Intake To Date">
                <input type="datetime-local" value={draft.intakeToDate} onChange={(e) => setDraft((d) => ({ ...d, intakeToDate: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>

              <GroupLabel>Ticket Mappings</GroupLabel>
              <Field label="Ticket ID">
                <input type="text" placeholder="TKT-20002" value={draft.ticketTicketId} onChange={(e) => setDraft((d) => ({ ...d, ticketTicketId: e.target.value }))} onKeyDown={handleEnterKey} style={inputStyle} />
              </Field>
              <Field label="Ticket Status">
                <select value={draft.ticketStatus} onChange={(e) => setDraft((d) => ({ ...d, ticketStatus: e.target.value }))} style={inputStyle}>
                  <option value="">ALL</option>
                  <option value="sell">sell</option>
                  <option value="nosell">nosell</option>
                  <option value="processing">processing</option>
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
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, fontFamily: "Inter", color: "#6B7280", textAlign: "center" }}>No leads found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter", fontSize: 12, minWidth: 7620, tableLayout: "fixed" }}>
              <colgroup>
                {COLUMNS.map((col) => (
                  <col key={col.key} style={{ width: col.width }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <Th key={col.key}>{col.label}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id ?? i} style={{ borderTop: "1px solid #F0F2F8" }}>
                    {COLUMNS.map((col) => (
                      <Td key={col.key}>
                        <div style={gridCellContentStyle}>{renderCell(col, row)}</div>
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div style={pagerWrapStyle}>
            <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1} style={pageBtnStyle(false, pagination.page <= 1)}>
              Prev
            </button>

            {pageItems.map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, padding: "0 4px" }}>…</span>
              ) : (
                <button key={item} onClick={() => goToPage(item)} style={pageBtnStyle(item === pagination.page, false)}>
                  {item}
                </button>
              )
            )}

            <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= totalPages} style={pageBtnStyle(false, pagination.page >= totalPages)}>
              Next
            </button>

            <span style={{ fontSize: 12, color: "#6B7280", paddingLeft: 8, whiteSpace: "nowrap" }}>
              Page {pagination.page} of {totalPages} | {pagination.total.toLocaleString()} records
            </span>
          </div>
        </div>
      )}

      {modal && (
        <div onClick={(e) => e.target === e.currentTarget && closeModal()} style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{modal.title}</h3>
              <button onClick={closeModal} style={modalCloseStyle}>✕</button>
            </div>
            <div style={{ padding: "16px 18px", overflow: "auto" }}>
              <pre style={modalPreStyle}>{modal.content}</pre>
            </div>
            <div style={modalFooterStyle}>
              <button onClick={copyModalContent} style={jsonBtnStyle}>📋 Copy</button>
              <button onClick={closeModal} style={jsonBtnStyle}>Close</button>
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
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginTop: first ? 0 : 6,
        borderTop: first ? "none" : "1px dashed #E5E7EB",
        paddingTop: first ? 0 : 8,
      }}
    >
      {children}
    </div>
  );
}

const inputStyle = {
  height: 34,
  padding: "6px 10px",
  border: "1px solid #D1D5DB",
  borderRadius: 6,
  minWidth: 130,
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
  alignSelf: "end",
  background: "#EEF2FF",
  color: "#1E40AF",
  border: "1px solid #C7D2FE",
  padding: "0 14px",
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "Inter",
};

const pagerWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 999,
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
  fontFamily: "Inter",
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

const statusBadgeStyle = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const channelBadgeStyle = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  background: "#F3ECFF",
  color: "#6D28D9",
};

const flagPillStyle = {
  display: "inline-block",
  padding: "1px 8px",
  borderRadius: 10,
  fontSize: 10,
  fontWeight: 700,
  marginRight: 3,
};
const flagTrueStyle = { background: "#E8F7ED", color: "#166534" };
const flagFalseStyle = { background: "#F3F4F6", color: "#9CA3AF" };

const ticketStatusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.2,
  border: "1px solid",
  lineHeight: 1,
};

const countPillStyle = {
  display: "inline-block",
  background: "#EEF2FF",
  color: "#1E40AF",
  borderRadius: 10,
  padding: "1px 7px",
  fontSize: 10,
  fontWeight: 700,
  marginLeft: 4,
};

const linkBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  maxWidth: "100%",
  padding: "4px 10px",
  border: "1px solid #BFDBFE",
  borderRadius: 999,
  background: "#EFF6FF",
  color: "#1D4ED8",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const jsonBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#fff",
  color: "#1F2937",
  border: "1px solid #D1D5DB",
  padding: "3px 10px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const gridCellContentStyle = {
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const moneyCellStyle = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: 6,
  whiteSpace: "nowrap",
};

const moneyValueStyle = {
  fontWeight: 700,
  color: "#111827",
  letterSpacing: 0.1,
};

const moneyCurrencyStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7280",
};

const jsonMutedStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#F3F4F6",
  color: "#9CA3AF",
  border: "1px solid #E5E7EB",
  padding: "3px 10px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.30)",
  zIndex: 9000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBoxStyle = {
  background: "#fff",
  borderRadius: 10,
  width: 640,
  maxWidth: "92vw",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
  overflow: "hidden",
  fontFamily: "Inter",
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 18px",
  borderBottom: "1px solid #E5E7EB",
  background: "#F8FAFC",
};

const modalCloseStyle = {
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  color: "#6B7280",
  lineHeight: 1,
};

const modalPreStyle = {
  background: "#0B1220",
  color: "#D1F7E0",
  padding: 14,
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
};

const modalFooterStyle = {
  padding: "10px 18px",
  borderTop: "1px solid #E5E7EB",
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  background: "#F8FAFC",
};
