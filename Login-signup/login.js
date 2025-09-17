// login.js

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
// Import the shared auth instance from your config file
import { auth } from '../JavaScript/firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');

    // --- Login Handler ---
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        errorMessage.textContent = ''; // Clear previous errors

        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // alert('Logged in successfully!');
            window.location.href = '/Dashboard/dashboard.html';
        } catch (error) {
            console.error('Login Error:', error.code);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage.textContent = 'Invalid email or password.';
            } else {
                errorMessage.textContent = error.message;
            }
        }
    });

    // --- Signup Handler ---
    signupBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        errorMessage.textContent = ''; // Clear previous errors

        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // alert('Account created! Logging you in...');
            window.location.href = '/Dashboard/dashboard.html';
        } catch (error) {
            console.error('Signup Error:', error.code);
            if (error.code === 'auth/email-already-in-use') {
                errorMessage.textContent = 'This email is already registered. Please login.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage.textContent = 'Password should be at least 6 characters long.';
            } else {
                errorMessage.textContent = error.message;
            }
        }
    });

    // --- Google Login Handler ---
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // const user = result.user;
            // alert(`Logged in as ${user.displayName || user.email}`);
            window.location.href = '/Dashboard/dashboard.html';
        } catch (error) {
            console.error('Google login failed:', error);
            errorMessage.textContent = 'Failed to login with Google. Please try again.';
        }
    });
});