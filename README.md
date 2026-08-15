<div align="center">
  <img src="https://raw.githubusercontent.com/pi-AshuSingh/Synqra/main/public/icon.svg" alt="Synqra Logo" width="120" height="120" />
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
- **Smart Filtering:** The app automatically hides people you have already interacted with so you never see duplicates.

### 👤 Enhanced Profiles & Onboarding
- **Detailed Bios:** Set your Age, City, and 'Looking For' intent (Serious, Casual, Friends).
- **Aura Tags:** Pick up to 3 personality traits (e.g. Adventurous, Chill, Creative).
- **Free Image Links:** Just paste an image URL from Instagram or Unsplash for your profile photo (No paid cloud storage required!).

### ✨ Matches Dashboard
- A dedicated page at `/matches` to view a beautiful grid of all the profiles you have 'Sparked' with.

### ⚙️ My Profile Editor
- Edit your Bio, City, and Intent at any time.
- See exactly how your profile looks to others.
- Securely log out.

### 🛡️ Admin Dashboard
- Protected `/admin` route explicitly accessible only to accounts with an `isAdmin: true` flag in Firestore. 

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
  <img src="https://raw.githubusercontent.com/pi-AshuSingh/Synqra/main/public/icon.svg" alt="Synqra Logo" width="40" height="40" />
</div>
