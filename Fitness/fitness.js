// Ensure Firebase is initialized
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// UI Elements
const exerciseTypeSelect = document.getElementById('exerciseType');
const exerciseNameInput = document.getElementById('exerciseName');
const dynamicFieldsContainer = document.getElementById('dynamic-fields');
const logWorkoutBtn = document.getElementById('logWorkoutBtn');
const historyList = document.getElementById('workout-history-list');
const historyLoading = document.getElementById('history-loading');
const historyEmpty = document.getElementById('history-empty');

// --- AUTHENTICATION ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        updateForm(); // Initial form setup
        loadWorkoutHistory();
    } else {
        alert("Please log in to track your fitness.");
        window.location.href = "/Login-signup/login.html";
    }
});

// --- DYNAMIC FORM LOGIC ---
exerciseTypeSelect.addEventListener('change', updateForm);

function updateForm() {
    const type = exerciseTypeSelect.value;
    dynamicFieldsContainer.innerHTML = ''; // Clear previous fields

    if (type === 'strength') {
        dynamicFieldsContainer.innerHTML = `
            <div id="sets-container">
                <div class="set-group">
                    <input type="number" class="reps-input" placeholder="Reps">
                    <span>x</span>
                    <input type="number" class="weight-input" placeholder="Weight (kg)">
                </div>
            </div>
            <button type="button" id="addSetBtn">+ Add Set</button>
        `;
        document.getElementById('addSetBtn').addEventListener('click', addSet);
    } else if (type === 'cardio') {
        dynamicFieldsContainer.innerHTML = `
            <div class="input-group">
                <label>Distance</label>
                <input type="number" id="distance" placeholder="e.g., 5">
            </div>
            <div class="input-group">
                <label>Duration (minutes)</label>
                <input type="number" id="duration" placeholder="e.g., 30">
            </div>
        `;
    } else if (type === 'bodyweight') {
        dynamicFieldsContainer.innerHTML = `
             <div id="sets-container">
                <div class="set-group">
                    <input type="number" class="reps-input" placeholder="Reps">
                </div>
            </div>
            <button type="button" id="addSetBtn">+ Add Set</button>
        `;
        document.getElementById('addSetBtn').addEventListener('click', addSet);
    }
}

function addSet() {
    const type = exerciseTypeSelect.value;
    const setsContainer = document.getElementById('sets-container');
    const setGroup = document.createElement('div');
    setGroup.classList.add('set-group');

    if (type === 'strength') {
        setGroup.innerHTML = `
            <input type="number" class="reps-input" placeholder="Reps">
            <span>x</span>
            <input type="number" class="weight-input" placeholder="Weight (kg)">
        `;
    } else { // bodyweight
        setGroup.innerHTML = `<input type="number" class="reps-input" placeholder="Reps">`;
    }
    setsContainer.appendChild(setGroup);
}


// --- SAVE WORKOUT DATA ---
logWorkoutBtn.addEventListener('click', () => {
    if (!currentUser) return;

    const workoutData = {
        exerciseName: exerciseNameInput.value.trim(),
        type: exerciseTypeSelect.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!workoutData.exerciseName) {
        alert("Please enter an exercise name.");
        return;
    }

    if (workoutData.type === 'strength' || workoutData.type === 'bodyweight') {
        workoutData.sets = [];
        const setGroups = dynamicFieldsContainer.querySelectorAll('.set-group');
        setGroups.forEach(set => {
            const reps = set.querySelector('.reps-input').value;
            const weight = workoutData.type === 'strength' ? set.querySelector('.weight-input').value : null;

            if (reps) {
                const setData = { reps: Number(reps) };
                if (weight) setData.weight = Number(weight);
                workoutData.sets.push(setData);
            }
        });
    } else if (workoutData.type === 'cardio') {
        workoutData.distance = Number(document.getElementById('distance').value);
        workoutData.duration = Number(document.getElementById('duration').value);
    }

    // Save to Firestore
    db.collection('users').doc(currentUser.uid).collection('fitnessLogs').add(workoutData)
        .then(() => {
            console.log("Workout logged successfully!");
            exerciseNameInput.value = '';
            updateForm(); // Reset form
        }).catch(error => {
            console.error("Error logging workout: ", error);
        });
});


// --- LOAD WORKOUT HISTORY ---
function loadWorkoutHistory() {
    if (!currentUser) return;

    const historyRef = db.collection('users').doc(currentUser.uid).collection('fitnessLogs').orderBy('createdAt', 'desc');

    historyRef.onSnapshot(snapshot => {
        historyLoading.style.display = 'none';
        if (snapshot.empty) {
            historyEmpty.style.display = 'block';
            historyList.innerHTML = '';
            return;
        }

        historyEmpty.style.display = 'none';
        historyList.innerHTML = '';
        snapshot.forEach(doc => {
            const workout = doc.data();
            const li = document.createElement('li');
            li.classList.add('history-item');

            const date = workout.createdAt ? workout.createdAt.toDate().toLocaleDateString() : 'No date';

            let detailsHtml = '';
            if (workout.type === 'strength') {
                detailsHtml = workout.sets.map(s => `<li>${s.reps} reps at ${s.weight} kg</li>`).join('');
            } else if (workout.type === 'bodyweight') {
                detailsHtml = workout.sets.map(s => `<li>${s.reps} reps</li>`).join('');
            } else if (workout.type === 'cardio') {
                detailsHtml = `<li>Distance: ${workout.distance} km</li><li>Duration: ${workout.duration} min</li>`;
            }

            li.innerHTML = `
                <div class="history-item-header">
                    <span>${workout.exerciseName} (${workout.type})</span>
                    <small>${date}</small>
                </div>
                <ul class="history-item-details">${detailsHtml}</ul>
            `;
            historyList.appendChild(li);
        });
    });
}