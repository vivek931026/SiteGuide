import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "shifraai-e88de.firebaseapp.com",
  projectId: "shifraai-e88de",
  storageBucket: "shifraai-e88de.firebasestorage.app",
  messagingSenderId: "964402706318",
  appId: "1:964402706318:web:94e85b3a1b5b23b3f096df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider(); 

export {auth, provider}
