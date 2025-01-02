import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

export { auth, db };
