"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import styles from "./page.module.css";
import Link from "next/link";
import Logo from "@/components/Logo";

interface User {
  id: string;
  name: string;
  email: string;
  gender: string;
  createdAt: string;
  isAdmin?: boolean;
  verificationStatus?: string;
  isBanned?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if ((userDoc.exists() && userDoc.data().isAdmin === true) || user.email === "ashu.chhapra.br@gmail.com" || user.email === "admin.synqra@gmail.com") {
          setIsAdmin(true);
          fetchUsers();
          fetchReports();
          fetchVerificationRequests();
        } else {
          setError("Access Denied. You do not have admin privileges.");
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify admin status.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      // Sort newest first
      usersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(usersData);
    } catch (err: any) {
      setError("Failed to fetch users. Ensure you have admin access.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      const repsData: any[] = [];
      querySnapshot.forEach((doc) => {
        repsData.push({ id: doc.id, ...doc.data() });
      });
      repsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setReports(repsData);
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "verificationRequests"));
      const reqsData: any[] = [];
      querySnapshot.forEach((doc) => {
        reqsData.push({ id: doc.id, ...doc.data() });
      });
      setVerificationRequests(reqsData);
    } catch (err: any) {
      console.error("Failed to fetch verification requests:", err);
    }
  };

  const handleApproveVerification = async (reqId: string, userId: string, approved: boolean) => {
    try {
      const { updateDoc } = await import("firebase/firestore");
      // Update user document
      await updateDoc(doc(db, "users", userId), {
        verificationStatus: approved ? "verified" : "none"
      });
      // Delete the request
      await deleteDoc(doc(db, "verificationRequests", reqId));
      
      setVerificationRequests(verificationRequests.filter(r => r.id !== reqId));
      setUsers(users.map(u => u.id === userId ? { ...u, verificationStatus: approved ? "verified" : "none" } : u));
      
      alert(`Verification ${approved ? 'Approved' : 'Denied'}!`);
    } catch (err: any) {
      alert("Failed to process verification: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}'s profile from the database?`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleBanUser = async (userId: string, userName: string, isBanned: boolean = false) => {
    if (!window.confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} ${userName}?`)) {
      return;
    }
    
    try {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", userId), {
        isBanned: !isBanned
      });
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !isBanned } : u));
    } catch (err: any) {
      alert("Failed to ban/unban user: " + err.message);
    }
  };

  const handleVerifyUser = async (userId: string, currentStatus: string | undefined) => {
    try {
      const { updateDoc } = await import("firebase/firestore");
      const newStatus = currentStatus === "verified" ? "none" : "verified";
      await updateDoc(doc(db, "users", userId), {
        verificationStatus: newStatus
      });
      setUsers(users.map(u => u.id === userId ? { ...u, verificationStatus: newStatus } : u));
    } catch (err: any) {
      alert("Failed to update verification status: " + err.message);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, "reports", reportId));
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      alert("Failed to dismiss report.");
    }
  };

  const handleSeedUsers = async () => {
    if (!window.confirm("This will create 20 mock Indian profiles. Continue?")) return;
    
    setLoading(true);
    const mockUsers = [
      { name: "Rahul", username: "rahul_007", gender: "man", age: 26, city: "Mumbai", bio: "Love coffee and long drives.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
      { name: "Aarav", username: "aarav_tech", gender: "man", age: 28, city: "Delhi", bio: "Tech enthusiast and foodie.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
      { name: "Vihaan", username: "vihaan_fit", gender: "man", age: 24, city: "Bangalore", bio: "Fitness freak, always at the gym.", image: "https://images.unsplash.com/photo-1488161628813-04466f872507?auto=format&fit=crop&w=400&q=80" },
      { name: "Arjun", username: "arjun_music", gender: "man", age: 27, city: "Pune", bio: "Musician looking for my muse.", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
      { name: "Sai", username: "sai_founder", gender: "man", age: 25, city: "Hyderabad", bio: "Startup founder, hustling 24/7.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
      { name: "Rohan", username: "rohan_clicks", gender: "man", age: 29, city: "Chennai", bio: "Traveler and photographer.", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80" },
      { name: "Krishna", username: "krishna_98", gender: "man", age: 26, city: "Jaipur", bio: "Simple guy, looking for something real.", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80" },
      { name: "Aditya", username: "aditya_finance", gender: "man", age: 28, city: "Ahmedabad", bio: "Finance bro by day, gamer by night.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
      { name: "Kabir", username: "kabir_reads", gender: "man", age: 27, city: "Kolkata", bio: "Bookworm and art lover.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
      { name: "Dev", username: "dev_cars", gender: "man", age: 25, city: "Chandigarh", bio: "Car enthusiast.", image: "https://images.unsplash.com/photo-1488161628813-04466f872507?auto=format&fit=crop&w=400&q=80" },
      
      { name: "Priya", username: "priya_styles", gender: "woman", age: 24, city: "Mumbai", bio: "Fashion designer, dog mom.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Ananya", username: "ananya_ca", gender: "woman", age: 26, city: "Delhi", bio: "CA looking for someone to balance my sheets.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
      { name: "Diya", username: "diya_codes", gender: "woman", age: 23, city: "Bangalore", bio: "Software engineer, weekend hiker.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
      { name: "Riya", username: "riya_matcha", gender: "woman", age: 25, city: "Pune", bio: "Cafe hopper and matcha lover.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
      { name: "Sneha", username: "sneha_hr", gender: "woman", age: 27, city: "Hyderabad", bio: "HR by profession, therapist for friends.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80" },
      { name: "Neha", username: "neha_dance", gender: "woman", age: 28, city: "Chennai", bio: "Classical dancer and foodie.", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80" },
      { name: "Kriti", username: "kriti_arch", gender: "woman", age: 24, city: "Jaipur", bio: "Architect, obsessed with old buildings.", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80" },
      { name: "Shreya", username: "shreya_mktg", gender: "woman", age: 26, city: "Ahmedabad", bio: "Marketing guru.", image: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=400&q=80" },
      { name: "Pooja", username: "pooja_sings", gender: "woman", age: 25, city: "Kolkata", bio: "Singer and songwriter.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Tanya", username: "tanya_fit", gender: "woman", age: 27, city: "Chandigarh", bio: "Gym rat and nutritionist.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" }
    ];

    try {
      for (const u of mockUsers) {
        const fakeId = `mock_${u.username}`;
        await setDoc(doc(db, "users", fakeId), {
          ...u,
          email: `${u.username}@mock.synqra.com`,
          interestedIn: "everyone",
          lookingFor: "Serious Relationship",
          tags: ["Chill", "Empathetic"],
          minAgePref: 18,
          maxAgePref: 99,
          createdAt: new Date().toISOString(),
          premium: false,
          isAdmin: false,
          verificationStatus: "verified" // Verified so they look legit
        });
      }
      alert("Successfully seeded 20 mock users!");
      fetchUsers();
    } catch (err: any) {
      alert("Failed to seed users: " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-center" style={{ minHeight: "100vh" }}>
        <p>Loading Admin Dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ color: "#ef4444" }}>{error}</h2>
        <Link href="/discover" className="btn-primary">Return to App</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "var(--spacing-xl)", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <div className={styles.adminContainer}>
        

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{users.length}</div>
            <div className={styles.statLabel}>Total Registered Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {users.filter(u => u.isAdmin).length}
            </div>
            <div className={styles.statLabel}>Admin Users</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3>User Management</h3>
            <p style={{ color: "var(--text-muted)" }}>Manage all registered users on the platform.</p>
          </div>
          <button onClick={handleSeedUsers} className="btn-primary" style={{ fontSize: "0.8rem", padding: "8px 16px" }}>
            + Seed 20 Mock Users
          </button>
        </div>

        <div className={styles.usersTableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Verification</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {user.name}
                      {user.verificationStatus === "verified" && (
                        <div style={{ background: "#3b82f6", color: "white", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      )}
                    </div>
                    {user.isAdmin && <span className={`${styles.badge} ${styles.badgeAdmin}`} style={{ marginTop: '4px', display: 'inline-block' }}>ADMIN</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                  <td>
                    {user.verificationStatus === "pending" ? (
                      <span style={{ color: "#eab308", fontWeight: 600 }}>Pending</span>
                    ) : user.verificationStatus === "verified" ? (
                      <span style={{ color: "#3b82f6" }}>Verified</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>None</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.isBanned && <span style={{ color: "#ef4444", fontWeight: "bold", marginRight: "8px" }}>BANNED</span>}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {!user.isAdmin && (
                        <>
                          <button 
                            onClick={() => handleVerifyUser(user.id, user.verificationStatus)}
                            style={{ padding: "4px 8px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: user.verificationStatus === "verified" ? "white" : "#3b82f6", borderRadius: "4px", cursor: "pointer" }}
                          >
                            {user.verificationStatus === "verified" ? "Revoke" : "Verify"}
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleBanUser(user.id, user.name, user.isBanned)}
                            style={{ background: user.isBanned ? "var(--glass-bg)" : "" }}
                          >
                            {user.isBanned ? "Unban" : "Ban"}
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: "2rem" }}>Verification Requests</h3>
        <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
          Review pending selfie verification requests to grant the blue checkmark.
        </p>
        <div className={styles.usersTableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Selfie Link</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verificationRequests.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>{req.name} (@{req.username})</td>
                  <td>
                    <a href={req.photoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)", textDecoration: "underline" }}>View Image</a>
                  </td>
                  <td>{new Date(req.timestamp).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleApproveVerification(req.id, req.userId, true)}
                        style={{ padding: "4px 8px", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleApproveVerification(req.id, req.userId, false)}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {verificationRequests.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No pending verification requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: "2rem" }}>User Reports</h3>
        <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
          Review users that have been reported and blocked by others.
        </p>

        <div className={styles.usersTableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Reported User</th>
                <th>Reported By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td style={{ color: "#ef4444", fontWeight: 600 }}>{report.reportedName} ({report.reportedId})</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{report.reporterId}</td>
                  <td>{new Date(report.timestamp).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleDismissReport(report.id)}
                        style={{ padding: "4px 8px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Dismiss
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => {
                          handleBanUser(report.reportedId, report.reportedName, false);
                          handleDismissReport(report.id);
                        }}
                      >
                        Ban User
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {reports.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No reports found. Everyone is behaving well!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
