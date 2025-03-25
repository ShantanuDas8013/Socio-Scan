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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
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
