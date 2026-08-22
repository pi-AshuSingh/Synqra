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
  reaction?: string;
  type?: "text" | "date_proposal";
  metadata?: any;
};

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id") as string;
  const targetName = searchParams.get("name") || "Match";
  const targetImg = searchParams.get("img") || "";
  const targetUsername = searchParams.get("username") || "";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [targetVerified, setTargetVerified] = useState(false);
  const [targetOnline, setTargetOnline] = useState(false);
  const [targetLookingFor, setTargetLookingFor] = useState("");
  const [isTargetTyping, setIsTargetTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateLocation, setDateLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
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
        if (data.lookingFor) setTargetLookingFor(data.lookingFor);
        if (data.lastActive && (new Date().getTime() - new Date(data.lastActive).getTime() < 15 * 60 * 1000)) {
          setTargetOnline(true);
        }
      }
    };
    fetchTarget();
    
    // Update my lastActive
    if (currentUser) {
      const updateMyActive = async () => {
        const { updateDoc } = await import("firebase/firestore");
        try {
          await updateDoc(doc(db, "users", currentUser.uid), { lastActive: serverTimestamp() });
        } catch (e) {}
      };
      updateMyActive();
    }
  }, [targetId, currentUser]);

  const hasTargetReplied = messages.some(m => m.senderId === targetId);
  const myMessagesCount = messages.filter(m => m.senderId === currentUser?.uid).length;
  const isBlocked = !hasTargetReplied && myMessagesCount >= 5;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || isBlocked) return;

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
      setInputText("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const sendDateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !targetId || !dateLocation || !dateTime) return;
    const chatId = currentUser.uid < targetId ? `${currentUser.uid}_${targetId}` : `${targetId}_${currentUser.uid}`;
    
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: `📅 Date Proposal: ${dateLocation} @ ${dateTime}`,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        isRead: false,
        type: "date_proposal",
        metadata: { location: dateLocation, time: dateTime }
      });
      setShowDateModal(false);
      setDateLocation("");
      setDateTime("");
    } catch (err) {
      console.error("Error sending date proposal", err);
    }
  };

  const handleDoubleClickMessage = async (msgId: string) => {
    if (!currentUser || !targetId) return;
    const chatId = currentUser.uid < targetId 
      ? `${currentUser.uid}_${targetId}` 
      : `${targetId}_${currentUser.uid}`;
      
    try {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "chats", chatId, "messages", msgId), {
        reaction: "❤️"
      });
    } catch (err) {
      console.error("Error adding reaction:", err);
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

  const generateIcebreaker = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const prompts = [
        `Hey ${targetName}, if you could instantly teleport anywhere right now, where would we go?`,
        `Quick question for you ${targetName}: what's the most controversial food opinion you have?`,
        `Okay ${targetName}, two truths and a lie. Go!`,
        `I have a theory that everyone has a secret useless talent. What's yours, ${targetName}?`,
        `Hey ${targetName}! What's the best thing that happened to you this week?`,
        ...(targetLookingFor ? [`So ${targetName}, I see you're looking for "${targetLookingFor}". What's your biggest green flag?`] : []),
        `I asked my AI Wingman what to say to ${targetName} and it told me to just be myself. How am I doing so far? ✨`
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setInputText(randomPrompt);
      setIsGenerating(false);
    }, 1500);
  };

  const handleReportMessage = async (msgId: string, text: string) => {
    if (!confirm("Are you sure you want to report this message?")) return;
    try {
      await addDoc(collection(db, "reports"), {
        reporterId: currentUser.uid,
        reportedUserId: targetId,
        messageId: msgId,
        messageText: text,
        type: "message",
        timestamp: serverTimestamp()
      });
      alert("Message reported successfully.");
    } catch (err) {
      console.error("Error reporting message:", err);
    }
  };

  const handleUnmatch = async () => {
    if (!currentUser || !targetId) return;
    
    if (confirm(`Are you sure you want to unmatch and block ${targetName}?`)) {
      try {
        const { deleteDoc, doc, updateDoc, arrayUnion } = await import("firebase/firestore");
        // Delete interaction from our side
        await deleteDoc(doc(db, "users", currentUser.uid, "interactions", targetId));
        // Delete the receivedLike we sent them
        await deleteDoc(doc(db, "users", targetId, "receivedLikes", currentUser.uid));
        
        // Add to blockedUsers array
        await updateDoc(doc(db, "users", currentUser.uid), {
          blockedUsers: arrayUnion(targetId)
        });
        
        router.push("/matches");
      } catch (err) {
        console.error("Error unmatching:", err);
        alert("Failed to unmatch.");
      }
    }
  };

  return (
    <main className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px", background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)", gap: "12px", position: "sticky", top: 0, zIndex: 10 }}>
        {targetImg && <img src={targetImg} alt={targetName} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            {targetName} {targetVerified && <span style={{ color: "#3b82f6", fontSize: "0.9rem" }}>✓</span>}
          </h2>
          {targetOnline && <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" }}></div> Online</span>}
        </div>
      </div>

      {targetLookingFor && (
        <div style={{ background: "var(--bg-secondary)", padding: "8px", textAlign: "center", fontSize: "0.85rem", color: "var(--primary-color)", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ fontWeight: 600 }}>{targetName} is looking for:</span> {targetLookingFor}
        </div>
      )}

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
                <div 
                  className={styles.message} 
                  onDoubleClick={() => !isMe && handleDoubleClickMessage(msg.id)}
                  style={{ position: "relative", cursor: !isMe ? "pointer" : "default" }}
                  title={!isMe ? "Double click to heart" : ""}
                >
                  {msg.type === "date_proposal" ? (
                    <div style={{ background: "var(--glass-bg)", border: "1px solid var(--primary-color)", borderRadius: "12px", padding: "12px", minWidth: "200px" }}>
                      <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: "8px" }}>📅</div>
                      <div style={{ fontWeight: "bold", textAlign: "center", marginBottom: "4px" }}>Date Proposal</div>
                      <div style={{ fontSize: "0.9rem", margin: "4px 0" }}><strong>Where:</strong> {msg.metadata?.location}</div>
                      <div style={{ fontSize: "0.9rem", margin: "4px 0" }}><strong>When:</strong> {msg.metadata?.time}</div>
                    </div>
                  ) : (
                    msg.text
                  )}
                  {msg.reaction && (
                    <div style={{ position: "absolute", bottom: "-10px", right: "-10px", background: "white", borderRadius: "50%", padding: "2px", fontSize: "0.8rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                      {msg.reaction}
                    </div>
                  )}
                  {isMe && (
                    <div style={{ fontSize: "0.6rem", textAlign: "right", marginTop: "4px", opacity: 0.8, color: msg.isRead ? "#60a5fa" : "inherit" }}>
                      {msg.isRead ? "✓✓" : "✓"}
                    </div>
                  )}
                </div>
                <div className={styles.timestamp} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                  {!isMe && (
                    <button 
                      onClick={() => handleReportMessage(msg.id, msg.text)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", opacity: 0.5 }}
                      title="Report message"
                    >
                      🚩
                    </button>
                  )}
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
        {isBlocked ? (
          <div style={{ width: "100%", padding: "10px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            You've reached the 5-message limit. Wait for {targetName} to reply!
          </div>
        ) : (
          <>
            <button 
              type="button" 
              className={styles.icebreakerBtn}
              onClick={() => setShowDateModal(true)}
              title="Propose Date"
            >
              📅
            </button>
            <button 
              type="button" 
              className={styles.icebreakerBtn}
              onClick={generateIcebreaker}
              disabled={isGenerating}
              title="AI Wingman"
            >
              {isGenerating ? "..." : "✨"}
            </button>
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
          </>
        )}
      </form>

      {/* Date Proposal Modal */}
      {showDateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg-color)", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "400px", border: "1px solid var(--glass-border)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary-color)" }}>📅 Propose a Date</h3>
            <form onSubmit={sendDateProposal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px" }}>Location / Activity</label>
                <input 
                  type="text" 
                  value={dateLocation} 
                  onChange={(e) => setDateLocation(e.target.value)} 
                  placeholder="e.g. Starbucks on 5th Ave" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--bg-secondary)", color: "var(--text-color)" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px" }}>Date & Time</label>
                <input 
                  type="text" 
                  value={dateTime} 
                  onChange={(e) => setDateTime(e.target.value)} 
                  placeholder="e.g. Friday @ 6:00 PM" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--bg-secondary)", color: "var(--text-color)" }}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowDateModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
