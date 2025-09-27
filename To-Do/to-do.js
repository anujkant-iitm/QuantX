function initializeApp(auth, db, firebase) {
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
    firebase.onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log("User logged in:", user.uid);
            loadTasks();
        } else {
            alert("Please log in first!");
            window.location.href = "/Login-signup/login.html"; // redirect to login if not signed in
        }
    });

    // 🔹 Load tasks for the logged-in user
    function loadTasks() {
        if (!currentUser) return;

        const todosRef = firebase.collection(db, "users", currentUser.uid, "todos");
        const q = firebase.query(todosRef, firebase.orderBy("createdAt", "desc"));

        firebase.onSnapshot(q, (snapshot) => {
            todoUL.innerHTML = "";
            let total = 0, pending = 0, completed = 0;

            if (snapshot.empty) {
                loadingState.style.display = "none";
                emptyState.style.display = "block";
                updateStats(0, 0, 0); // Reset stats
                return;
            }

            snapshot.forEach((doc) => {
                const task = doc.data();
                total++;
                if (task.completed) completed++; else pending++;

                const li = document.createElement("li");
                li.className = "todo-item " + (task.completed ? "completed" : "");
                li.innerHTML = `
                    <div class="todo-checkbox ${task.completed ? 'checked' : ''}" data-id="${doc.id}" data-status="${task.completed}"></div>
                    <span class="todo-text">${task.text}</span>
                    <button class="delete-btn" data-id="${doc.id}">Delete</button>
                `;
                todoUL.appendChild(li);
            });

            updateStats(total, pending, completed);
            loadingState.style.display = "none";
            emptyState.style.display = total === 0 ? "block" : "none";
        });
    }

    function updateStats(total, pending, completed) {
        totalTasks.textContent = total;
        pendingTasks.textContent = pending;
        completedTasks.textContent = completed;
    }


    // 🔹 Add Task
    addBtn.addEventListener("click", async () => {
        const text = todoInput.value.trim();
        if (text === "" || !currentUser) return;

        try {
            const todosRef = firebase.collection(db, "users", currentUser.uid, "todos");
            await firebase.addDoc(todosRef, {
                text: text,
                completed: false,
                createdAt: firebase.serverTimestamp()
            });
            todoInput.value = "";
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    });

    // 🔹 Event Delegation for Toggle and Delete
    todoUL.addEventListener('click', (e) => {
        if (e.target.matches('.todo-checkbox')) {
            const id = e.target.dataset.id;
            const currentStatus = e.target.dataset.status === 'true';
            toggleTask(id, !currentStatus);
        }
        if (e.target.matches('.delete-btn')) {
            const id = e.target.dataset.id;
            deleteTask(id);
        }
    });


    // 🔹 Toggle Task Completion
    async function toggleTask(id, newStatus) {
        if (!currentUser) return;
        const taskRef = firebase.doc(db, "users", currentUser.uid, "todos", id);
        try {
            await firebase.updateDoc(taskRef, { completed: newStatus });
        } catch (error) {
            console.error("Error toggling task: ", error);
        }
    }

    // 🔹 Delete Task
    async function deleteTask(id) {
        if (!currentUser) return;
        const taskRef = firebase.doc(db, "users", currentUser.uid, "todos", id);
        try {
            await firebase.deleteDoc(taskRef);
        } catch (error) {
            console.error("Error deleting task: ", error);
        }
    }
}