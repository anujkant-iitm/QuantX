
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAWa3itQgOYerg-xh1FHvYx8_xPROFmIpM",
    authDomain: "quantx-studio.firebaseapp.com",
    projectId: "quantx-studio",
    storageBucket: "quantx-studio.firebasestorage.app",
    messagingSenderId: "509999669475",
    appId: "1:509999669475:web:d375beafafd69f8ed8a5d6",
    measurementId: "G-BL772GV8MN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);