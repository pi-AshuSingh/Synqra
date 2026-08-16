"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<"user" | "admin">("user");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill out all fields.");
    
    setLoading(true);
    setError("");
    
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (loginRole === "admin") {
        if ((userDoc.exists() && userDoc.data().isAdmin === true) || userCredential.user.email === "ashu.chhapra.br@gmail.com") {
          router.push("/admin");
        } else {
          await auth.signOut();
          setError("Access Denied: You do not have Admin privileges.");
        }
      } else {
        router.push("/discover");
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithPopup(auth, provider);
      
      const { doc, getDoc, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: userCredential.user.displayName || "New User",
          username: `user_${Math.floor(Math.random() * 10000)}`,
          email: userCredential.user.email || "",
          gender: "nonbinary",
          interestedIn: "everyone",
          age: 25,
          city: "",
          lookingFor: "Casual",
          bio: "",
          tags: [],
          image: userCredential.user.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          images: [userCredential.user.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          minAgePref: 18,
          maxAgePref: 99,
          createdAt: new Date().toISOString(),
          premium: false,
          isAdmin: userCredential.user.email === "ashu.chhapra.br@gmail.com"
        });
      }
      
      if (loginRole === "admin") {
        if (userCredential.user.email === "ashu.chhapra.br@gmail.com" || (userDoc.exists() && userDoc.data()?.isAdmin === true)) {
          router.push("/admin");
        } else {
          await auth.signOut();
          setError("Access Denied: You do not have Admin privileges.");
        }
      } else {
        router.push("/discover");
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <main className="flex-center" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <div className={`glass-card ${styles.loginCard} animate-fade-in`}>
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <h2 className="text-gradient">Welcome Back</h2>
          <p>Sign in to your Synqra account</p>
        </div>
        
        {error && <div style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
        
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "4px", marginBottom: "1.5rem" }}>
          <button 
            type="button"
            onClick={() => setLoginRole("user")}
            style={{ flex: 1, padding: "8px", background: loginRole === "user" ? "var(--primary-color)" : "transparent", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: loginRole === "user" ? "bold" : "normal", transition: "all 0.2s" }}
          >
            User
          </button>
          <button 
            type="button"
            onClick={() => setLoginRole("admin")}
            style={{ flex: 1, padding: "8px", background: loginRole === "admin" ? "var(--primary-color)" : "transparent", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: loginRole === "admin" ? "bold" : "normal", transition: "all 0.2s" }}
          >
            Admin
          </button>
        </div>
        
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>or continue with</span>
        </div>
        
        <button className={styles.socialBtn} onClick={handleGoogleLogin}>
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Google
        </button>
        
        <p className={styles.footer}>
          Don't have an account? <Link href="/onboarding" className="text-gradient">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
