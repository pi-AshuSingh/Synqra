<div align="center">
  <img src="https://raw.githubusercontent.com/pi-AshuSingh/Synqra/main/src/app/icon.svg" alt="Synqra Logo" width="120" height="120" />
  <h1>Synqra</h1>
  <p><strong>A Modern, Fast, and Free Dating App for the Indian Market</strong></p>
  
  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fsynqra-4you.web.app&logo=firebase)](https://synqra-4you.web.app)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-orange?logo=firebase)](https://firebase.google.com/)
</div>

---

## 🌟 Live Demo

**[Check out the live app here: synqra-4you.web.app](https://synqra-4you.web.app)**

*Note: Since the app is in its MVP stage, go ahead and create a brand new account using the 'Start Discovering' flow to test the full feature set!*

---

## 🚀 Features

Synqra has been built from the ground up to be an aesthetic, high-performance web app utilizing glassmorphism and smooth animations.

### 💖 The Swiping Engine
- **Discover Profiles:** Browse profiles one by one in a stack-like UI.
- **Like or Pass:** Swipe right (Spark) or swipe left (Pass).
- **Super Sparks & Notes:** Send high-priority 'Super Sparks' directly from the feed with a personalized note to grab attention immediately.
- **Profile Videos:** Experience dynamic dating cards! See auto-playing profile videos instead of just static images.
- **Smart Filtering:** The app automatically hides people you have already interacted with so you never see duplicates.

### 👤 Enhanced Profiles & Onboarding
- **Detailed Bios:** Set your Age, City, and 'Looking For' intent (Serious, Casual, Friends).
- **Aura Tags:** Pick up to 3 personality traits (e.g. Adventurous, Chill, Creative).
- **Free Image Links:** Just paste an image URL from Instagram or Unsplash for your profile photo (No paid cloud storage required!).

### ✨ Matches Dashboard
- A dedicated page at `/matches` to view a beautiful grid of all the profiles you have 'Sparked' with.

### 💬 Real-Time Chat
- **Instant Messaging:** Real-time sync with Firestore.
- **Typing Indicators:** See when the other person is typing in real-time.
- **Read Receipts:** Know exactly when your match reads your message (✓✓).
- **Message Reactions:** Double-click any message bubble to instantly heart (❤️) it.

### 💎 Premium Features
- **Incognito Mode:** Browse completely hidden. Only people you swipe right on will ever see your profile.
- **Profile Boosting:** Pin your profile to the top of everyone's feed for 30 minutes for maximum visibility.
- **Advanced Filtering:** Filter matches by Age, Zodiac sign, Drinking, Smoking, and more.

### 🔔 Notification Center
- **Real-time Alerts:** Get notified instantly when you receive a Like, a Match, or a Profile View.
- **Dedicated Hub:** A dedicated `/notifications` page to track all your historical interactions.

### 🛠️ Trust & Safety
- **Community Safety Pledge:** A mandatory pledge all new users must agree to, encouraging kindness and respect.
- **Verified Profiles:** Request verification to get the blue checkmark.
- **Granular Reporting:** Report specific, individual messages in chat directly to admins instead of just vague profile reports.
- **Online Presence Dots:** Easily spot a green dot next to the names of users who are currently active online.
- **Profile Completion Score:** A gamified progress bar to encourage users to fill out their bios and add photos.

### ⚙️ My Profile Editor
- Edit your Bio, City, and Intent at any time.
- Answer Icebreaker Prompts (e.g. "Two truths and a lie...") and set your Spotify Anthem.
- Securely log out.

### 🛡️ Admin Dashboard
- Protected `/admin` route explicitly accessible only to accounts with an `isAdmin: true` flag in Firestore. 
- Dynamic checks ensure secure access for the primary admin email regardless of initial signup flow (Email/Password or Google).

### 🎨 Premium Landing Page (New)
- **Interactive Phone Demo:** A glassmorphic iPhone mockup right on the index page demonstrating the swiping interface.
- **Authenticity First:** "What to Expect" section replaces fake marketing data with core values (Authentic Connections, Meaningful Conversations, Absolute Privacy).
- **Premium Grid & Enhanced Footer:** Dedicated feature showcases and a professional multi-column footer layout.

---

## 🛠️ Tech Stack

Synqra operates on a **100% Free Tier** architecture. 

- **Frontend Framework:** [Next.js 14](https://nextjs.org/) (App Router, Static Export Mode)
- **Styling:** Vanilla CSS Modules with custom CSS variables, gradients, and animated glassmorphism blobs.
- **Backend & Auth:** [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password)
- **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore) 
- **Hosting:** Firebase Hosting

### 🔒 Security

All reads and writes are protected by highly restrictive Firestore Security Rules (`firestore.rules`). 
- Users can only edit their own documents.
- Sensitive collections (like interactions) are securely locked down.
- Admin-only areas strictly verify the user's role on the backend.

---

## 💻 Local Development

First, install dependencies:

```bash
npm install
```

Set up your Firebase configuration in `src/lib/firebase.ts`.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

Synqra is configured as a static HTML export (`output: "export"` in `next.config.ts`), allowing it to be hosted on Firebase Hosting without requiring any server-side rendering or Cloud Functions.

To deploy:
```bash
npm run build
firebase deploy --only hosting,firestore
```

---
<div align="center">
  <img src="https://raw.githubusercontent.com/pi-AshuSingh/Synqra/main/src/app/icon.svg" alt="Synqra Logo" width="40" height="40" />
</div>
