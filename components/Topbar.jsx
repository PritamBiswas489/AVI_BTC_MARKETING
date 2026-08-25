import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Bell, Check } from "lucide-react";
import { useRouter } from "next/router";

import { useFilters } from "../context/FilterContext";

/* ============================================================
   date helpers
============================================================ */
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["S","M","T","W","T","F","S"];

function fmt(date) {
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const PRESETS = [
  { label: "Today", range: () => { const t = new Date(); return { start: t, end: t }; } },
  { label: "Last 7 days", range: () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 6); return { start, end }; } },
  { label: "Last 30 days", range: () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29); return { start, end }; } },
  { label: "This month", range: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth(), 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: "Last month", range: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth() - 1, 1), end: new Date(n.getFullYear(), n.getMonth(), 0) }; } },
];

const HIDE_TOPBAR_FILTERS_PATHS = new Set([
  "/dashboard/ad-level-cost-allocation",
  "/dashboard/ad-spend-tracking",
  "/dashboard/campaign-reconciled-cost-allocation",
  "/dashboard/it-tracking-leads",
  "/dashboard/lead-profit-summary",
]);

/* ============================================================
   DateRangePicker.jsx  (drop into its own file)
============================================================ */
export function DateRangePicker() {
  const { dateRange, setDateRange } = useFilters();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(dateRange);
  const [selecting, setSelecting] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [viewMonth, setViewMonth] = useState(dateRange.start.getMonth());
  const [viewYear, setViewYear] = useState(dateRange.start.getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openPicker() {
    setDraft(dateRange);
    setViewMonth(dateRange.start.getMonth());
    setViewYear(dateRange.start.getFullYear());
    setSelecting(false);
    setOpen((o) => !o);
  }

  function pickDay(day) {
    if (!day) return;
    if (!selecting) {
      setDraft({ start: day, end: day });
      setSelecting(true);
    } else {
      if (day < draft.start) setDraft({ start: day, end: draft.start });
      else setDraft({ start: draft.start, end: day });
      setSelecting(false);
    }
  }

  function applyPreset(p) {
    const r = p.range();
    setDraft(r);
    setSelecting(false);
    setViewMonth(r.start.getMonth());
    setViewYear(r.start.getFullYear());
  }

  function apply() {
    setDateRange(draft);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1);
  }

  const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const rightYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const previewEnd = selecting && hoverDate ? (hoverDate < draft.start ? draft.start : hoverDate) : draft.end;

  function inRange(day) {
    if (!day) return false;
    return day >= draft.start && day <= previewEnd;
  }
  function isEdge(day) {
    if (!day) return null;
    if (sameDay(day, draft.start)) return "start";
    if (sameDay(day, previewEnd)) return "end";
    return null;
  }

  function renderMonth(year, month) {
    const cells = buildMonth(year, month);
    return (
      <div style={{ width: 220 }}>
        <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 13, color: "#0F1424", marginBottom: 10 }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontFamily: "Inter", fontSize: 10.5, color: "#9AA3C2", fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {cells.map((day, i) => {
            const edge = isEdge(day);
            const within = inRange(day);
            return (
              <button
                key={i}
                disabled={!day}
                onClick={() => pickDay(day)}
                onMouseEnter={() => day && setHoverDate(day)}
                style={{
                  height: 28,
                  borderRadius: 8,
                  border: "none",
                  cursor: day ? "pointer" : "default",
                  background: edge ? "#2F6FED" : within ? "#EAF1FE" : "transparent",
                  color: edge ? "#fff" : day ? "#3A4160" : "transparent",
                  fontFamily: "Inter",
                  fontSize: 12,
                  fontWeight: edge ? 700 : 500,
                }}
              >
                {day ? day.getDate() : ""}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={openPicker}
        style={{ display: "flex", alignItems: "center", gap: 6, border: open ? "1px solid #2F6FED" : "1px solid #E7EAF3", borderRadius: 10, padding: "8px 12px", fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#4A5170", cursor: "pointer", userSelect: "none" }}
      >
        <Calendar size={14} color="#2F6FED" />
        {fmt(dateRange.start)} – {fmt(dateRange.end)}
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>

      {open && (
        <div
          onMouseLeave={() => setHoverDate(null)}
          style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #E7EAF3", borderRadius: 14, boxShadow: "0 12px 32px rgba(15,20,36,0.12)", padding: 16, display: "flex", gap: 16, zIndex: 50 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingRight: 14, borderRight: "1px solid #EEF1F8", minWidth: 120 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                style={{ textAlign: "left", background: "transparent", border: "none", borderRadius: 8, padding: "7px 8px", fontFamily: "Inter", fontSize: 12.5, color: "#4A5170", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={prevMonth} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex" }}>
                <ChevronLeft size={16} color="#8A93B0" />
              </button>
              <div style={{ display: "flex", gap: 10, fontFamily: "Inter", fontSize: 11.5, color: "#8A93B0" }}>
                <span style={{ color: "#2F6FED", fontWeight: 700 }}>{fmt(draft.start)}</span>
                <span>→</span>
                <span style={{ color: "#2F6FED", fontWeight: 700 }}>{fmt(previewEnd)}</span>
              </div>
              <button onClick={nextMonth} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex" }}>
                <ChevronRight size={16} color="#8A93B0" />
              </button>
            </div>

            <div style={{ display: "flex", gap: 18 }}>
              {renderMonth(viewYear, viewMonth)}
              {renderMonth(rightYear, rightMonth)}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid #EEF1F8" }}>
              <button onClick={() => setOpen(false)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E7EAF3", background: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: "#4A5170", cursor: "pointer" }}>Cancel</button>
              <button onClick={apply} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#2F6FED", fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: "#fff", cursor: "pointer" }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SourceDropdown.jsx  (drop into its own file)
============================================================ */
const SOURCES = [
  {
    value: "all",
    label: "All Sources",
    icon: <span style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg,#2F6FED,#17B893)", display: "inline-block" }} />,
  },
  {
    value: "google",
    label: "Google",
    icon: <span style={{ width: 16, height: 16, borderRadius: 4, background: "conic-gradient(#4285F4 0 25%, #34A853 25% 50%, #FBBC05 50% 75%, #EA4335 75% 100%)", display: "inline-block" }} />,
  },
  {
    value: "meta",
    label: "Meta",
    icon: <span style={{ width: 16, height: 16, borderRadius: 4, background: "#1877F2", color: "#fff", fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>f</span>,
  },
];

export function SourceDropdown() {
  const { source, setSource } = useFilters();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = SOURCES.find((s) => s.value === source);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, border: open ? "1px solid #2F6FED" : "1px solid #E7EAF3", borderRadius: 10, padding: "8px 12px", fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#4A5170", cursor: "pointer", userSelect: "none" }}
      >
        {active.icon}
        {active.label}
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #E7EAF3", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,20,36,0.12)", padding: 6, minWidth: 150, zIndex: 50 }}>
          {SOURCES.map((s) => (
            <div
              key={s.value}
              onClick={() => { setSource(s.value); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "Inter", fontSize: 13, color: "#3A4160" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s.icon}
              <span style={{ flex: 1 }}>{s.label}</span>
              {s.value === source && <Check size={14} color="#2F6FED" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Topbar.jsx  (drop into its own file)
   Search box removed — search state now lives in FilterContext
   so any component (a sidebar, a table filter row, etc.) can
   read/write it via useFilters() without prop drilling.
============================================================ */
export default function Topbar({ title, subtitle }) {
  const router = useRouter();
  const shouldShowFilters = !HIDE_TOPBAR_FILTERS_PATHS.has(router.pathname);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid #E7EAF3", background: "#FFFFFF", flexShrink: 0 }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, margin: 0, color: "#0F1424" }}>{title}</h1>
        <p style={{ fontFamily: "Inter", fontSize: 12.5, color: "#8A93B0", margin: "3px 0 0" }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {shouldShowFilters && (
          <>
            <SourceDropdown />
            <DateRangePicker />
          </>
        )}
        <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E7EAF3", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={15} color="#4A5170" />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2F6FED,#17B893)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 13 }}>NA</div>
      </div>
    </div>
  );
}