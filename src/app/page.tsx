"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Logo from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Logo size={32} />
        <div className={styles.navLinks}>
          <a href="#about" className={styles.navLink}>About us</a>
          <a href="#help" className={styles.navLink}>Help</a>
          <Link href="/login" className={styles.loginBtn}>Login ⌵</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Choose Your Forever</h1>
          <p className={styles.heroSubtitle}>Find love on your terms with millions of verified profiles</p>
          
          <form className={styles.searchWidget} onSubmit={handleSearch}>
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>I want to meet</label>
              <select className={styles.searchInput}>
                <option>Women</option>
                <option>Men</option>
                <option>Everyone</option>
              </select>
            </div>
            
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>Age range</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select className={styles.searchInput} style={{ minWidth: "70px" }}>
                  <option>18</option>
                  <option>22</option>
                  <option>25</option>
                </select>
                <span style={{ color: "white", fontSize: "0.85rem" }}>to</span>
                <select className={styles.searchInput} style={{ minWidth: "70px" }}>
                  <option>27</option>
                  <option>35</option>
                  <option>50+</option>
                </select>
              </div>
            </div>
            
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>Distance</label>
              <select className={styles.searchInput}>
                <option>Up to 10 miles</option>
                <option>Up to 25 miles</option>
                <option>Up to 50 miles</option>
                <option>Anywhere</option>
              </select>
            </div>
            
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>Looking for</label>
              <select className={styles.searchInput}>
                <option>Serious Relationship</option>
                <option>Casual Dating</option>
                <option>Just Friends</option>
                <option>Not sure yet</option>
              </select>
            </div>

            <button type="submit" className={styles.searchBtn}>Let's Begin</button>
          </form>
        </div>
      </section>

      <div className={styles.trustBanner}>
        <div className={styles.trustItem}>
          Exclusive Matchmaking Experience
        </div>
        <div className={styles.divider}></div>
        <div className={styles.trustItem}>
          <span className={styles.stars}>✨✨✨✨✨</span>
          Highly Rated by Our Early Members
        </div>
        <div className={styles.divider}></div>
        <div className={styles.trustItem}>
          Real Connections, Verified Profiles
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The Synqra Experience</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>₹</div>
            <h3>30 Day Money Back Guarantee</h3>
            <p>Get matched with someone special within 30 days, or we'll refund your money—guaranteed!</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✓</div>
            <h3>Intention-based Matching</h3>
            <p>See exactly what people are looking for up front—whether it's a serious relationship, casual dating, or just friends.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>Premium Privacy</h3>
            <p>Use Incognito mode to browse completely hidden. Only the people you swipe right on will ever see your profile.</p>
          </div>
        </div>
      </section>

      <section className={styles.vipSection}>
        <div className={styles.vipLeft}>
          <div className={styles.vipLogo}>▽</div>
          <div className={styles.vipText}>
            <h3>SYNQRA PREMIUM</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>MAXIMIZE YOUR DATING EXPERIENCE</p>
          </div>
        </div>
        <div style={{ flex: 1, padding: "0 20px" }}>
          <p style={{ fontSize: "1.1rem", color: "#111", fontWeight: 500, marginBottom: "15px" }}>Experience the world of elite personalized matchmaking and exclusive privacy by Synqra.</p>
          <Link href="/premium" className={styles.vipBtn}>Upgrade Now</Link>
        </div>
      </section>

      <section id="about" className={styles.founderSection}>
        <div className={styles.founderContent}>
          <div className={styles.quoteMark}>“</div>
          <h2 className={styles.founderQuote}>At Synqra, it is our mission to use technology to bring back deep and meaningful relationships.</h2>
          <p className={styles.founderName}>- Ashutosh Kumar Singh, Founder</p>
        </div>
        <div className={styles.founderImgWrapper}>
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Founder" className={styles.founderImg} />
        </div>
      </section>

      <section className={styles.storiesSection}>
        <div className={styles.storiesLeft}>
          <h2>Real Connections, Deep Conversations</h2>
          <p>Discover how Synqra brings together compatible individuals through our AI-driven aura matching and dating intentions.</p>
          <Link href="/login" className={styles.searchBtn} style={{ display: "inline-block", textDecoration: "none", marginTop: "10px" }}>Know more →</Link>
        </div>
        <div className={styles.storiesGrid}>
          <div className={styles.storyCard}>
            <img src="https://images.unsplash.com/photo-1583939411023-14783179e581?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Couple 1" className={styles.storyImg} />
            <div className={styles.storyContent}>
              <h3>A Match Made in Synqra</h3>
              <p>We met on Synqra and immediately connected over our shared interests and similar dating intentions. Best decision ever!</p>
            </div>
          </div>
          <div className={styles.storyCard}>
            <img src="https://images.unsplash.com/photo-1621801306185-1845183db7ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Couple 2" className={styles.storyImg} />
            <div className={styles.storyContent}>
              <h3>Meaningful Conversations</h3>
              <p>Synqra's matching system helped me find someone who actually aligned with my values. No more pointless swiping.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="help" className={styles.faqSection}>
        <h2 className={styles.sectionTitle} style={{ textAlign: "left", marginBottom: "30px" }}>Frequently Asked Questions</h2>
        
        {[
          { q: "Why is Synqra better compared to other dating apps?", a: "Synqra focuses on quality over quantity. With features like Aura matching, clear Dating Intentions, and Incognito mode, we prioritize meaningful connections and privacy." },
          { q: "Is Synqra a trustworthy platform?", a: "Yes. Our platform uses Google Firebase for secure authentication and data protection to keep your information safe." },
          { q: "What is the difference between free vs paid membership?", a: "Free members can create a profile and browse. Paid members get access to Incognito Mode, advanced filters (Zodiac, Drinking, Smoking), and maximum profile visibility." },
          { q: "What additional benefits do I get as a Premium Member?", a: "Premium members unlock exclusive privacy features, advanced filtering options, and priority matching." }
        ].map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <div className={styles.faqHeader} onClick={() => toggleFaq(index)}>
              <div className={styles.faqQuestion}>
                <span className={styles.faqNumber}>0{index + 1}</span>
                {faq.q}
              </div>
              <div className={styles.faqIcon}>{openFaq === index ? "−" : "+"}</div>
            </div>
            {openFaq === index && (
              <div className={styles.faqContent}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>© 2026 Synqra Dating App. All rights reserved.</p>
      </footer>
    </main>
  );
}
