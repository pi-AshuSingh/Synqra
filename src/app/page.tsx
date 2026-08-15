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
              <label className={styles.searchLabel}>I'm looking for a</label>
              <select className={styles.searchInput}>
                <option>Woman</option>
                <option>Man</option>
              </select>
            </div>
            
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>aged</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select className={styles.searchInput} style={{ minWidth: "70px" }}>
                  <option>22</option>
                  <option>23</option>
                  <option>24</option>
                </select>
                <span style={{ color: "white", fontSize: "0.85rem" }}>to</span>
                <select className={styles.searchInput} style={{ minWidth: "70px" }}>
                  <option>27</option>
                  <option>28</option>
                  <option>29</option>
                </select>
              </div>
            </div>
            
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>of religion</label>
              <select className={styles.searchInput}>
                <option>Select</option>
                <option>Hindu</option>
                <option>Muslim</option>
                <option>Christian</option>
              </select>
            </div>
            
            <div className={styles.searchGroup}>
              <label className={styles.searchLabel}>and mother tongue</label>
              <select className={styles.searchInput}>
                <option>Select</option>
                <option>Hindi</option>
                <option>English</option>
                <option>Marathi</option>
              </select>
            </div>

            <button type="submit" className={styles.searchBtn}>Let's Begin</button>
          </form>
        </div>
      </section>

      <div className={styles.trustBanner}>
        <div className={styles.trustItem}>
          #1 Matchmaking Service
        </div>
        <div className={styles.divider}></div>
        <div className={styles.trustItem}>
          <span className={styles.stars}>★★★★★</span>
          Ratings on Playstore by 2.4 lakh users
        </div>
        <div className={styles.divider}></div>
        <div className={styles.trustItem}>
          80 Lakh Success Stories
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
            <h3>Blue Tick to find your Green Flag</h3>
            <p>Did you know our blue-tick profiles get 40% more connection requests than others?</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>Matchmaking Powered by AI</h3>
            <p>Cutting-edge technology with two decades of matchmaking expertise to help you find "the one".</p>
          </div>
        </div>
      </section>

      <section className={styles.vipSection}>
        <div className={styles.vipLeft}>
          <div className={styles.vipLogo}>▽</div>
          <div className={styles.vipText}>
            <h3>VIP SYNQRA</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>NO.1 MATCHMAKING SERVICE FOR ELITES</p>
          </div>
        </div>
        <div style={{ flex: 1, padding: "0 20px" }}>
          <p style={{ fontSize: "1.1rem", color: "#111", fontWeight: 500, marginBottom: "15px" }}>Experience the world of elite personalised matchmaking by synqra.com</p>
          <Link href="/premium" className={styles.vipBtn}>Free Consultation</Link>
        </div>
      </section>

      <section className={styles.founderSection}>
        <div className={styles.founderContent}>
          <div className={styles.quoteMark}>“</div>
          <h2 className={styles.founderQuote}>At synqra.com, it is our life's mission to use technology for good and bring back deep and meaningful relationships.</h2>
          <p className={styles.founderName}>- Ashutosh Kumar Singh, Founder & CEO</p>
        </div>
        <div className={styles.founderImgWrapper}>
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Founder" className={styles.founderImg} />
        </div>
      </section>

      <section className={styles.storiesSection}>
        <div className={styles.storiesLeft}>
          <h2>Real Stories, True Connections</h2>
          <p>Discover how synqra.com has brought together couples through meaningful connections and shared journeys. Your success story could be next!</p>
          <Link href="/login" className={styles.searchBtn} style={{ display: "inline-block", textDecoration: "none", marginTop: "10px" }}>Know more →</Link>
        </div>
        <div className={styles.storiesGrid}>
          <div className={styles.storyCard}>
            <img src="https://images.unsplash.com/photo-1583939411023-14783179e581?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Couple 1" className={styles.storyImg} />
            <div className={styles.storyContent}>
              <h3>Ajinkya & Ashwini</h3>
              <p>Thank you Synqra! I found my soulmate here. After chatting, we involved our families—now we're happily engaged!</p>
            </div>
          </div>
          <div className={styles.storyCard}>
            <img src="https://images.unsplash.com/photo-1621801306185-1845183db7ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Couple 2" className={styles.storyImg} />
            <div className={styles.storyContent}>
              <h3>Rohit & Sonam</h3>
              <p>We met on Synqra and found our perfect match. Thank you for helping me find my soulmate and begin this beautiful chapter of life!</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle} style={{ textAlign: "left", marginBottom: "30px" }}>Frequently Asked Questions</h2>
        
        {[
          { q: "Why is synqra.com better compared to other websites?", a: "Synqra.com stands out as India's leading matchmaking platform with thousands of success stories. Unlike traditional sites, we offer verified profiles, personalized matching, and advanced tools." },
          { q: "Is synqra.com a trustworthy matchmaking platform?", a: "Yes, we manually verify profiles and use AI to filter out bad actors. Your safety and privacy are our top priorities." },
          { q: "What is the difference between free vs paid membership?", a: "Free members can create a profile and browse. Paid members can initiate chats, use Incognito Mode, and Boost their profile for maximum visibility." },
          { q: "What additional benefits do I get as a Premium Member?", a: "Unlimited Swipes, Super Likes, Read Receipts, and Advanced Filters (Zodiac, Height, etc)." }
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
        <p>© 2026 Synqra Matchmaking Service. All rights reserved.</p>
      </footer>
    </main>
  );
}
