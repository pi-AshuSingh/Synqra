"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, setDoc, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "./discover.module.css";

type Profile = {
  id: string;
  name: string;
  age?: number;
  city?: string;
  lookingFor?: string;
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
    city: "Bangalore",
    lookingFor: "Serious Relationship",
    bio: "UX Designer in Bangalore. Love masala chai, indie music, and weekend road trips.",
    tags: ["Creative", "Spontaneous", "Chill"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    distance: "5 km away"
  },
  {
    id: "mock2",
    name: "Rohan",
    age: 29,
    city: "Delhi",
    lookingFor: "Something Casual",
    bio: "Techie by day, amateur photographer by night. Looking for someone to explore Delhi cafes with.",
    tags: ["Adventurous", "Analytical", "Outgoing"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    distance: "12 km away"
  }
];

export default function Discover() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchProfiles(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProfiles = async (uid: string) => {
    try {
      // 0. Fetch current user profile to get preferences
      const userRef = doc(db, "users", uid);
      const { getDoc } = await import("firebase/firestore");
      const userSnap = await getDoc(userRef);
      const currentUserData = userSnap.data();
      const interestedIn = currentUserData?.interestedIn || "everyone";
      const minAgePref = currentUserData?.minAgePref || 18;
      const maxAgePref = currentUserData?.maxAgePref || 99;

      // 1. Fetch all previous interactions to filter them out
      const interactionsSnapshot = await getDocs(collection(db, "users", uid, "interactions"));
      const interactedIds = new Set<string>();
      interactionsSnapshot.forEach(docSnap => interactedIds.add(docSnap.id));

      // 2. Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const fetchedProfiles: Profile[] = [];
      
      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Skip current user and already interacted users and admins
        if (docSnap.id === uid || interactedIds.has(docSnap.id) || data.isAdmin === true) {
          return;
        }

        // Apply gender filtering
        if (interestedIn !== "everyone" && data.gender !== interestedIn) {
          return;
        }
        
        // Apply age filtering
        const userAge = data.age || 25;
        if (userAge < minAgePref || userAge > maxAgePref) {
          return;
        }

        fetchedProfiles.push({
          id: docSnap.id,
          name: data.name || "Unknown",
          age: data.age || 25,
          city: data.city || "",
          lookingFor: data.lookingFor || "",
          bio: data.bio || "No bio yet.",
          tags: data.tags || [],
          image: data.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          distance: "Nearby"
        });
      });
      
      // Shuffle profiles for randomness
      const shuffled = fetchedProfiles.sort(() => 0.5 - Math.random());
      
      if (shuffled.length > 0) {
        setProfiles(shuffled);
      } else {
        // Only fallback to mock if truly empty (for testing)
        setProfiles(MOCK_PROFILES);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setProfiles(MOCK_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: "pass" | "like") => {
    if (currentIndex >= profiles.length || !currentUser) return;
    
    const targetProfile = profiles[currentIndex];
    
    // Save to Firestore
    try {
      await setDoc(doc(db, "users", currentUser.uid, "interactions", targetProfile.id), {
        type: type,
        targetId: targetProfile.id,
        targetName: targetProfile.name,
        targetImage: targetProfile.image,
        timestamp: new Date().toISOString()
      });

      // If it's a 'like', also double-write to the target user's receivedLikes
      if (type === "like") {
        await setDoc(doc(db, "users", targetProfile.id, "receivedLikes", currentUser.uid), {
          sourceId: currentUser.uid,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to save interaction", err);
    }
    
    // Animate out
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
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/sparks" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Sparks ✨
          </Link>
          <Link href="/matches" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Matches
          </Link>
          <Link href="/profile" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Profile
          </Link>
        </div>
      </header>

      <div className={styles.cardContainer}>
        {currentProfile ? (
          <div className={`${styles.profileCard} ${animationClass}`} style={{ backgroundImage: `url(${currentProfile.image})` }}>
            <div className={styles.cardOverlay}>
              <div className={styles.profileInfo}>
                <div className={styles.nameAge}>
                  <h2>{currentProfile.name}, {currentProfile.age}</h2>
                  {currentProfile.city && <span className={styles.distance}>{currentProfile.city}</span>}
                </div>
                
                {currentProfile.lookingFor && (
                  <div style={{ fontSize: "0.875rem", color: "var(--primary-color)", fontWeight: 600, marginBottom: "8px" }}>
                    Looking for: {currentProfile.lookingFor}
                  </div>
                )}
                
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
            <p>Check back later for more matches.</p>
            <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: "20px" }}>
              Refresh
            </button>
          </div>
        )}
      </div>

      {currentProfile && (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.passBtn}`} onClick={() => handleAction("pass")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <button className={`${styles.actionBtn} ${styles.sparkBtn}`} onClick={() => handleAction("like")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      )}
    </main>
  );
}
