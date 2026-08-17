"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut(auth);
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Discover", path: "/discover", icon: "🔥" },
    { name: "Matches", path: "/matches", icon: "💖" },
    { name: "Sparks", path: "/sparks", icon: "✨" },
    { name: "Visitors", path: "/visitors", icon: "👁️" },
    { name: "Premium", path: "/premium", icon: "⭐" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      {/* Sidebar (Desktop) */}
      {!isMobile && (
        <nav style={{
          width: "250px",
          borderRight: "1px solid var(--glass-border)",
          background: "rgba(20, 20, 25, 0.8)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 50
        }}>
          <div style={{ padding: "0 10px 30px", borderBottom: "1px solid var(--glass-border)", marginBottom: "20px" }}>
            <Logo size={32} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {navItems.map(item => (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: pathname.startsWith(item.path) ? "rgba(247, 37, 133, 0.15)" : "transparent",
                  color: pathname.startsWith(item.path) ? "var(--primary-color)" : "var(--text-color)",
                  fontWeight: pathname.startsWith(item.path) ? 600 : 400,
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: "auto" }}>
            <button 
              onClick={handleSignOut}
              className="btn-glass"
              style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
            >
              Sign Out 🚪
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, paddingBottom: isMobile ? "70px" : "0" }}>
        {/* Top Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "rgba(20, 20, 25, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--glass-border)",
          position: "sticky",
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={() => router.back()}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "white",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.2rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--glass-bg)"}
            >
              ←
            </button>
            {isMobile && <Logo size={24} />}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <NotificationBell />
            {isMobile && (
              <button onClick={handleSignOut} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "1.2rem", cursor: "pointer", padding: "6px" }}>
                🚪
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {children}
        </div>
      </div>

      {/* Bottom Nav (Mobile) */}
      {isMobile && (
        <nav style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(20, 20, 25, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "12px 0",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
          zIndex: 50
        }}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              href={item.path}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                color: pathname.startsWith(item.path) ? "var(--primary-color)" : "var(--text-muted)",
                textDecoration: "none"
              }}
            >
              <span style={{ fontSize: "1.2rem", filter: pathname.startsWith(item.path) ? "drop-shadow(0 0 5px var(--primary-color))" : "none" }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "0.65rem", fontWeight: pathname.startsWith(item.path) ? 600 : 400 }}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
