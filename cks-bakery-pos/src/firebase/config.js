// Firebase app initialization.
//
// The app runs fully in "simulation mode" out of the box (see
// src/services/orderService.js) so `npm run dev` works with no setup.
// To connect it to a real Firebase project:
//   1. cp .env.example .env.local and fill in your project's web config
//   2. deploy functions/index.js and firestore.rules
//   3. set VITE_USE_CLOUD_FUNCTION=true in .env.local

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Boolean(firebaseConfig.projectId);

export const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = hasFirebaseConfig ? getFirestore(app) : null;
export const functions = hasFirebaseConfig ? getFunctions(app) : null;

export const USE_CLOUD_FUNCTION =
  import.meta.env.VITE_USE_CLOUD_FUNCTION === "true" && hasFirebaseConfig;
