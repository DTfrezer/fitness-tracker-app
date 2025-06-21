// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging"; // Required for messaging support in Web

const firebaseConfig = {
  apiKey: "AIzaSyCwueS4r1ba0RG2hNE2DklbbNJ5iAMmEJk",
  authDomain: "fitnesstrackerapp-12.firebaseapp.com",
  projectId: "fitnesstrackerapp-12",
  storageBucket: "fitnesstrackerapp-12.appspot.com",
  messagingSenderId: "710417398156",
  appId: "1:710417398156:web:5d2637e11cb57bb642bea9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app); // For web push notifications
