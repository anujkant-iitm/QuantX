import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, onSnapshot, query, getDocs, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { auth } from '/JavaScript/firebase-config.js';

const db = getFirestore();
let currentUser = null;

// DOM Elements
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('foodName');
const proteinInput = document.getElementById('protein');
const carbsInput = document.getElementById('carbs');
const fatInput = document.getElementById('fat');
const calculatedCaloriesEl = document.getElementById('calculated-calories');
const foodListEl = document.getElementById('food-list');
const emptyLogState = document.getElementById('empty-log-state');

// Summary Elements
const totalCaloriesEl = document.getElementById('total-calories');
const totalProteinEl = document.getElementById('total-protein');
const totalCarbsEl = document.getElementById('total-carbs');
const totalFatEl = document.getElementById('total-fat');

// History Modal Elements
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const closeHistoryBtn = document.getElementById('close-history-btn');
const historyContent = document.getElementById('history-content');

// --- Authentication ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadDailyData();
    } else {
        window.location.href = "/Login-signup/login.html";
    }
});

// --- Real-time Calorie Calculation in Form ---
function calculateKcal() {
    const p = parseFloat(proteinInput.value) || 0;
    const c = parseFloat(carbsInput.value) || 0;
    const f = parseFloat(fatInput.value) || 0;
    const kcal = Math.round((p * 4) + (c * 4) + (f * 9));
    calculatedCaloriesEl.textContent = kcal;
}
[proteinInput, carbsInput, fatInput].forEach(input => input.addEventListener('input', calculateKcal));

// --- Get Current Date (YYYY-MM-DD) ---
function getCurrentDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// --- Load and Display Data for Today ---
function loadDailyData() {
    if (!currentUser) return;
    const dateStr = getCurrentDateString();
    const dailyLogRef = collection(db, "users", currentUser.uid, "nutrition", dateStr, "log");

    onSnapshot(query(dailyLogRef, orderBy("createdAt")), (snapshot) => {
        foodListEl.innerHTML = '';
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

        if (snapshot.empty) {
            emptyLogState.style.display = 'block';
        } else {
            emptyLogState.style.display = 'none';
        }

        snapshot.forEach(doc => {
            const food = doc.data();
            totals.calories += food.calories;
            totals.protein += food.protein;
            totals.carbs += food.carbs;
            totals.fat += food.fat;
            renderFoodItem(doc.id, food);
        });
        updateSummary(totals);
    });
}

function renderFoodItem(id, food) {
    const li = document.createElement('li');
    li.className = 'food-item';
    li.innerHTML = `
        <span class="name">${food.name}</span>
        <span class="macro">P: ${food.protein}g</span>
        <span class="macro">C: ${food.carbs}g</span>
        <span class="macro">F: ${food.fat}g</span>
        <span class="calories">${food.calories} KCal</span>
        <button class="delete-btn" data-id="${id}"><i class="fas fa-trash"></i></button>
    `;
    foodListEl.appendChild(li);
}

function updateSummary(totals) {
    totalCaloriesEl.textContent = Math.round(totals.calories);
    totalProteinEl.textContent = `${Math.round(totals.protein)}g`;
    totalCarbsEl.textContent = `${Math.round(totals.carbs)}g`;
    totalFatEl.textContent = `${Math.round(totals.fat)}g`;
}

// --- Add/Delete Food ---
foodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dateStr = getCurrentDateString();
    const dailyLogRef = collection(db, "users", currentUser.uid, "nutrition", dateStr, "log");

    await addDoc(dailyLogRef, {
        name: foodNameInput.value,
        protein: parseFloat(proteinInput.value),
        carbs: parseFloat(carbsInput.value),
        fat: parseFloat(fatInput.value),
        calories: parseFloat(calculatedCaloriesEl.textContent),
        createdAt: new Date()
    });
    foodForm.reset();
    calculatedCaloriesEl.textContent = '0';
});

foodListEl.addEventListener('click', (e) => {
    if (e.target.closest('.delete-btn')) {
        const id = e.target.closest('.delete-btn').dataset.id;
        const dateStr = getCurrentDateString();
        const docRef = doc(db, "users", currentUser.uid, "nutrition", dateStr, "log", id);
        deleteDoc(docRef);
    }
});

// --- History Modal Logic ---
historyBtn.addEventListener('click', async () => {
    historyContent.innerHTML = '<p>Loading history...</p>';
    historyModal.style.display = 'flex';

    const historyRef = collection(db, "users", currentUser.uid, "nutrition");
    const snapshot = await getDocs(query(historyRef, orderBy('date', 'desc')));

    if (snapshot.empty) {
        historyContent.innerHTML = '<p>No previous nutrition data found.</p>';
        return;
    }

    historyContent.innerHTML = '';
    for (const doc of snapshot.docs) {
        const dayData = doc.data();
        const dayDiv = document.createElement('div');
        dayDiv.className = 'history-day';
        dayDiv.innerHTML = `
            <h4>${doc.id}</h4>
            <div class="macros-summary">
                <div class="summary-item calories"><span style="color: #4CAF50">${Math.round(dayData.totalCalories)}</span><label>KCal</label></div>
                <div class="summary-item"><span>${Math.round(dayData.totalProtein)}g</span><label>Protein</label></div>
                <div class="summary-item"><span>${Math.round(dayData.totalCarbs)}g</span><label>Carbs</label></div>
                <div class="summary-item"><span>${Math.round(dayData.totalFat)}g</span><label>Fat</label></div>
            </div>
        `;
        historyContent.appendChild(dayDiv);
    }
});

closeHistoryBtn.addEventListener('click', () => historyModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.style.display = 'none';
    }
});