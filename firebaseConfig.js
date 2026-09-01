import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCY7PLlMThlJqDjFt4bvMfdoVRnuU4q2_0",
  authDomain: "etkinlikapp-207e1.firebaseapp.com",
  projectId: "etkinlikapp-207e1",
  storageBucket: "etkinlikapp-207e1.firebasestorage.app",
  messagingSenderId: "436570306540",
  appId: "1:436570306540:web:6754a9e0754408061e32c9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);