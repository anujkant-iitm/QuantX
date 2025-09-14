const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const logoutBtn = document.getElementById('logout');
const logoutModal = document.getElementById('logoutModal');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');

// Toggle sidebar
hamburger.addEventListener('click', () => {
    sidebar.style.left = '3px';
    overlay.style.display = 'block';
});

// Close sidebar when clicking outside
overlay.addEventListener('click', () => {
    sidebar.style.left = '-300px';
    overlay.style.display = 'none';
});

// Logout modal
logoutBtn.addEventListener('click', () => {
    logoutModal.style.display = 'flex';
});

cancelLogout.addEventListener('click', () => {
    logoutModal.style.display = 'none';
});

confirmLogout.addEventListener('click', () => {
    logoutModal.style.display = 'none';
    alert('Logged out!');
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
        logoutModal.style.display = 'none';
    }
});
// Close sidebar on window resize if width > 768px
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.style.left = '-300px';
        overlay.style.display = 'none';
    }
});
// Example: Display user email if available (replace with actual user data retrieval)
// const userEmail = "user@example.com";
// if (userEmail) {
//     const emailDisplay = document.createElement('div');
//     emailDisplay.style.color = '#e5dcfe';
//     emailDisplay.style.fontSize = '0.9rem';
//     emailDisplay.style.marginLeft = '10px';
//     emailDisplay.textContent = userEmail;
//     document.querySelector('.profile').appendChild(emailDisplay);
// }