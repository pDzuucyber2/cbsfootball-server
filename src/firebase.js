import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRY_HtwzhW6RyXmUAAvbnRp2iwwPMg7m8",
  authDomain: "contrabetssore-cbc.firebaseapp.com",
  projectId: "contrabetssore-cbc",
  storageBucket: "contrabetssore-cbc.firebasestorage.app",
  messagingSenderId: "655975334525",
  appId: "1:655975334525:web:6f9e18c59c9337a3b4e714"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);