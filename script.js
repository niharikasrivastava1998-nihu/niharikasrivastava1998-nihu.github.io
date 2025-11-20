document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Stop the default jump

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        // Smooth scroll animation
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - document.querySelector('nav').offsetHeight, // Adjust for the sticky nav height
                behavior: 'smooth'
            });
        }
    });
});
