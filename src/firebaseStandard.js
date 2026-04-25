// firebaseStandard.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD3CaMpn3uwfA9MfBKPqQjQCdkPDP67bDw",
  authDomain: "cbscothers.firebaseapp.com",
  projectId: "cbscothers",
  storageBucket: "cbscothers.firebasestorage.app",
  messagingSenderId: "226914703482",
  appId: "1:226914703482:web:fee5d4aae96b78ac8c03c3",
  measurementId: "G-32PQVJDE02"
};

// IMPORTANT 🔥 (weka jina tofauti)
const standardApp = initializeApp(firebaseConfig, "standardApp");

// Firestore (hii ndio muhimu)
export const standardDb = getFirestore(standardApp);

// Analytics (optional)
export const analytics = getAnalytics(standardApp);