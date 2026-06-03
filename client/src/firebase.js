import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithPopup 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlevqTD5nc28crWpCbBknLPGcRYLVTEHk",
  authDomain: "supportsphere-ai-35f58.firebaseapp.com",
  projectId: "supportsphere-ai-35f58",
  storageBucket: "supportsphere-ai-35f58.firebasestorage.app",
  messagingSenderId: "153509169534",
  appId: "1:153509169534:web:f9157e44b66f67a3d18b2f",
  measurementId: "G-WV85W9ZW6L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure social providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");

// Allow tenant configuration or standard credentials
microsoftProvider.setCustomParameters({
  prompt: "select_account"
});

// Configure recaptcha verifier helpers
export { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup };
