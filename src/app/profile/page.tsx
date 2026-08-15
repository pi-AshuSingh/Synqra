"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  const [city, setCity] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");

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
          setCity(data.city || "");
          setLookingFor(data.lookingFor || "");
          setMinAge(data.minAgePref || 18);
          setMaxAge(data.maxAgePref || 99);
          
          setImage1(data.images?.[0] || data.image || "");
          setImage2(data.images?.[1] || "");
          setImage3(data.images?.[2] || "");
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
    setSaving(true);
    try {
      const newImages = [image1];
      if (image2) newImages.push(image2);
      if (image3) newImages.push(image3);

      await updateDoc(doc(db, "users", user.uid), {
        bio,
        city,
        lookingFor,
        minAgePref: minAge,
        maxAgePref: maxAge,
        image: image1, // fallback
        images: newImages
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
        <div style={{ display: "flex", gap: "10px" }}>
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
            <p style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{profileData.gender}</p>
            
            {(!profileData.verificationStatus || profileData.verificationStatus === "none") && (
              <button 
                onClick={handleRequestVerification}
                className="btn-glass" 
                style={{ marginTop: "10px", fontSize: "0.8rem", padding: "4px 8px" }}
              >
                Request Verification
              </button>
            )}
            {profileData.verificationStatus === "pending" && (
              <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "#eab308" }}>Verification Pending</div>
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
              <option value="Serious Relationship">Serious Relationship</option>
              <option value="Something Casual">Something Casual</option>
              <option value="New Friends">New Friends</option>
              <option value="Not Sure Yet">Not Sure Yet</option>
            </select>
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
