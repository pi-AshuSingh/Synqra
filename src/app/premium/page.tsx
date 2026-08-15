"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "./premium.module.css";

export default function Premium() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().isPremium) {
          setIsPremium(true);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpgrade = async () => {
    if (!currentUser) return;
    
    // In a real app, this would redirect to a Stripe checkout session.
    // For this prototype, we'll just mock the payment success.
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        isPremium: true
      });
      setIsPremium(true);
      alert("Payment Successful! Welcome to Synqra Premium ✨");
    } catch (err: any) {
      alert("Failed to upgrade: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-center" style={{ minHeight: "100vh" }}>
        <p>Loading...</p>
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
          <Link href="/profile" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Profile
          </Link>
        </div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Synqra Premium</h1>
        <p className={styles.subtitle}>Unlock the full experience and find your perfect match faster.</p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <div>
              <div className={styles.featureTitle}>See Who Liked You</div>
              <div className={styles.featureDesc}>Don't wait for a match. Instantly see everyone who has swiped right on you in the Sparks tab.</div>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div>
              <div className={styles.featureTitle}>Unlimited Super Likes</div>
              <div className={styles.featureDesc}>Stand out from the crowd with unlimited Super Likes to let them know you're really interested.</div>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21L21.5 8"></path></svg>
            </div>
            <div>
              <div className={styles.featureTitle}>Unlimited Rewinds</div>
              <div className={styles.featureDesc}>Accidentally swiped left? Take it back and give them a second chance.</div>
            </div>
          </div>
        </div>

        {isPremium ? (
          <div style={{ background: "rgba(247, 37, 133, 0.1)", border: "1px solid #f72585", padding: "16px 32px", borderRadius: "100px", color: "#f72585", fontWeight: 700, fontSize: "1.25rem" }}>
            You are a Premium Member ✨
          </div>
        ) : (
          <button className={styles.upgradeBtn} onClick={handleUpgrade}>
            Upgrade Now - ₹999/mo
          </button>
        )}
      </div>
    </main>
  );
}
