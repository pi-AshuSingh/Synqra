"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import styles from "../matches/page.module.css";

type Visitor = {
  id: string;
  sourceId: string;
  name: string;
  image: string;
  timestamp: string;
};

export default function Visitors() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const { getDoc, doc: fsDoc } = await import("firebase/firestore");
        const userSnap = await getDoc(fsDoc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().isPremium) {
          setIsPremium(true);
        }
        await fetchVisitors(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchVisitors = async (uid: string) => {
    try {
      const visitorsSnapshot = await getDocs(collection(db, "users", uid, "profileViews"));
      
      const fetchedVisitors: Visitor[] = [];
      
      for (const docSnap of visitorsSnapshot.docs) {
        const data = docSnap.data();
        
        // Fetch the visitor's profile details
        const likerRef = doc(db, "users", data.sourceId);
        const likerSnap = await getDoc(likerRef);
        
        if (likerSnap.exists()) {
          const likerData = likerSnap.data();
          fetchedVisitors.push({
            id: docSnap.id,
            sourceId: data.sourceId,
            name: likerData.name || "Unknown",
            image: likerData.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            timestamp: data.timestamp
          });
        }
      }
      
      // Sort by newest
      fetchedVisitors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Deduplicate visitors (keep only the most recent view per person)
      const uniqueVisitors = fetchedVisitors.filter((v, i, a) => a.findIndex(t => (t.sourceId === v.sourceId)) === i);
      
      setVisitors(uniqueVisitors);
    } catch (error) {
      console.error("Error fetching visitors:", error);
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
      

      <div style={{ padding: "var(--spacing-lg) var(--spacing-md)", paddingBottom: "10px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px" }}>Recent Visitors 👁️</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>See who's been checking out your profile!</p>
      </div>

      {visitors.length === 0 ? (
        <div className={`glass-card ${styles.emptyState}`}>
          <div style={{ fontSize: "3rem" }}>👻</div>
          <h3>It's quiet... too quiet.</h3>
          <p>Boost your profile or swipe more to get noticed!</p>
          <Link href="/discover" className="btn-primary">Back to Discover</Link>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div className={styles.grid}>
            {visitors.map((visitor, index) => {
              const shouldBlur = !isPremium && index >= 3;
              return (
                <div 
                  key={visitor.id} 
                  className={styles.matchCard} 
                  onClick={() => shouldBlur ? router.push("/premium") : router.push("/discover")}
                  style={{
                    filter: shouldBlur ? "blur(8px)" : "none",
                    opacity: shouldBlur ? 0.7 : 1,
                    cursor: shouldBlur ? "not-allowed" : "pointer"
                  }}
                >
                  <div className={styles.imageWrapper}>
                    <img src={visitor.image} alt={visitor.name} className={styles.image} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>
                      {shouldBlur ? "Secret Admirer" : visitor.name}
                    </div>
                    <div className={styles.time} style={{ color: "var(--text-muted)" }}>
                      Viewed your profile
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {!isPremium && visitors.length > 3 && (
            <div style={{
              position: "absolute",
              bottom: "5%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.8)",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center",
              width: "90%",
              maxWidth: "400px",
              border: "1px solid #f72585",
              boxShadow: "0 10px 30px rgba(247, 37, 133, 0.4)",
              zIndex: 10
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "white" }}>See All Your Visitors</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.9rem" }}>Upgrade to Synqra Premium to instantly see everyone checking you out.</p>
              <Link href="/premium" className="btn-primary" style={{ display: "block", background: "linear-gradient(135deg, #f72585, #7209b7)", border: "none" }}>
                Unlock Premium
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
