import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaXcOvOum4eg7STytm8i6y_XUhWrjUMF4",
  authDomain: "asgestao-fd428.firebaseapp.com",
  projectId: "asgestao-fd428",
  storageBucket: "asgestao-fd428.firebasestorage.app",
  messagingSenderId: "1062707534454",
  appId: "1:1062707534454:web:ca5a3a1ac619c3f48b1d57"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);