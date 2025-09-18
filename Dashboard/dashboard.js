import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { auth } from '/JavaScript/firebase-config.js';

// --- Authentication State Observer ---

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         initializeDashboard(user);
//     } else {
//         // If no user is logged in, redirect to the login page
//         window.location.href = '/Login-signup/login.html';
//     }
// });

function initializeDashboard(user) {
    // --- Setup UI Elements ---
    const welcomeMessage = document.getElementById('welcome-message');
    const profilePic = document.getElementById('profile-pic');

    // Use user's display name or part of their email
    const displayName = user.displayName || user.email.split('@')[0];
    welcomeMessage.textContent = `Welcome, ${displayName}!`;

    // Use user's profile picture if available
    if (user.photoURL) {
        profilePic.src = user.photoURL;
    }

    // --- Initialize Dashboard Widgets with Sample Data ---
    renderProgressChart();
    renderTaskChart(); // New function for pie chart
    setupTodoList();
    setupUIEventListeners();
}

// --- Chart.js: Weekly Productivity (Line Chart) ---
function renderProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tasks Completed',
                // Sample data for a productive week
                data: [5, 6, 4, 7, 8, 5, 9],
                borderColor: '#a3a9ff',
                backgroundColor: 'rgba(163, 169, 255, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    ticks: { color: '#e0e0e0', font: { size: 12 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#e0e0e0', font: { size: 12 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// --- Chart.js: Task Overview (Pie Chart) ---
function renderTaskChart() {
    const ctx = document.getElementById('taskChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                label: 'Task Status',
                // Sample data: 8 tasks completed, 4 pending
                data: [8, 4],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)', // Completed - Green
                    'rgba(255, 99, 132, 0.8)'  // Pending - Red
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e0e0e0',
                        font: { size: 14 }
                    }
                }
            }
        }
    });
}


// --- Interactive To-Do List with Sample Data ---
function setupTodoList() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Clear existing list and add sample tasks
    todoList.innerHTML = '';
    const sampleTasks = [
        "Finish project report",
        "Go for a 30-minute run",
        "Buy groceries for the week"
    ];

    sampleTasks.forEach(taskText => {
        const li = document.createElement('li');
        li.textContent = taskText;
        todoList.appendChild(li);
    });

    // Add new tasks
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

    // Toggle sidebar
    hamburger.addEventListener('click', () => {
        sidebar.style.left = '0';
        overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
        sidebar.style.left = '-300px';
        overlay.style.display = 'none';
    });

    // Logout modal
    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });

    cancelLogout.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    confirmLogout.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    });
}