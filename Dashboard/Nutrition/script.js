document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const foodNameInput = document.getElementById('food-name');
    const calorieCountInput = document.getElementById('calorie-count');
    const addLogBtn = document.getElementById('add-log-btn');
    const foodLogList = document.getElementById('food-log-list');
    const progressCircle = document.querySelector('.circle-progress');
    const progressText = document.querySelector('.progress-text');
    const totalCaloriesText = document.querySelector('.progress-card div:last-child');

    // Initial values
    let dailyGoal = 2800;
    let currentCalories = 0;

    // Function to update the UI
    function updateUI() {
        // Update total calories display
        totalCaloriesText.textContent = `${currentCalories} / ${dailyGoal} kcal`;

        // Calculate and update progress chart
        let percentage = (currentCalories / dailyGoal) * 100;
        percentage = Math.min(percentage, 100); // Cap at 100%
        const circumference = 2 * Math.PI * 15.9155; // Circumference of the circle
        const strokeDashOffset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDasharray = `${circumference - strokeDashOffset}, ${circumference}`;
        progressText.textContent = `${Math.round(percentage)}%`;
    }

    // Function to add a new food log item
    function addFoodLog(food, calories) {
        const logItem = document.createElement('div');
        logItem.classList.add('log-item');
        logItem.innerHTML = `
            <div>
                <h3>${food}</h3>
                <p>Snack</p> </div>
            <div class="calories">${calories} kcal</div>
        `;
        foodLogList.appendChild(logItem);
    }

    // Add event listener to the "Add to Log" button
    addLogBtn.addEventListener('click', () => {
        const foodName = foodNameInput.value.trim();
        const calorieCount = parseInt(calorieCountInput.value);

        if (foodName && !isNaN(calorieCount) && calorieCount > 0) {
            // Update total calories and add the new log
            currentCalories += calorieCount;
            addFoodLog(foodName, calorieCount);
            updateUI();

            // Clear input fields
            foodNameInput.value = '';
            calorieCountInput.value = '';
        } else {
            alert('Please enter a valid food name and calorie count.');
        }
    });

    // Initial population (for demonstration)
    addFoodLog('Morning Oats', 450);
    currentCalories += 450;
    addFoodLog('Chicken Salad', 620);
    currentCalories += 620;
    addFoodLog('Protein Shake', 250);
    currentCalories += 250;
    addFoodLog('Salmon with Asparagus', 780);
    currentCalories += 780;

    // Initial UI update
    updateUI();
});