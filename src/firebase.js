import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCX8m844f8k3rtCPYwZQJcqMFSt0gHF6KY",
  authDomain: "tohidgame-b8f3b.firebaseapp.com",
  projectId: "tohidgame-b8f3b",
  storageBucket: "tohidgame-b8f3b.firebasestorage.app",
  messagingSenderId: "991711454420",
  appId: "991711454420:web:b389ce5ceca17f4a0ac741",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);