import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcmbh3buL6Z7BhFI0PAkh-xOwWi4oU_Ds",
  authDomain: "chatapp-mukesh.firebaseapp.com",
  projectId: "chatapp-mukesh",
  storageBucket: "chatapp-mukesh.firebasestorage.app",
  messagingSenderId: "197879098792",
  appId: "1:197879098792:web:8fc1990d70aa9486e8819d",
  measurementId: "G-7LTNMMXNTZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();