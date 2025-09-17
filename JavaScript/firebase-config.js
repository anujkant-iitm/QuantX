// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// WARNING: In a real project, use environment variables for these keys,
// do not commit them directly to your code repository.
const firebaseConfig = {
    apiKey: "AIzaSyAWa3itQgOYerg-xh1FHvYx8_xPROFmIpM", // Keep your actual key here
    authDomain: "quantx-studio.firebaseapp.com",
    projectId: "quantx-studio",
    storageBucket: "quantx-studio.appspot.com", // Corrected the domain
    messagingSenderId: "509999669475",
    appId: "1:509999669475:web:d375beafafd69f8ed8a5d6",
    measurementId: "G-BL772GV8MN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);