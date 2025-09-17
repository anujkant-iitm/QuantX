import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { auth } from '/JavaScript/firebase-config.js';

// --- Authentication State Observer ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        initializeDashboard(user);
    } else {
        window.location.href = 'login.html';
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
    setupTodoList();
    setupUIEventListeners(); // This function contains the fix
}

// --- Chart.js: Weekly Progress Chart ---
function renderProgressChart() {
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

// --- Interactive To-Do List ---
function setupTodoList() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = todoInput.value.trim();
        if (taskText !== '') {
            const li = document.createElement('li');
            li.textContent = taskText;
            todoList.appendChild(li);
            todoInput.value = '';
        }
    });
}

// --- General UI Event Listeners (Sidebar, Logout, etc.) ---
function setupUIEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logout');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    // **FIXED CODE STARTS HERE**
    // This code opens the sidebar and shows the overlay
    hamburger.addEventListener('click', () => {
        sidebar.style.left = '0';
        overlay.style.display = 'block';
    });

    // This code closes the sidebar and hides the overlay when you click outside
    overlay.addEventListener('click', () => {
        sidebar.style.left = '-300px';
        overlay.style.display = 'none';
    });
    // **FIXED CODE ENDS HERE**

    logoutBtn.addEventListener('click', () => logoutModal.style.display = 'flex');
    cancelLogout.addEventListener('click', () => logoutModal.style.display = 'none');

    confirmLogout.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    });
}