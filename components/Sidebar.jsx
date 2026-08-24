import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Settings, LogOut } from "lucide-react";
import { NAV } from "../lib/data";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside style={{ width: 248, flexShrink: 0, background: "#0B1330", height: "100%", display: "flex", flexDirection: "column", padding: "22px 14px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 8px 26px" }}>
        <div style={{ width: 190, height: 86, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Image src="/images/logo.png" alt="Brand logo" width={190} height={86} style={{ objectFit: "contain", width: "100%", height: "100%" }} priority />
        </div>
        
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
        {NAV.map(({ label, icon: Icon, href }) => {
          const isActive = router.pathname === href;
          return (
            <div key={label}>
              <Link href={href} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10,
                textDecoration: "none", cursor: "pointer",
                background: isActive ? "linear-gradient(90deg,#2F6FED,#2557C7)" : "transparent",
                color: isActive ? "#fff" : "#A6B0D6", fontFamily: "Inter", fontWeight: 600, fontSize: 13.5,
              }}>
                <Icon size={16} strokeWidth={2.1} />{label}
              </Link>
               
            </div>
          );
        })}
      </nav>
      <div style={{ borderTop: "1px solid #1B274D", paddingTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
        <Link href="/dashboard/settings" style={{
          display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10,
          textDecoration: "none", cursor: "pointer",
          background: router.pathname === "/dashboard/settings" ? "linear-gradient(90deg,#2F6FED,#2557C7)" : "transparent",
          color: router.pathname === "/dashboard/settings" ? "#fff" : "#A6B0D6", fontFamily: "Inter", fontWeight: 600, fontSize: 13.5,
        }}>
          <Settings size={16} /> Settings
        </Link>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "#F5A3A3", fontFamily: "Inter", fontWeight: 600, fontSize: 13.5 }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
