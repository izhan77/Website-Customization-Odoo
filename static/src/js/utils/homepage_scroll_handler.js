/**
 * Homepage Scroll Handler
 * Handles scrolling to sections when arriving from checkout page
 */

function initHomepageScrollHandler() {
    // Check if we need to scroll to a specific section
    const sectionToScrollTo = sessionStorage.getItem('scrollToSection');

    if (sectionToScrollTo) {
        console.log('HomepageScroll - Scrolling to section:', sectionToScrollTo);

        // Clear the storage
        sessionStorage.removeItem('scrollToSection');

        // Wait for page to fully load
        const checkSection = () => {
            const targetElement = document.getElementById(sectionToScrollTo);

            if (targetElement) {
                // Use existing scroll utility if available
                if (typeof scrollToSectionWithPrecision === 'function') {
                    setTimeout(() => {
                        scrollToSectionWithPrecision(targetElement);
                    }, 300);
                } else {
                    // Fallback scrolling
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            } else {
                // Section not found yet, check again
                setTimeout(checkSection, 100);
            }
        };

        // Start checking for section
        checkSection();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageScrollHandler);
} else {
    initHomepageScrollHandler();
}