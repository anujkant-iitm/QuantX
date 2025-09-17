import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { auth } from '../JavaScript/firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const toggleLink = document.getElementById('toggle-link');
    const toggleText = document.getElementById('toggle-text');
    const errorMessage = document.getElementById('error-message');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const authForm = document.getElementById('auth-form');

    let isLoginMode = true;

    // --- Helper Functions for UI State ---
    const showLoading = (isLoading) => {
        if (isLoading) {
            btnText.style.display = 'none';
            spinner.style.display = 'block';
            submitBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    };

    const displayError = (message) => {
        errorMessage.textContent = message;
    };

    const clearError = () => {
        errorMessage.textContent = '';
    };

    // --- Toggle between Login and Signup ---
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        clearError();

        if (isLoginMode) {
            formTitle.textContent = 'Login to QuantX';
            formSubtitle.textContent = 'Welcome back! Let\'s get productive.';
            btnText.textContent = 'Login';
            toggleText.textContent = 'Don\'t have an account?';
            toggleLink.textContent = 'Sign up';
        } else {
            formTitle.textContent = 'Create an Account';
            formSubtitle.textContent = 'Join QuantX and start optimizing your life.';
            btnText.textContent = 'Create Account';
            toggleText.textContent = 'Already have an account?';
            toggleLink.textContent = 'Login';
        }
    });

    // --- Main Auth Handler (Login/Signup with Email) ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        clearError();
        if (!email || !password) {
            displayError('Please enter both email and password.');
            return;
        }

        showLoading(true);

        try {
            if (isLoginMode) {
                // --- Login Logic ---
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // --- Signup Logic ---
                await createUserWithEmailAndPassword(auth, email, password);
            }
            window.location.href = '/Dashboard/dashboard.html';
        } catch (error) {
            // --- Improved Error Handling ---
            handleAuthError(error);
        } finally {
            showLoading(false);
        }
    });

    // --- Google Login Handler ---
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        clearError();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '/Dashboard/dashboard.html';
        } catch (error) {
            handleAuthError(error);
        }
    });

    // --- Centralized Error Handler ---
    function handleAuthError(error) {
        console.error("Authentication Error:", error.code, error.message);
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                displayError('Invalid email or password. Please try again.');
                break;
            case 'auth/email-already-in-use':
                displayError('This email is already registered. Please login.');
                break;
            case 'auth/weak-password':
                displayError('Password must be at least 6 characters long.');
                break;
            case 'auth/popup-closed-by-user':
                displayError('Google sign-in was cancelled.');
                break;
            default:
                displayError('An unexpected error occurred. Please try again.');
                break;
        }
    }
});