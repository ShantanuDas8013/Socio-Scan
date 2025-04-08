/**
 * Utility to test Firebase connectivity
 */
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  getDocs,
  collection,
  limit,
  query,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// Test Firebase auth initialization
export const testAuth = async () => {
  try {
    const authInstance = getAuth();
    console.log("Auth initialized:", !!authInstance);
    return !!authInstance;
  } catch (error) {
    console.error("Auth test failed:", error);
    return false;
  }
};

// Test Firestore connectivity
export const testFirestore = async () => {
  try {
    const dbInstance = getFirestore();
    console.log("Firestore initialized:", !!dbInstance);

    // Try to read a document
    const usersRef = collection(db, "users");
    const q = query(usersRef, limit(1));
    const snapshot = await getDocs(q);
    console.log("Firestore test query successful, doc count:", snapshot.size);

    return true;
  } catch (error) {
    console.error("Firestore test failed:", error);
    return false;
  }
};
