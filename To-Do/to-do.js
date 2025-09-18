import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    where,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

// --- Firestore & Auth Initialization ---
const db = getFirestore();
let currentUser;
let currentFilter = 'all'; // State for filtering tasks
let unsubscribe; // To detach the Firestore listener when changing filters

// --- UI Elements ---
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');

// --- Auth State Observer ---
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         currentUser = user;
//         loadTasks(); // Initial load
//     } else {
//         alert("Please log in to manage your tasks.");
//         window.location.href = "/Login-signup/login.html";
//     }
// });

// --- Main Function to Load Tasks ---
function loadTasks() {
    if (!currentUser) return;
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    taskList.innerHTML = '';

    // Detach previous listener if it exists
    if (unsubscribe) unsubscribe();

    // Build the Firestore query based on the current filter
    const todosRef = collection(db, "users", currentUser.uid, "todos");
    let q;
    if (currentFilter === 'pending') {
        q = query(todosRef, where("completed", "==", false), orderBy("createdAt", "desc"));
    } else if (currentFilter === 'completed') {
        q = query(todosRef, where("completed", "==", true), orderBy("completedAt", "desc"));
    } else {
        q = query(todosRef, orderBy("createdAt", "desc"));
    }

    // Attach real-time listener
    unsubscribe = onSnapshot(q, (snapshot) => {
        loadingState.style.display = 'none';
        if (snapshot.empty) {
            emptyState.style.display = 'flex';
            taskList.innerHTML = '';
        } else {
            emptyState.style.display = 'none';
            renderTasks(snapshot.docs);
        }
    });
}

// --- Render Tasks to the DOM ---
function renderTasks(docs) {
    taskList.innerHTML = '';
    docs.forEach(doc => {
        const task = doc.data();
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = doc.id;

        // ✨ Timestamp Formatting ✨
        const createdAt = task.createdAt ? formatDate(task.createdAt.toDate()) : '...';
        const completedAt = task.completedAt ? formatDate(task.completedAt.toDate()) : '';
        const timestampsHTML = `
            <div class="task-timestamps">
                <span>Created: ${createdAt}</span>
                ${task.completed ? ` | <span>Completed: ${completedAt}</span>` : ''}
            </div>
        `;

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <p class="task-text">${task.text}</p>
                ${timestampsHTML}
            </div>
            <div class="task-actions">
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// --- Event Listeners ---

// Add Task Form
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText === '' || !currentUser) return;

    try {
        const todosRef = collection(db, "users", currentUser.uid, "todos");
        await addDoc(todosRef, {
            text: taskText,
            completed: false,
            createdAt: serverTimestamp(),
            completedAt: null
        });
        taskInput.value = '';
    } catch (error) {
        console.error("Error adding task: ", error);
        alert("Could not add task. Please try again.");
    }
});

// Click handler for Checkbox and Delete button
taskList.addEventListener('click', (e) => {
    const target = e.target;
    const li = target.closest('.todo-item');
    if (!li) return;
    const taskId = li.dataset.id;

    // Toggle Complete
    if (target.classList.contains('task-checkbox')) {
        const newStatus = target.checked;
        const taskRef = doc(db, "users", currentUser.uid, "todos", taskId);
        updateDoc(taskRef, {
            completed: newStatus,
            completedAt: newStatus ? serverTimestamp() : null // Set or clear completedAt timestamp
        });
    }

    // Delete Task
    if (target.closest('.delete-btn')) {
        if (confirm("Are you sure you want to delete this task?")) {
            const taskRef = doc(db, "users", currentUser.uid, "todos", taskId);
            deleteDoc(taskRef);
        }
    }
});

// Filter Buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadTasks(); // Reload tasks with the new filter
    });
});

// --- Helper Function ---
function formatDate(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}