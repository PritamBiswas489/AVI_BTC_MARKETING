import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Plane, Mail, Lock, Eye, EyeOff, Compass } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function RouteMap() {
  const pts = [[40, 220], [130, 120], [230, 170], [320, 70], [400, 140], [470, 60]];
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  return (
    <svg viewBox="0 0 520 280" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.9 }}>
      <path d={path} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" strokeDasharray="2 6" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5 : 3.2} fill={i === pts.length - 1 ? "#F6A93B" : "#ffffff"} opacity={i === pts.length - 1 ? 1 : 0.75} />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("nadia@voyage-growth.com");
  const [pw, setPw] = useState("••••••••••");
  const { loggedIn, ready, login } = useAuth();
  const router = useRouter();

  // Already signed in? Skip the login screen.
  useEffect(() => {
    if (ready && loggedIn) {
      router.replace("/dashboard/overview");
    }
  }, [ready, loggedIn, router]);

  const handleLogin = () => {
    login();
    router.push("/dashboard/overview");
  };

  if (!ready || loggedIn) return null;

  return (
    <>
      <Head>
        <title>Sign in · Voyage</title>
      </Head>
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F5F7FB", fontFamily: "Inter" }}>
        <div style={{
          flex: "0 0 46%", position: "relative", overflow: "hidden",
          background: "linear-gradient(160deg,#0B1330 0%, #131C3E 55%, #0E2C4A 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 44px",
          boxSizing: "border-box", color: "#fff", minWidth: 380,
        }}>
          <RouteMap />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#2F6FED,#17B893)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plane size={17} color="#fff" strokeWidth={2.4} />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 16 }}>Voyage</span>
          </div>
          <div style={{ position: "relative", maxWidth: 380 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "5px 12px", fontSize: 11.5, fontWeight: 600, color: "#BFD0FF", marginBottom: 18 }}>
              <Compass size={12} /> Growth intelligence for travel brands
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 32, lineHeight: 1.18, margin: 0 }}>
              Every campaign,<br />every lead,<br /><span style={{ color: "#63A9FF" }}>one clear route.</span>
            </h1>
            <p style={{ fontFamily: "Inter", fontSize: 13.5, color: "#9BA6CC", marginTop: 16, lineHeight: 1.6 }}>
              Spend, leads, bookings and revenue reconciled in real time — from first click to confirmed booking.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", gap: 28 }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 20 }}>15.5x</div><div style={{ fontSize: 11.5, color: "#8A93B0", marginTop: 2 }}>Avg. ROAS</div></div>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 20 }}>95%</div><div style={{ fontSize: 11.5, color: "#8A93B0", marginTop: 2 }}>Lead match rate</div></div>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 20 }}>8m 24s</div><div style={{ fontSize: 11.5, color: "#8A93B0", marginTop: 2 }}>Avg. response</div></div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 24, color: "#0F1424", margin: "0 0 6px" }}>Welcome back</h2>
            <p style={{ fontSize: 13.5, color: "#8A93B0", margin: "0 0 28px" }}>Sign in to your growth dashboard.</p>

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#4A5170", display: "block", marginBottom: 6 }}>Email</label>
            <div style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid #E7EAF3", borderRadius: 11, padding: "11px 13px", marginBottom: 16, background: "#fff" }}>
              <Mail size={16} color="#9AA3C2" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ border: "none", outline: "none", fontSize: 13.5, flex: 1, fontFamily: "Inter", color: "#0F1424" }} />
            </div>

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#4A5170", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid #E7EAF3", borderRadius: 11, padding: "11px 13px", marginBottom: 10, background: "#fff" }}>
              <Lock size={16} color="#9AA3C2" />
              <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} style={{ border: "none", outline: "none", fontSize: 13.5, flex: 1, fontFamily: "Inter", color: "#0F1424" }} />
              <button onClick={() => setShowPw((s) => !s)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                {showPw ? <EyeOff size={15} color="#9AA3C2" /> : <Eye size={15} color="#9AA3C2" />}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#6B7280" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "#2F6FED" }} /> Keep me signed in
              </label>
              <a style={{ fontSize: 12.5, color: "#2F6FED", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>Forgot password?</a>
            </div>

            <button onClick={handleLogin} style={{
              width: "100%", padding: "12px 0", borderRadius: 11, border: "none", cursor: "pointer",
              background: "linear-gradient(90deg,#2F6FED,#2557C7)", color: "#fff", fontFamily: "'Plus Jakarta Sans'",
              fontWeight: 700, fontSize: 14.5, boxShadow: "0 10px 24px rgba(47,111,237,0.28)",
            }}>Sign in</button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E7EAF3" }} />
              <span style={{ fontSize: 11.5, color: "#9AA3C2" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "#E7EAF3" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {["Google", "Microsoft"].map((p) => (
                <button key={p} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "1px solid #E7EAF3", background: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#4A5170", cursor: "pointer" }}>{p}</button>
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 12.5, color: "#8A93B0", marginTop: 26 }}>
              New to Voyage? <a style={{ color: "#2F6FED", fontWeight: 600, textDecoration: "none" }}>Request access</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
