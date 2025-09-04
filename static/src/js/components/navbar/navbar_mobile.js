/**
 * FIXED Mobile Menu System - Prevents Menu Closing When Clicking Categories Popup
 */
(function() {
    'use strict';

    // State management
    let mobileMenuInitialized = false;
    let isMainMenuOpen = false;
    let isCategoriesPopupOpen = false;

    /**
     * Toggle body scroll lock
     */
    function toggleBodyScroll(lock) {
        if (lock) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }

    /**
     * Animate hamburger icon transformation
     */
    function toggleHamburgerIcon(isOpen) {
        const line1 = document.getElementById('menu-line-1');
        const line2 = document.getElementById('menu-line-2');

        if (line1 && line2) {
            if (isOpen) {
                // Transform to X
                line1.setAttribute('y1', '12');
                line1.setAttribute('y2', '12');
                line1.style.transform = 'rotate(45deg)';
                line1.style.transformOrigin = 'center';

                line2.setAttribute('y1', '12');
                line2.setAttribute('y2', '12');
                line2.style.transform = 'rotate(-45deg)';
                line2.style.transformOrigin = 'center';
            } else {
                // Transform back to hamburger
                line1.setAttribute('y1', '9');
                line1.setAttribute('y2', '9');
                line1.style.transform = 'rotate(0deg)';

                line2.setAttribute('y1', '15');
                line2.setAttribute('y2', '15');
                line2.style.transform = 'rotate(0deg)';
            }
        }
    }

    /**
     * Open the main mobile menu
     */
    function openMainMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu || !menuContent) {
            console.error('Mobile menu elements not found');
            return;
        }

        console.log('Opening main menu');
        isMainMenuOpen = true;

        // Show the overlay immediately
        mobileMenu.classList.remove('hidden');
        mobileMenu.style.display = 'block';
        mobileMenu.style.visibility = 'visible';
        mobileMenu.style.opacity = '1';

        // Reset content position to hidden state
        menuContent.style.transform = 'translateY(-100%)';
        menuContent.classList.remove('menu-open');

        // Force a reflow then animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                menuContent.style.transform = 'translateY(0)';
                menuContent.classList.add('menu-open');
            });
        });

        toggleBodyScroll(true);
        toggleHamburgerIcon(true);
    }

    /**
     * Close the main mobile menu
     */
    function closeMainMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu || !menuContent) return;

        console.log('Closing main menu');
        isMainMenuOpen = false;

        // Animate content out
        menuContent.style.transform = 'translateY(-100%)';
        menuContent.classList.remove('menu-open');

        // Hide overlay after animation completes
        setTimeout(() => {
            if (!isMainMenuOpen && mobileMenu) {
                mobileMenu.style.opacity = '0';
                mobileMenu.style.visibility = 'hidden';
                mobileMenu.style.display = 'none';
                mobileMenu.classList.add('hidden');
            }
        }, 500);

        // IMPORTANT: Only restore scrolling if categories popup is also closed
        if (!isCategoriesPopupOpen) {
            toggleBodyScroll(false);
        }

        toggleHamburgerIcon(false);
    }

    /**
     * Show categories popup
     */
    function showCategoriesPopup() {
        const popup = document.getElementById('mobile-categories-popup');
        if (!popup) return;

        console.log('Showing categories popup');
        isCategoriesPopupOpen = true;

        popup.style.display = 'flex';
        popup.style.visibility = 'visible';
        popup.style.opacity = '1';
        popup.classList.remove('hidden');

        // Ensure scrolling remains locked when popup opens
        toggleBodyScroll(true);
    }

    /**
     * Hide categories popup
     */
    function hideCategoriesPopup() {
        const popup = document.getElementById('mobile-categories-popup');
        if (!popup) return;

        console.log('Hiding categories popup');
        isCategoriesPopupOpen = false;

        popup.style.opacity = '0';
        popup.style.visibility = 'hidden';
        popup.style.display = 'none';
        popup.classList.add('hidden');

        // IMPORTANT: Only restore scrolling if main menu is also closed
        if (!isMainMenuOpen) {
            toggleBodyScroll(false);
        }
    }

    /**
     * Initialize mobile menu system
     */
    function initMobileMenu() {
        if (mobileMenuInitialized) return true;

        console.log('Initializing mobile menu...');

        // Wait for elements to be available
        const checkElements = () => {
            const mobileMenuButton = document.getElementById('mobile-menu-toggle');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuContent = document.getElementById('menu-content-container');

            if (!mobileMenuButton || !mobileMenu || !menuContent) {
                console.log('Mobile menu elements not ready, waiting...');
                return false;
            }

            return true;
        };

        if (!checkElements()) {
            setTimeout(() => {
                if (!mobileMenuInitialized) {
                    initMobileMenu();
                }
            }, 100);
            return false;
        }

        mobileMenuInitialized = true;
        console.log('Mobile menu elements found, setting up handlers...');

        // Get elements
        const mobileMenuButton = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const categoriesTrigger = document.getElementById('mobile-menu-categories-trigger');
        const categoriesCloseBtn = document.getElementById('mobile-categories-close');

        // Main menu toggle
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Menu button clicked, current state:', isMainMenuOpen);

            if (isMainMenuOpen) {
                closeMainMenu();
            } else {
                openMainMenu();
            }
        });

        // Categories trigger
        if (categoriesTrigger) {
            categoriesTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showCategoriesPopup();
            });
        }

        // Categories close button
        if (categoriesCloseBtn) {
            categoriesCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                hideCategoriesPopup();
            });
        }

        // FIXED: Better outside click handling - prevents main menu from closing when clicking categories popup
        document.addEventListener('click', function(e) {
            // Close categories popup when clicking outside (but not on main menu content)
            if (isCategoriesPopupOpen) {
                const categoriesPopup = document.getElementById('mobile-categories-popup');
                const container = categoriesPopup ? categoriesPopup.querySelector('.mobile-categories-container') : null;
                const menuContent = document.getElementById('menu-content-container');

                // Only close if clicking outside both the categories popup AND the main menu content
                if (categoriesPopup && container &&
                    !container.contains(e.target) &&
                    (!menuContent || !menuContent.contains(e.target))) {
                    hideCategoriesPopup();
                }
            }

            // Close main menu when clicking outside (but only if categories popup is not open)
            else if (isMainMenuOpen && !isCategoriesPopupOpen) {
                const menuButton = document.getElementById('mobile-menu-toggle');
                const mobileMenu = document.getElementById('mobile-menu');
                const menuContent = document.getElementById('menu-content-container');

                if (mobileMenu && menuContent &&
                    !menuContent.contains(e.target) &&
                    !menuButton.contains(e.target)) {
                    closeMainMenu();
                }
            }
        });

        // Close menu when clicking navigation links (except categories trigger)
        const mainMenuLinks = mobileMenu.querySelectorAll('a:not(#mobile-menu-categories-trigger)');
        mainMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMainMenu, 200);
            });
        });

        // Handle category clicks in mobile popup
        const mobileCategories = document.querySelectorAll('.mobile-category-item');
        mobileCategories.forEach(item => {
            item.addEventListener('click', () => {
                hideCategoriesPopup();
                setTimeout(closeMainMenu, 300);
            });
        });

        console.log('Mobile menu initialized successfully!');
        return true;
    }

    /**
     * Multiple initialization attempts for robustness
     */
    function attemptInitialization() {
        let attempts = 0;
        const maxAttempts = 20;

        const tryInit = () => {
            attempts++;
            console.log(`Mobile menu initialization attempt ${attempts}/${maxAttempts}`);

            if (initMobileMenu()) {
                console.log('Mobile menu successfully initialized!');
                return;
            }

            if (attempts < maxAttempts) {
                setTimeout(tryInit, 200);
            } else {
                console.error('Failed to initialize mobile menu after maximum attempts');
            }
        };

        tryInit();
    }

    // Expose functions globally for debugging
    window.openMainMenu = openMainMenu;
    window.closeMainMenu = closeMainMenu;
    window.showCategoriesPopup = showCategoriesPopup;
    window.hideCategoriesPopup = hideCategoriesPopup;

    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInitialization);
    } else {
        attemptInitialization();
    }

    // Also try after window load
    window.addEventListener('load', () => {
        if (!mobileMenuInitialized) {
            attemptInitialization();
        }
    });

    console.log('Mobile navbar module loaded');

})();



