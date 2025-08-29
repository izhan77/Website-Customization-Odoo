/**
 * FIXED Mobile Menu System - Compatible with Unified Scroll System
 * File: /website_customizations/static/src/js/components/navbar/navbar_mobile.js
 */
(function() {
    'use strict';

    // State management
    let mobileMenuInitialized = false;
    let isMainMenuOpen = false;
    let isCategoriesPopupOpen = false;

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
        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu) return;

        console.log('MobileNavbar - Opening main menu');
        isMainMenuOpen = true;

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
    }

    /**
     * Close the main mobile menu
     */
    function closeMainMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu) return;

        console.log('MobileNavbar - Closing main menu');
        isMainMenuOpen = false;

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
        }, 500);

        toggleBodyScroll(false);
        toggleHamburgerIcon(false);
    }

    /**
     * Show categories popup
     */
    function showCategoriesPopup() {
        const popup = document.getElementById('mobile-categories-popup');
        if (!popup) return;

        console.log('MobileNavbar - Showing categories popup');
        isCategoriesPopupOpen = true;

        popup.classList.remove('hidden');
        popup.style.display = 'flex';
        void popup.offsetWidth;

        popup.classList.add('show');
        popup.classList.add('mobile-categories-popup-enter');
        popup.classList.remove('mobile-categories-popup-exit');

        // Stagger animation for cards
        const cards = popup.querySelectorAll('.mobile-category-item');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    /**
     * Hide categories popup
     */
    function hideCategoriesPopup() {
        const popup = document.getElementById('mobile-categories-popup');
        if (!popup) return;

        console.log('MobileNavbar - Hiding categories popup');
        isCategoriesPopupOpen = false;

        popup.classList.remove('mobile-categories-popup-enter');
        popup.classList.add('mobile-categories-popup-exit');
        popup.classList.remove('show');

        setTimeout(() => {
            if (popup && !isCategoriesPopupOpen) {
                popup.classList.add('hidden');
                popup.style.display = 'none';
                popup.classList.remove('mobile-categories-popup-exit');
            }
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

        // Visual feedback
        const clickedCard = event.currentTarget.querySelector('.mobile-category-card');
        if (clickedCard) {
            clickedCard.style.transform = 'translateY(0) scale(0.95)';
            clickedCard.style.borderColor = '#7abfba';

            setTimeout(() => {
                clickedCard.style.transform = '';
                clickedCard.style.borderColor = '';
            }, 150);
        }

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

        // Close menus on outside click
        document.addEventListener('click', function(e) {
            if (categoriesPopup && isCategoriesPopupOpen && e.target === categoriesPopup) {
                hideCategoriesPopup();
            }

            if (mobileMenu && isMainMenuOpen &&
                !e.target.closest('#menu-content-container') &&
                !e.target.closest('#mobile-menu-toggle') &&
                !e.target.closest('#mobile-categories-popup')) {
                closeMainMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (isCategoriesPopupOpen) {
                    hideCategoriesPopup();
                } else if (isMainMenuOpen) {
                    closeMainMenu();
                }
            }
        });

        // Close on scroll (but not during precision scroll)
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if ((isCategoriesPopupOpen || isMainMenuOpen) && !window.scrollUtils?.isScrolling) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (!window.scrollUtils?.isScrolling) {
                        if (isCategoriesPopupOpen) hideCategoriesPopup();
                        if (isMainMenuOpen) closeMainMenu();
                    }
                }, 100);
            }
        }, { passive: true });

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

    // Multiple initialization strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(tryInitialize, 200);
        });
    } else {
        setTimeout(tryInitialize, 200);
    }

    window.addEventListener('load', () => {
        setTimeout(tryInitialize, 400);
    });

    console.log('MobileNavbar module loaded');

})();