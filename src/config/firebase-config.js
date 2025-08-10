import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import dotenv from 'dotenv';

dotenv.config();

//  Firebase cofiguration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Firebase app
const app = initializeApp(firebaseConfig);

const db = getFirestore(app); //  Firestore
const auth = getAuth(app); // Firebase Authentication

// Xuất db và auth để sử dụng ở các file khác
export { db,auth };