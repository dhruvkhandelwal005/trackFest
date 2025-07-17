// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOez6oN0vx463gT5_El_0LliBmVymG3sU",
  authDomain: "trackfest-affb0.firebaseapp.com",
  projectId: "trackfest-affb0",
  storageBucket: "trackfest-affb0.firebasestorage.app",
  messagingSenderId: "422676200117",
  appId: "1:422676200117:web:40ef2eefeb3ebb61c7dcfc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
