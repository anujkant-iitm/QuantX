// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoUL = document.getElementById('todoUL');
const allBtn = document.getElementById('allBtn');
const pendingBtn = document.getElementById('pendingBtn');
const completedBtn = document.getElementById('completedBtn');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const totalTasks = document.getElementById('totalTasks');
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');

// State management
let todos = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    loadTodos();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    allBtn.addEventListener('click', () => setFilter('all'));
    pendingBtn.addEventListener('click', () => setFilter('pending'));
    completedBtn.addEventListener('click', () => setFilter('completed'));
}

// Load todos from Firestore
async function loadTodos() {
    try {
        loading.style.display = 'block';
        emptyState.style.display = 'none';

        const snapshot = await todosCollection.orderBy('createdAt', 'desc').get();
        todos = [];

        snapshot.forEach(doc => {
            todos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        loading.style.display = 'none';
        renderTodos();
        updateStats();

    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load tasks. Please refresh the page.');
        loading.style.display = 'none';
    }
}

// Add new todo
async function addTodo() {
    const text = todoInput.value.trim();

    if (!text) {
        todoInput.focus();
        return;
    }

    try {
        addBtn.disabled = true;
        addBtn.textContent = 'Adding...';

        const newTodo = {
            text: text,
            completed: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await todosCollection.add(newTodo);

        // Add to local state immediately for better UX
        todos.unshift({
            id: docRef.id,
            ...newTodo,
            createdAt: new Date() // Temporary timestamp for display
        });

        todoInput.value = '';
        renderTodos();
        updateStats();

    } catch (error) {
        console.error('Error adding todo:', error);
        showError('Failed to add task. Please try again.');
    } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Add Task';
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const newCompleted = !todo.completed;

        await todosCollection.doc(id).update({
            completed: newCompleted,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update local state
        todo.completed = newCompleted;
        renderTodos();
        updateStats();

    } catch (error) {
        console.error('Error toggling todo:', error);
        showError('Failed to update task. Please try again.');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        await todosCollection.doc(id).delete();

        // Remove from local state
        todos = todos.filter(todo => todo.id !== id);
        renderTodos();
        updateStats();

    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete task. Please try again.');
    }
}

// Set filter
function setFilter(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (filter === 'all') allBtn.classList.add('active');
    if (filter === 'pending') pendingBtn.classList.add('active');
    if (filter === 'completed') completedBtn.classList.add('active');

    renderTodos();
}

// Get filtered todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'pending':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    todoUL.innerHTML = '';

    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const timestamp = todo.createdAt && todo.createdAt.toDate ?
            formatDate(todo.createdAt.toDate()) :
            formatDate(todo.createdAt || new Date());

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="toggleTodo('${todo.id}')"></div>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <span class="todo-timestamp">${timestamp}</span>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Delete</button>
        `;

        todoUL.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const pending = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}

// Utility functions
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const container = document.querySelector('.container');
    const todoList = document.querySelector('.todo-list');
    container.insertBefore(errorDiv, todoList);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Real-time updates (optional)
function setupRealTimeUpdates() {
    todosCollection.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        todos = [];
        snapshot.forEach(doc => {
            todos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        renderTodos();
        updateStats();
    }, error => {
        console.error('Error in real-time updates:', error);
    });
}

// Uncomment the line below to enable real-time updates
// setupRealTimeUpdates();