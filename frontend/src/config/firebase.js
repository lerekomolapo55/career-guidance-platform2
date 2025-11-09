// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBq6tHXwgSEaIeSAams_vK1j5VM8EC37ao",
  authDomain: "career-guidance-platform-4d56c.firebaseapp.com",
  projectId: "career-guidance-platform-4d56c",
  storageBucket: "career-guidance-platform-4d56c.firebasestorage.app",
  messagingSenderId: "781345119901",
  appId: "1:781345119901:web:a48f6a95415a5035d5be74",
  measurementId: "G-BSYT892FNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;