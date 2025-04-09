import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  setDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Get Firebase configuration from any available source
const getFirebaseConfig = () => {
  // Check for runtime config first (from runtime-config.js)
  if (typeof window !== "undefined" && window.FIREBASE_CONFIG) {
    console.log("Using window.FIREBASE_CONFIG");
    return window.FIREBASE_CONFIG;
  }

  // Check for config in window.RUNTIME_CONFIG (from config.js)
  if (typeof window !== "undefined" && window.RUNTIME_CONFIG) {
    console.log("Using window.RUNTIME_CONFIG");
    return {
      apiKey: window.RUNTIME_CONFIG.FIREBASE_API_KEY,
      authDomain: window.RUNTIME_CONFIG.FIREBASE_AUTH_DOMAIN,
      projectId: window.RUNTIME_CONFIG.FIREBASE_PROJECT_ID,
      storageBucket: window.RUNTIME_CONFIG.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.RUNTIME_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.RUNTIME_CONFIG.FIREBASE_APP_ID,
      measurementId: window.RUNTIME_CONFIG.FIREBASE_MEASUREMENT_ID,
    };
  }

  // Fallback to hardcoded config
  console.log("Using hardcoded Firebase config");
  return {
    apiKey: "AIzaSyD2mvq7WrWu4u0TPk3g2bqPM3vVx6WZcWM",
    authDomain: "socio-scan.firebaseapp.com",
    projectId: "socio-scan",
    storageBucket: "socio-scan.appspot.com",
    messagingSenderId: "591183114585",
    appId: "1:591183114585:web:b42c116a8c8ccc2d925c48",
    measurementId: "G-GWFYWKPNEV",
  };
};

const firebaseConfig = getFirebaseConfig();

// For debugging purposes - Remove in production
console.log("Firebase initialization with config:", {
  apiKey: firebaseConfig.apiKey ? "Set" : "Missing",
  projectId: firebaseConfig.projectId,
});

// Initialize Firebase with the config
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Attempt to reinitialize with a delay if it failed
  setTimeout(() => {
    try {
      app = initializeApp(firebaseConfig, "secondary-app");
      console.log("Firebase reinitialized successfully with secondary name");
    } catch (retryError) {
      console.error("Firebase reinitialization also failed:", retryError);
    }
  }, 1000);
}

const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);

export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      subscription: subscriptionData,
      lastUpdated: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

export const createSubscriptionNode = async (userId, subscriptionData) => {
  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const newSubscriptionRef = doc(subscriptionsRef);

    // Add subscription metadata
    const enrichedSubscriptionData = {
      ...subscriptionData,
      id: newSubscriptionRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newSubscriptionRef, enrichedSubscriptionData);
    return newSubscriptionRef.id;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription. Please try again.");
  }
};

// Update user subscription status
export const updateUserSubscriptionStatus = async (
  userId,
  subscriptionId,
  status
) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      subscriptionId,
      subscriptionStatus: status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw new Error("Failed to update subscription status.");
  }
};

export { auth, db };
