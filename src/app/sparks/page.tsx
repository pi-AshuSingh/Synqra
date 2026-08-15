"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "../matches/page.module.css";

type Spark = {
  id: string;
  sourceId: string;
  name: string;
  image: string;
  timestamp: string;
};

export default function Sparks() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchSparks(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchSparks = async (uid: string) => {
    try {
      const sparksSnapshot = await getDocs(collection(db, "users", uid, "receivedLikes"));
      
      const fetchedSparks: Spark[] = [];
      
      for (const docSnap of sparksSnapshot.docs) {
        const data = docSnap.data();
        
        // Fetch the liker's profile details
        const likerRef = doc(db, "users", data.sourceId);
        const likerSnap = await getDoc(likerRef);
        
        if (likerSnap.exists()) {
          const likerData = likerSnap.data();
          fetchedSparks.push({
            id: docSnap.id,
            sourceId: data.sourceId,
            name: likerData.name || "Unknown",
            image: likerData.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            timestamp: data.timestamp
          });
        }
      }
      
      // Sort by newest
      fetchedSparks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSparks(fetchedSparks);
    } catch (error) {
      console.error("Error fetching sparks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Logo size={28} />
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/discover" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Discover
          </Link>
          <Link href="/matches" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Matches
          </Link>
        </div>
      </header>

      <div style={{ padding: "var(--spacing-lg) var(--spacing-md)", paddingBottom: "10px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px" }}>Who Liked You ✨</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>These people have already swiped right on you.</p>
      </div>

      {sparks.length === 0 ? (
        <div className={`glass-card ${styles.emptyState}`}>
          <div style={{ fontSize: "3rem" }}>🫣</div>
          <h3>No Sparks Yet</h3>
          <p>Keep swiping and updating your profile to get noticed!</p>
          <Link href="/discover" className="btn-primary">Back to Discover</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {sparks.map(spark => (
            <div key={spark.id} className={styles.matchCard} onClick={() => router.push("/discover")}>
              <div className={styles.imageWrapper}>
                <img src={spark.image} alt={spark.name} className={styles.image} />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{spark.name}</div>
                <div className={styles.time}>Match with them in Discover!</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
