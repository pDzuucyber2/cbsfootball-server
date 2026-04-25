// firebaseSecondary.js
import { initializeApp as initializeAppSecondary } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Secondary Firebase configuration
const firebaseConfig2 = {
  apiKey: "AIzaSyB3AzyprEMqA7bbrBT4LAQsonofSYa5Dd4",
  authDomain: "casinobet-cbs.firebaseapp.com",
  projectId: "casinobet-cbs",
  storageBucket: "casinobet-cbs.firebasestorage.app",
  messagingSenderId: "753795870172",
  appId: "1:7537958702f6b319",
  measurementId: "G-YPJ5BCZJ6R"
};

// Initialize secondary app
const app2 = initializeAppSecondary(firebaseConfig2, "secondary");

// Get Firestore instance
export const secondaryDb = getFirestore(app2);

// Enable offline persistence (optional)
enableIndexedDbPersistence(secondaryDb)
  .catch((err) => {
    console.log("Persistence error (secondaryDb):", err.code);
  });