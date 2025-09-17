// Function to create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Function to handle scroll-triggered fade-in animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 80) {
            element.classList.add('visible');
        }
    });
}

// ✨--- NEW INTERACTIVE SPOTLIGHT EFFECT ---✨
function setupBentoCardInteraction() {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
}


// Initialize all functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    handleScrollAnimations();
    setupBentoCardInteraction();

    // Listen for scroll events to trigger animations
    window.addEventListener('scroll', handleScrollAnimations);
});