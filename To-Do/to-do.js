// To-Do/to-do.js

// Import services from your central config file
import { auth, db } from '/JavaScript/firebase-config.js';

// Import necessary functions from Firebase SDK
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- UI Elements ---
const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoUL = document.getElementById("todoUL");
const loadingState = document.getElementById("todoLoading");
const emptyState = document.getElementById("todoEmptyState");

let currentUser = null;

// --- Authentication Observer ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadTasks();
    } else {
        // Not logged in, redirect to login page
        window.location.href = "/Login-signup/login.html";
    }
});

// --- Load Tasks from Firestore ---
const loadTasks = () => {
    if (!currentUser) return;

    const todosRef = collection(db, "users", currentUser.uid, "todos");
    const q = query(todosRef, orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        loadingState.style.display = "none";
        todoUL.innerHTML = ""; // Clear list before rendering

        if (snapshot.empty) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
            snapshot.forEach(doc => {
                renderTask(doc.id, doc.data());
            });
        }
    });
};

// --- Render a single task item ---
const renderTask = (id, taskData) => {
    const li = document.createElement("li");
    li.className = `todo-item ${taskData.completed ? "completed" : ""}`;
    li.setAttribute('data-id', id);

    li.innerHTML = `
        <div class="todo-checkbox ${taskData.completed ? 'checked' : ''}"></div>
        <span class="todo-text">${taskData.text}</span>
        <button class="delete-btn">✕</button>
    `;
    todoUL.appendChild(li);
};

// --- Add a new Task ---
const addTask = async () => {
    const text = todoInput.value.trim();
    if (text === "" || !currentUser) return;

    try {
        await addDoc(collection(db, "users", currentUser.uid, "todos"), {
            text: text,
            completed: false,
            createdAt: serverTimestamp()
        });
        todoInput.value = ""; // Clear input after adding
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};

// --- Handle Clicks on Task List (Toggle/Delete) ---
const handleListClick = async (e) => {
    const target = e.target;
    const taskItem = target.closest('.todo-item');
    if (!taskItem || !currentUser) return;

    const docId = taskItem.getAttribute('data-id');
    const taskRef = doc(db, "users", currentUser.uid, "todos", docId);

    if (target.matches('.todo-checkbox')) {
        const isCompleted = taskItem.classList.contains('completed');
        await updateDoc(taskRef, { completed: !isCompleted });
    }

    if (target.matches('.delete-btn')) {
        await deleteDoc(taskRef);
    }
};

// --- Event Listeners ---
addBtn.addEventListener("click", addTask);
todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});
todoUL.addEventListener("click", handleListClick);