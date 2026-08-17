"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, setDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
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
  height?: string;
  zodiac?: string;
  mbti?: string;
  currentVibe?: string;
  drinking?: string;
  smoking?: string;
  spotifyAnthem?: string;
  matchScore?: number;
  prompt?: string;
  promptAnswer?: string;
  isBoosted?: boolean;
  isNewHere?: boolean;
  matchReasons?: { label: string, points: number, icon: string }[];
  isTopPick?: boolean;
};

// Fallback mock profiles in case Firestore is empty or not configured yet
const MOCK_PROFILES: Profile[] = [
  {
    id: "mock_priya_styles",
    name: "Priya",
    age: 24,
    city: "Mumbai",
    lookingFor: "Serious Relationship",
    bio: "Fashion designer, dog mom. Love masala chai and weekend road trips.",
    tags: ["Creative", "Fashion", "Chill"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    distance: "5 km away",
    matchScore: 92,
    verificationStatus: "verified"
  },
  {
    id: "mock_rahul_007",
    name: "Rahul",
    age: 26,
    city: "Mumbai",
    lookingFor: "Something Casual",
    bio: "Techie by day, amateur photographer by night. Looking for someone to explore cafes with.",
    tags: ["Photography", "Tech", "Coffee"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    distance: "12 km away",
    matchScore: 88,
    verificationStatus: "verified"
  },
  {
    id: "mock_ananya_ca",
    name: "Ananya",
    age: 26,
    city: "Delhi",
    lookingFor: "Serious Relationship",
    bio: "CA looking for someone to balance my sheets. Always up for a coffee date.",
    tags: ["Finance", "Coffee", "Fitness"],
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    distance: "2 km away",
    matchScore: 95,
    verificationStatus: "verified"
  },
  {
    id: "mock_aarav_tech",
    name: "Aarav",
    age: 28,
    city: "Delhi",
    lookingFor: "Marriage",
    bio: "Tech enthusiast and foodie. Let's debate which pizza topping is best.",
    tags: ["Foodie", "Tech", "Introvert"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    distance: "8 km away",
    matchScore: 80,
    verificationStatus: "verified"
  }
];

export default function Discover() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
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

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterZodiac, setFilterZodiac] = useState("");
  const [filterDrinking, setFilterDrinking] = useState("");
  const [filterSmoking, setFilterSmoking] = useState("");

  const [showMatchModal, setShowMatchModal] = useState<Profile | null>(null);
  const [showSuperLikeModal, setShowSuperLikeModal] = useState(false);
  const [superLikeNote, setSuperLikeNote] = useState("");

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (blockedIds.has(p.id)) return false;
      if (searchCity && !p.city?.toLowerCase().includes(searchCity.toLowerCase())) return false;
      if (filterZodiac && p.zodiac !== filterZodiac) return false;
      if (filterDrinking && p.drinking !== filterDrinking) return false;
      if (filterSmoking && p.smoking !== filterSmoking) return false;
      return true;
    });
  }, [profiles, blockedIds, searchCity, filterZodiac, filterDrinking, filterSmoking]);

  const currentProfile = useMemo(() => currentIndex >= 0 && currentIndex < filteredProfiles.length ? filteredProfiles[currentIndex] : null, [currentIndex, filteredProfiles]);

  // Reset indices when search or filters change
  useEffect(() => {
    setCurrentIndex(0);
    setCurrentPhotoIndex(0);
  }, [searchCity, filterZodiac, filterDrinking, filterSmoking]);

  // Reset photo index when swiping to new profile
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [currentIndex]);

  // Track profile views (Feature: Who Viewed My Profile)
  useEffect(() => {
    if (!currentProfile || isGuest || !currentUser) return;
    
    const timer = setTimeout(async () => {
      try {
        const { setDoc, doc: fsDoc } = await import("firebase/firestore");
        await setDoc(fsDoc(db, "users", currentProfile.id, "profileViews", currentUser.uid), {
          sourceId: currentUser.uid,
          timestamp: new Date().toISOString()
        });
        
        // Push notification for view
        await setDoc(fsDoc(db, "users", currentProfile.id, "notifications", `view_${currentUser.uid}`), {
          type: "view",
          sourceId: currentUser.uid,
          sourceImage: currentUser.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          title: "New Visitor",
          body: "Someone viewed your profile!",
          timestamp: new Date().toISOString(),
          read: false
        });
      } catch (err) {
        console.error("Failed to register profile view", err);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [currentProfile?.id, currentUser, isGuest]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuest(false);
        await fetchProfiles(user.uid);
      } else {
        setCurrentUser(null);
        setIsGuest(true);
        setProfiles(MOCK_PROFILES);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProfiles = async (uid: string) => {
    try {
      // 0. Fetch current user profile to get preferences
      const userRef = doc(db, "users", uid);
      const { getDoc, updateDoc } = await import("firebase/firestore");
      const userSnap = await getDoc(userRef);
      const currentUserData = userSnap.data();
      
      // Auto-recover Admin for the creator
      if (currentUserData?.email === "ashu.chhapra.br@gmail.com" && currentUserData?.isAdmin !== true) {
        await updateDoc(userRef, { isAdmin: true, lastActive: serverTimestamp() });
        if (currentUserData) currentUserData.isAdmin = true;
      } else {
        // Just update last active
        await updateDoc(userRef, { lastActive: serverTimestamp() });
      }
      
      const interestedIn = currentUserData?.interestedIn || "everyone";
      const minAgePref = currentUserData?.minAgePref || 18;
      const maxAgePref = currentUserData?.maxAgePref || 99;
      const userBlockedList = currentUserData?.blockedUsers || [];
      
      if (currentUserData?.isPremium && currentUserData?.travelCity && !searchCity) {
        setSearchCity(currentUserData.travelCity);
      }

      setBlockedIds(new Set(userBlockedList));
      if (currentUserData?.isPremium) {
        setIsPremium(true);
      }

      // 1. Fetch all previous interactions to filter them out
      const interactionsSnapshot = await getDocs(collection(db, "users", uid, "interactions"));
      const interactedIds = new Set<string>();
      interactionsSnapshot.forEach(docSnap => interactedIds.add(docSnap.id));

      // 1.5 Fetch all users who liked the current user (for Incognito bypass)
      const receivedLikesSnapshot = await getDocs(collection(db, "users", uid, "receivedLikes"));
      const usersWhoLikedMe = new Set<string>();
      receivedLikesSnapshot.forEach(docSnap => usersWhoLikedMe.add(docSnap.id));

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

        // Apply Incognito filtering
        if (data.isIncognito) {
          if (!usersWhoLikedMe.has(docSnap.id)) {
            return; // Hide this user if they are incognito and haven't liked me
          }
        }

        // Calculate Compatibility Score
        let score = 50; // Base score
        const reasons: { label: string, points: number, icon: string }[] = [];
        
        reasons.push({ label: "Base Compatibility", points: 50, icon: "🔥" });

        const targetTags = data.tags || [];
        const myTags = currentUserData?.tags || [];
        
        // +10 for each overlapping tag
        const overlappingTags = targetTags.filter((t: string) => myTags.includes(t));
        if (overlappingTags.length > 0) {
          const points = overlappingTags.length * 10;
          score += points;
          reasons.push({ label: `Shared Interests (${overlappingTags.join(', ')})`, points, icon: "🧩" });
        }

        // Age proximity (closer is better, max +20)
        const ageDiff = Math.abs((currentUserData?.age || 25) - userAge);
        if (ageDiff <= 2) { score += 20; reasons.push({ label: "Age Proximity (Within 2 years)", points: 20, icon: "🕰️" }); }
        else if (ageDiff <= 5) { score += 10; reasons.push({ label: "Age Proximity (Within 5 years)", points: 10, icon: "🕰️" }); }
        else if (ageDiff <= 10) { score += 5; reasons.push({ label: "Age Proximity (Within 10 years)", points: 5, icon: "🕰️" }); }

        // Cap at 99
        if (score > 99) score = 99;

        // Check New Here (last 7 days)
        let isNewHere = false;
        if (data.createdAt) {
          const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (new Date().getTime() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
            isNewHere = true;
          }
        }

        // Check Boosted (last 30 minutes)
        let isBoosted = false;
        if (data.boostedAt) {
          const boostedDate = data.boostedAt.toDate ? data.boostedAt.toDate() : new Date(data.boostedAt);
          if (new Date().getTime() - boostedDate.getTime() < 30 * 60 * 1000) {
            isBoosted = true;
          }
        }

        fetchedProfiles.push({
          id: docSnap.id,
          name: data.name || "Unknown",
          age: userAge,
          city: data.city || "",
          lookingFor: data.lookingFor || "",
          bio: data.bio || "No bio yet.",
          tags: targetTags,
          image: data.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          images: data.images || [data.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          verificationStatus: data.verificationStatus || "none",
          distance: "Nearby",
          height: data.height,
          zodiac: data.zodiac,
          mbti: data.mbti,
          currentVibe: data.currentVibe,
          drinking: data.drinking || "",
          smoking: data.smoking || "",
          spotifyAnthem: data.spotifyAnthem || "",
          prompt: data.prompt || "",
          promptAnswer: data.promptAnswer || "",
          matchScore: score,
          matchReasons: reasons,
          isBoosted,
          isNewHere
        });
      });
      
      // Identify Top 3 Picks based on matchScore
      const sortedByScore = [...fetchedProfiles].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      const top3Ids = new Set(sortedByScore.slice(0, 3).map(p => p.id));
      
      fetchedProfiles.forEach(p => {
        if (top3Ids.has(p.id)) {
          p.isTopPick = true;
        }
      });
      
      // Shuffle profiles for randomness, but put Top Picks and Boosted profiles first
      const shuffled = fetchedProfiles.sort((a, b) => {
        if (a.isTopPick && !b.isTopPick) return -1;
        if (!a.isTopPick && b.isTopPick) return 1;
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        return 0.5 - Math.random();
      });
      
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
    if (currentIndex >= profiles.length) return;
    
    if (isGuest) {
      if (type === "like" || type === "super_like") {
        if (confirm("Log in to connect and send likes!")) {
          router.push("/login");
        }
        return;
      }
    }
    
    if (!currentUser && !isGuest) return;
    
    if (type === "super_like" && !isPremium && superLikesUsed >= 1 && !isGuest) {
      if (confirm("You have used your free Super Like for today! Upgrade to Premium for unlimited Super Likes.")) {
        router.push("/premium");
      }
      return;
    }

    if (type === "super_like" && !isGuest) {
      setShowSuperLikeModal(true);
      return;
    }

    await executeAction(type);
  };

  const submitSuperLike = async () => {
    setShowSuperLikeModal(false);
    setSuperLikesUsed(prev => prev + 1);
    await executeAction("super_like", superLikeNote);
    setSuperLikeNote("");
  };

  const executeAction = async (type: "pass" | "like" | "super_like", note?: string) => {
    const targetProfile = profiles[currentIndex];
    
    // Save to Firestore if authenticated
    if (!isGuest && currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "interactions", targetProfile.id), {
          type: type,
          targetId: targetProfile.id,
          targetName: targetProfile.name,
          targetImage: targetProfile.image,
          note: note || "",
          timestamp: new Date().toISOString()
        });

        if (type === "like" || type === "super_like") {
          await setDoc(doc(db, "users", targetProfile.id, "receivedLikes", currentUser.uid), {
            sourceId: currentUser.uid,
            type: type,
            note: note || "",
            timestamp: new Date().toISOString()
          });

          // Push notification for like/super_like
          await setDoc(doc(db, "users", targetProfile.id, "notifications", `like_${currentUser.uid}`), {
            type: type,
            sourceId: currentUser.uid,
            sourceImage: currentUser.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: type === "super_like" ? "Super Like!" : "New Like!",
            body: type === "super_like" ? (note ? `They said: "${note}"` : "Someone Super Liked you!") : "Someone liked you!",
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      } catch (err) {
        console.error("Failed to save interaction", err);
      }
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
    if (!canRewind || currentIndex <= 0) return;
    
    const previousIndex = currentIndex - 1;
    
    if (isGuest) {
      setCurrentIndex(previousIndex);
      setCanRewind(false);
      setAnimationClass("");
      return;
    }

    if (!currentUser) return;
    
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
    if (currentIndex >= profiles.length) return;
    
    if (isGuest) {
      if (confirm("Log in to block or report users!")) {
        router.push("/login");
      }
      return;
    }

    if (!currentUser) return;
    
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
          if (currentIndex < filteredProfiles.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnimationClass("");
          } else {
            setCurrentIndex(-1);
          }
        }, 300);
      } catch (err) {
        console.error("Error blocking user:", err);
      }
    }
  };

  const handleFilterChange = (setter: any, value: string) => {
    if (isGuest) {
      if (confirm("Log in to use Advanced Filtering and find your perfect match!")) {
        router.push("/login");
      }
      return;
    }
    
    if (!isPremium) {
      if (confirm("Advanced Filtering is a Premium feature! Upgrade now to find your perfect match.")) {
        router.push("/premium");
      }
      return;
    }
    setter(value);
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


  return (
    <main className={styles.container}>


      <div style={{ padding: "10px 20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Search by city..." 
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "white" }}
          />
          <button 
            className="btn-glass" 
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding: "0 15px", borderRadius: "8px", border: showFilters ? "1px solid var(--primary-color)" : "1px solid var(--glass-border)" }}
          >
            Filters ⚡
          </button>
        </div>

        {showFilters && (
          <div style={{ marginTop: "10px", padding: "12px", background: "rgba(20,20,25,0.8)", borderRadius: "8px", border: "1px solid var(--primary-color)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Zodiac</label>
              <select value={filterZodiac} onChange={(e) => handleFilterChange(setFilterZodiac, e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", fontSize: "0.85rem" }}>
                <option value="">Any</option>
                <option value="Aries">Aries</option>
                <option value="Taurus">Taurus</option>
                <option value="Gemini">Gemini</option>
                <option value="Cancer">Cancer</option>
                <option value="Leo">Leo</option>
                <option value="Virgo">Virgo</option>
                <option value="Libra">Libra</option>
                <option value="Scorpio">Scorpio</option>
                <option value="Sagittarius">Sagittarius</option>
                <option value="Capricorn">Capricorn</option>
                <option value="Aquarius">Aquarius</option>
                <option value="Pisces">Pisces</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Drinking</label>
              <select value={filterDrinking} onChange={(e) => handleFilterChange(setFilterDrinking, e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", fontSize: "0.85rem" }}>
                <option value="">Any</option>
                <option value="Yes">Yes</option>
                <option value="Sometimes">Sometimes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Smoking</label>
              <select value={filterSmoking} onChange={(e) => handleFilterChange(setFilterSmoking, e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", fontSize: "0.85rem" }}>
                <option value="">Any</option>
                <option value="Yes">Yes</option>
                <option value="Sometimes">Sometimes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        )}
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
                {currentProfile.images.map((_: string, i: number) => (
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
                    {currentProfile.isNewHere && (
                      <span style={{ background: "linear-gradient(45deg, #10b981, #34d399)", color: "white", padding: "2px 6px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: "bold" }}>
                        🌱 New Here
                      </span>
                    )}
                    {currentProfile.isBoosted && (
                      <span style={{ background: "linear-gradient(45deg, #a855f7, #ec4899)", color: "white", padding: "2px 6px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: "bold" }}>
                        ⚡ Boosted
                      </span>
                    )}
                    {currentProfile.isTopPick && (
                      <span style={{ background: "linear-gradient(45deg, #fbbf24, #d97706)", color: "white", padding: "2px 6px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: "bold" }}>
                        ⭐ Top Pick
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleBlock(); }}
                    style={{ pointerEvents: "auto", background: "rgba(0,0,0,0.5)", border: "none", color: "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Block
                  </button>
                </div>
                {currentProfile.currentVibe && (
                  <div style={{ position: "absolute", top: "-20px", left: "0", background: "rgba(255,255,255,0.9)", color: "#1f2937", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 10 }}>
                    {currentProfile.currentVibe}
                  </div>
                )}
                
                {currentProfile.city && <div className={styles.distance} style={{ marginBottom: "8px" }}>{currentProfile.city}</div>}
                
                {currentProfile.spotifyAnthem && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1DB95420", color: "#1DB954", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600", marginBottom: "8px" }}>
                    <span>🎵</span> My Anthem: {currentProfile.spotifyAnthem}
                  </div>
                )}

                {currentProfile.lookingFor && (
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ 
                      background: currentProfile.lookingFor === "Marriage" ? "linear-gradient(45deg, #fbbf24, #d97706)" : 
                                  currentProfile.lookingFor === "Serious Relationship" ? "linear-gradient(45deg, #f43f5e, #be123c)" :
                                  currentProfile.lookingFor === "Casual" ? "linear-gradient(45deg, #a855f7, #7e22ce)" :
                                  "linear-gradient(45deg, #3b82f6, #1d4ed8)",
                      color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" 
                    }}>
                      🎯 {currentProfile.lookingFor}
                    </span>
                  </div>
                )}
                
                <p className={styles.bio}>{currentProfile.bio}</p>
                
                <div className={styles.tags}>
                  {currentProfile.tags.map((tag: string) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>

                {currentProfile.prompt && currentProfile.promptAnswer && (
                <div 
                  className={styles.promptCard} 
                  style={{ marginTop: "1rem", cursor: "pointer", transition: "transform 0.2s" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSuperLikeNote(`Re: ${currentProfile.promptAnswer}`);
                    setShowSuperLikeModal(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div className={styles.promptQuestion} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{currentProfile.prompt}</span>
                    <span style={{ fontSize: "0.8rem", color: "#3b82f6", background: "rgba(59, 130, 246, 0.2)", padding: "2px 8px", borderRadius: "12px" }}>Reply ✨</span>
                  </div>
                  <div className={styles.promptAnswer}>{currentProfile.promptAnswer}</div>
                </div>
              )}

                {/* Audio Prompt Player */}
                <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "10px", width: "fit-content" }}>
                  <button style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-color)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "16px" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} style={{ width: "3px", height: `${Math.max(4, Math.random() * 16)}px`, background: "white", borderRadius: "2px", opacity: 0.7 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "4px" }}>0:05</span>
                </div>

                {/* Advanced Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                  {currentProfile.matchScore && (
                    <span 
                      onClick={(e) => { e.stopPropagation(); setShowMatchModal(currentProfile); }}
                      style={{ cursor: "pointer", background: "rgba(34, 197, 94, 0.2)", border: "1px solid #22c55e", color: "#22c55e", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700 }}
                    >
                      {currentProfile.matchScore}% Match ℹ️
                    </span>
                  )}
                  {currentProfile.height && (
                    <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      📏 {currentProfile.height}
                    </span>
                  )}
                  {currentProfile.zodiac && (
                    <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✨ {currentProfile.zodiac}
                    </span>
                  )}
                  {currentProfile.mbti && (
                    <span style={{ background: "linear-gradient(45deg, #3b82f6, #a855f7)", color: "white", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
                      🧠 {currentProfile.mbti}
                    </span>
                  )}
                  {currentProfile.drinking && (
                    <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      🍷 {currentProfile.drinking}
                    </span>
                  )}
                  {currentProfile.smoking && (
                    <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      🚬 {currentProfile.smoking}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`glass-card ${styles.emptyState}`}>
            <div className={styles.pulseRing}></div>
            {isGuest ? (
              <>
                <h3>Want to see more?</h3>
                <p>Join Synqra to unlock thousands of profiles and find your perfect match!</p>
                <Link href="/login" className="btn-primary" style={{ marginTop: "20px", display: "inline-block", textDecoration: "none" }}>
                  Log In / Sign Up
                </Link>
              </>
            ) : (
              <>
                <h3>You've seen everyone!</h3>
                <p>Check back later for more matches.</p>
                <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: "20px" }}>
                  Refresh
                </button>
              </>
            )}
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
      
      {showMatchModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowMatchModal(null)}>
          <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "100%", color: "white" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#22c55e" }}>{showMatchModal.matchScore}% Match</span> with {showMatchModal.name}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {showMatchModal.matchReasons?.map((reason, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "10px 12px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{reason.icon}</span>
                    <span style={{ fontSize: "0.9rem" }}>{reason.label}</span>
                  </div>
                  <span style={{ color: "#22c55e", fontWeight: "bold" }}>+{reason.points}</span>
                </div>
              ))}
            </div>
            
            <button 
              className="btn-primary" 
              onClick={() => setShowMatchModal(null)} 
              style={{ width: "100%", marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Super Like Modal */}
      {showSuperLikeModal && currentProfile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "24px", position: "relative" }}>
            <h3 style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              Super Like {currentProfile.name}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
              Stand out by attaching a message to your Super Like!
            </p>
            <textarea 
              value={superLikeNote}
              onChange={(e) => setSuperLikeNote(e.target.value)}
              placeholder="e.g., I love your dog! What breed is it?"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "white", minHeight: "100px", marginBottom: "16px" }}
              maxLength={150}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-glass" onClick={() => { setShowSuperLikeModal(false); setSuperLikeNote(""); }}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={submitSuperLike}
                style={{ background: "linear-gradient(45deg, #3b82f6, #2563eb)" }}
              >
                Send Super Like
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
