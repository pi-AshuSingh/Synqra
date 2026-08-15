"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./onboarding.module.css";

const AURA_TAGS = [
  "Adventurous", "Creative", "Analytical", "Spontaneous", 
  "Empathetic", "Ambitious", "Chill", "Outgoing"
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
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = async () => {
    setError("");
    if (step === 1) {
      if (!name || !gender) {
        return setError("Please fill out all fields.");
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!email || !password) {
        return setError("Please enter your email and password.");
      }
      // Final step: Create user and save to Firestore
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          gender,
          bio,
          tags: selectedTags,
          createdAt: new Date().toISOString(),
          premium: false,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Placeholder for now
        });
        
        router.push("/discover");
      } catch (err: any) {
        setError(err.message || "An error occurred during signup.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="flex-center" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <div className={`glass-card ${styles.onboardingCard} animate-fade-in`}>
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {error && <div style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-gradient">Account & Basics</h2>
            <p className={styles.subtitle}>Let's set up your profile.</p>
            
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input type="text" className={styles.input} placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div className={styles.formGroup}>
              <label>I identify as</label>
              <select className={styles.input} value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="man">Man</option>
                <option value="woman">Woman</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-gradient">Your Vibe & Aura</h2>
            <p className={styles.subtitle}>Write a short bio and pick your traits.</p>
            
            <div className={styles.formGroup}>
              <label>Bio</label>
              <textarea 
                className={styles.input} 
                rows={3} 
                placeholder="I love late night drives and deep conversations..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              ></textarea>
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
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
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-gradient">Save Your Profile</h2>
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

        <div className={styles.actions}>
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
