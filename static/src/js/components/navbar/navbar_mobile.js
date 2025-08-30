/**
 * FIXED Mobile Menu System - Bulletproof Solution
 * This fixes the flash/hide issue by properly managing display states
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
     * FIXED: Open the main mobile menu - No more flashing!
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

        // STEP 1: Show the overlay immediately
        mobileMenu.classList.remove('hidden');
        mobileMenu.style.display = 'block';
        mobileMenu.style.visibility = 'visible';
        mobileMenu.style.opacity = '1';

        // STEP 2: Reset content position to hidden state
        menuContent.style.transform = 'translateY(-100%)';
        menuContent.classList.remove('menu-open');

        // STEP 3: Force a reflow then animate in
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
     * FIXED: Close the main mobile menu - Smooth closing
     */
    function closeMainMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu || !menuContent) return;

        console.log('Closing main menu');
        isMainMenuOpen = false;

        // STEP 1: Animate content out
        menuContent.style.transform = 'translateY(-100%)';
        menuContent.classList.remove('menu-open');

        // STEP 2: Hide overlay after animation completes
        setTimeout(() => {
            if (!isMainMenuOpen && mobileMenu) {
                mobileMenu.style.opacity = '0';
                mobileMenu.style.visibility = 'hidden';
                mobileMenu.style.display = 'none';
                mobileMenu.classList.add('hidden');
            }
        }, 500);

        toggleBodyScroll(false);
        toggleHamburgerIcon(false);
    }

    /**
     * FIXED: Show categories popup
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
    }

    /**
     * FIXED: Hide categories popup
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
    }

    /**
     * FIXED: Initialize mobile menu system with better error handling
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
            // Retry after a short delay
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

        // FIXED: Main menu toggle with better event handling
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

        // FIXED: Better outside click handling
        document.addEventListener('click', function(e) {
            // Close main menu when clicking outside
            if (isMainMenuOpen) {
                const menuButton = document.getElementById('mobile-menu-toggle');
                const mobileMenu = document.getElementById('mobile-menu');
                const menuContent = document.getElementById('menu-content-container');

                if (mobileMenu && menuContent &&
                    !menuContent.contains(e.target) &&
                    !menuButton.contains(e.target)) {
                    closeMainMenu();
                }
            }

            // Close categories popup when clicking outside
            if (isCategoriesPopupOpen) {
                const categoriesPopup = document.getElementById('mobile-categories-popup');
                const container = categoriesPopup ? categoriesPopup.querySelector('.mobile-categories-container') : null;

                if (categoriesPopup && container &&
                    !container.contains(e.target)) {
                    hideCategoriesPopup();
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
     * FIXED: Multiple initialization attempts for robustness
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