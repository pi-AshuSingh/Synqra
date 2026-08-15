"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "./discover.module.css";

type Profile = {
  id: string;
  name: string;
  age?: number;
  bio: string;
  tags: string[];
  image: string;
  distance?: string;
};

// Fallback mock profiles in case Firestore is empty or not configured yet
const MOCK_PROFILES: Profile[] = [
  {
    id: "mock1",
    name: "Aisha",
    age: 26,
    bio: "UX Designer in Bangalore. Love masala chai, indie music, and weekend road trips.",
    tags: ["Creative", "Spontaneous", "Chill"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    distance: "5 km away"
  },
  {
    id: "mock2",
    name: "Rohan",
    age: 29,
    bio: "Techie by day, amateur photographer by night. Looking for someone to explore Delhi cafes with.",
    tags: ["Adventurous", "Analytical", "Outgoing"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    distance: "12 km away"
  }
];

export default function Discover() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(10));
        const querySnapshot = await getDocs(q);
        
        const fetchedProfiles: Profile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProfiles.push({
            id: doc.id,
            name: data.name || "Unknown",
            age: data.age || 25,
            bio: data.bio || "No bio yet.",
            tags: data.tags || [],
            image: data.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            distance: "Nearby"
          });
        });
        
        if (fetchedProfiles.length > 0) {
          setProfiles(fetchedProfiles);
        } else {
          setProfiles(MOCK_PROFILES);
        }
      } catch (error) {
        console.error("Error fetching users, falling back to mock:", error);
        setProfiles(MOCK_PROFILES);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleAction = (type: "pass" | "spark") => {
    // Here you would typically save the swipe to Firestore matches collection
    
    setAnimationClass(type === "pass" ? styles.slideLeft : styles.slideRight);
    
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setAnimationClass("");
      } else {
        // No more profiles
        setCurrentIndex(-1);
      }
    }, 300);
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className="flex-center" style={{ height: "100%" }}>
           <div className={styles.pulseRing}></div>
        </div>
      </main>
    );
  }

  const currentProfile = currentIndex >= 0 && currentIndex < profiles.length ? profiles[currentIndex] : null;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Logo size={28} />
        <Link href="/premium" className={styles.premiumBadge}>
          Get Plus
        </Link>
      </header>

      <div className={styles.cardContainer}>
        {currentProfile ? (
          <div className={`${styles.profileCard} ${animationClass}`} style={{ backgroundImage: `url(${currentProfile.image})` }}>
            <div className={styles.cardOverlay}>
              <div className={styles.profileInfo}>
                <div className={styles.nameAge}>
                  <h2>{currentProfile.name}, {currentProfile.age}</h2>
                  <span className={styles.distance}>{currentProfile.distance}</span>
                </div>
                
                <p className={styles.bio}>{currentProfile.bio}</p>
                
                <div className={styles.tags}>
                  {currentProfile.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`glass-card ${styles.emptyState}`}>
            <div className={styles.pulseRing}></div>
            <h3>You've seen everyone!</h3>
            <p>Expand your distance or check back later for more matches.</p>
            <button className="btn-glass" onClick={() => setCurrentIndex(0)} style={{ marginTop: "20px" }}>
              Reset Discover
            </button>
          </div>
        )}
      </div>

      {currentProfile && (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.passBtn}`} onClick={() => handleAction("pass")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <button className={`${styles.actionBtn} ${styles.sparkBtn}`} onClick={() => handleAction("spark")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      )}
    </main>
  );
}
