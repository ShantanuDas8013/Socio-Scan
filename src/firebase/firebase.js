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
  apiKey: "AIzaSyD2mvq7WrWu4u0TPk3g2bqPM3vVx6WZcWM",
  authDomain: "socio-scan.firebaseapp.com",
  projectId: "socio-scan",
  storageBucket: "socio-scan.appspot.com",
  messagingSenderId: "591183114585",
  appId: "1:591183114585:web:b42c116a8c8ccc2d925c48",
  measurementId: "G-GWFYWKPNEV",
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
