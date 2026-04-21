# BarterLearn - Local Skill Exchange Platform

![BarterLearn Logo/Banner](https://via.placeholder.com/1200x300?text=BarterLearn+-+Skill+Exchange+Platform)

## 🎯 Problem Statement

**Who is the user?** 
College students, freelancers, and self-learners who are eager to acquire new skills but face financial barriers to expensive courses or find it difficult to locate the right mentorship.

**What problem are you solving?**
We are solving the barrier to continuous education by removing the need for financial transactions. BarterLearn connects users who have complementary skills (e.g., someone who knows React and wants to learn UI Design, matched with someone who knows UI Design and wants to learn React). It facilitates a direct, 1-on-1 "barter" exchange of knowledge.

**Why does this problem matter?**
Education and skill acquisition should be accessible. By leveraging the existing, unused knowledge within a local community or campus, we can build a collaborative learning environment where everyone acts as both a student and a teacher.

---

## ✨ Features

- **Authentication System**: Secure Email/Password and Google Sign-in provided by Firebase Authentication.
- **Smart Matching System**: An algorithm that calculates a "Compatibility Score" between users based on intersecting "Skills Offered" and "Skills Wanted".
- **Discover Matches**: A beautiful, animated Tinder-style interface to browse suggested learning partners and send exchange requests.
- **Exchange Hub**: A centralized dashboard to track active exchanges, manage incoming/outgoing requests, and log the duration/notes of your learning sessions.
- **Persistent Profiles**: Users can dynamically update their teaching experience, availability, and skill tags, which are immediately synced to Firestore and update their matching pool in real-time.

---

## ⚛️ Tech Stack & React Requirements Fulfilled

This project strictly adheres to the React guidelines:

### Core Concepts
- **Functional Components**: Used exclusively throughout the application (`Login`, `Dashboard`, `Discover`, etc.).
- **Props & Component Composition**: Modular components like layout wrappers and protected routes.
- **State Management**: Heavy use of `useState` for forms, modal toggling, and local UI state.
- **Side Effects**: `useEffect` used for subscribing to Firebase `onSnapshot` listeners and managing focus.
- **Conditional Rendering**: Handling empty states (e.g., "No matches found"), loading states, and auth checks.
- **Lists & Keys**: Rendering dynamic lists of requests, matches, and sessions.

### Intermediate & Advanced Concepts
- **Context API**: `AuthContext` and `DataContext` lift state up to make user profiles, matches, and requests globally accessible without prop-drilling.
- **React Router**: Full routing implementation with `ProtectedRoute` wrappers.
- **useMemo**: Powers the `useMatch` hook to efficiently calculate and sort user compatibility scores without unnecessary recalculations.
- **useCallback**: Optimizes Firestore write operations (like `addSession`, `updateProfile`) inside the Context.
- **useRef**: Implemented to auto-focus primary input fields (e.g., Login email input) on mount.
- **React.lazy & Suspense**: Pages are lazy-loaded to optimize initial bundle size and improve performance.

### Backend Integration
- **Firebase Auth**: User authentication (Google + Email/Password).
- **Firebase Firestore**: Fully integrated NoSQL database for real-time CRUD operations on Users, Requests, Exchanges, and Sessions.

---

## 🚀 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd skill-exchange-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Configuration**:
   The app connects to a Firebase project. The configuration is located in `src/services/firebase.js`. To use your own database:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password & Google).
   - Enable **Firestore Database** (Start in Test Mode).
   - Replace the `firebaseConfig` object in `src/services/firebase.js` with your own keys.
   - **Important Security Step**: Copy the contents of `firestore.rules` (in the root folder) and paste them into the **Rules** tab of your Firestore Database in the Firebase Console. This ensures that users can only access their own private data.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```text
/src
├── components/       # Reusable UI components (Layout, ProtectedRoute)
├── context/          # Global state (AuthContext, DataContext)
├── hooks/            # Custom hooks (useMatch)
├── pages/            # Page components (Login, Dashboard, Discover, Profile, ExchangeHub)
├── services/         # Backend services (firebase.js)
├── index.css         # Global Tailwind styles
├── App.jsx           # Routing and Context Providers
└── main.jsx          # React DOM mounting
```

---
*Developed for the Building Web Applications with React Course.*
