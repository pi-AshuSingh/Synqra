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

type Spark = {
  id: string;
  sourceId: string;
  name: string;
  image: string;
  type?: string;
  timestamp: string;
};

export default function Sparks() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
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
            type: data.type || "like",
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
        <div style={{ position: "relative" }}>
          <div className={styles.grid}>
            {sparks.map((spark, index) => {
              const shouldBlur = !isPremium && index > 0;
              return (
                <div 
                  key={spark.id} 
                  className={styles.matchCard} 
                  onClick={() => shouldBlur ? router.push("/premium") : router.push("/discover")}
                  style={{
                    ...(spark.type === "super_like" ? { border: "2px solid #3b82f6", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" } : {}),
                    filter: shouldBlur ? "blur(8px)" : "none",
                    opacity: shouldBlur ? 0.7 : 1,
                    cursor: shouldBlur ? "not-allowed" : "pointer"
                  }}
                >
                  <div className={styles.imageWrapper}>
                    <img src={spark.image} alt={spark.name} className={styles.image} />
                    {spark.type === "super_like" && !shouldBlur && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", background: "#3b82f6", borderRadius: "50%", padding: "4px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>
                      {shouldBlur ? "Hidden Admirer" : spark.name}
                    </div>
                    <div className={styles.time} style={{ color: spark.type === "super_like" ? "#3b82f6" : "inherit" }}>
                      {spark.type === "super_like" ? "Super Liked you!" : "Match with them in Discover!"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {!isPremium && sparks.length > 1 && (
            <div style={{
              position: "absolute",
              bottom: "10%",
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
              <h3 style={{ margin: "0 0 10px 0", color: "white" }}>See All Your Admirers</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.9rem" }}>Upgrade to Synqra Premium to instantly see everyone who likes you.</p>
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
