"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import styles from "./onboarding.module.css";
import Logo from "@/components/Logo";

const AURA_TAGS = [
  "Adventurous", "Creative", "Analytical", "Spontaneous", 
  "Empathetic", "Ambitious", "Chill", "Outgoing"
];

const LOOKING_FOR_OPTIONS = [
  "Serious Relationship",
  "Something Casual",
  "New Friends",
  "Not Sure Yet"
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Profile state
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [interestedIn, setInterestedIn] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Photo state
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUrl2, setPhotoUrl2] = useState("");
  const [photoUrl3, setPhotoUrl3] = useState("");

  // Advanced state
  const [height, setHeight] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [drinking, setDrinking] = useState("");
  const [smoking, setSmoking] = useState("");

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Removed handlePhotoChange

  const handleNext = async () => {
    setError("");
    
    if (step === 1) {
      if (!name || !gender || !interestedIn || !age || !city || !lookingFor) {
        return setError("Please fill out all fields.");
      }
      if (parseInt(age) < 18) {
        return setError("You must be at least 18 years old.");
      }
      setStep(2);
    } 
    else if (step === 2) {
      if (!photoUrl) {
        return setError("Please add a profile photo URL.");
      }
      if (!bio) {
        return setError("Please write a short bio.");
      }
      setStep(3);
    } 
    else if (step === 3) {
      if (!email || !password) {
        return setError("Please enter your email and password.");
      }
      
      setLoading(true);
      try {
        // 1. Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        // 2. We skip Firebase Storage since it requires a credit card.
        // We use the image URL they pasted, or a fallback.
        let finalImageUrl1 = photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
        let imagesArray = [finalImageUrl1];
        if (photoUrl2) imagesArray.push(photoUrl2);
        if (photoUrl3) imagesArray.push(photoUrl3);
        
        // 3. Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          gender,
          interestedIn,
          age: parseInt(age),
          city,
          lookingFor,
          bio,
          tags: selectedTags,
          image: finalImageUrl1, // Legacy fallback
          images: imagesArray,
          height,
          zodiac,
          drinking,
          smoking,
          minAgePref: 18,
          maxAgePref: 99,
          createdAt: new Date().toISOString(),
          premium: false,
          isAdmin: false
        });
        
        router.push("/discover");
      } catch (err: any) {
        setError(err.message || "An error occurred during signup.");
        setLoading(false);
      }
    }
  };

  return (
    <main className="flex-center" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)", padding: "var(--spacing-lg)" }}>
      <div className={`glass-card ${styles.onboardingCard} animate-fade-in`} style={{ maxWidth: "500px", width: "100%" }}>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <Logo size={40} />
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {error && <div style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center", background: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px" }}>{error}</div>}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-gradient">The Basics</h2>
            <p className={styles.subtitle}>Who are you and what are you looking for?</p>
            
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input type="text" className={styles.input} placeholder="Aisha" value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Age</label>
                <input type="number" className={styles.input} placeholder="24" value={age} onChange={e => setAge(e.target.value)} min="18" max="99" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Gender</label>
                <select className={styles.input} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="man">Man</option>
                  <option value="woman">Woman</option>
                  <option value="nonbinary">Non-binary</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <label>Interested In</label>
              <select className={styles.input} value={interestedIn} onChange={e => setInterestedIn(e.target.value)}>
                <option value="">Select</option>
                <option value="man">Men</option>
                <option value="woman">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>City</label>
              <input type="text" className={styles.input} placeholder="Mumbai" value={city} onChange={e => setCity(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>I'm looking for...</label>
              <select className={styles.input} value={lookingFor} onChange={e => setLookingFor(e.target.value)}>
                <option value="">Select connection type</option>
                {LOOKING_FOR_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-gradient">Your Vibe</h2>
            <p className={styles.subtitle}>Add a profile photo and write a bio.</p>
            
            <div className={styles.formGroup}>
              <label>Profile Image URL (Primary)</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Paste an image link here (e.g. from Instagram)" 
                value={photoUrl} 
                onChange={e => setPhotoUrl(e.target.value)} 
              />
              {photoUrl && (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <img src={photoUrl} alt="Preview" style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-color)" }} />
                </div>
              )}
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
              <label>Additional Photo URL 2 (Optional)</label>
              <input type="url" className={styles.input} placeholder="https://example.com/photo2.jpg" value={photoUrl2} onChange={e => setPhotoUrl2(e.target.value)} />
              {photoUrl2 && (
                <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                  <img src={photoUrl2} alt="Preview 2" style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--glass-border)" }} />
                </div>
              )}
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
              <label>Additional Photo URL 3 (Optional)</label>
              <input type="url" className={styles.input} placeholder="https://example.com/photo3.jpg" value={photoUrl3} onChange={e => setPhotoUrl3(e.target.value)} />
              {photoUrl3 && (
                <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                  <img src={photoUrl3} alt="Preview 3" style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--glass-border)" }} />
                </div>
              )}
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
              <label>Bio</label>
              <textarea 
                className={styles.input} 
                rows={3} 
                placeholder="I love late night drives and deep conversations..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              ></textarea>
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
              <label>Pick up to 3 traits</label>
              <div className={styles.tagsContainer} style={{ marginTop: "0.5rem" }}>
                {AURA_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagSelected : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--primary-color)" }}>Advanced (Optional)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className={styles.formGroup}>
                  <label>Height</label>
                  <input type="text" className={styles.input} placeholder="e.g. 5'9&quot;" value={height} onChange={e => setHeight(e.target.value)} />
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
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-gradient">Save Profile</h2>
            <p className={styles.subtitle}>Create an account to save your progress.</p>
            
            <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
              <label>Email</label>
              <input type="email" className={styles.input} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" className={styles.input} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
        )}

        <div className={styles.actions} style={{ marginTop: "2rem" }}>
          {step > 1 && (
            <button className="btn-glass" onClick={() => setStep(step - 1)} disabled={loading}>Back</button>
          )}
          <button 
            className={`btn-primary ${styles.nextBtn}`} 
            onClick={handleNext}
            style={{ marginLeft: step === 1 ? 'auto' : '0' }}
            disabled={loading}
          >
            {loading ? "Saving..." : (step === 3 ? "Complete Profile" : "Continue")}
          </button>
        </div>
      </div>
    </main>
  );
}
