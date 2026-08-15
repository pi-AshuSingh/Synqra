"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ClientPresence() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            lastActive: new Date().toISOString()
          });
        } catch (e) {
          console.error("Failed to update presence:", e);
        }
      }
    });

    // Optionally update every 5 minutes if they leave the app open
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            lastActive: new Date().toISOString()
          });
        } catch (e) {
          // ignore
        }
      }
    }, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return null;
}
