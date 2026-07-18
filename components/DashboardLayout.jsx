import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ title, subtitle, children }) {
  const { loggedIn, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !loggedIn) {
      router.replace("/");
    }
  }, [ready, loggedIn, router]);

  // Avoid flashing dashboard content before we know the auth state.
  if (!ready || !loggedIn) return null;

  return (
    <>
      <Head>
        <title>{title ? `${title} · Voyage` : "Voyage · Growth Dashboard"}</title>
      </Head>
      <div style={{ display: "flex", height: "100%", width: "100%", background: "#F5F7FB", fontFamily: "Inter" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
          <Topbar title={title} subtitle={subtitle} />
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 32px" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
