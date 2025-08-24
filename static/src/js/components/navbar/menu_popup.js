/**
 * Menu Hover Popup Controller - Improved with better hover detection
 */
(function() {
    'use strict';

    let menuPopupInitialized = false;
    let hoverTimeout = null;
    let hideTimeout = null;
    let isMouseOverPopup = false;
    let isMouseOverTrigger = false;

    function initMenuPopup() {
        if (menuPopupInitialized) return;

        console.log('Initializing menu hover popup...');

        const menuTrigger = document.getElementById('menu-hover-trigger');
        const menuPopup = document.getElementById('menu-categories-popup');
        const navbar = document.querySelector('.custom-navbar') || document.querySelector('header');

        if (!menuTrigger || !menuPopup) {
            console.log('Menu popup elements not found, retrying...');
            return false;
        }

        console.log('Menu popup elements found!');
        menuPopupInitialized = true;

        // Calculate and set navbar height for proper positioning
        function updatePopupPosition() {
            if (navbar) {
                const navbarHeight = navbar.offsetHeight;
                menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');
                menuPopup.classList.add('positioned');
            }
        }

        // Show popup function
        function showPopup() {
            clearTimeout(hideTimeout);
            isMouseOverTrigger = true;

            updatePopupPosition();
            menuPopup.classList.add('show');
        }

        // Hide popup function
        function hidePopup() {
            clearTimeout(hoverTimeout);

            // Only hide if mouse is not over popup or trigger
            if (!isMouseOverPopup && !isMouseOverTrigger) {
                menuPopup.classList.remove('show');
            }
        }

        // Menu trigger hover events
        menuTrigger.addEventListener('mouseenter', function() {
            isMouseOverTrigger = true;
            clearTimeout(hideTimeout);
            hoverTimeout = setTimeout(showPopup, 100); // Reduced delay for better UX
        });

        menuTrigger.addEventListener('mouseleave', function() {
            isMouseOverTrigger = false;
            clearTimeout(hoverTimeout);
            hideTimeout = setTimeout(hidePopup, 200); // Reduced delay
        });

        // Popup hover events to keep it open
        menuPopup.addEventListener('mouseenter', function() {
            isMouseOverPopup = true;
            clearTimeout(hideTimeout);
        });

        menuPopup.addEventListener('mouseleave', function() {
            isMouseOverPopup = false;
            hideTimeout = setTimeout(hidePopup, 150); // Reduced delay
        });

        // Handle clicks on category items
        const popupItems = menuPopup.querySelectorAll('.menu-popup-item');
        popupItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();

                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    // Hide popup immediately
                    menuPopup.classList.remove('show');
                    isMouseOverPopup = false;
                    isMouseOverTrigger = false;

                    // Smooth scroll to section
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        // Calculate offset considering navbar and category strip
                        const navbarHeight = navbar ? navbar.offsetHeight : 80;
                        const categoryStrip = document.getElementById('category-strip-wrapper');
                        const categoryStripHeight = categoryStrip ? categoryStrip.offsetHeight : 60;

                        const offsetTop = targetElement.getBoundingClientRect().top +
                                        window.pageYOffset -
                                        navbarHeight -
                                        categoryStripHeight -
                                        20;

                        window.scrollTo({
                            top: Math.max(0, offsetTop),
                            behavior: 'smooth'
                        });

                        // Update category strip active state
                        setTimeout(() => {
                            if (window.categoryStripMain) {
                                const categoryItem = document.querySelector(`.category-item[href="${href}"]`);
                                if (categoryItem) {
                                    window.categoryStripMain.setActiveCategory(categoryItem);
                                }
                            }
                        }, 100);
                    }
                }
            });
        });

        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        // Close popup on scroll
        window.addEventListener('scroll', function() {
            if (menuPopup.classList.contains('show')) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        }, { passive: true });

        // Close popup on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        // Update position on resize
        window.addEventListener('resize', updatePopupPosition);

        // Initial position update
        setTimeout(updatePopupPosition, 100);

        console.log('Menu popup initialized successfully!');
        return true;
    }

    // Multiple initialization strategies
    function tryInitialize() {
        if (initMenuPopup()) {
            return;
        }
        setTimeout(tryInitialize, 500);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInitialize, 100);
        });
    } else {
        setTimeout(tryInitialize, 100);
    }

    // Fallback initialization
    window.addEventListener('load', function() {
        setTimeout(tryInitialize, 200);
    });

})();