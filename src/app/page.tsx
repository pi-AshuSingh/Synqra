import Link from "next/link";
import styles from "./page.module.css";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Logo size={32} />
        <Link href="/login" className="btn-glass">Log In</Link>
      </nav>

      {/* Decorative background elements */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className="container flex-center" style={{ minHeight: "100vh", position: "relative", zIndex: 10 }}>
        <div className={`glass-card ${styles.heroCard} animate-fade-in delay-1`}>
          <div className="animate-float" style={{ marginBottom: "2rem" }}>
            <Logo size={80} />
          </div>
          <h1 className={styles.title}>
            Discover your <br />
            <span className="text-aura">Perfect Sync</span>
          </h1>
          <p className={styles.subtitle}>
            Synqra is an exclusive dating platform where deep connections happen by design, not by chance. Meet people who truly align with your aura.
          </p>
          
          <div className={styles.ctaGroup}>
            <Link href="/onboarding" className="btn-primary">
              Join Synqra
            </Link>
            <Link href="/login" className="btn-glass">
              Sign In
            </Link>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10k+</span>
              <span className={styles.statLabel}>Active Matches</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Success Rate</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
