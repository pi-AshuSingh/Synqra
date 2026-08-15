"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
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
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
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
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
          fetchUsers();
          fetchReports();
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
        <header className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Logo size={40} />
            <h2>Admin Dashboard</h2>
          </div>
          <Link href="/discover" className="btn-glass">Exit Admin</Link>
        </header>

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

        <h3>User Management</h3>
        <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
          Manage all registered users on the platform.
        </p>

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
                    <div style={{ display: "flex", gap: "8px" }}>
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
                          handleDeleteUser(report.reportedId, report.reportedName);
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
