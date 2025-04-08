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
import { getFirebaseConfig } from "../utils/configLoader";

// Get Firebase configuration from any available source
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
