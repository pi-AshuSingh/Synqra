"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "./page.module.css";

type Match = {
  id: string;
  targetId: string;
  targetName: string;
  targetImage: string;
  timestamp: string;
};

export default function Matches() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      
      try {
        const q = query(
          collection(db, "users", user.uid, "interactions"),
          where("type", "==", "like")
          // Note: Needs composite index if ordered by timestamp with a where clause.
          // For MVP, we will sort on client to avoid needing manual index creation via CLI.
        );
        
        const snapshot = await getDocs(q);
        const fetchedMatches: Match[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          fetchedMatches.push({
            id: doc.id,
            targetId: data.targetId,
            targetName: data.targetName,
            targetImage: data.targetImage || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            timestamp: data.timestamp
          });
        });
        
        // Sort client side
        fetchedMatches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setMatches(fetchedMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="flex-center" style={{ minHeight: "100vh" }}>
        <p>Loading your sparks...</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Logo size={32} />
          <h2 className="text-gradient" style={{ margin: 0 }}>Your Sparks</h2>
        </div>
        <Link href="/discover" className="btn-glass">Keep Swiping</Link>
      </header>

      {matches.length === 0 ? (
        <div className={`glass-card ${styles.emptyState}`}>
          <div style={{ fontSize: "3rem" }}>✨</div>
          <h3>No Sparks Yet</h3>
          <p>Get back out there and find your perfect sync!</p>
          <Link href="/discover" className="btn-primary">Discover Profiles</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {matches.map(match => (
            <div key={match.id} className={styles.matchCard} onClick={() => router.push(`/chat?id=${match.targetId}&name=${encodeURIComponent(match.targetName)}&img=${encodeURIComponent(match.targetImage)}`)}>
              <div className={styles.imageWrapper}>
                <img src={match.targetImage} alt={match.targetName} className={styles.image} />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{match.targetName}</div>
                <div className={styles.time}>{new Date(match.timestamp).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
