import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { auth } from '/JavaScript/firebase-config.js';

// --- Auth Check ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in, initializing fitness page.");
        initializeApp(user);
    } else {
        console.log("User is not logged in, redirecting to login page.");
    }
});


function initializeApp(user) {
    // --- UI Elements ---
    const addWorkoutBtn = document.getElementById('add-workout-fab');
    const workoutModal = document.getElementById('workoutModal');
    const cancelWorkoutBtn = document.getElementById('cancel-workout-btn');
    const workoutForm = document.getElementById('workout-form');
    const exerciseType = document.getElementById('exercise-type');
    const dynamicFields = document.getElementById('dynamic-fields');
    const logList = document.getElementById('log-list');

    // --- Dynamic Form Logic ---
    const workoutFields = {
        running: `
            <div class="form-group">
                <label for="distance">Distance (km)</label>
                <input type="number" id="distance" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="duration">Duration (minutes)</label>
                <input type="number" id="duration" required>
            </div>`,
        pushups: `
            <div class="form-group">
                <label for="sets">Sets</label>
                <input type="number" id="sets" required>
            </div>
            <div class="form-group">
                <label for="reps">Total Reps</label>
                <input type="number" id="reps" required>
            </div>`,
        squats: `
            <div class="form-group">
                <label for="sets">Sets</label>
                <input type="number" id="sets" required>
            </div>
            <div class="form-group">
                <label for="reps">Total Reps</label>
                <input type="number" id="reps" required>
            </div>`,
        plank: `
            <div class="form-group">
                <label for="duration">Duration (seconds)</label>
                <input type="number"id="duration" required>
            </div>`,
        bicep_curls: `
            <div class="form-group">
                <label for="weight">Weight (kg)</label>
                <input type="number" id="weight" step="0.5" required>
            </div>
            <div class="form-group">
                <label for="reps">Total Reps</label>
                <input type="number" id="reps" required>
            </div>`
    };

    function updateFormFields() {
        dynamicFields.innerHTML = workoutFields[exerciseType.value] || '';
    }

    // --- Event Listeners ---
    addWorkoutBtn.addEventListener('click', () => {
        workoutModal.style.display = 'flex';
        document.getElementById('workout-time').value = new Date().toISOString().slice(0, 16);
        updateFormFields();
    });

    cancelWorkoutBtn.addEventListener('click', () => {
        workoutModal.style.display = 'none';
    });

    exerciseType.addEventListener('change', updateFormFields);

    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedExerciseText = exerciseType.options[exerciseType.selectedIndex].text;
        const workoutData = {
            type: selectedExerciseText,
            time: document.getElementById('workout-time').value
        };

        // Collect data from dynamic fields
        Array.from(dynamicFields.querySelectorAll('input')).forEach(input => {
            workoutData[input.id] = input.value;
        });

        addWorkoutToLog(workoutData);
        workoutModal.style.display = 'none';
        workoutForm.reset();
    });

    // --- Functions to update UI ---
    function addWorkoutToLog(data) {
        // Remove empty state if it exists
        const emptyState = logList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const item = document.createElement('div');
        item.className = 'workout-item';

        let details = '';
        if (data.type === 'Running') {
            details = `<p>${data.distance} km in ${data.duration} mins</p>`;
        } else if (data.type === 'Plank') {
            details = `<p>${data.duration} seconds</p>`;
        } else if (data.type === 'Bicep Curls') {
            details = `<p>${data.reps} reps with ${data.weight} kg</p>`;
        } else {
            details = `<p>${data.sets} sets, ${data.reps} total reps</p>`;
        }

        item.innerHTML = `
            <h3>${data.type}</h3>
            ${details}
            <p style="font-size: 0.8rem; opacity: 0.7;">${new Date(data.time).toLocaleString()}</p>
        `;
        logList.prepend(item);
    }

    // --- Initialize Charts ---
    renderCharts();
}

function renderCharts() {
    // --- Running Chart ---
    const runningCtx = document.getElementById('runningChart').getContext('2d');
    new Chart(runningCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Running Distance (km)',
                data: [10, 12, 15, 13], // Dummy data
                backgroundColor: 'rgba(163, 169, 255, 0.6)',
                borderColor: '#a3a9ff',
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // --- Strength Chart ---
    const strengthCtx = document.getElementById('strengthChart').getContext('2d');
    new Chart(strengthCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Wed', 'Fri'],
            datasets: [{
                label: 'Total Pushups',
                data: [50, 65, 70], // Dummy data
                borderColor: '#4caf50',
                tension: 0.1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}