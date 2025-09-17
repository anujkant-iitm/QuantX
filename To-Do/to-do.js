// Ensure Firebase Auth is available
const auth = firebase.auth();

// Firestore reference
const db = firebase.firestore();

let currentUser = null;

// UI elements
const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoUL = document.getElementById("todoUL");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const loadingState = document.getElementById("todoLoading");
const emptyState = document.getElementById("todoEmptyState");

// 🔹 Auth State Change (check if user is logged in)
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", user.uid);
        loadTasks();
    } else {
        alert("Please log in first!");
        window.location.href = "login.html"; // redirect to login if not signed in
    }
});

// 🔹 Load tasks for the logged-in user
function loadTasks() {
    if (!currentUser) return;

    const todosRef = db.collection("users").doc(currentUser.uid).collection("todos");

    todosRef.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        todoUL.innerHTML = "";
        let total = 0, pending = 0, completed = 0;

        if (snapshot.empty) {
            loadingState.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        snapshot.forEach((doc) => {
            const task = doc.data();
            total++;
            if (task.completed) completed++; else pending++;

            const li = document.createElement("li");
            li.className = "todo-item " + (task.completed ? "completed" : "");
            li.innerHTML = `
                <span>${task.text}</span>
                <div class="actions">
                    <button onclick="toggleTask('${doc.id}', ${!task.completed})">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>
                    <button onclick="deleteTask('${doc.id}')">Delete</button>
                </div>
            `;
            todoUL.appendChild(li);
        });

        totalTasks.textContent = total;
        pendingTasks.textContent = pending;
        completedTasks.textContent = completed;

        loadingState.style.display = "none";
        emptyState.style.display = total === 0 ? "block" : "none";
    });
}

// 🔹 Add Task
addBtn.addEventListener("click", () => {
    const text = todoInput.value.trim();
    if (text === "" || !currentUser) return;

    const todosRef = db.collection("users").doc(currentUser.uid).collection("todos");
    todosRef.add({
        text: text,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    todoInput.value = "";
});

// 🔹 Toggle Task Completion
function toggleTask(id, newStatus) {
    const taskRef = db.collection("users").doc(currentUser.uid).collection("todos").doc(id);
    taskRef.update({ completed: newStatus });
}

// 🔹 Delete Task
function deleteTask(id) {
    const taskRef = db.collection("users").doc(currentUser.uid).collection("todos").doc(id);
    taskRef.delete();
}
