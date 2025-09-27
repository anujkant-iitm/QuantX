// JavaScript/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWa3itQgOYerg-xh1FHvYx8_xPROFmIpM", // Keep your actual key here
    authDomain: "quantx-studio.firebaseapp.com",
    projectId: "quantx-studio",
    storageBucket: "quantx-studio.appspot.com",
    messagingSenderId: "509999669475",
    appId: "1:509999669475:web:d375beafafd69f8ed8a5d6",
    measurementId: "G-BL772GV8MN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialize and export Firestore