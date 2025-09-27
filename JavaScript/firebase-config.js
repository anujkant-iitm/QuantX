// anujkant-iitm/quantx/QuantX-f6a6166c4805c35edbf1e87647b731fbe9c47324/JavaScript/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
// 1. Import getFirestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ... (your firebaseConfig object)
const firebaseConfig = {
    apiKey: "AIzaSyAWa3itQgOYerg-xh1FHvYx8_xPROFmIpM",
    authDomain: "quantx-studio.firebaseapp.com",
    projectId: "quantx-studio",
    storageBucket: "quantx-studio.appspot.com",
    messagingSenderId: "509999669475",
    appId: "1:509999669475:web:d375beafafd69f8ed8a5d6",
    measurementId: "G-BL772GV8MN"
};


const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore and export it along with auth
export const auth = getAuth(app);
export const db = getFirestore(app);