/**
 * Menu Popup Controller - With Category Strip Interference Blocker
 * File: /website_customizations/static/src/js/components/navbar/menu_popup.js
 *
 * This version blocks category strip interference during menu popup scrolls only
 */
(function () {
    'use strict';

    // ================================= STATE & CONFIGURATION =================================
    let menuPopupInitialized = false;
    let hoverTimeout = null;
    let hideTimeout = null;
    let isMouseOverPopup = false;
    let isMouseOverTrigger = false;
    let isScrolling = false;

    // Constants - FROM YOUR WORKING CODE
    const NAVBAR_SELECTOR = 'header, .navbar, #main-navbar, nav';
    const CATEGORY_STRIP_SELECTOR = '#category-strip-wrapper';
    const HOVER_DELAY = 150;
    const HIDE_DELAY = 300;

    // ================================= CATEGORY STRIP INTERFERENCE BLOCKER =================================

    /**
     * Block category strip during menu popup scrolls ONLY
     */
    function blockCategoryStripTemporarily(duration = 2000) {
        // Create a temporary flag that category strip can check
        window.menuPopupScrolling = true;

        console.log('🚫 Blocking category strip interference for', duration + 'ms');

        setTimeout(() => {
            window.menuPopupScrolling = false;
            console.log('✅ Category strip interference block removed');
        }, duration);
    }

    // ================================= WORKING SCROLL LOGIC - EXTRACTED FROM YOUR CODE =================================

    /**
     * Get EXACT element position - FROM YOUR WORKING CODE
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
 * Calculate PRECISE header heights - ADJUSTED BUFFER
 */
    function getPreciseHeaderHeight() {
    let totalHeight = 0;

    document.body.offsetHeight;

    const navbar = document.querySelector(NAVBAR_SELECTOR);
    if (navbar) {
        navbar.offsetHeight;
        const computedStyle = window.getComputedStyle(navbar);
        const position = computedStyle.position;

        if (position === 'fixed' || position === 'sticky') {
            const height = navbar.getBoundingClientRect().height;
            totalHeight += Math.round(height);
            console.log('Menu Popup - Navbar height:', Math.round(height));
        }
    }

    const categoryStrip = document.querySelector(CATEGORY_STRIP_SELECTOR);
    if (categoryStrip) {
        categoryStrip.offsetHeight;
        const stripRect = categoryStrip.getBoundingClientRect();
        const stripHeight = Math.round(stripRect.height);
        totalHeight += stripHeight;
        console.log('Menu Popup - Category strip height:', stripHeight);
    }

    // CORRECT positioning - just below the strip
    totalHeight += 20; // Small positive buffer for clean positioning

    console.log('Menu Popup - Total header height:', totalHeight);
    return totalHeight;
}

    /**
     * WORKING PRECISION SCROLL - Multi-pass with error correction - FROM YOUR CODE
     */
    function scrollToElementWithPrecision(targetElement) {
        if (!targetElement) {
            console.error('Target element is null');
            return;
        }

        console.log('=== MENU POPUP PRECISION SCROLL START ===');
        console.log('Target element:', targetElement.id);

        isScrolling = true;

        // BLOCK CATEGORY STRIP INTERFERENCE
        blockCategoryStripTemporarily(3000);

        // Step 1: Initial calculation and scroll
        function performInitialScroll() {
            return new Promise((resolve) => {
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(targetElement);
                const targetPosition = Math.max(0, elementTop - headerHeight);

                console.log('Menu Popup - Initial scroll calculation:', {
                    elementTop,
                    headerHeight,
                    targetPosition,
                    currentScroll: window.pageYOffset
                });

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                setTimeout(resolve, 300);
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

                console.log('Menu Popup - First correction:', {
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
                    setTimeout(resolve, 300);
                } else {
                    resolve();
                }
            });
        }

        // Step 3: Final precision correction
        function performFinalCorrection() {
            return new Promise((resolve) => {
                // Wait for any pending animations
                setTimeout(() => {
                    const headerHeight = getPreciseHeaderHeight();
                    const elementTop = getExactElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = Math.abs(currentScroll - targetPosition);

                    console.log('Menu Popup - Final correction:', {
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
                }, 100);
            });
        }

        // Step 4: Ultra-precise pixel correction
        function performPixelCorrection() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const headerHeight = getPreciseHeaderHeight();
                    const elementTop = getExactElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = targetPosition - currentScroll;

                    console.log('Menu Popup - Pixel correction:', {
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

                    console.log('Menu Popup - Final position:', window.pageYOffset);
                    console.log('=== MENU POPUP PRECISION SCROLL COMPLETE ===');

                    resolve();
                }, 50);
            });
        }

        // Execute scroll sequence - FROM YOUR WORKING CODE
        performInitialScroll()
            .then(() => performFirstCorrection())
            .then(() => performFinalCorrection())
            .then(() => performPixelCorrection())
            .then(() => {
                setTimeout(() => {
                    isScrolling = false;
                }, 200);
            })
            .catch((error) => {
                console.error('Menu Popup - Scroll error:', error);
                isScrolling = false;
            });
    }

    /**
     * Enhanced scroll with intersection observer - FROM YOUR WORKING CODE
     */
    function scrollWithIntersectionCheck(targetElement) {
    console.log('Menu Popup - Starting enhanced scroll with intersection check');

    // Start the precision scroll
    scrollToElementWithPrecision(targetElement);

    // FIX: Ensure rootMargin is always positive
    const headerHeight = getPreciseHeaderHeight();
    const rootMargin = Math.max(headerHeight, 50); // Ensure minimum 50px

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const rect = entry.boundingClientRect;

                console.log('Menu Popup - Intersection detected:', {
                    top: rect.top,
                    headerHeight: headerHeight,
                    isVisible: rect.top >= 0 && rect.top <= headerHeight + 10
                });

                // If not positioned correctly, make final adjustment
                if (rect.top < 0 || rect.top > headerHeight + 10) {
                    const elementTop = getExactElementTop(targetElement);
                    const correctPosition = Math.max(0, elementTop - headerHeight);
                    window.scrollTo(0, correctPosition);
                    console.log('Menu Popup - Final intersection correction applied');
                }

                observer.disconnect();
            }
        });
    }, {
        rootMargin: `-${rootMargin}px 0px 0px 0px`, // Fixed: use positive rootMargin
        threshold: 0.1
    });

    observer.observe(targetElement);

    // Cleanup observer after timeout
    setTimeout(() => {
        observer.disconnect();
    }, 2000);
}

    // ================================= POPUP MANAGEMENT =================================

    function updatePopupPosition() {
        const menuPopup = document.getElementById('menu-categories-popup');
        const navbar = document.querySelector(NAVBAR_SELECTOR);

        if (!menuPopup || !navbar) return;

        const navbarHeight = navbar.offsetHeight || 80;
        menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');
        menuPopup.classList.add('positioned');

        console.log(`Menu popup positioned below navbar at height: ${navbarHeight}px`);
    }

    function showPopup() {
        if (isScrolling) return;

        clearTimeout(hideTimeout);
        isMouseOverTrigger = true;
        updatePopupPosition();

        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup) return;

        menuPopup.classList.add('show');
        console.log('Menu popup shown below navbar');

        // Add stagger animation for cards
        const cards = menuPopup.querySelectorAll('.menu-popup-item');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        });
    }

    function hidePopup() {
        clearTimeout(hoverTimeout);

        if (!isMouseOverPopup && !isMouseOverTrigger) {
            const menuPopup = document.getElementById('menu-categories-popup');
            if (menuPopup) {
                menuPopup.classList.remove('show');
                console.log('Menu popup hidden');

                // Reset card animations
                const cards = menuPopup.querySelectorAll('.menu-popup-item');
                cards.forEach(card => {
                    card.style.animation = '';
                    card.style.animationDelay = '';
                });
            }
        }
    }

    /**
     * WORKING CATEGORY CLICK HANDLER - FROM YOUR CODE
     */
    function handleCategoryClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const item = event.currentTarget;
        const href = item.getAttribute('href');

        console.log('=== MENU POPUP CATEGORY CLICK EVENT ===');
        console.log('Clicked href:', href);

        if (!href || !href.startsWith('#')) {
            console.error('Invalid href:', href);
            return;
        }

        // Visual feedback
        const card = item.querySelector('.menu-popup-card');
        if (card) {
            card.style.transform = 'translateY(-2px) scale(0.95)';
            setTimeout(() => card.style.transform = '', 150);
        }

        // Hide popup immediately
        hidePopup();
        isMouseOverPopup = false;
        isMouseOverTrigger = false;

        // Find target element with validation
        const targetId = href.slice(1);
        console.log('Menu Popup - Looking for section:', targetId);

        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.error('Menu Popup - Section not found:', targetId);

            // Enhanced debugging
            const allSections = document.querySelectorAll('section[id], div[id], article[id]');
            console.log('Available sections:');
            allSections.forEach(section => {
                console.log(`- ${section.id} (tag: ${section.tagName})`);
            });
            return;
        }

        console.log('Menu Popup - Target found:', targetElement);
        console.log('Menu Popup - Target offsetTop:', targetElement.offsetTop);
        console.log('Menu Popup - Target getBoundingClientRect:', targetElement.getBoundingClientRect());

        // Wait for popup to close, then scroll with precision - WORKING LOGIC
        setTimeout(() => {
            scrollWithIntersectionCheck(targetElement);
        }, 150);

        // Update URL after scroll sequence completes
        setTimeout(() => {
            console.log('Menu Popup - Updating URL to:', href);
            history.replaceState(null, '', href);
        }, 1500);
    }

    // ================================= EVENT HANDLERS =================================

    function initMenuPopup() {
        if (menuPopupInitialized) return true;

        const menuTrigger = document.getElementById('menu-hover-trigger');
        const menuPopup = document.getElementById('menu-categories-popup');

        if (!menuTrigger || !menuPopup) {
            console.log('Menu elements not found, retrying...');
            return false;
        }

        console.log('Initializing menu popup system with category strip blocker');
        menuPopupInitialized = true;

        // Desktop hover handling
        menuTrigger.addEventListener('mouseenter', function () {
            console.log('Menu trigger hovered');
            isMouseOverTrigger = true;
            clearTimeout(hideTimeout);
            hoverTimeout = setTimeout(showPopup, HOVER_DELAY);
        });

        menuTrigger.addEventListener('mouseleave', function () {
            console.log('Menu trigger left');
            isMouseOverTrigger = false;
            clearTimeout(hoverTimeout);
            hideTimeout = setTimeout(hidePopup, HIDE_DELAY);
        });

        menuPopup.addEventListener('mouseenter', function () {
            console.log('Menu popup entered');
            isMouseOverPopup = true;
            clearTimeout(hideTimeout);
        });

        menuPopup.addEventListener('mouseleave', function () {
            console.log('Menu popup left');
            isMouseOverPopup = false;
            hideTimeout = setTimeout(hidePopup, 200);
        });

        // Category item click handlers - WORKING LOGIC
        const popupItems = menuPopup.querySelectorAll('.menu-popup-item');
        popupItems.forEach((item) => {
            item.addEventListener('click', handleCategoryClick);
        });

        // Global close handlers
        document.addEventListener('click', function (e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                hidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        // Close on scroll - but respect scrolling state
        window.addEventListener('scroll', function () {
            if (!isScrolling && menuPopup.classList.contains('show')) {
                setTimeout(() => {
                    if (!isScrolling) {
                        hidePopup();
                        isMouseOverPopup = false;
                        isMouseOverTrigger = false;
                    }
                }, 50);
            }
        }, { passive: true });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                hidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        // Update position on resize
        window.addEventListener('resize', updatePopupPosition);
        setTimeout(updatePopupPosition, 100);

        // Add CSS animations
        addMenuPopupAnimations();

        console.log('Menu popup system initialized successfully!');
        return true;
    }

    function addMenuPopupAnimations() {
        if (document.getElementById('menu-popup-animations')) return;

        const style = document.createElement('style');
        style.id = 'menu-popup-animations';
        style.textContent = `
            @keyframes fadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .menu-popup-item {
                opacity: 0;
                transform: translateY(20px);
            }

            .menu-categories-popup.show .menu-popup-item {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    // ================================= INITIALIZATION =================================

    function tryInitialize() {
        if (initMenuPopup()) return;
        setTimeout(tryInitialize, 500);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInitialize, 100));
    } else {
        setTimeout(tryInitialize, 100);
    }

    window.addEventListener('load', () => setTimeout(tryInitialize, 200));

    // Debug methods for testing - FROM YOUR WORKING CODE
    window.menuPopupDebug = {
        scrollTo: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                console.log(`=== MENU POPUP MANUAL DEBUG SCROLL TO: ${sectionId} ===`);
                scrollWithIntersectionCheck(element);
            } else {
                console.error(`Section not found: ${sectionId}`);
                this.listSections();
            }
        },

        listSections: function() {
            const sections = document.querySelectorAll('section[id], div[id], article[id]');
            console.log('=== ALL SECTIONS WITH IDS ===');
            sections.forEach(s => {
                console.log(`${s.id}: ${s.tagName.toLowerCase()}, top: ${getExactElementTop(s)}, visible: ${s.offsetParent !== null}`);
            });
            return Array.from(sections);
        },

        testScroll: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                console.log(`=== TESTING SCROLL CALCULATION FOR: ${sectionId} ===`);
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(element);
                const targetPosition = Math.max(0, elementTop - headerHeight);
                console.log({
                    elementTop,
                    headerHeight,
                    targetPosition,
                    currentScroll: window.pageYOffset
                });
            }
        }
    };

    // Export for global access
    window.menuPopupController = {
        init: initMenuPopup,
        show: showPopup,
        hide: hidePopup,
        scrollToSection: scrollWithIntersectionCheck
    };

})();