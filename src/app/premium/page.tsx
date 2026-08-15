"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import styles from "./premium.module.css";

export default function Premium() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Redirect to a Stripe Payment Link. 
    // You can generate this for free in your Stripe Dashboard > Payment Links.
    // Replace this URL with your actual payment link.
    window.location.href = "https://buy.stripe.com/test_YOUR_PAYMENT_LINK";
  };

  return (
    <main className="flex-center" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <div className={`glass-card ${styles.premiumCard} animate-fade-in`}>
        <div className={styles.header}>
          <div className="flex-center" style={{ marginBottom: "1rem" }}>
            <Logo size={48} />
          </div>
          <p>Unlock the ultimate dating experience</p>
        </div>
        
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.icon}>✨</div>
            <div>
              <h3>Unlimited Sparks</h3>
              <p>Never run out of likes. Connect with as many people as you want.</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.icon}>👀</div>
            <div>
              <h3>See Who Liked You</h3>
              <p>Skip the swiping and match instantly with people who already like you.</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.icon}>⚡</div>
            <div>
              <h3>Super Aura Boost</h3>
              <p>Be the top profile in your area for 30 minutes every week.</p>
            </div>
          </div>
        </div>
        
        <div className={styles.pricing}>
          <div className={styles.priceAmount}>₹999<span className={styles.pricePeriod}>/mo</span></div>
          <p className={styles.billingText}>Billed monthly. Cancel anytime.</p>
        </div>
        
        <button 
          className={`btn-primary ${styles.subscribeBtn}`}
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Subscribe Now"}
        </button>
        
        <div className={styles.footer}>
          <Link href="/discover" className="btn-glass" style={{ width: "100%", display: "block", textAlign: "center" }}>
            Maybe Later
          </Link>
        </div>
      </div>
    </main>
  );
}
