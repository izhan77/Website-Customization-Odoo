// Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButtons = document.querySelectorAll('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButtons.length && mobileMenu) {
        mobileMenuButtons.forEach(button => {
            button.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
                mobileMenu.classList.add('animate-fade-in');
            });
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            const isClickInsideMenu = mobileMenu.contains(event.target);
            const isClickOnButton = Array.from(mobileMenuButtons).some(button =>
                button.contains(event.target)
            );

            if (!isClickInsideMenu && !isClickOnButton) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Navbar scroll behavior
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.custom-navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});