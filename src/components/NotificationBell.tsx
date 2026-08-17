"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "notifications"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });
      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    try {
      const { writeBatch, doc: fsDoc } = await import("firebase/firestore");
      const batch = writeBatch(db);
      notifications.forEach(n => {
        if (!n.read) {
          batch.update(fsDoc(db, "users", userId, "notifications", n.id), { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDropdown = () => {
    if (!showDropdown) markAllAsRead();
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = (notif: any) => {
    setShowDropdown(false);
    if (notif.type === "super_like" || notif.type === "like") {
      router.push("/sparks");
    } else if (notif.type === "match") {
      router.push("/matches");
    } else if (notif.type === "view") {
      router.push("/visitors");
    }
  };

  if (!userId) return null;

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={toggleDropdown}
        style={{ 
          background: "transparent", 
          border: "none", 
          color: "white", 
          fontSize: "1.2rem", 
          cursor: "pointer", 
          position: "relative",
          padding: "6px"
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#ef4444",
            color: "white",
            fontSize: "0.6rem",
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            fontWeight: "bold"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: "absolute",
          top: "40px",
          right: "0",
          width: "280px",
          background: "rgba(20, 20, 25, 0.95)",
          border: "1px solid var(--glass-border)",
          borderRadius: "12px",
          padding: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 1000,
          backdropFilter: "blur(10px)",
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: "var(--text-muted)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px" }}>
            Notifications
          </h4>
          
          {notifications.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>
              No new notifications
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
              {notifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    background: n.read ? "transparent" : "rgba(59, 130, 246, 0.1)",
                    borderLeft: n.read ? "none" : "3px solid #3b82f6",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <img src={n.sourceImage} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: n.read ? "normal" : "bold", color: "white" }}>
                      {n.title}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {n.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
