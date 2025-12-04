// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCLWHLw5EQu1-Cc3vFKZrjsPMsSuBT4HK4",
    authDomain: "go-kitchen-72d22.firebaseapp.com",
    projectId: "go-kitchen-72d22",
    storageBucket: "go-kitchen-72d22.firebasestorage.app",
    messagingSenderId: "421887242146",
    appId: "1:421887242146:web:3acf825d4b4bbab189ccfb",
    measurementId: "G-6ZBFJMKV6J"
};

// Inicializar Firebase (Evita inicializarlo dos veces en desarrollo)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportamos las herramientas para usarlas en toda la app
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);