"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

/**
 * Generic "cost allocation" data table with server-side pagination,
 * search, and spend-date filtering. Used by both the ad-level and
 * campaign-reconciled pages (they only differ in endpoint/columns/copy).
 */
export default function CostAllocationTable({
  title,
  endpoint,
  currentRoute,
  searchPlaceholder,
  preferredOrder,
  minTableWidth = 1300,
}) {
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [spendDateFrom, setSpendDateFrom] = useState("");
  const [spendDateTo, setSpendDateTo] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Values actually applied to the request (decoupled from live input state
  // so typing doesn't trigger a fetch until Apply / Enter / page change).
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    spendDateFrom: "",
    spendDateTo: "",
  });

  const sidebarInitedRef = useRef(false);

  const formatCellValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const buildQuery = useCallback(
    (targetPage, targetLimit, filters) => {
      const params = new URLSearchParams();
      params.set("page", String(Math.max(parseInt(targetPage || "1", 10) || 1, 1)));
      params.set("limit", String(Math.max(parseInt(targetLimit || "50", 10) || 1, 1)));

      const s = (filters.search || "").trim();
      if (s) params.set("search", s);
      if (filters.spendDateFrom) params.set("spend_date_from", filters.spendDateFrom);
      if (filters.spendDateTo) params.set("spend_date_to", filters.spendDateTo);

      return params.toString();
    },
    []
  );

  const loadData = useCallback(
    async (targetPage, filters) => {
      const nextPage = Math.max(parseInt(targetPage ?? page, 10) || 1, 1);
      setLoading(true);
      setError(null);

      try {
        const qs = buildQuery(nextPage, limit, filters);
        const response = await fetch(`${endpoint}?${qs}`, {
          method: "GET",
          credentials: "same-origin",
        });

        const result = await response.json();
        if (!response.ok || !result || result.success === false) {
          throw new Error((result && (result.message || result.error)) || "Request failed");
        }

        const data = Array.isArray(result.data) ? result.data : [];
        setRows(data);

        const p = result.pagination || {};
        const total = Number(p.total || 0);
        const currentPage = Number(p.page || nextPage || 1);
        const totalPages = Number(p.total_pages || 1);

        setPage(currentPage);
        setPageInput(String(currentPage));
        setPagination({ total, page: currentPage, total_pages: totalPages });
      } catch (err) {
        setRows([]);
        setError(err.message || "Failed to load");
        setPagination({ total: 0, page: 1, total_pages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, endpoint, limit, page]
  );

  // Initial load
  useEffect(() => {
    loadData(1, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    const filters = { search, spendDateFrom, spendDateTo };
    setAppliedFilters(filters);
    loadData(1, filters);
  };

  const handleReset = () => {
    setSearch("");
    setSpendDateFrom("");
    setSpendDateTo("");
    setLimit(50);
    setPageInput("1");
    const filters = { search: "", spendDateFrom: "", spendDateTo: "" };
    setAppliedFilters(filters);
    loadData(1, filters);
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") handleApply();
  };

  const onLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10) || 50;
    setLimit(newLimit);
    setPageInput("1");
    fetchWithLimit(1, newLimit, appliedFilters);
  };

  const fetchWithLimit = useCallback(
    async (targetPage, targetLimit, filters) => {
      const nextPage = Math.max(parseInt(targetPage ?? 1, 10) || 1, 1);
      setLoading(true);
      setError(null);
      try {
        const qs = buildQuery(nextPage, targetLimit, filters);
        const response = await fetch(`${endpoint}?${qs}`, {
          method: "GET",
          credentials: "same-origin",
        });
        const result = await response.json();
        if (!response.ok || !result || result.success === false) {
          throw new Error((result && (result.message || result.error)) || "Request failed");
        }
        const data = Array.isArray(result.data) ? result.data : [];
        setRows(data);
        const p = result.pagination || {};
        const total = Number(p.total || 0);
        const currentPage = Number(p.page || nextPage || 1);
        const totalPages = Number(p.total_pages || 1);
        setPage(currentPage);
        setPageInput(String(currentPage));
        setPagination({ total, page: currentPage, total_pages: totalPages });
      } catch (err) {
        setRows([]);
        setError(err.message || "Failed to load");
        setPagination({ total: 0, page: 1, total_pages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, endpoint]
  );

  const handlePageInputChange = (event) => {
    setPageInput(event.target.value);
  };

  const handlePageInputCommit = () => {
    const target = Math.max(parseInt(pageInput || "1", 10) || 1, 1);
    fetchWithLimit(target, limit, appliedFilters);
  };

  const goToPage = (targetPage) => {
    fetchWithLimit(targetPage, limit, appliedFilters);
  };

  const buildPageItems = (currentPage, totalPages) => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    pages.push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  const monoCols = ["id", "spend", "clicks", "impressions", "real_leads", "cpl"];

  const rowKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const keys = [
    ...preferredOrder.filter((k) => rowKeys.includes(k)),
    ...rowKeys.filter((k) => !preferredOrder.includes(k)),
  ];

  const currentPage = pagination.page || page;
  const totalPages = pagination.total_pages || 1;
  const total = pagination.total || 0;
  const pageItems = buildPageItems(currentPage, totalPages);

  const summaryText = loading
    ? "Loading..."
    : error
    ? "Failed to load"
    : `Total: ${total} | Page: ${currentPage} / ${totalPages}`;

  useEffect(() => {
    if (sidebarInitedRef.current && typeof window !== "undefined" && typeof window.initCommonSidebar === "function") {
      window.initCommonSidebar(currentRoute);
    }
  }, [currentRoute]);

  return (
    <div className="cat-root">
      <Script
        src="/commonSidebarTemplate.js"
        strategy="afterInteractive"
        onLoad={() => {
          sidebarInitedRef.current = true;
          if (typeof window !== "undefined" && typeof window.initCommonSidebar === "function") {
            window.initCommonSidebar(currentRoute);
          }
        }}
      />

      <div className="topbar">
        <button className="btn" onClick={() => setSidebarOpen((v) => !v)}>
          Menu
        </button>
        <div className="title">{title}</div>

        <div className="field">
          <label htmlFor="page">Page</label>
          <input
            id="page"
            type="number"
            min="1"
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={handlePageInputCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePageInputCommit();
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="limit">Limit</label>
          <select id="limit" value={limit} onChange={onLimitChange}>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleEnterKey}
          />
        </div>

        <div className="field">
          <label htmlFor="spendDateFrom">Spend Date From</label>
          <input
            id="spendDateFrom"
            type="date"
            value={spendDateFrom}
            onChange={(e) => setSpendDateFrom(e.target.value)}
            onKeyDown={handleEnterKey}
          />
        </div>

        <div className="field">
          <label htmlFor="spendDateTo">Spend Date To</label>
          <input
            id="spendDateTo"
            type="date"
            value={spendDateTo}
            onChange={(e) => setSpendDateTo(e.target.value)}
            onKeyDown={handleEnterKey}
          />
        </div>

        <button className="btn primary" onClick={handleApply}>
          Apply
        </button>
        <button className="btn" onClick={handleReset}>
          Reset
        </button>

        <div className="summary">{summaryText}</div>
      </div>

      <div id="sidebar" className={`sidebar${sidebarOpen ? " open" : ""}`} />

      <div className="table-wrap">
        <div className="table-scroll">
          {error ? (
            <div className="empty">{error}</div>
          ) : rows.length === 0 && !loading ? (
            <div className="empty">No data found</div>
          ) : (
            <table style={{ minWidth: minTableWidth }}>
              <thead>
                <tr>
                  {keys.map((k) => (
                    <th key={k}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row.id ?? rowIdx}>
                    {keys.map((k) => (
                      <td key={k} className={monoCols.includes(k) ? "mono" : ""}>
                        {formatCellValue(row[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages >= 1 && (
        <div className="pagination">
          <button
            data-page={currentPage - 1}
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </button>
          <span className="page-info">{total} rows</span>

          {pageItems.map((item, idx) =>
            item === "..." ? (
              <span className="page-info" key={`ellipsis-${idx}`}>
                ...
              </span>
            ) : (
              <button
                key={item}
                data-page={item}
                className={item === currentPage ? "active" : ""}
                onClick={() => goToPage(item)}
              >
                {item}
              </button>
            )
          )}

          <button
            data-page={currentPage + 1}
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .cat-root {
          --border: #e5e7eb;
        }
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 12px 14px;
          display: flex;
          gap: 10px;
          align-items: end;
          flex-wrap: wrap;
        }
        .title {
          font-size: 16px;
          font-weight: 700;
          margin-right: 8px;
          white-space: nowrap;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .field label {
          font-size: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 700;
        }
        .field input,
        .field select {
          height: 34px;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          min-width: 120px;
          background: #fff;
        }
        .btn {
          height: 34px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111827;
          font-weight: 700;
          padding: 0 14px;
          cursor: pointer;
        }
        .btn.primary {
          background: #1d4ed8;
          border-color: #1d4ed8;
          color: #fff;
        }
        .sidebar {
          position: fixed;
          left: -250px;
          top: 0;
          width: 250px;
          height: 100vh;
          background: #0d0d0d;
          color: #f0f6fc;
          padding-top: 70px;
          transition: left 0.3s;
          z-index: 300;
          border-right: 1px solid #242424;
        }
        .sidebar.open {
          left: 0;
        }
        .summary {
          margin-left: auto;
          font-size: 12px;
          color: #374151;
          font-weight: 600;
          white-space: nowrap;
        }
        .table-wrap {
          position: fixed;
          top: 88px;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 12px 12px 72px 12px;
        }
        .table-scroll {
          width: 100%;
          height: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          overflow: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th,
        td {
          border-bottom: 1px solid #edf0f4;
          padding: 8px 10px;
          text-align: left;
          vertical-align: top;
          white-space: nowrap;
        }
        th {
          position: sticky;
          top: 0;
          background: #f8fafc;
          z-index: 1;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #4b5563;
        }
        tr:hover td {
          background: #f8fbff;
        }
        .mono {
          font-family: Menlo, Monaco, Consolas, monospace;
        }
        .empty {
          padding: 24px;
          color: #6b7280;
          text-align: center;
        }
        .pagination {
          position: fixed;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
          z-index: 1100;
          max-width: calc(100% - 24px);
          overflow-x: auto;
          white-space: nowrap;
        }
        .pagination button {
          border: 1px solid transparent;
          background: transparent;
          color: #1f2937;
          height: 30px;
          min-width: 30px;
          border-radius: 999px;
          padding: 0 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }
        .pagination button:hover:not(:disabled) {
          background: #eef2f7;
        }
        .pagination button.active {
          background: #1d4ed8;
          color: #ffffff;
        }
        .pagination button:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .pagination .page-info {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          padding: 0 4px;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: "Segoe UI", Arial, sans-serif;
          background: #f6f8fb;
          color: #111827;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
