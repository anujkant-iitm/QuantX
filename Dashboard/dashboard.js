import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, collection, onSnapshot, updateDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();
let currentUser;

// --- Authentication State Observer ---
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         currentUser = user;
//         initializeDashboard(user);
//     } else {
//         window.location.href = '/Login-signup/login.html';
//     }
// });

function initializeDashboard(user) {
    // ... (All initialization code from previous turn remains the same)
    setupUIEventListeners(); // This is where the magic happens!
}

// ... (All chart and date functions from previous turn remain the same)

// ... (To-do list setup and completeTask function from previous turn remain the same)

// --- General UI Event Listeners (FIXED & IMPROVED) ---
function setupUIEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    // --- ✅ HAMBURGER TOGGLE FIX ---
    // Toggles the sidebar and the overlay with a single click
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents click from bubbling up to the document
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    });

    // --- ✅ OVERLAY CLICK FIX ---
    // Closes all open elements when the overlay is clicked
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.getElementById('profileModal').classList.remove('show');
        document.getElementById('chat-popup').classList.remove('show');
    });

    // Profile Modal Listeners (from previous turn)
    // ...

    // Logout Listener (from previous turn)
    // ...

    // --- ✨ NEW: AI CHATBOT EVENT LISTENERS ✨ ---
    const aiChatBtn = document.getElementById('ai-chat-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');

    // Toggle the chat popup visibility
    aiChatBtn.addEventListener('click', () => {
        chatPopup.classList.toggle('show');
    });

    // Close the chat popup
    closeChatBtn.addEventListener('click', () => {
        chatPopup.classList.remove('show');
    });

    // Handle chat message submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        const messageText = chatInput.value.trim();
        if (messageText) {
            // Display user's message
            const sentMessage = document.createElement('div');
            sentMessage.classList.add('message', 'sent');
            sentMessage.textContent = messageText;
            chatMessages.appendChild(sentMessage);

            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll

            // TODO: Add logic to send 'messageText' to your AI API
            // and display the response.
        }
    });
}