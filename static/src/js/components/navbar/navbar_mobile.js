/**
 * FIXED Mobile Menu System - Final Complete Solution
 * File: /website_customizations/static/src/js/components/navbar/navbar_mobile.js
 */
(function() {
    'use strict';

    // State management
    let mobileMenuInitialized = false;
    let isMainMenuOpen = false;
    let isCategoriesPopupOpen = false;
    let isAnimating = false;

    /**
     * Wait for scroll utilities to be available
     */
    function waitForScrollUtils() {
        return new Promise((resolve) => {
            const check = () => {
                if (typeof window.scrollToSectionWithPrecision === 'function') {
                    console.log('MobileNavbar - Scroll utilities ready');
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

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
        if (isAnimating) return;

        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu) return;

        console.log('MobileNavbar - Opening main menu');
        isMainMenuOpen = true;
        isAnimating = true;

        // Show overlay
        mobileMenu.classList.remove('hidden');
        mobileMenu.style.display = 'block';

        // Force reflow
        void mobileMenu.offsetWidth;

        // Animate overlay
        mobileMenu.classList.add('animate-fadeIn');
        mobileMenu.classList.remove('animate-fadeOut');

        // Animate menu content
        if (menuContent) {
            menuContent.style.transform = 'translateY(0)';
            menuContent.classList.add('menu-open');
        }

        toggleBodyScroll(true);
        toggleHamburgerIcon(true);

        // Reset animation flag
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    /**
     * Close the main mobile menu
     */
    function closeMainMenu() {
        if (isAnimating) return;

        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu) return;

        console.log('MobileNavbar - Closing main menu');
        isMainMenuOpen = false;
        isAnimating = true;

        // Animate menu content
        if (menuContent) {
            menuContent.style.transform = 'translateY(-100%)';
            menuContent.classList.remove('menu-open');
        }

        // Animate overlay out
        mobileMenu.classList.remove('animate-fadeIn');
        mobileMenu.classList.add('animate-fadeOut');

        // Hide after animation
        setTimeout(() => {
            if (mobileMenu && !isMainMenuOpen) {
                mobileMenu.classList.add('hidden');
                mobileMenu.style.display = 'none';
            }
            isAnimating = false;
        }, 500);

        toggleBodyScroll(false);
        toggleHamburgerIcon(false);
    }

    /**
     * Show categories popup - FIXED CENTERING
     */
    function showCategoriesPopup() {
        if (isAnimating) return;

        const popup = document.getElementById('mobile-categories-popup');
        if (!popup) return;

        console.log('MobileNavbar - Showing categories popup');
        isCategoriesPopupOpen = true;
        isAnimating = true;

        // Reset and center the popup
        popup.classList.remove('hidden');
        popup.style.display = 'flex';
        popup.style.alignItems = 'center';
        popup.style.justifyContent = 'center';
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.zIndex = '1001';

        // Force reflow
        void popup.offsetWidth;

        // Apply show classes
        popup.classList.add('show');

        // Center the container
        const container = popup.querySelector('.mobile-categories-container');
        if (container) {
            container.style.margin = 'auto';
        }

        // Reset animation flag
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }

    /**
     * Hide categories popup - FIXED MULTIPLE CALLS
     */
    function hideCategoriesPopup() {
        if (!isCategoriesPopupOpen || isAnimating) return;

        const popup = document.getElementById('mobile-categories-popup');
        if (!popup) return;

        console.log('MobileNavbar - Hiding categories popup');
        isCategoriesPopupOpen = false;
        isAnimating = true;

        // Remove show classes
        popup.classList.remove('show');

        // Hide after animation
        setTimeout(() => {
            if (popup && !isCategoriesPopupOpen) {
                popup.classList.add('hidden');
                popup.style.display = 'none';
            }
            isAnimating = false;
        }, 300);
    }

    /**
     * FIXED: Handle category clicks using unified scroll system
     */
    function handleMobileCategoryClick(event, href) {
        event.preventDefault();

        if (!href || !href.startsWith('#')) return;

        console.log('=== MOBILE CATEGORY CLICK ===');
        console.log('MobileNavbar - Category clicked:', href);

        // Close menus
        hideCategoriesPopup();
        setTimeout(closeMainMenu, 100);

        // Use unified scroll system after menus close
        setTimeout(() => {
            const targetId = href.slice(1);
            const targetElement = document.getElementById(targetId);

            if (!targetElement) {
                console.error('MobileNavbar - Section not found:', targetId);
                return;
            }

            // Use the global scroll function for smooth scrolling
            if (window.scrollToSectionWithPrecision) {
                window.scrollToSectionWithPrecision(targetElement).then(() => {
                    history.replaceState(null, null, href);
                    console.log('MobileNavbar - Scrolled to section:', targetId);
                });
            } else {
                console.error('MobileNavbar - Scroll function not available');
            }
        }, 300);
    }

    /**
     * Initialize mobile menu system
     */
    async function initMobileMenu() {
        if (mobileMenuInitialized) return true;

        // Wait for scroll utilities
        await waitForScrollUtils();

        console.log('MobileNavbar - Initializing...');

        const mobileMenuButton = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const categoriesTrigger = document.getElementById('mobile-menu-categories-trigger');
        const categoriesPopup = document.getElementById('mobile-categories-popup');
        const categoriesCloseBtn = document.getElementById('mobile-categories-close');

        if (!mobileMenuButton || !mobileMenu) {
            console.log('MobileNavbar - Elements not found, retrying...');
            return false;
        }

        mobileMenuInitialized = true;
        console.log('MobileNavbar - Elements found!');

        // Main menu toggle
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

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

        // Category items with unified scroll handling
        if (categoriesPopup) {
            const categoryItems = categoriesPopup.querySelectorAll('.mobile-category-item');
            categoryItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    handleMobileCategoryClick(e, href);
                });
            });
        }

        // Close menu when clicking other links
        const mainMenuLinks = mobileMenu.querySelectorAll('a:not(#mobile-menu-categories-trigger)');
        mainMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMainMenu, 200);
            });
        });

        // Expose global functions
        window.closeMainMenu = closeMainMenu;
        window.hideCategoriesPopup = hideCategoriesPopup;

        console.log('MobileNavbar - Initialized successfully!');
        return true;
    }

    /**
     * Initialize with retries
     */
    function tryInitialize() {
        initMobileMenu().then(success => {
            if (!success) {
                setTimeout(tryInitialize, 500);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(tryInitialize, 200);
        });
    } else {
        setTimeout(tryInitialize, 200);
    }

    console.log('MobileNavbar module loaded');

})();