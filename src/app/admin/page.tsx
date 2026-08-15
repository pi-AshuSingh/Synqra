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
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
                <th>Gender</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.name}
                    {user.isAdmin && <span className={`${styles.badge} ${styles.badgeAdmin}`} style={{ marginLeft: '8px' }}>ADMIN</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                  <td style={{ textTransform: "capitalize" }}>{user.gender}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!user.isAdmin && (
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        Delete
                      </button>
                    )}
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
      </div>
    </main>
  );
}
