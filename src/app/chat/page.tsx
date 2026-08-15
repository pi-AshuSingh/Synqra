"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import styles from "./page.module.css";

import React, { Suspense } from "react";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
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
  const chatEndRef = useRef<HTMLDivElement>(null);

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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [currentUser, targetId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const textToSend = inputText.trim();
    setInputText("");

    const chatId = currentUser.uid < targetId 
      ? `${currentUser.uid}_${targetId}` 
      : `${targetId}_${currentUser.uid}`;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: textToSend,
        senderId: currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className={styles.profileInfo}>
          {targetImg && <img src={targetImg} alt={targetName} className={styles.avatar} />}
          <div className={styles.name}>{targetName}</div>
        </div>
      </header>

      <div className={styles.chatArea}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "2rem" }}>
            This is the start of your conversation with {targetName}.
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.senderId === currentUser?.uid;
            return (
              <div key={msg.id} className={`${styles.messageRow} ${isSent ? styles.sent : styles.received}`}>
                <div className={styles.message}>
                  {msg.text}
                </div>
                <div className={styles.timestamp}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={sendMessage}>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Say something nice..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
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
