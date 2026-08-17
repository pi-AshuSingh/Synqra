"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "./page.module.css";

type UserProfile = {
  id: string;
  name: string;
  username?: string;
  image: string;
  city?: string;
  age?: number;
};

export default function SearchPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchAllUsers(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchAllUsers = async (currentUid: string) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList: UserProfile[] = [];
      
      usersSnapshot.forEach((docSnap) => {
        if (docSnap.id !== currentUid) {
          const data = docSnap.data();
          usersList.push({
            id: docSnap.id,
            name: data.name || "Unknown",
            username: data.username || "",
            image: data.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            city: data.city || "",
            age: data.age || 0
          });
        }
      });
      
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching all users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <main className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          Loading profiles...
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      

      <div style={{ padding: "var(--spacing-lg) var(--spacing-md)", paddingBottom: "10px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px" }}>Explore 🌍</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>Find anyone and send a direct message.</p>
        
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid var(--glass-border)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-color)",
            outline: "none",
            fontSize: "1rem"
          }}
        />
      </div>

      <div style={{ position: "relative" }}>
        {filteredUsers.length === 0 ? (
          <div className={`glass-card ${styles.emptyState}`}>
            <div style={{ fontSize: "3rem" }}>🔍</div>
            <h3>No users found</h3>
            <p>Try searching for a different name.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={styles.matchCard} 
                onClick={() => router.push(`/chat?id=${user.id}&name=${encodeURIComponent(user.name)}&img=${encodeURIComponent(user.image)}&username=${encodeURIComponent(user.username || '')}`)}
              >
                <div className={styles.imageWrapper}>
                  <img src={user.image} alt={user.name} className={styles.image} />
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{user.name} {user.age ? `, ${user.age}` : ""}</div>
                  {user.username && <div style={{ color: "var(--primary-color)", fontSize: "0.8rem", marginBottom: "4px" }}>@{user.username}</div>}
                  <div className={styles.time} style={{ color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Message
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
