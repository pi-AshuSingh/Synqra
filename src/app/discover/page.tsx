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
  images?: string[];
  verificationStatus?: string;
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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [canRewind, setCanRewind] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [isPremium, setIsPremium] = useState(false);
  const [superLikesUsed, setSuperLikesUsed] = useState(0);

  // Reset indices when search city changes
  useEffect(() => {
    setCurrentIndex(0);
    setCurrentPhotoIndex(0);
  }, [searchCity]);

  // Reset photo index when swiping to new profile
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [currentIndex]);

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
      const userBlockedList = currentUserData?.blockedUsers || [];
      setBlockedIds(new Set(userBlockedList));
      if (currentUserData?.isPremium) {
        setIsPremium(true);
      }

      // 1. Fetch all previous interactions to filter them out
      const interactionsSnapshot = await getDocs(collection(db, "users", uid, "interactions"));
      const interactedIds = new Set<string>();
      interactionsSnapshot.forEach(docSnap => interactedIds.add(docSnap.id));

      // 2. Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const fetchedProfiles: Profile[] = [];
      
      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Skip current user, already interacted users, blocked users, and admins
        if (docSnap.id === uid || interactedIds.has(docSnap.id) || data.isAdmin === true || userBlockedList.includes(docSnap.id)) {
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
          images: data.images || [data.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          verificationStatus: data.verificationStatus || "none",
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

  const handleAction = async (type: "pass" | "like" | "super_like") => {
    if (currentIndex >= profiles.length || !currentUser) return;
    
    if (type === "super_like" && !isPremium && superLikesUsed >= 1) {
      if (confirm("You have used your free Super Like for today! Upgrade to Premium for unlimited Super Likes.")) {
        router.push("/premium");
      }
      return;
    }

    if (type === "super_like") {
      setSuperLikesUsed(prev => prev + 1);
    }
    
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

      // If it's a 'like' or 'super_like', also double-write to the target user's receivedLikes
      if (type === "like" || type === "super_like") {
        await setDoc(doc(db, "users", targetProfile.id, "receivedLikes", currentUser.uid), {
          sourceId: currentUser.uid,
          type: type,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to save interaction", err);
    }
    
    // Enable rewind if it was a pass
    if (type === "pass") {
      setCanRewind(true);
    } else {
      setCanRewind(false);
    }

    // Animate out (super like animates up)
    if (type === "super_like") {
      setAnimationClass(styles.slideUp);
    } else {
      setAnimationClass(type === "pass" ? styles.slideLeft : styles.slideRight);
    }
    
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

  const handleRewind = async () => {
    if (!canRewind || currentIndex <= 0 || !currentUser) return;
    
    const previousIndex = currentIndex - 1;
    const targetProfile = profiles[previousIndex];

    try {
      // Delete the 'pass' interaction from Firestore
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", currentUser.uid, "interactions", targetProfile.id));
      
      // Go back
      setCurrentIndex(previousIndex);
      setCanRewind(false);
      setAnimationClass("");
    } catch (err) {
      console.error("Failed to rewind", err);
    }
  };

  const cyclePhoto = (direction: "left" | "right") => {
    if (!currentProfile || !currentProfile.images) return;
    
    const maxIndex = currentProfile.images.length - 1;
    if (direction === "left") {
      setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  const handleBlock = async () => {
    if (currentIndex >= profiles.length || !currentUser) return;
    
    const targetProfile = filteredProfiles[currentIndex];
    if (!targetProfile) return;

    if (confirm(`Are you sure you want to block ${targetProfile.name}? They will no longer appear in your feed.`)) {
      try {
        const { updateDoc, arrayUnion } = await import("firebase/firestore");
        await updateDoc(doc(db, "users", currentUser.uid), {
          blockedUsers: arrayUnion(targetProfile.id)
        });
        
        // Also report them
        await setDoc(doc(db, "reports", `${currentUser.uid}_${targetProfile.id}`), {
          reporterId: currentUser.uid,
          reportedId: targetProfile.id,
          reportedName: targetProfile.name,
          timestamp: new Date().toISOString(),
          status: "pending"
        });

        alert("User blocked and reported.");
        
        // Skip this user
        setAnimationClass(styles.slideLeft);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setAnimationClass("");
        }, 300);
      } catch (err) {
        console.error("Error blocking user:", err);
      }
    }
  };

  const filteredProfiles = profiles.filter(p => !searchCity || p.city?.toLowerCase().includes(searchCity.toLowerCase()));
  const currentProfile = currentIndex >= 0 && currentIndex < filteredProfiles.length ? filteredProfiles[currentIndex] : null;

  if (loading) {
    return (
      <main className={styles.container}>
        <div className="flex-center" style={{ height: "100%" }}>
           <div className={styles.pulseRing}></div>
        </div>
      </main>
    );
  }


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

      <div style={{ padding: "10px 20px" }}>
        <input 
          type="text" 
          placeholder="Search by city (e.g. Bangalore)..." 
          value={searchCity}
          onChange={e => setSearchCity(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "white" }}
        />
      </div>

      <div className={styles.cardContainer}>
        {currentProfile ? (
          <div className={`${styles.profileCard} ${animationClass}`}>
            <img 
              src={currentProfile.images?.[currentPhotoIndex] || currentProfile.image} 
              alt={currentProfile.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 0 }}
            />
            
            {/* Photo Navigation Overlays */}
            <div 
              style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "80%", zIndex: 1, cursor: "pointer" }}
              onClick={() => cyclePhoto("left")}
            />
            <div 
              style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "80%", zIndex: 1, cursor: "pointer" }}
              onClick={() => cyclePhoto("right")}
            />

            {/* Photo Indicators */}
            {currentProfile.images && currentProfile.images.length > 1 && (
              <div style={{ position: "absolute", top: "10px", left: 0, right: 0, display: "flex", gap: "4px", padding: "0 10px", zIndex: 2 }}>
                {currentProfile.images.map((_, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      flex: 1, 
                      height: "4px", 
                      background: i === currentPhotoIndex ? "white" : "rgba(255,255,255,0.4)",
                      borderRadius: "2px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
                    }}
                  />
                ))}
              </div>
            )}

            <div className={styles.cardOverlay} style={{ zIndex: 2, pointerEvents: "none" }}>
              <div className={styles.profileInfo}>
                <div className={styles.nameAge} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ margin: 0 }}>{currentProfile.name}, {currentProfile.age}</h2>
                    {currentProfile.verificationStatus === "verified" && (
                      <div style={{ background: "#3b82f6", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleBlock(); }}
                    style={{ pointerEvents: "auto", background: "rgba(0,0,0,0.5)", border: "none", color: "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Block
                  </button>
                </div>
                {currentProfile.city && <div className={styles.distance} style={{ marginBottom: "8px" }}>{currentProfile.city}</div>}
                
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
          <button 
            className={`${styles.actionBtn}`} 
            onClick={handleRewind}
            disabled={!canRewind}
            style={{ 
              color: canRewind ? "#eab308" : "#9ca3af", 
              borderColor: canRewind ? "rgba(234, 179, 8, 0.3)" : "var(--glass-border)",
              cursor: canRewind ? "pointer" : "not-allowed"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          </button>
          
          <button className={`${styles.actionBtn} ${styles.passBtn}`} onClick={() => handleAction("pass")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <button className={`${styles.actionBtn} ${styles.superBtn}`} onClick={() => handleAction("super_like")} style={{ color: "#3b82f6", borderColor: "rgba(59, 130, 246, 0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>

          <button className={`${styles.actionBtn} ${styles.sparkBtn}`} onClick={() => handleAction("like")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      )}
    </main>
  );
}
