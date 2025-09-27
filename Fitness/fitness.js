import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, onSnapshot, query, orderBy, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();
let currentUser = null;
let currentWorkoutId = null; // To track the active workout session

// DOM Elements
const dashboardView = document.getElementById('gym-dashboard-view');
const sessionView = document.getElementById('workout-session-view');
const startWorkoutBtn = document.getElementById('start-workout-btn');
const finishWorkoutBtn = document.getElementById('finish-workout-btn');
const workoutHistoryList = document.getElementById('workout-history-list');
const noHistoryState = document.getElementById('no-history-state');
const workoutDateEl = document.getElementById('workout-date');
const exerciseList = document.getElementById('exercise-list');
const addExerciseForm = document.getElementById('add-exercise-form');
const exerciseNameInput = document.getElementById('exercise-name-input');

// --- Authentication ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadWorkoutHistory();
    } else {
        window.location.href = "/Login-signup/login.html";
    }
});

// --- View Switching ---
function showDashboardView() {
    sessionView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    currentWorkoutId = null;
    exerciseList.innerHTML = '';
}

function showSessionView() {
    dashboardView.classList.add('hidden');
    sessionView.classList.remove('hidden');
    workoutDateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// --- Dashboard Logic ---
async function loadWorkoutHistory() {
    if (!currentUser) return;
    const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
    onSnapshot(query(workoutsRef, orderBy("date", "desc")), (snapshot) => {
        workoutHistoryList.innerHTML = '';
        if (snapshot.empty) {
            noHistoryState.style.display = 'block';
        } else {
            noHistoryState.style.display = 'none';
            snapshot.forEach(doc => renderHistoryItem(doc.id, doc.data()));
        }
    });
}

function renderHistoryItem(id, data) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div>
            <div class="history-item-date">${new Date(data.date).toLocaleDateString()}</div>
            <div class="history-item-summary">${data.exerciseCount || 0} exercises</div>
        </div>
        <i class="fas fa-chevron-right"></i>
    `;
    // TODO: Add click event to view full workout details
    workoutHistoryList.appendChild(item);
}

// --- Workout Session Logic ---
startWorkoutBtn.addEventListener('click', async () => {
    const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
    const newWorkout = {
        date: new Date().toISOString(),
        exerciseCount: 0,
        completed: false
    };
    const docRef = await addDoc(workoutsRef, newWorkout);
    currentWorkoutId = docRef.id;
    loadActiveWorkout();
    showSessionView();
});

finishWorkoutBtn.addEventListener('click', async () => {
    // Update the final exercise count
    const workoutDoc = doc(db, "users", currentUser.uid, "workouts", currentWorkoutId);
    const workoutSnap = await getDoc(workoutDoc);
    const exerciseCount = workoutSnap.data().exerciseCount || 0;
    await updateDoc(workoutDoc, { completed: true, exerciseCount });
    showDashboardView();
});

addExerciseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const exerciseName = exerciseNameInput.value.trim();
    if (exerciseName && currentWorkoutId) {
        const exercisesRef = collection(db, "users", currentUser.uid, "workouts", currentWorkoutId, "exercises");
        await addDoc(exercisesRef, {
            name: exerciseName,
            sets: [],
            createdAt: new Date()
        });

        // Update exercise count on the main workout doc
        const workoutDoc = doc(db, "users", currentUser.uid, "workouts", currentWorkoutId);
        const workoutSnap = await getDoc(workoutDoc);
        const currentCount = workoutSnap.data().exerciseCount || 0;
        await updateDoc(workoutDoc, { exerciseCount: currentCount + 1 });

        addExerciseForm.reset();
    }
});

function loadActiveWorkout() {
    const exercisesRef = collection(db, "users", currentUser.uid, "workouts", currentWorkoutId, "exercises");
    onSnapshot(query(exercisesRef, orderBy("createdAt")), (snapshot) => {
        exerciseList.innerHTML = '';
        snapshot.forEach(doc => renderExerciseLog(doc.id, doc.data()));
    });
}

function renderExerciseLog(id, data) {
    const logDiv = document.createElement('div');
    logDiv.className = 'exercise-log';
    logDiv.dataset.id = id;
    logDiv.innerHTML = `
        <div class="exercise-log-header">
            <h4>${data.name}</h4>
            <button class="delete-exercise-btn"><i class="fas fa-trash"></i></button>
        </div>
        <ul class="set-list">
            ${data.sets.map((set, index) => `<li class="set-item" data-index="${index}"><span>Set ${index + 1}: ${set.weight} kg x ${set.reps} reps</span><span class="delete-set-btn">×</span></li>`).join('')}
        </ul>
        <form class="add-set-form">
            <input type="number" class="weight-input" placeholder="Weight (kg)" required>
            <input type="number" class="reps-input" placeholder="Reps" required>
            <button type="submit">Add Set</button>
        </form>
    `;
    exerciseList.appendChild(logDiv);
}

// --- Event Delegation for Adding/Deleting Sets/Exercises ---
exerciseList.addEventListener('submit', async (e) => {
    if (e.target.classList.contains('add-set-form')) {
        e.preventDefault();
        const exerciseId = e.target.closest('.exercise-log').dataset.id;
        const weight = e.target.querySelector('.weight-input').value;
        const reps = e.target.querySelector('.reps-input').value;

        if (weight && reps) {
            const exerciseDoc = doc(db, "users", currentUser.uid, "workouts", currentWorkoutId, "exercises", exerciseId);
            await updateDoc(exerciseDoc, {
                sets: arrayUnion({ weight: parseFloat(weight), reps: parseInt(reps) })
            });
            e.target.reset();
        }
    }
});

exerciseList.addEventListener('click', async (e) => {
    const exerciseLog = e.target.closest('.exercise-log');
    const exerciseId = exerciseLog.dataset.id;

    // Handle Set Deletion
    if (e.target.classList.contains('delete-set-btn')) {
        const setItem = e.target.closest('.set-item');
        const setIndex = parseInt(setItem.dataset.index);

        const exerciseDocRef = doc(db, "users", currentUser.uid, "workouts", currentWorkoutId, "exercises", exerciseId);
        const exerciseSnap = await getDoc(exerciseDocRef);
        const sets = exerciseSnap.data().sets;
        const setToRemove = sets[setIndex];

        if (setToRemove) {
            await updateDoc(exerciseDocRef, {
                sets: arrayRemove(setToRemove)
            });
        }
    }

    // Handle Exercise Deletion
    if (e.target.closest('.delete-exercise-btn')) {
        if (confirm(`Are you sure you want to delete this exercise?`)) {
            const exerciseDocRef = doc(db, "users", currentUser.uid, "workouts", currentWorkoutId, "exercises", exerciseId);
            await deleteDoc(exerciseDocRef);

            // Decrement exercise count
            const workoutDoc = doc(db, "users", currentUser.uid, "workouts", currentWorkoutId);
            const workoutSnap = await getDoc(workoutDoc);
            const currentCount = workoutSnap.data().exerciseCount || 0;
            await updateDoc(workoutDoc, { exerciseCount: Math.max(0, currentCount - 1) });
        }
    }
});