import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();

onAuthStateChanged(auth, user => {
    if (user) {
        initializeApp(user);
    } else {
        window.location.href = '/Login-signup/login.html';
    }
});

function initializeApp(user) {
    const userId = user.uid;
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const workoutForm = document.getElementById('workout-form');
    const historyList = document.getElementById('history-list');
    const loadingState = document.getElementById('workout-loading');
    const emptyState = document.getElementById('workout-empty-state');

    // Add Workout
    workoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const exerciseName = document.getElementById('exercise-name').value;
        const sets = document.getElementById('sets').value;
        const reps = document.getElementById('reps').value;
        const weight = document.getElementById('weight').value;

        if (exerciseName.trim() === '') return;

        await addDoc(workoutsRef, {
            name: exerciseName,
            sets: Number(sets),
            reps: Number(reps),
            weight: Number(weight),
            createdAt: serverTimestamp()
        });
        workoutForm.reset();
    });

    // Fetch and Display Workouts
    const q = query(workoutsRef, orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        loadingState.style.display = 'none';
        historyList.innerHTML = '';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            snapshot.forEach(doc => renderWorkout(doc.data(), doc.id));
        }
    });

    function renderWorkout(workout, id) {
        const li = document.createElement('li');
        const date = workout.createdAt ? workout.createdAt.toDate().toLocaleDateString() : '';
        li.innerHTML = `
            <span>${workout.name}</span>
            <span>${workout.sets}x${workout.reps} @ ${workout.weight}kg</span>
            <span>${date}</span>
            <button class="delete-btn" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
        `;
        historyList.appendChild(li);
    }

    // Delete Workout
    historyList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const workoutId = deleteBtn.dataset.id;
            await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
        }
    });
}