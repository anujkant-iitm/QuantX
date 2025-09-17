import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    collection,
    onSnapshot,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp // Import serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();
let currentUser;

// --- Authentication State Observer ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initializeDashboard(user);
    } else {
        window.location.href = '/Login-signup/login.html';
    }
});

function initializeDashboard(user) {
    // --- Setup UI Elements ---
    const displayName = user.displayName || user.email.split('@')[0];
    document.getElementById('welcome-message').textContent = `Welcome, ${displayName}!`;
    if (user.photoURL) {
        document.getElementById('profile-pic').src = user.photoURL;
    }

    // --- Initialize Widgets ---
    setCurrentDate();
    renderProductivityChart();
    renderAttendanceChart();
    setupTodoList(); // ✨ THIS FUNCTION IS NOW FULLY INTERACTIVE ✨
    setupUIEventListeners();
}

// --- Set Current Date ---
function setCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// --- Chart.js: Weekly Productivity Chart ---
function renderProductivityChart() {
    const ctx = document.getElementById('productivityChart').getContext('2d');
    // ... (Chart code is unchanged)
}

// --- Chart.js: Attendance Chart ---
function renderAttendanceChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    // ... (Chart code is unchanged)
}


// --- ✅ ENHANCED: Interactive To-Do List from Firestore ---
function setupTodoList() {
    const todoList = document.getElementById('todo-list');
    if (!currentUser) return;

    // Step 1: Create a query to get ONLY incomplete tasks
    const todosRef = collection(db, "users", currentUser.uid, "todos");
    const q = query(todosRef, where("completed", "==", false), orderBy("createdAt", "desc"));

    // Step 2: Listen for real-time updates
    onSnapshot(q, (snapshot) => {
        todoList.innerHTML = ''; // Clear list before re-rendering
        if (snapshot.empty) {
            todoList.innerHTML = '<p class="empty-task-message">No pending tasks. Great job!</p>';
        }
        snapshot.forEach(doc => {
            const task = doc.data();
            const li = document.createElement('li');
            li.dataset.id = doc.id; // Store the document ID
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" id="task-${doc.id}">
                <label for="task-${doc.id}">${task.text}</label>
            `;
            todoList.appendChild(li);

            // Step 3: Add event listener to each new checkbox
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('li').dataset.id;
                // When checked, complete the task
                if (e.target.checked) {
                    completeTask(taskId, e.target.closest('li'));
                }
            });
        });
    });
}

// Step 4: Function to update task status in Firestore
async function completeTask(taskId, listItemElement) {
    if (!currentUser) return;
    const taskRef = doc(db, "users", currentUser.uid, "todos", taskId);
    try {
        // Update the 'completed' field to true and set 'completedAt' timestamp
        await updateDoc(taskRef, {
            completed: true,
            completedAt: serverTimestamp()
        });

        // Add a smooth animation before removing the task from the view
        listItemElement.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        listItemElement.style.opacity = '0';
        listItemElement.style.transform = 'translateX(20px)';

        // The real-time listener will automatically remove it, but this animation provides great UX
        setTimeout(() => {
            // The onSnapshot listener handles the actual removal, so we don't strictly need this,
            // but it's good practice for instant feedback.
            listItemElement.remove();
        }, 400);

    } catch (error) {
        console.error("Error completing task:", error);
        alert("Couldn't update the task. Please try again.");
    }
}

// --- General UI Event Listeners ---
function setupUIEventListeners() {
    // ... (All other event listeners for sidebar, modals, chat are unchanged)
}