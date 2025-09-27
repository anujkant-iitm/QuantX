// anujkant-iitm/quantx/QuantX-f6a6166c4805c35edbf1e87647b731fbe9c47324/Dashboard/dashboard.js

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
// 1. Import auth and db from your config file
import { auth, db } from '/JavaScript/firebase-config.js';
// 2. Import Firestore functions
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- Authentication State Observer ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // If user is logged in, initialize the dashboard
        initializeDashboard(user);
    } else {
        // If not, redirect to the login page
        window.location.href = '/Login-signup/login.html';
    }
});

function initializeDashboard(user) {
    // --- Setup UI Elements ---
    const welcomeMessage = document.getElementById('welcome-message');
    const profilePic = document.getElementById('profile-pic');

    const displayName = user.displayName || user.email.split('@')[0];
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
    if (user.photoURL) {
        profilePic.src = user.photoURL;
    }

    // --- Initialize Dashboard Widgets ---
    renderProgressChart();
    setupTodoWidget(user.uid); // Pass user ID to the to-do widget setup
    setupUIEventListeners();
}

// --- Chart.js: Weekly Progress Chart ---
function renderProgressChart() {
    // This function remains the same
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tasks Completed',
                data: [5, 7, 4, 8, 6, 9, 7],
                borderColor: '#a3a9ff',
                backgroundColor: 'rgba(163, 169, 255, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            }
        }
    });
}

// --- NEW: To-Do List Widget Functionality ---
function setupTodoWidget(userId) {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Get a reference to the user's personal "todos" collection
    const todosRef = collection(db, "users", userId, "todos");

    // --- Add a new task ---
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskText = todoInput.value.trim();
        if (taskText !== '') {
            await addDoc(todosRef, {
                text: taskText,
                completed: false,
                createdAt: serverTimestamp()
            });
            todoInput.value = '';
        }
    });

    // --- Listen for real-time updates and display tasks ---
    const q = query(todosRef, orderBy("createdAt", "desc"), limit(5)); // Show latest 5 tasks
    onSnapshot(q, (snapshot) => {
        todoList.innerHTML = ''; // Clear the list before re-rendering
        snapshot.forEach((doc) => {
            const task = doc.data();
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="complete-btn" data-id="${doc.id}" data-completed="${task.completed}">✓</button>
                    <button class="delete-btn" data-id="${doc.id}">×</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    });

    // --- Handle task completion and deletion using event delegation ---
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');

        if (target.classList.contains('complete-btn')) {
            const currentStatus = target.getAttribute('data-completed') === 'true';
            const taskDocRef = doc(db, "users", userId, "todos", id);
            updateDoc(taskDocRef, { completed: !currentStatus });
        }

        if (target.classList.contains('delete-btn')) {
            const taskDocRef = doc(db, "users", userId, "todos", id);
            deleteDoc(taskDocRef);
        }
    });
}


// --- General UI Event Listeners (Sidebar, Logout, etc.) ---
function setupUIEventListeners() {
    // This function remains the same
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logout');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    hamburger.addEventListener('click', () => {
        sidebar.style.left = '0';
        overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
        sidebar.style.left = '-300px';
        overlay.style.display = 'none';
    });

    logoutBtn.addEventListener('click', () => logoutModal.style.display = 'flex');
    cancelLogout.addEventListener('click', () => logoutModal.style.display = 'none');

    confirmLogout.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    });
}