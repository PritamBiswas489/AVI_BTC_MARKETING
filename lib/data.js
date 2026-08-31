import {
  Home, BarChart2, Users, MessageSquare, Calendar, DollarSign, Target,
  Share2, ShieldCheck, FileText,
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
   Ink #0B1330 · Ink-2 #131C3E · Horizon (primary) #2F6FED
   Reef (positive) #17B893 · Sand (accent) #F6A93B · Coral (alert) #E15A5A
   Cloud (bg) #F5F7FB · Paper #FFFFFF · Slate-900 #0F1424 · Slate-500 #6B7280
   Line #E7EAF3
   Display: Plus Jakarta Sans · Body/Data: Inter
------------------------------------------------------------------ */

export const dates = ["Jul 1", "Jul 4", "Jul 7", "Jul 10", "Jul 13", "Jul 16", "Jul 19", "Jul 22", "Jul 25", "Jul 28", "Jul 31"];

export const spendRevenue = [
  { d: "Jul 1", spend: 120000, revenue: 40000 }, { d: "Jul 4", spend: 210000, revenue: 95000 },
  { d: "Jul 7", spend: 395000, revenue: 110000 }, { d: "Jul 10", spend: 260000, revenue: 190000 },
  { d: "Jul 13", spend: 205000, revenue: 250000 }, { d: "Jul 16", spend: 165000, revenue: 320000 },
  { d: "Jul 19", spend: 235000, revenue: 265000 }, { d: "Jul 22", spend: 190000, revenue: 300000 },
  { d: "Jul 25", spend: 215000, revenue: 275000 }, { d: "Jul 28", spend: 175000, revenue: 350000 },
  { d: "Jul 31", spend: 205000, revenue: 410000 },
];

export const cplTrend = dates.map((d, i) => ({ d, Meta: 220 + Math.round(60 * Math.sin(i * 1.3)) + 40, Google: 200 + Math.round(40 * Math.cos(i * 1.1)) + 30 }));
export const roasTrend = dates.map((d, i) => ({ d, roas: +(12 + 4 * Math.sin(i * 0.9) + i * 0.3).toFixed(1) }));
export const revProfit = spendRevenue.map((r) => ({ d: r.d, revenue: r.revenue, spend: r.spend, profit: Math.round(r.revenue - r.spend * 0.45) }));
export const bookingsOverTime = dates.map((d, i) => ({ d, bookings: 20 + Math.round(30 * Math.abs(Math.sin(i * 1.1))) }));
export const paidLeadsOverTime = dates.map((d, i) => ({ d, Meta: 30 + Math.round(25 * Math.abs(Math.sin(i))), Google: 15 + Math.round(15 * Math.abs(Math.cos(i))) }));
export const matchRateTrend = dates.map((d, i) => ({ d, rate: +(90 + 5 * Math.sin(i * 0.8)).toFixed(1) }));

export const platformDonut = [{ name: "Meta", value: 67.5, color: "#2F6FED" }, { name: "Google", value: 32.5, color: "#17B893" }];
export const spendDonut = [{ name: "Meta", value: 64.0, color: "#2F6FED" }, { name: "Google", value: 36.0, color: "#17B893" }];
export const bookingsDonut = [{ name: "Meta", value: 63.4, color: "#2F6FED" }, { name: "Google", value: 36.6, color: "#17B893" }];
export const ticketStatusDonut = [
  { name: "Open", value: 27.2, color: "#2F6FED" },
  { name: "Closed (No Booking)", value: 58.4, color: "#17B893" },
  { name: "Closed (Booked)", value: 14.4, color: "#F6A93B" },
];
export const unmatchedDonut = [
  { name: "Missing Campaign ID", value: 51.6, color: "#2F6FED" },
  { name: "Missing Ad Set/Group", value: 29.0, color: "#17B893" },
  { name: "Missing Ad ID", value: 12.9, color: "#8B6BF0" },
  { name: "Other", value: 6.5, color: "#F6A93B" },
];

export const campaigns = [
  { name: "Family Thailand", platform: "Meta", spend: "฿65,420", clicks: "12,540", leads: 286, cpl: "฿229", bookings: 46, revenue: "฿1,238,000", roas: "18.6x" },
  { name: "Families Israel", platform: "Meta", spend: "฿58,910", clicks: "10,230", leads: 210, cpl: "฿280", bookings: 32, revenue: "฿892,000", roas: "15.1x" },
  { name: "Retirees Europe", platform: "Google", spend: "฿42,180", clicks: "8,160", leads: 182, cpl: "฿232", bookings: 22, revenue: "฿754,000", roas: "17.9x" },
  { name: "Wellness Retreats", platform: "Meta", spend: "฿31,550", clicks: "5,320", leads: 128, cpl: "฿246", bookings: 18, revenue: "฿512,000", roas: "16.2x" },
  { name: "Couples Getaway", platform: "Google", spend: "฿24,800", clicks: "4,110", leads: 94, cpl: "฿264", bookings: 16, revenue: "฿348,000", roas: "14.0x" },
];

export const recentLeads = [
  { id: "L-2026-0715-00123", date: "Jul 15, 2026", source: "Meta", campaign: "Family Thailand", cost: "฿210", status: "Open" },
  { id: "L-2026-0715-00122", date: "Jul 15, 2026", source: "Google", campaign: "Retirees Europe", cost: "฿235", status: "Open" },
  { id: "L-2026-0715-00121", date: "Jul 15, 2026", source: "Meta", campaign: "Families Israel", cost: "฿180", status: "Open" },
  { id: "L-2026-0714-00098", date: "Jul 14, 2026", source: "Meta", campaign: "Wellness Retreats", cost: "฿165", status: "Qualified" },
  { id: "L-2026-0714-00097", date: "Jul 14, 2026", source: "Google", campaign: "Couples Getaway", cost: "฿220", status: "Closed (Booked)" },
];

export const recentTickets = [
  { id: "T-09231", lead: "L-2026-0715-00123", status: "Open", agent: "Anna", updated: "Jul 15, 11:24" },
  { id: "T-09320", lead: "L-2026-0715-00122", status: "Qualified", agent: "Ben", updated: "Jul 15, 10:52" },
  { id: "T-09319", lead: "L-2026-0715-00121", status: "Closed (Booked)", agent: "Chai", updated: "Jul 15, 09:41" },
  { id: "T-09318", lead: "L-2026-0714-00199", status: "Open", agent: "Anna", updated: "Jul 14, 16:33" },
];

export const unmatchedLeads = [
  { id: "L-2026-0714-00098", date: "Jul 14, 2026", source: "Meta", reason: "Missing Ad ID", campaign: "Family Thailand" },
  { id: "L-2026-0714-00077", date: "Jul 14, 2026", source: "Google", reason: "Missing Ad Set ID", campaign: "Retirees Europe" },
  { id: "L-2026-0713-00054", date: "Jul 13, 2026", source: "Google", reason: "Missing Campaign ID", campaign: "Families Israel" },
  { id: "L-2026-0713-00031", date: "Jul 13, 2026", source: "Meta", reason: "Other", campaign: "Wellness Retreats" },
];

export const matchQualityLevels = [
  { label: "Ad Level (High)", pct: 68, count: 742, color: "#2F6FED" },
  { label: "Ad Set / Group", pct: 24, count: 262, color: "#2F6FED" },
  { label: "Campaign Level", pct: 6, count: 66, color: "#2F6FED" },
  { label: "Name Fallback", pct: 2, count: 24, color: "#2F6FED" },
];

export const dataChecks = [
  { name: "Lead → Ad match rate", detail: "1,186 of 1,248 leads matched to a paid source", status: "good" },
  { name: "Duplicate leads", detail: "3 possible duplicates flagged this period", status: "warn" },
  { name: "Missing UTM parameters", detail: "62 leads arrived without a full UTM set", status: "warn" },
  { name: "Spend reconciliation", detail: "Ad platform spend matches billing within 0.4%", status: "good" },
  { name: "Booking sync (LiveAgent → CRM)", detail: "2 bookings failed to sync — retry required", status: "bad" },
];

export const reports = [
  { title: "Campaign Performance Report", desc: "Spend, leads, CPL, bookings, revenue, ROAS, ROI", icon: BarChart2, tint: "#E9F1FF" },
  { title: "Monthly Performance Summary", desc: "Executive summary with key metrics and trends", icon: Calendar, tint: "#E9F1FF" },
  { title: "Agent Performance Report", desc: "Tickets handled, conversion rate, bookings", icon: Users, tint: "#E9F1FF" },
  { title: "Lead Source Breakdown", desc: "Detailed breakdown by campaign, ad set, ad", icon: Users, tint: "#E7FBF4" },
  { title: "P&L by Campaign", desc: "Revenue, cost, profit, ROI breakdown", icon: DollarSign, tint: "#FFF4E3" },
  { title: "Data Quality Report", desc: "Matched vs. unmatched leads, data health", icon: ShieldCheck, tint: "#E7FBF4" },
];

export const integrations = [
  { name: "Meta Ads", detail: "Campaigns, ad sets and spend sync every 30 min", connected: true },
  { name: "Google Ads", detail: "Campaigns and conversion data sync every 30 min", connected: true },
  { name: "LiveAgent", detail: "Tickets and agent activity sync in real time", connected: true },
  { name: "Stripe", detail: "Booking and payment data for revenue matching", connected: false },
];

/* NAV now carries real routes instead of in-memory tab state */
export const NAV = [
  { label: "Overview", icon: Home, href: "/dashboard/overview" },
  { label: "IT Tracking leads", icon: FileText, href: "/dashboard/it-tracking-leads" },
  { label: "AD spend tracking", icon: FileText, href: "/dashboard/ad-spend-tracking" },
  { label: "Ad Level Cost Allocation", icon: FileText, href: "/dashboard/ad-level-cost-allocation" },
  { label: "Campaign Reconciled Cost Allocation", icon: FileText, href: "/dashboard/campaign-reconciled-cost-allocation" },
  { label: "Lead profile summary", icon: FileText, href: "/dashboard/lead-profit-summary" },
  { label: "Leads", icon: Users, href: "/dashboard/leads" },

  



  
  { label: "Ad Performance", icon: BarChart2, href: "/dashboard/ad-performance" },
  
  
  
  { label: "Tickets", icon: MessageSquare, href: "/dashboard/tickets" },
  { label: "Bookings / Sales", icon: Calendar, href: "/dashboard/bookings" },
  { label: "Revenue & Profit", icon: DollarSign, href: "/dashboard/revenue" },
  { label: "ROAS / ROI", icon: Target, href: "/dashboard/roas" },
  { label: "Attribution", icon: Share2, href: "/dashboard/attribution" },
  { label: "Data Quality", icon: ShieldCheck, href: "/dashboard/data-quality" },
  { label: "Reports", icon: FileText, href: "/dashboard/reports" },
];

export const axisStyle = { fontFamily: "Inter", fontSize: 11, fill: "#9AA3C2" };
