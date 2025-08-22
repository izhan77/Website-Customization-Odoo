// Category Strip Sticky Functionality
(function() {
    'use strict';

    let isSticky = false;
    let originalPosition = null;
    let navbarHeight = 80; // Default navbar height
    let categoryStripHeight = 60; // Default category strip height

    function initCategorySticky() {
        console.log('Initializing category strip sticky behavior...');

        const categoryStrip = document.getElementById('category-strip-wrapper');

        if (!categoryStrip) {
            console.log('Category strip not found, retrying...');
            return false;
        }

        // Get actual navbar height
        function getNavbarHeight() {
            const navbar = document.querySelector('.custom-navbar') || document.querySelector('header');
            if (navbar) {
                navbarHeight = navbar.offsetHeight;
                console.log('Navbar height:', navbarHeight);
            }
        }

        // Get category strip height
        function getCategoryStripHeight() {
            if (categoryStrip) {
                categoryStripHeight = categoryStrip.offsetHeight;
                console.log('Category strip height:', categoryStripHeight);
            }
        }

        // Calculate trigger point (where category strip should become sticky)
        function calculateTriggerPoint() {
            if (!originalPosition) {
                const rect = categoryStrip.getBoundingClientRect();
                originalPosition = rect.top + window.pageYOffset;
                console.log('Original position:', originalPosition);
            }
            return originalPosition - navbarHeight;
        }

        // Make category strip sticky
        function makeSticky() {
            if (isSticky) return;

            console.log('Making category strip sticky');
            isSticky = true;

            // Add sticky class with animation
            categoryStrip.classList.add('sticky', 'sticky-animate');

            // Add padding to body to prevent content jump
            document.body.style.paddingTop = (navbarHeight + categoryStripHeight) + 'px';
            document.body.classList.add('category-strip-sticky');

            // Remove animation class after animation completes
            setTimeout(() => {
                categoryStrip.classList.remove('sticky-animate');
            }, 300);
        }

        // Remove sticky behavior
        function removeSticky() {
            if (!isSticky) return;

            console.log('Removing category strip sticky');
            isSticky = false;

            // Remove sticky classes
            categoryStrip.classList.remove('sticky', 'sticky-animate');

            // Remove body padding
            document.body.style.paddingTop = '';
            document.body.classList.remove('category-strip-sticky');
        }

        // Scroll handler
        function handleScroll() {
            if (!categoryStrip) return;

            const triggerPoint = calculateTriggerPoint();
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > triggerPoint && !isSticky) {
                makeSticky();
            } else if (currentScroll <= triggerPoint && isSticky) {
                removeSticky();
            }
        }

        // Throttled scroll handler for better performance
        let scrollTimeout;
        function throttledScrollHandler() {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 10);
            }
        }

        // Resize handler
        function handleResize() {
            getNavbarHeight();
            getCategoryStripHeight();
            originalPosition = null; // Reset to recalculate

            // Recheck sticky state after resize
            setTimeout(() => {
                handleScroll();
            }, 100);
        }

        // Initialize dimensions
        getNavbarHeight();
        getCategoryStripHeight();

        // Add scroll listener
        window.addEventListener('scroll', throttledScrollHandler, { passive: true });

        // Add resize listener
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', function() {
            setTimeout(handleResize, 100);
        });

        // Initial check
        setTimeout(() => {
            handleScroll();
        }, 100);

        console.log('Category strip sticky behavior initialized successfully!');
        return true;
    }

    // Export for use by main category script
    window.initCategorySticky = initCategorySticky;

})();