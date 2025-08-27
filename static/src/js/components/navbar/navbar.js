/**
 * FIXED Mobile Menu System with Advanced Precision Scrolling
 * File: /website_customizations/static/src/js/components/navbar/navbar_mobile.js
 */
(function() {
    'use strict';

    // ================================= STATE MANAGEMENT =================================
    let mobileMenuInitialized = false;
    let isMainMenuOpen = false;
    let isCategoriesPopupOpen = false;
    let isScrolling = false;

    // ================================= ADVANCED PRECISION SCROLL FUNCTIONS =================================

    /**
     * Get EXACT element position with all layout considerations
     */
    function getExactElementTop(element) {
        if (!element) return 0;

        // Force layout recalculation
        element.offsetHeight;

        // Get bounding rect after layout
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return Math.round(rect.top + scrollTop);
    }

    /**
     * Calculate PRECISE header heights with layout updates
     */
    function getPreciseHeaderHeight() {
        let totalHeight = 0;

        // Force layout recalculation
        document.body.offsetHeight;

        // Navbar height calculation
        const navbar = document.querySelector('header, .navbar, #main-navbar, nav');
        if (navbar) {
            navbar.offsetHeight; // Force layout

            const computedStyle = window.getComputedStyle(navbar);
            const position = computedStyle.position;

            if (position === 'fixed' || position === 'sticky') {
                const height = navbar.getBoundingClientRect().height;
                totalHeight += Math.round(height);
                console.log('Mobile - Navbar height:', Math.round(height));
            }
        }

        // Category strip height calculation
        const categoryStrip = document.querySelector('#category-strip-wrapper');
        if (categoryStrip) {
            categoryStrip.offsetHeight; // Force layout

            const stripRect = categoryStrip.getBoundingClientRect();
            const stripHeight = Math.round(stripRect.height);
            totalHeight += stripHeight;
            console.log('Mobile - Category strip height:', stripHeight);
        }

        // Buffer for perfect alignment
        totalHeight += 15;

        console.log('Mobile - Total header height:', totalHeight);
        return totalHeight;
    }

    /**
     * ADVANCED MOBILE PRECISION SCROLL - Multi-pass with error correction
     */
    function scrollToElementWithPrecision(targetElement) {
        if (!targetElement) {
            console.error('Mobile - Target element is null');
            return;
        }

        console.log('=== MOBILE PRECISION SCROLL START ===');
        console.log('Mobile - Target element:', targetElement.id);

        isScrolling = true;

        // Step 1: Initial calculation and scroll
        function performInitialScroll() {
            return new Promise((resolve) => {
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(targetElement);
                const targetPosition = Math.max(0, elementTop - headerHeight);

                console.log('Mobile - Initial scroll calculation:', {
                    elementTop,
                    headerHeight,
                    targetPosition,
                    currentScroll: window.pageYOffset
                });

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                setTimeout(resolve, 400);
            });
        }

        // Step 2: First correction pass
        function performFirstCorrection() {
            return new Promise((resolve) => {
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(targetElement);
                const targetPosition = Math.max(0, elementTop - headerHeight);
                const currentScroll = window.pageYOffset;
                const difference = Math.abs(currentScroll - targetPosition);

                console.log('Mobile - First correction:', {
                    elementTop,
                    headerHeight,
                    targetPosition,
                    currentScroll,
                    difference
                });

                if (difference > 3) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    setTimeout(resolve, 400);
                } else {
                    resolve();
                }
            });
        }

        // Step 3: Final precision correction
        function performFinalCorrection() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const headerHeight = getPreciseHeaderHeight();
                    const elementTop = getExactElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = Math.abs(currentScroll - targetPosition);

                    console.log('Mobile - Final correction:', {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll,
                        difference
                    });

                    if (difference > 2) {
                        // Final precise scroll without animation
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'auto'
                        });
                    }

                    resolve();
                }, 200);
            });
        }

        // Step 4: Pixel-perfect correction
        function performPixelCorrection() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const headerHeight = getPreciseHeaderHeight();
                    const elementTop = getExactElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = targetPosition - currentScroll;

                    console.log('Mobile - Pixel correction:', {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll,
                        difference
                    });

                    if (Math.abs(difference) > 1) {
                        // Instantaneous pixel-perfect positioning
                        window.scrollTo(0, targetPosition);
                    }

                    console.log('Mobile - Final position:', window.pageYOffset);
                    console.log('=== MOBILE PRECISION SCROLL COMPLETE ===');

                    resolve();
                }, 100);
            });
        }

        // Execute mobile scroll sequence
        performInitialScroll()
            .then(() => performFirstCorrection())
            .then(() => performFinalCorrection())
            .then(() => performPixelCorrection())
            .then(() => {
                setTimeout(() => {
                    isScrolling = false;
                }, 300);
            })
            .catch((error) => {
                console.error('Mobile scroll error:', error);
                isScrolling = false;
            });
    }

    // ================================= UTILITY FUNCTIONS =================================

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

    // ================================= MAIN MOBILE MENU FUNCTIONS =================================

    /**
     * Open the main mobile menu
     */
    function openMainMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuContent = document.getElementById('menu-content-container');

        if (!mobileMenu) return;

        console.log('Opening main mobile menu');
        isMainMenuOpen = true;

        // Show overlay
        mobileMenu.classList.remove('hidden');
        mobileMenu.style.display = 'block';

        // Force reflow
        void mobileMenu.offsetWidth;

        // Animate overlay
        mobileMenu.classList.add('animate-fadeIn');
        mobileMenu.classList.remove('animate-fadeOut');

        // Animate menu content from top
        if (menuContent) {
            menuContent.style.transform = 'translateY(0)';
            menuContent.classList.add('menu-open');
        }

        // Lock scroll and transform icon
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

        console.log('Closing main mobile menu');
        isMainMenuOpen = false;

        // Animate menu content back up
        if (menuContent) {
            menuContent.style.transform = 'translateY(-100%)';
            menuContent.classList.remove('menu-open');
        }

        // Animate overlay out
        mobileMenu.classList.remove('animate-fadeIn');
        mobileMenu.classList.add('animate-fadeOut');

        // Hide after animation
        setTimeout(function() {
            if (mobileMenu && !isMainMenuOpen) {
                mobileMenu.classList.add('hidden');
                mobileMenu.style.display = 'none';
            }
        }, 500);

        // Unlock scroll and reset icon
        toggleBodyScroll(false);
        toggleHamburgerIcon(false);
    }

    // ================================= CATEGORIES POPUP FUNCTIONS =================================

    /**
     * Show the categories popup
     */
    function showCategoriesPopup() {
        const popup = document.getElementById('mobile-categories-popup');

        if (!popup) return;

        console.log('Showing categories popup');
        isCategoriesPopupOpen = true;

        // Show the popup
        popup.classList.remove('hidden');
        popup.style.display = 'flex';

        // Force reflow
        void popup.offsetWidth;

        // Add show class for animation
        popup.classList.add('show');
        popup.classList.add('mobile-categories-popup-enter');
        popup.classList.remove('mobile-categories-popup-exit');

        // Stagger animation for category cards
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
     * Hide the categories popup
     */
    function hideCategoriesPopup() {
        const popup = document.getElementById('mobile-categories-popup');

        if (!popup) return;

        console.log('Hiding categories popup');
        isCategoriesPopupOpen = false;

        // Add exit animation
        popup.classList.remove('mobile-categories-popup-enter');
        popup.classList.add('mobile-categories-popup-exit');
        popup.classList.remove('show');

        // Hide after animation
        setTimeout(() => {
            if (popup && !isCategoriesPopupOpen) {
                popup.classList.add('hidden');
                popup.style.display = 'none';
                popup.classList.remove('mobile-categories-popup-exit');
            }
        }, 300);
    }

    /**
     * FIXED: Handle category item click with advanced precision scroll
     */
    function handleCategoryClick(event, href) {
        event.preventDefault();

        if (!href || !href.startsWith('#')) return;

        console.log('=== MOBILE CATEGORY CLICK ===');
        console.log('Mobile - Category clicked:', href);

        // Visual feedback on the clicked item
        const clickedCard = event.currentTarget.querySelector('.mobile-category-card');
        if (clickedCard) {
            clickedCard.style.transform = 'translateY(0) scale(0.95)';
            clickedCard.style.borderColor = '#7abfba';

            setTimeout(() => {
                clickedCard.style.transform = '';
                clickedCard.style.borderColor = '';
            }, 150);
        }

        // Close categories popup first
        hideCategoriesPopup();

        // Close main menu after a short delay
        setTimeout(() => {
            closeMainMenu();
        }, 100);

        // FIXED: Use advanced precision scroll after menus are closed
        setTimeout(() => {
            const targetId = href.slice(1);
            console.log('Mobile - Looking for section:', targetId);

            const targetElement = document.getElementById(targetId);

            if (!targetElement) {
                console.error('Mobile - Section not found:', targetId);

                // Debug: List available sections
                const allSections = document.querySelectorAll('section[id], div[id], article[id]');
                console.log('Mobile - Available sections:');
                allSections.forEach(section => {
                    console.log(`- ${section.id} (tag: ${section.tagName})`);
                });
                return;
            }

            console.log('Mobile - Target found:', targetElement);

            // Use advanced precision scroll
            scrollToElementWithPrecision(targetElement);

            // Update URL after scroll sequence completes
            setTimeout(() => {
                console.log('Mobile - Updating URL to:', href);
                history.replaceState(null, '', href);
            }, 1500);
        }, 300);
    }

    // ================================= INITIALIZATION =================================

    /**
     * Initialize all mobile menu functionality
     */
    function initMobileMenu() {
        if (mobileMenuInitialized) return false;

        console.log('Initializing mobile menu system...');

        // Get required elements
        const mobileMenuButton = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const categoriesTrigger = document.getElementById('mobile-menu-categories-trigger');
        const categoriesPopup = document.getElementById('mobile-categories-popup');
        const categoriesCloseBtn = document.getElementById('mobile-categories-close');

        if (!mobileMenuButton || !mobileMenu) {
            console.log('Mobile menu elements not found, retrying...');
            return false;
        }

        console.log('Mobile menu elements found!');
        mobileMenuInitialized = true;

        // ================================= EVENT LISTENERS =================================

        // Main menu toggle button
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked!');

            if (isMainMenuOpen) {
                closeMainMenu();
            } else {
                openMainMenu();
            }
        });

        // Categories trigger in main menu
        if (categoriesTrigger) {
            categoriesTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Categories trigger clicked!');

                showCategoriesPopup();
            });
        }

        // Categories popup close button
        if (categoriesCloseBtn) {
            categoriesCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Categories close button clicked!');

                hideCategoriesPopup();
            });
        }

        // FIXED: Category items click handlers with advanced scroll
        if (categoriesPopup) {
            const categoryItems = categoriesPopup.querySelectorAll('.mobile-category-item');
            categoryItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    handleCategoryClick(e, href);
                });
            });
        }

        // Close main menu when clicking on other menu links
        const mainMenuLinks = mobileMenu.querySelectorAll('a:not(#mobile-menu-categories-trigger)');
        mainMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Main menu link clicked, closing menu');
                setTimeout(closeMainMenu, 200);
            });
        });

        // Close menus when clicking outside
        document.addEventListener('click', function(e) {
            // Close categories popup when clicking on its overlay
            if (categoriesPopup &&
                isCategoriesPopupOpen &&
                e.target === categoriesPopup) {
                console.log('Closing categories popup - clicked on overlay');
                hideCategoriesPopup();
            }

            // Close main menu when clicking on its overlay
            if (mobileMenu &&
                isMainMenuOpen &&
                !e.target.closest('#menu-content-container') &&
                !e.target.closest('#mobile-menu-toggle') &&
                !e.target.closest('#mobile-categories-popup')) {
                console.log('Closing main menu - clicked on overlay');
                closeMainMenu();
            }
        });

        // Close menus on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (isCategoriesPopupOpen) {
                    console.log('Closing categories popup - escape key');
                    hideCategoriesPopup();
                } else if (isMainMenuOpen) {
                    console.log('Closing main menu - escape key');
                    closeMainMenu();
                }
            }
        });

        // Close menus on scroll (but not during our precision scroll)
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if ((isCategoriesPopupOpen || isMainMenuOpen) && !isScrolling) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (!isScrolling) {
                        if (isCategoriesPopupOpen) {
                            hideCategoriesPopup();
                        }
                        if (isMainMenuOpen) {
                            closeMainMenu();
                        }
                    }
                }, 100);
            }
        }, { passive: true });

        console.log('Mobile menu system initialized successfully!');
        return true;
    }

    // ================================= INITIALIZATION STRATEGIES =================================

    /**
     * Try to initialize with multiple fallback strategies
     */
    function tryInitialize() {
        if (initMobileMenu()) {
            return; // Success, stop trying
        }
        // If elements not found, keep trying
        setTimeout(tryInitialize, 500);
    }

    // Strategy 1: DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, trying to init mobile menu system');
            setTimeout(tryInitialize, 100);
        });
    } else {
        console.log('DOM already loaded, trying to init mobile menu system');
        setTimeout(tryInitialize, 100);
    }

    // Strategy 2: Window load (fallback)
    window.addEventListener('load', function() {
        console.log('Window loaded, trying to init mobile menu system');
        setTimeout(tryInitialize, 200);
    });

    // Strategy 3: MutationObserver for dynamic content
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'mobile-menu-toggle' ||
                            node.id === 'mobile-menu' ||
                            node.id === 'mobile-categories-popup' ||
                            (node.querySelector && (
                                node.querySelector('#mobile-menu-toggle') ||
                                node.querySelector('#mobile-categories-popup')
                            ))) {
                            console.log('Mobile menu elements detected via mutation observer');
                            setTimeout(tryInitialize, 100);
                        }
                    }
                });
            }
        });
    });

    // Start observing after a short delay
    setTimeout(function() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }, 500);

    // Expose debug methods for mobile
    window.mobileMenuDebug = {
        scrollTo: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                console.log(`=== MOBILE DEBUG SCROLL TO: ${sectionId} ===`);
                scrollToElementWithPrecision(element);
            } else {
                console.error(`Mobile - Section not found: ${sectionId}`);
            }
        }
    };

})();