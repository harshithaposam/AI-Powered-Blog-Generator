import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBLPD0b2GlgnYk4V0iz-fzbbqq8gDt0His",
    authDomain: "dbms-4a089.firebaseapp.com",
    projectId: "dbms-4a089",
    storageBucket: "dbms-4a089.firebasestorage.app",
    messagingSenderId: "469729546773",
    appId: "1:469729546773:web:193ba32dc6aa4b52acf41c",
    measurementId: "G-BF3STH7FWY"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
