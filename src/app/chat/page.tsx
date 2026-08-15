"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, query, collection, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import styles from "./page.module.css";

import React, { Suspense } from "react";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  isRead?: boolean;
};

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id") as string;
  const targetName = searchParams.get("name") || "Match";
  const targetImg = searchParams.get("img") || "";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [targetVerified, setTargetVerified] = useState(false);
  const [targetOnline, setTargetOnline] = useState(false);
  const [isTargetTyping, setIsTargetTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  let typingTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser || !targetId) return;

    // Create a consistent chat ID between two users
    const chatId = currentUser.uid < targetId 
      ? `${currentUser.uid}_${targetId}` 
      : `${targetId}_${currentUser.uid}`;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMsgs = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({ id: docSnap.id, ...data } as Message);
        
        // Mark as read if I am receiving this message and it's not read yet
        if (data.senderId !== currentUser.uid && data.isRead !== true) {
          const { updateDoc } = require("firebase/firestore");
          updateDoc(doc(db, "chats", chatId, "messages", docSnap.id), { isRead: true });
        }
      });
      setMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    // Listen for target typing status
    const targetTypingRef = doc(db, "chats", chatId, "typing", targetId);
    const unsubscribeTyping = onSnapshot(targetTypingRef, (snap) => {
      if (snap.exists() && snap.data().isTyping) {
        setIsTargetTyping(true);
      } else {
        setIsTargetTyping(false);
      }
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeTyping();
    };
  }, [currentUser, targetId]);

  useEffect(() => {
    if (!targetId) return;
    const fetchTarget = async () => {
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "users", targetId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.verificationStatus === "verified") setTargetVerified(true);
        if (data.lastActive && (new Date().getTime() - new Date(data.lastActive).getTime() < 15 * 60 * 1000)) {
          setTargetOnline(true);
        }
      }
    };
    fetchTarget();
  }, [targetId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const textToSend = inputText.trim();
    setInputText("");

    const chatId = currentUser.uid < targetId 
      ? `${currentUser.uid}_${targetId}` 
      : `${targetId}_${currentUser.uid}`;

    // Clear my typing status
    setDoc(doc(db, "chats", chatId, "typing", currentUser.uid), { isTyping: false });

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: textToSend,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        isRead: false
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (!currentUser || !targetId) return;
    
    const chatId = currentUser.uid < targetId 
      ? `${currentUser.uid}_${targetId}` 
      : `${targetId}_${currentUser.uid}`;
      
    // Set typing to true
    setDoc(doc(db, "chats", chatId, "typing", currentUser.uid), { isTyping: true, updatedAt: serverTimestamp() });
    
    // Clear typing status after 2 seconds of no input
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setDoc(doc(db, "chats", chatId, "typing", currentUser.uid), { isTyping: false });
    }, 2000);
  };

  const handleUnmatch = async () => {
    if (!currentUser || !targetId) return;
    
    if (confirm(`Are you sure you want to unmatch with ${targetName}?`)) {
      try {
        const { deleteDoc, doc } = await import("firebase/firestore");
        // Delete interaction from our side
        await deleteDoc(doc(db, "users", currentUser.uid, "interactions", targetId));
        // Delete the receivedLike we sent them
        await deleteDoc(doc(db, "users", targetId, "receivedLikes", currentUser.uid));
        
        router.push("/matches");
      } catch (err) {
        console.error("Error unmatching:", err);
        alert("Failed to unmatch.");
      }
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className={styles.profileInfo} style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            {targetImg && <img src={targetImg} alt={targetName} className={styles.avatar} />}
            {targetOnline && (
              <div style={{ position: "absolute", bottom: "0", right: "0", background: "#22c55e", width: "12px", height: "12px", borderRadius: "50%", border: "2px solid var(--glass-bg)" }}></div>
            )}
          </div>
          <div className={styles.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {targetName}
            {targetVerified && (
              <div style={{ background: "#3b82f6", color: "white", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleUnmatch}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', padding: '8px' }}
        >
          Unmatch
        </button>
      </header>

      <div className={styles.chatArea}>
        {messages.length === 0 ? (
          <div className="flex-center" style={{ height: "100%", color: "var(--text-muted)", flexDirection: "column" }}>
            <p>Say hi to {targetName}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div key={msg.id} className={`${styles.messageRow} ${isMe ? styles.sent : styles.received}`}>
                <div className={styles.message}>
                  {msg.text}
                  {isMe && (
                    <div style={{ fontSize: "0.6rem", textAlign: "right", marginTop: "4px", opacity: 0.8, color: msg.isRead ? "#60a5fa" : "inherit" }}>
                      {msg.isRead ? "✓✓" : "✓"}
                    </div>
                  )}
                </div>
                <div className={styles.timestamp}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
        {isTargetTyping && (
          <div style={{ padding: "10px", color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.875rem" }}>
            {targetName} is typing...
          </div>
        )}
      </div>

      <form className={styles.inputArea} onSubmit={sendMessage}>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Say something nice..." 
          value={inputText}
          onChange={handleInputChange}
        />
        <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </main>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={<div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
