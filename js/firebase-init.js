
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2W316gOm8TXGAJG4Un9LQROdFi6bR3jc",
  authDomain: "agencia-ariel.firebaseapp.com",
  projectId: "agencia-ariel",
  storageBucket: "agencia-ariel.firebasestorage.app",
  messagingSenderId: "744307320337",
  appId: "1:744307320337:web:2fd072640df43afc0333b0",
  measurementId: "G-Q3ZX8HTJLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = undefined;