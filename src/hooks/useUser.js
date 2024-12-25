import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useUser = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          console.log("Auth state changed - User found:", user.email);
          const userDocRef = doc(db, "users", user.uid);

          unsubscribeDoc = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const docData = docSnap.data();
                const data = {
                  ...docData,
                  email: user.email,
                  uid: user.uid,
                  photoURL:
                    docData.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      docData.fullName || "User"
                    )}&background=random`, // Prioritize Firestore photoURL
                  displayName: docData.fullName || user.displayName, // Use fullName as displayName
                };
                console.log("Real-time user data update:", data);
                setUserData(data);
                setError(null);
              }
            },
            (error) => {
              console.error("Error in snapshot listener:", error);
              setError(error.message);
            }
          );
        } else {
          setUserData(null);
          if (unsubscribeDoc) {
            unsubscribeDoc();
          }
        }
      } catch (err) {
        console.error("Error in useUser:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
      unsubscribeAuth();
    };
  }, []);

  return { userData, loading, error };
};
