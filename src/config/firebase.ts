import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDAf5bUbRCLz2j-EgxJQGnX7x1kPomCMO0",
  authDomain: "vita-recovery-app.firebaseapp.com",
  projectId: "vita-recovery-app",
  storageBucket: "vita-recovery-app.firebasestorage.app",
  messagingSenderId: "827118162914",
  appId: "1:827118162914:web:a0d6d7fbc9b3fdae9a5fbb",
  measurementId: "G-4ZESH89LVD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);