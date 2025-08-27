/**
 * ULTIMATE SCROLL FIX - Pixel Perfect Navigation
 * File: /website_customizations/static/src/js/components/navbar/menu_popup.js
 */
(function () {
    'use strict';

    // ================================= STATE & CONFIGURATION =================================
    let menuPopupInitialized = false;
    let hoverTimeout = null;
    let hideTimeout = null;
    let isMouseOverPopup = false;
    let isMouseOverTrigger = false;
    let resizeTimeout = null;
    let popupReady = false;
    let isScrolling = false;
    let scrollTimeout = null;
    let scrollObserver = null;

    // Constants
    const NAVBAR_SELECTOR = 'header, .navbar, #main-navbar, nav';
    const CATEGORY_STRIP_SELECTOR = '#category-strip-wrapper';
    const HOVER_DELAY = 150;
    const HIDE_DELAY = 300;
    const SCROLL_HIDE_DELAY = 50;

    // ================================= ULTIMATE SCROLL CALCULATION =================================

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

        // Force layout recalculation on all potential header elements
        document.body.offsetHeight;

        // Navbar height calculation
        const navbar = document.querySelector(NAVBAR_SELECTOR);
        if (navbar) {
            // Force layout
            navbar.offsetHeight;

            const computedStyle = window.getComputedStyle(navbar);
            const position = computedStyle.position;

            if (position === 'fixed' || position === 'sticky') {
                const height = navbar.getBoundingClientRect().height;
                totalHeight += Math.round(height);
                console.log('Navbar height:', Math.round(height));
            }
        }

        // Category strip height calculation
        const categoryStrip = document.querySelector(CATEGORY_STRIP_SELECTOR);
        if (categoryStrip) {
            // Force layout
            categoryStrip.offsetHeight;

            const stripRect = categoryStrip.getBoundingClientRect();
            const stripHeight = Math.round(stripRect.height);
            totalHeight += stripHeight;
            console.log('Category strip height:', stripHeight);
        }

        // Additional buffer for pixel-perfect alignment
        totalHeight += 15;

        console.log('Total header height:', totalHeight);
        return totalHeight;
    }

    /**
     * ULTIMATE PRECISION SCROLL - Multi-pass with error correction
     */
    function scrollToElementWithPrecision(targetElement) {
        if (!targetElement) {
            console.error('Target element is null');
            return;
        }

        console.log('=== STARTING PRECISION SCROLL ===');
        console.log('Target element:', targetElement.id);

        isScrolling = true;

        // Step 1: Initial calculation and scroll
        function performInitialScroll() {
            return new Promise((resolve) => {
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(targetElement);
                const targetPosition = Math.max(0, elementTop - headerHeight);

                console.log('Initial scroll calculation:', {
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

                console.log('First correction:', {
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

                    console.log('Final correction:', {
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

                    console.log('Pixel correction:', {
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

                    console.log('Final position:', window.pageYOffset);
                    console.log('=== SCROLL COMPLETE ===');

                    resolve();
                }, 50);
            });
        }

        // Execute scroll sequence
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
                console.error('Scroll error:', error);
                isScrolling = false;
            });
    }

    /**
     * Enhanced scroll with intersection observer for accuracy
     */
    function scrollWithIntersectionCheck(targetElement) {
        console.log('Starting enhanced scroll with intersection check');

        // Start the precision scroll
        scrollToElementWithPrecision(targetElement);

        // Set up intersection observer for verification
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const rect = entry.boundingClientRect;
                    const headerHeight = getPreciseHeaderHeight();

                    console.log('Intersection detected:', {
                        top: rect.top,
                        headerHeight: headerHeight,
                        isVisible: rect.top >= 0 && rect.top <= headerHeight + 10
                    });

                    // If not positioned correctly, make final adjustment
                    if (rect.top < 0 || rect.top > headerHeight + 10) {
                        const elementTop = getExactElementTop(targetElement);
                        const correctPosition = Math.max(0, elementTop - headerHeight);
                        window.scrollTo(0, correctPosition);
                        console.log('Final intersection correction applied');
                    }

                    observer.disconnect();
                }
            });
        }, {
            rootMargin: `-${getPreciseHeaderHeight()}px 0px 0px 0px`,
            threshold: 0.1
        });

        observer.observe(targetElement);

        // Cleanup observer after timeout
        setTimeout(() => {
            observer.disconnect();
        }, 2000);
    }

    // ================================= POPUP MANAGEMENT =================================

    function isMobileDevice() {
        return window.innerWidth <= 1023;
    }

    function forceHidePopup() {
        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup) return;

        console.log('Force hiding popup');

        menuPopup.style.display = 'none';
        menuPopup.style.visibility = 'hidden';
        menuPopup.style.opacity = '0';
        menuPopup.style.transform = 'translateY(-100%)';
        menuPopup.style.pointerEvents = 'none';
        menuPopup.classList.remove('show', 'positioned', 'mobile-centered');

        popupReady = false;
    }

    function setupMobilePopup(menuPopup) {
        if (isMobileDevice()) {
            menuPopup.classList.add('mobile-centered');

            menuPopup.style.position = 'fixed';
            menuPopup.style.top = '50%';
            menuPopup.style.left = '50%';
            menuPopup.style.transform = 'translate(-50%, -50%)';
            menuPopup.style.width = '90vw';
            menuPopup.style.maxWidth = '400px';
            menuPopup.style.height = '80vh';
            menuPopup.style.maxHeight = '600px';
            menuPopup.style.borderRadius = '20px';
            menuPopup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            menuPopup.style.zIndex = '9999';

            const contentWrapper = menuPopup.querySelector('.menu-popup-content-wrapper');
            if (contentWrapper) {
                contentWrapper.style.height = '100%';
                contentWrapper.style.overflowY = 'auto';
                contentWrapper.style.padding = '20px';
                contentWrapper.style.maxHeight = 'none';
            }
        } else {
            menuPopup.classList.remove('mobile-centered');

            // Reset desktop styles
            const resetStyles = ['position', 'top', 'left', 'transform', 'width', 'maxWidth', 'height', 'maxHeight', 'borderRadius', 'boxShadow'];
            resetStyles.forEach(style => {
                menuPopup.style[style] = '';
            });
        }
    }

    function adjustScrollBehavior() {
        const menuPopup = document.getElementById('menu-categories-popup');
        const contentWrapper = menuPopup?.querySelector('.menu-popup-content-wrapper');
        if (!menuPopup || !contentWrapper) return;

        if (isMobileDevice()) {
            setupMobilePopup(menuPopup);
        } else {
            const navbar = document.querySelector(NAVBAR_SELECTOR);
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');

            const isLargeScreen = window.innerWidth >= 1400 && window.innerHeight >= 700;
            if (isLargeScreen) {
                contentWrapper.style.overflowY = 'visible';
                contentWrapper.style.maxHeight = 'none';
                menuPopup.style.maxHeight = 'none';
                menuPopup.style.overflow = 'visible';
            } else {
                const maxHeight = `calc(100vh - ${navbarHeight}px - 40px)`;
                contentWrapper.style.overflowY = 'auto';
                contentWrapper.style.maxHeight = maxHeight;
                menuPopup.style.maxHeight = `calc(100vh - ${navbarHeight}px)`;
                menuPopup.style.overflow = 'hidden';
            }
        }
    }

    function preparePopup() {
        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup) return false;

        setupMobilePopup(menuPopup);

        if (!isMobileDevice()) {
            const navbar = document.querySelector(NAVBAR_SELECTOR);
            if (navbar) {
                const navbarHeight = navbar.offsetHeight || 80;
                menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');
            }
        }

        menuPopup.style.display = 'block';
        menuPopup.style.visibility = 'hidden';
        menuPopup.style.opacity = '0';

        if (isMobileDevice()) {
            menuPopup.style.transform = 'translate(-50%, -50%) scale(0.95)';
        } else {
            menuPopup.style.transform = 'translateY(-100%)';
        }

        menuPopup.classList.add('positioned');
        adjustScrollBehavior();

        popupReady = true;
        return true;
    }

    function showPopupNow() {
        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup || !popupReady) return;

        menuPopup.style.visibility = 'visible';
        menuPopup.style.pointerEvents = 'all';

        requestAnimationFrame(() => {
            menuPopup.classList.add('show');
            menuPopup.style.opacity = '1';

            if (isMobileDevice()) {
                menuPopup.style.transform = 'translate(-50%, -50%) scale(1)';
            } else {
                menuPopup.style.transform = 'translateY(0)';
            }

            const cards = menuPopup.querySelectorAll('.menu-popup-item');
            cards.forEach((card, index) => {
                card.style.setProperty('--animation-delay', `${index * 0.05}s`);
                card.style.animation = 'none';
                card.offsetHeight;
                card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                card.style.animationDelay = `var(--animation-delay)`;
            });
        });
    }

    function showPopup() {
        if (isScrolling) return;

        clearTimeout(hideTimeout);
        isMouseOverTrigger = true;

        if (!preparePopup()) return;
        setTimeout(showPopupNow, 13);
    }

    function hidePopup() {
        clearTimeout(hoverTimeout);

        if (!isMouseOverPopup && !isMouseOverTrigger) {
            const menuPopup = document.getElementById('menu-categories-popup');
            if (menuPopup) {
                menuPopup.classList.remove('show');
                menuPopup.style.opacity = '0';

                if (isMobileDevice()) {
                    menuPopup.style.transform = 'translate(-50%, -50%) scale(0.95)';
                } else {
                    menuPopup.style.transform = 'translateY(-100%)';
                }

                setTimeout(forceHidePopup, 300);

                const cards = menuPopup.querySelectorAll('.menu-popup-item');
                cards.forEach(card => {
                    card.style.animation = '';
                    card.style.animationDelay = '';
                    card.style.removeProperty('--animation-delay');
                });
            }
        }
    }

    /**
     * ULTIMATE: Enhanced category click handler with precision scroll
     */
    function handleCategoryClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const item = event.currentTarget;
        const href = item.getAttribute('href');

        console.log('=== CATEGORY CLICK EVENT ===');
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
        forceHidePopup();
        isMouseOverPopup = false;
        isMouseOverTrigger = false;

        // Find target element with validation
        const targetId = href.slice(1);
        console.log('Looking for section:', targetId);

        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.error('Section not found:', targetId);

            // Enhanced debugging
            const allSections = document.querySelectorAll('section[id], div[id], article[id]');
            console.log('Available sections:');
            allSections.forEach(section => {
                console.log(`- ${section.id} (tag: ${section.tagName})`);
            });
            return;
        }

        console.log('Target found:', targetElement);
        console.log('Target offsetTop:', targetElement.offsetTop);
        console.log('Target getBoundingClientRect:', targetElement.getBoundingClientRect());

        // Wait for popup to close, then scroll with precision
        setTimeout(() => {
            scrollWithIntersectionCheck(targetElement);
        }, 150);

        // Update URL after scroll sequence completes
        setTimeout(() => {
            console.log('Updating URL to:', href);
            history.replaceState(null, '', href);
        }, 1500);
    }

    function handleScroll() {
        if (!isScrolling) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (popupReady && !isScrolling) {
                    forceHidePopup();
                    isMouseOverPopup = false;
                    isMouseOverTrigger = false;
                }
            }, SCROLL_HIDE_DELAY);
        }
    }

    // ================================= INITIALIZATION =================================

    function initMenuPopup() {
        if (menuPopupInitialized) return true;

        const menuTrigger = document.getElementById('menu-hover-trigger');
        const menuPopup = document.getElementById('menu-categories-popup');

        if (!menuTrigger || !menuPopup) {
            console.error('Menu elements not found');
            return false;
        }

        console.log('Initializing ultimate menu popup system');
        menuPopupInitialized = true;
        forceHidePopup();

        // Event handlers
        menuTrigger.addEventListener('mouseenter', function () {
            if (!isMobileDevice()) {
                isMouseOverTrigger = true;
                clearTimeout(hideTimeout);
                hoverTimeout = setTimeout(showPopup, HOVER_DELAY);
            }
        });

        menuTrigger.addEventListener('mouseleave', function () {
            if (!isMobileDevice()) {
                isMouseOverTrigger = false;
                clearTimeout(hoverTimeout);
                hideTimeout = setTimeout(hidePopup, HIDE_DELAY);
            }
        });

        menuPopup.addEventListener('mouseenter', function () {
            if (!isMobileDevice()) {
                isMouseOverPopup = true;
                clearTimeout(hideTimeout);
            }
        });

        menuPopup.addEventListener('mouseleave', function () {
            if (!isMobileDevice()) {
                isMouseOverPopup = false;
                hideTimeout = setTimeout(hidePopup, 200);
            }
        });

        // Mobile click handler
        menuTrigger.addEventListener('click', function(e) {
            if (isMobileDevice()) {
                e.preventDefault();
                if (popupReady && menuPopup.classList.contains('show')) {
                    hidePopup();
                } else {
                    showPopup();
                }
            }
        });

        // Category item handlers
        const popupItems = menuPopup.querySelectorAll('.menu-popup-item');
        popupItems.forEach((item) => {
            item.addEventListener('click', handleCategoryClick);
        });

        // Global handlers
        document.addEventListener('click', function (e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                forceHidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        window.addEventListener('scroll', handleScroll, { passive: true });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                forceHidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (popupReady) adjustScrollBehavior();
            }, 250);
        });

        addEnhancedAnimations();
        console.log('Ultimate menu popup system ready');
        return true;
    }

    function addEnhancedAnimations() {
        if (document.getElementById('ultimate-menu-animations')) return;

        const style = document.createElement('style');
        style.id = 'ultimate-menu-animations';
        style.textContent = `
            @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            .menu-popup-item {
                opacity: 0;
                transform: translateY(20px);
                will-change: transform, opacity;
            }

            .menu-categories-popup.show .menu-popup-item {
                opacity: 1;
                transform: translateY(0);
            }

            @media (max-width: 1023px) {
                .menu-popup-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 16px !important;
                }
                .menu-popup-card {
                    height: 140px !important;
                    padding: 16px !important;
                }
                .menu-popup-title { font-size: 14px !important; }
                .menu-popup-image { width: 70px !important; height: 70px !important; }
            }
        `;
        document.head.appendChild(style);
    }

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

    // Enhanced debug methods
    window.menuPopupDebug = {
        scrollTo: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                console.log(`=== MANUAL DEBUG SCROLL TO: ${sectionId} ===`);
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
                const rect = s.getBoundingClientRect();
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

})();