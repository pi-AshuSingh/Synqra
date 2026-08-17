"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifs = async (userId: string) => {
      try {
        const q = query(
          collection(db, "users", userId, "notifications"),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const notifs: any[] = [];
        snapshot.forEach(doc => {
          notifs.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notifs);

        // Mark all as read
        const unreadDocs = snapshot.docs.filter(doc => !doc.data().read);
        if (unreadDocs.length > 0) {
          const batch = writeBatch(db);
          unreadDocs.forEach(docSnap => {
            batch.update(docSnap.ref, { read: true });
          });
          await batch.commit();
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchNotifs(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const clearAll = async () => {
    if (!auth.currentUser || notifications.length === 0) return;
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    
    try {
      setLoading(true);
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, "users", auth.currentUser!.uid, "notifications", n.id));
      });
      await batch.commit();
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications", err);
      alert("Failed to clear notifications");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return "🔥";
      case "like": return "💖";
      case "superlike": return "⭐";
      case "view": return "👁️";
      default: return "🔔";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notification Center</h1>
        {notifications.length > 0 && (
          <button className={styles.clearBtn} onClick={clearAll}>Clear All</button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "4rem 1rem", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📭</span>
          <h3>All caught up!</h3>
          <p style={{ marginTop: "0.5rem" }}>You don't have any notifications right now.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div key={n.id} className={styles.notificationCard} onClick={() => router.push(n.link || "/")}>
              <div className={styles.icon}>{getIcon(n.type)}</div>
              <div className={styles.content}>
                <div className={styles.titleText}>{n.title}</div>
                <div className={styles.bodyText}>{n.body}</div>
                <div className={styles.timestamp}>
                  {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleString() : "Just now"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
