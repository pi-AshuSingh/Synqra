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
          <Link href="/login" className={styles.joinBtn}>Join Now</Link>
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

      {/* PHONE DEMO SECTION */}
      <section className={styles.phoneDemoSection}>
        <div className={styles.phoneDemoText}>
          <h2>Swipe into your next great story</h2>
          <p>
            Experience dating like never before. With Synqra's intuitive swipe gestures, you can browse verified profiles tailored just for you. Send a Spark, or use a Super Spark to attach a personalized note.
          </p>
          <Link href="/login" className={styles.searchBtn} style={{ textDecoration: "none" }}>
            Try it now
          </Link>
        </div>

        <div className={styles.phoneMockup}>
          <div className={styles.phoneHeader}>Synqra</div>
          <div className={styles.phoneNotch}></div>
          <div className={styles.phoneScreen}>
            <div className={styles.phoneCard}>
              <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Demo Profile" className={styles.phoneCardImg} />
              <div className={styles.phoneCardInfo}>
                <div className={styles.phoneCardName}>Priya, 26</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "5px" }}>📍 Mumbai • Creative</div>
              </div>
              <div className={styles.phoneCardActions}>
                <div className={styles.phoneActionBtn}>✕</div>
                <div className={styles.phoneActionBtn} style={{ color: "#3b82f6" }}>⭐</div>
                <div className={styles.phoneActionBtn} style={{ color: "#ec4899" }}>❤️</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Removed fake stats section to maintain authenticity */}

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

      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepIcon}>✍️</div>
            <h3>Create Profile</h3>
            <p>Tell us about your authentic self, your interests, and what you are truly looking for.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepIcon}>✨</div>
            <h3>Find Sparks</h3>
            <p>Connect with verified individuals based on shared intentions and deep compatibility.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepIcon}>🥂</div>
            <h3>Meet Up</h3>
            <p>Take the conversation offline and build a meaningful relationship safely.</p>
          </div>
        </div>
      </section>

      <section className={styles.marqueeSection}>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeContent}>
            <span className={styles.badge}>☕ Coffee Lover</span>
            <span className={styles.badge}>✈️ World Traveler</span>
            <span className={styles.badge}>🎨 Art Enthusiast</span>
            <span className={styles.badge}>🎸 Live Music</span>
            <span className={styles.badge}>🐕 Dog Parent</span>
            <span className={styles.badge}>🧘‍♀️ Mindfulness</span>
            <span className={styles.badge}>🧗‍♂️ Bouldering</span>
            <span className={styles.badge}>🍷 Wine Tasting</span>
            {/* DUPLICATE FOR INFINITE EFFECT */}
            <span className={styles.badge}>☕ Coffee Lover</span>
            <span className={styles.badge}>✈️ World Traveler</span>
            <span className={styles.badge}>🎨 Art Enthusiast</span>
            <span className={styles.badge}>🎸 Live Music</span>
            <span className={styles.badge}>🐕 Dog Parent</span>
            <span className={styles.badge}>🧘‍♀️ Mindfulness</span>
            <span className={styles.badge}>🧗‍♂️ Bouldering</span>
            <span className={styles.badge}>🍷 Wine Tasting</span>
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

      {/* PREMIUM FEATURES GRID */}
      <section className={styles.premiumFeaturesSection}>
        <h2>Why Upgrade to Premium?</h2>
        <p style={{ color: "#9ca3af", maxWidth: "600px", margin: "10px auto 0" }}>
          Synqra Premium gives you the ultimate control over your dating life.
        </p>
        <div className={styles.premiumFeaturesGrid}>
          <div className={styles.premiumFeatureCard}>
            <div className={styles.premiumFeatureIcon}>🕵️‍♂️</div>
            <h3>Incognito Mode</h3>
            <p>Browse completely hidden. Only people you swipe right on will ever see your profile in their feed.</p>
          </div>
          <div className={styles.premiumFeatureCard}>
            <div className={styles.premiumFeatureIcon}>⭐</div>
            <h3>Super Sparks</h3>
            <p>Stand out from the crowd! Send a Super Spark with a personalized note attached to guarantee you get noticed.</p>
          </div>
          <div className={styles.premiumFeatureCard}>
            <div className={styles.premiumFeatureIcon}>🎬</div>
            <h3>Video Profiles</h3>
            <p>Upload a looping video to your profile card. Show your authentic self and instantly increase your matches.</p>
          </div>
          <div className={styles.premiumFeatureCard}>
            <div className={styles.premiumFeatureIcon}>🚀</div>
            <h3>Profile Boost</h3>
            <p>Be the top profile in your area for 30 minutes. Get up to 10x more views and matches instantly.</p>
          </div>
          <div className={styles.premiumFeatureCard}>
            <div className={styles.premiumFeatureIcon}>⏪</div>
            <h3>Unlimited Rewinds</h3>
            <p>Accidentally swiped left on the love of your life? Instantly take it back with unlimited rewinds.</p>
          </div>
          <div className={styles.premiumFeatureCard}>
            <div className={styles.premiumFeatureIcon}>🎯</div>
            <h3>Advanced Filters</h3>
            <p>Filter your feed by Zodiac sign, drinking preferences, and more to find exactly who you're looking for.</p>
          </div>
        </div>
      </section>

      <section className={styles.successSection}>
        <h2 className={styles.sectionTitle}>What to Expect</h2>
        <div className={styles.successGrid}>
          <div className={styles.successCard}>
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Authentic Connections" className={styles.successImg} />
            <div className={styles.successContent}>
              <h3>Authentic Connections</h3>
              <p>We require verified profiles and clear dating intentions so you know exactly who you're talking to and what they're looking for.</p>
            </div>
          </div>
          <div className={styles.successCard}>
            <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Meaningful Conversations" className={styles.successImg} />
            <div className={styles.successContent}>
              <h3>Meaningful Conversations</h3>
              <p>With our Icebreaker Prompts and Aura Tags, starting a conversation is natural, easy, and goes beyond just a simple "hello".</p>
            </div>
          </div>
          <div className={styles.successCard}>
            <img src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Absolute Privacy" className={styles.successImg} />
            <div className={styles.successContent}>
              <h3>Absolute Privacy</h3>
              <p>Your data is protected. With Premium Incognito Mode, you have complete control over who gets to see your profile.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className={styles.founderSection}>
        <div className={styles.founderContent}>
          <div className={styles.quoteMark}>“</div>
          <h2 className={styles.founderQuote}>At Synqra, it is our mission to use technology to bring back deep and meaningful relationships. We focus on quality over quantity.</h2>
          <p className={styles.founderName}>- Founder &amp; CEO</p>
        </div>
        <div className={styles.founderImgWrapper}>
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Founder" className={styles.founderImg} />
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

      {/* ENHANCED FOOTER */}
      <footer className={styles.enhancedFooter}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Logo size={40} />
            <p>
              Synqra is revolutionizing modern dating by focusing on authenticity, transparency, and deep connections. Choose your forever.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <h4>Company</h4>
            <Link href="#about">About Us</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Press</Link>
            <Link href="#">Blog</Link>
          </div>
          <div className={styles.footerLinks}>
            <h4>Legal</h4>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Cookie Policy</Link>
            <Link href="#help">Safety Tips</Link>
          </div>
          <div className={styles.footerNewsletter}>
            <h4>Stay Updated</h4>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div>© {new Date().getFullYear()} Synqra Dating App. All rights reserved.</div>
          <div className={styles.footerSocials}>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
            <a href="#">TikTok</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
