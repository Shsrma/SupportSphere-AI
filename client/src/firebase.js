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
  apiKey: "AIzaSyCTMczgYUGktJP40d4Qc01ioNoTbTkSv-c",
  authDomain: "authentication-system-4b59d.firebaseapp.com",
  projectId: "authentication-system-4b59d",
  storageBucket: "authentication-system-4b59d.firebasestorage.app",
  messagingSenderId: "979409146957",
  appId: "1:979409146957:web:fe42f12cde2df3e5143804",
  measurementId: "G-YH3JPVZVHR"
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
