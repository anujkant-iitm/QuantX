// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWa3itQgOYerg-xh1FHvYx8_xPROFmIpM",
    authDomain: "quantx-studio.firebaseapp.com",
    projectId: "quantx-studio",
    storageBucket: "quantx-studio.firebasestorage.app",
    messagingSenderId: "509999669475",
    appId: "1:509999669475:web:d375beafafd69f8ed8a5d6",
    measurementId: "G-BL772GV8MN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
