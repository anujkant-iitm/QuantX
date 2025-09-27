import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();
let currentUser = null;
let currentFilter = 'all';

// UI Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todoInput');
const todoUL = document.getElementById('todoUL');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');
const loadingState = document.getElementById('todoLoading');
const emptyState = document.getElementById('todoEmptyState');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- Authentication ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadTasks();
    } else {
        window.location.href = "/Login-signup/login.html";
    }
});

// --- Load and Render Tasks ---
function loadTasks() {
    if (!currentUser) return;
    const todosRef = collection(db, "users", currentUser.uid, "todos");
    const q = query(todosRef, orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        let allTasks = [];
        snapshot.forEach(doc => allTasks.push({ id: doc.id, ...doc.data() }));
        renderTasks(allTasks);
        updateStats(allTasks);
    });
}

function renderTasks(tasks) {
    todoUL.innerHTML = '';
    loadingState.style.display = 'none';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTasks.forEach(createTaskElement);
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('div');
    checkbox.className = 'todo-checkbox';
    checkbox.addEventListener('click', () => toggleTask(task.id, !task.completed));

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = task.text;

    const timestamps = document.createElement('div');
    timestamps.className = 'timestamps';

    const createdAt = document.createElement('span');
    createdAt.className = 'timestamp';
    createdAt.textContent = `Created: ${formatTimestamp(task.createdAt)}`;
    timestamps.appendChild(createdAt);

    if (task.completed && task.completedAt) {
        const completedAt = document.createElement('span');
        completedAt.className = 'timestamp';
        completedAt.textContent = `Completed: ${formatTimestamp(task.completedAt)}`;
        timestamps.appendChild(completedAt);
    }

    taskDetails.appendChild(text);
    taskDetails.appendChild(timestamps);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(taskDetails);
    li.appendChild(actions);
    todoUL.appendChild(li);
}

// --- Update Statistics ---
function updateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    pendingTasksEl.textContent = pending;
    completedTasksEl.textContent = completed;
}

// --- Event Listeners ---
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text && currentUser) {
        const todosRef = collection(db, "users", currentUser.uid, "todos");
        addDoc(todosRef, {
            text: text,
            completed: false,
            createdAt: serverTimestamp(),
            completedAt: null
        });
        todoInput.value = '';
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadTasks();
    });
});

// --- Firestore Actions ---
function toggleTask(id, newStatus) {
    const taskRef = doc(db, "users", currentUser.uid, "todos", id);
    updateDoc(taskRef, {
        completed: newStatus,
        completedAt: newStatus ? serverTimestamp() : null
    });
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskRef = doc(db, "users", currentUser.uid, "todos", id);
        deleteDoc(taskRef);
    }
}

// --- Utility Functions ---
function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) {
        return '...';
    }
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}