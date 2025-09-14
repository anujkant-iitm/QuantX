// login.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const googleLoginBtn = document.getElementById('google-login-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('Logged in successfully');
        } catch (signInError) {
            if (signInError.code === 'auth/user-not-found') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    alert('Account created and logged in!');
                } catch (signupError) {
                    errorMessage.textContent = signupError.message;
                }
            } else {
                errorMessage.textContent = signInError.message;
            }
        }
    });

    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            alert(`Logged in as ${user.email}`);
        } catch (error) {
            console.error('Google login failed:', error);
            alert(error.message);
        }
    });
});
