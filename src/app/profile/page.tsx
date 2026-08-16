"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Logo from "@/components/Logo";
import styles from "./page.module.css";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");

  const [height, setHeight] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [drinking, setDrinking] = useState("");
  const [smoking, setSmoking] = useState("");

  const [prompt, setPrompt] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [completionScore, setCompletionScore] = useState(0);
  
  const [isIncognito, setIsIncognito] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setBio(data.bio || "");
          setUsername(data.username || "");
          setCity(data.city || "");
          setLookingFor(data.lookingFor || "");
          setMinAge(data.minAgePref || 18);
          setMaxAge(data.maxAgePref || 99);
          
          setImage1(data.images?.[0] || data.image || "");
          setImage2(data.images?.[1] || "");
          setImage3(data.images?.[2] || "");

          setHeight(data.height || "");
          setZodiac(data.zodiac || "");
          setDrinking(data.drinking || "");
          setSmoking(data.smoking || "");

          setPrompt(data.prompt || "");
          setPromptAnswer(data.promptAnswer || "");
          
          setIsIncognito(data.isIncognito || false);

          // Calculate Completion
          let score = 0;
          if (data.image) score += 20;
          if (data.bio) score += 20;
          if (data.tags && data.tags.length > 0) score += 20;
          if (data.height || data.zodiac || data.drinking || data.smoking) score += 20;
          if (data.prompt && data.promptAnswer) score += 20;
          setCompletionScore(score);
        } else {
          // Document does not exist. Recover the account gracefully.
          const newData = {
            name: user.displayName || "New User",
            username: `user_${Math.floor(Math.random() * 10000)}`,
            email: user.email || "",
            gender: "nonbinary",
            interestedIn: "everyone",
            age: 25,
            city: "",
            lookingFor: "Casual",
            bio: "",
            tags: [],
            image: user.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            images: [user.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
            minAgePref: 18,
            maxAgePref: 99,
            createdAt: new Date().toISOString(),
            premium: false,
            isAdmin: user.email === "ashu.chhapra.br@gmail.com"
          };
          await setDoc(docRef, newData);
          
          setProfileData(newData);
          setBio("");
          setUsername(newData.username);
          setCity("");
          setLookingFor("Casual");
          setMinAge(18);
          setMaxAge(99);
          setImage1(newData.image);
          setImage2("");
          setImage3("");
          setHeight("");
          setZodiac("");
          setDrinking("");
          setSmoking("");
          setPrompt("");
          setPromptAnswer("");
          setIsIncognito(false);
          setCompletionScore(20);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;

    if (username.length < 3 || username.includes(" ")) {
      return alert("Username must be at least 3 characters and contain no spaces.");
    }

    setSaving(true);
    try {
      if (username.toLowerCase() !== profileData.username) {
        const usernameQuery = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
        const snapshot = await getDocs(usernameQuery);
        if (!snapshot.empty) {
          setSaving(false);
          return alert("This username is already taken. Please choose another one.");
        }
      }

      const newImages = [image1];
      if (image2) newImages.push(image2);
      if (image3) newImages.push(image3);

      await updateDoc(doc(db, "users", user.uid), {
        bio,
        username: username.toLowerCase(),
        city,
        lookingFor,
        minAgePref: minAge,
        maxAgePref: maxAge,
        image: image1, // fallback
        images: newImages,
        height,
        zodiac,
        drinking,
        smoking,
        prompt,
        promptAnswer,
        isIncognito
      });
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleRequestVerification = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        verificationStatus: "pending"
      });
      setProfileData({ ...profileData, verificationStatus: "pending" });
      alert("Verification request sent! An admin will review your profile.");
    } catch (err: any) {
      alert("Failed to request verification: " + err.message);
    }
  };

  const handleBoost = async () => {
    if (!user) return;
    if (!profileData?.isPremium) {
      router.push("/premium");
      return;
    }
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        boostedAt: serverTimestamp()
      });
      alert("⚡ Profile Boosted! You will be shown first to everyone for the next 30 minutes.");
    } catch (err: any) {
      alert("Failed to boost: " + err.message);
    }
  };

  const handleIncognitoToggle = async () => {
    if (!user) return;
    if (!profileData?.isPremium) {
      router.push("/premium");
      return;
    }
    const newValue = !isIncognito;
    setIsIncognito(newValue);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        isIncognito: newValue
      });
      alert(`Incognito mode is now ${newValue ? 'ON' : 'OFF'}.`);
    } catch (err: any) {
      alert("Failed to update incognito status.");
      setIsIncognito(!newValue); // revert
    }
  };

  if (loading) {
    return (
      <main className="flex-center" style={{ minHeight: "100vh" }}>
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Logo size={32} />
          <h2 className="text-gradient" style={{ margin: 0 }}>My Profile</h2>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link href="/search" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Search 🔍
          </Link>
          <Link href="/sparks" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Sparks ✨
          </Link>
          <Link href="/discover" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Discover
          </Link>
          <Link href="/matches" className="btn-glass" style={{ padding: "6px 12px", fontSize: "0.875rem" }}>
            Matches
          </Link>
        </div>
      </header>

      {profileData && (
        <div className={styles.profileCard}>
          <div className={styles.imageSection}>
            <img src={image1 || profileData.image} alt="Profile" className={styles.avatar} />
            <h3 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {profileData.name}, {profileData.age}
              {profileData.verificationStatus === "verified" && (
                <div style={{ background: "#3b82f6", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </h3>
            {profileData.username && (
              <p style={{ color: "var(--primary-color)", fontWeight: "500", marginTop: "4px" }}>@{profileData.username}</p>
            )}
            <p style={{ color: "var(--text-muted)", textTransform: "capitalize", marginTop: "4px" }}>{profileData.gender}</p>
            
            {/* Profile Completion Bar */}
            <div style={{ width: "100%", maxWidth: "300px", margin: "10px auto 0", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>Profile Completion</span>
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>{completionScore}%</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${completionScore}%`, background: "var(--primary-color)", height: "100%", borderRadius: "8px" }}></div>
              </div>
              {completionScore < 100 && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "center" }}>
                  Complete your profile to get more matches!
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
              {(!profileData.verificationStatus || profileData.verificationStatus === "none") && (
                <button 
                  onClick={handleRequestVerification}
                  className="btn-glass" 
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                >
                  Request Verification
                </button>
              )}
              <button 
                onClick={handleBoost}
                className="btn-glass" 
                style={{ fontSize: "0.8rem", padding: "6px 12px", background: "linear-gradient(45deg, #a855f7, #ec4899)", border: "none" }}
              >
                ⚡ Boost
              </button>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", cursor: "pointer" }} onClick={handleIncognitoToggle}>
                🕵️‍♂️ Incognito Mode {isIncognito ? "ON" : "OFF"}
              </label>
            </div>

            {profileData.verificationStatus === "pending" && (
              <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "#eab308", textAlign: "center" }}>Verification Pending</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Photo 1 (Primary)</label>
            <input type="url" className={styles.input} value={image1} onChange={e => setImage1(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Photo 2</label>
            <input type="url" className={styles.input} value={image2} onChange={e => setImage2(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Photo 3</label>
            <input type="url" className={styles.input} value={image3} onChange={e => setImage3(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Username</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>@</span>
              <input type="text" className={styles.input} style={{ paddingLeft: "30px" }} value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <input 
              type="text" 
              className={styles.input} 
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Looking For</label>
            <select 
              className={styles.input} 
              value={lookingFor}
              onChange={e => setLookingFor(e.target.value)}
            >
              <option value="">Select Intention</option>
              <option value="Marriage">Marriage</option>
              <option value="Serious Relationship">Serious Relationship</option>
              <option value="Casual">Casual</option>
              <option value="Just Friends">Just Friends</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className={styles.formGroup}>
              <label>Height</label>
              <input type="text" className={styles.input} value={height} onChange={e => setHeight(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Zodiac</label>
              <select className={styles.input} value={zodiac} onChange={e => setZodiac(e.target.value)}>
                <option value="">Select</option>
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
            <div className={styles.formGroup}>
              <label>Drinking</label>
              <select className={styles.input} value={drinking} onChange={e => setDrinking(e.target.value)}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="Sometimes">Sometimes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Smoking</label>
              <select className={styles.input} value={smoking} onChange={e => setSmoking(e.target.value)}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="Sometimes">Sometimes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Bio</label>
            <textarea 
              className={styles.input} 
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
            ></textarea>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--primary-color)" }}>Icebreaker Prompt</h3>
            <div className={styles.formGroup}>
              <select className={styles.input} value={prompt} onChange={e => setPrompt(e.target.value)} style={{ marginBottom: "10px" }}>
                <option value="">Select a prompt</option>
                <option value="Two truths and a lie...">Two truths and a lie...</option>
                <option value="I geek out on...">I geek out on...</option>
                <option value="My simple pleasures...">My simple pleasures...</option>
                <option value="A random fact I love is...">A random fact I love is...</option>
                <option value="First round is on me if...">First round is on me if...</option>
              </select>
              <textarea 
                className={styles.input} 
                rows={2}
                placeholder="Write your answer..."
                value={promptAnswer}
                onChange={e => setPromptAnswer(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
              Voice Prompt (Premium)
            </h3>
            <div className={styles.formGroup} style={{ opacity: profileData?.isPremium ? 1 : 0.6 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "12px" }}>
                <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: profileData?.isPremium ? "var(--primary-color)" : "#4b5563", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: profileData?.isPremium ? "pointer" : "not-allowed" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "24px", flex: 1 }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: `${Math.max(10, Math.random() * 24)}px`, background: profileData?.isPremium ? "var(--primary-color)" : "#4b5563", borderRadius: "2px", opacity: 0.7 }} />
                  ))}
                </div>
                {!profileData?.isPremium && (
                  <button onClick={(e) => { e.preventDefault(); router.push("/premium"); }} style={{ fontSize: "0.7rem", padding: "4px 8px", background: "linear-gradient(45deg, #a855f7, #ec4899)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Unlock
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Min Age Pref</label>
              <input 
                type="number" 
                className={styles.input} 
                value={minAge}
                onChange={e => setMinAge(parseInt(e.target.value))}
                min="18" max="99"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Max Age Pref</label>
              <input 
                type="number" 
                className={styles.input} 
                value={maxAge}
                onChange={e => setMaxAge(parseInt(e.target.value))}
                min="18" max="99"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Tags (Not editable)</label>
            <div className={styles.tags}>
              {profileData.tags?.map((tag: string) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn-glass" onClick={handleLogout} style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>
              Log Out
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
