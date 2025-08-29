/**
 * COMPLETE SCROLL UTILITIES - FIXED FOR ALL COMPONENTS
 * File: /website_customizations/static/src/js/utils/scroll_utils.js
 * FIXES: Function availability, smooth scrolling, precise positioning
 */

// Global state management
window.scrollUtils = window.scrollUtils || {
    isScrolling: false,
    cachedNavbarHeight: 0,
    cachedStripHeight: 0,
    lastCalculationTime: 0
};

/**
 * Calculate exact scroll offset with caching for performance
 */
function calculatePreciseScrollOffset() {
    const now = Date.now();

    // Use cached values if calculated recently (within 100ms)
    if (now - window.scrollUtils.lastCalculationTime < 100 &&
        (window.scrollUtils.cachedNavbarHeight + window.scrollUtils.cachedStripHeight) > 0) {
        const total = window.scrollUtils.cachedNavbarHeight + window.scrollUtils.cachedStripHeight + 15;
        console.log('Using cached offset:', total);
        return total;
    }

    let totalOffset = 0;
    window.scrollUtils.lastCalculationTime = now;

    // Calculate navbar height
    const navbar = document.querySelector('header, .navbar, #main-navbar, nav');
    if (navbar) {
        const navbarStyle = window.getComputedStyle(navbar);
        const position = navbarStyle.position;

        if (position === 'fixed' || position === 'sticky') {
            const navbarRect = navbar.getBoundingClientRect();
            const navbarHeight = Math.round(navbarRect.height);
            totalOffset += navbarHeight;
            window.scrollUtils.cachedNavbarHeight = navbarHeight;
            console.log('ScrollUtils - Navbar height:', navbarHeight);
        }
    }

    // Calculate category strip height
    const categoryStrip = document.getElementById('category-strip-wrapper');
    if (categoryStrip && categoryStrip.offsetParent !== null) {
        const categoryStyle = window.getComputedStyle(categoryStrip);
        const position = categoryStyle.position;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        const isSticky = position === 'fixed' || position === 'sticky';
        const isScrolledPast = scrollTop > categoryStrip.offsetTop;

        if (isSticky || isScrolledPast) {
            const categoryRect = categoryStrip.getBoundingClientRect();
            const stripHeight = Math.round(categoryRect.height);
            totalOffset += stripHeight;
            window.scrollUtils.cachedStripHeight = stripHeight;
            console.log('ScrollUtils - Category strip height:', stripHeight);
        }
    }

    // MINIMAL buffer - headings will be very close to category strip
    totalOffset -= 20; // NEGATIVE buffer to position headings even closer

    console.log('ScrollUtils - Total calculated offset:', totalOffset);
    return totalOffset;
}

/**
 * Get element's exact position relative to document
 */
function getElementDocumentTop(element) {
    if (!element) return 0;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return Math.round(rect.top + scrollTop);
}

/**
 * MAIN SMOOTH SCROLL FUNCTION - Used by all components
 * This provides smooth scrolling with precise positioning
 */
function scrollToSectionWithPrecision(targetElement) {
    if (!targetElement) {
        console.error('ScrollUtils - Target element is null');
        return Promise.reject('Target element is null');
    }

    console.log('=== PRECISION SCROLL START ===');

    console.log('ScrollUtils - Target:', targetElement.id || 'unnamed element');

    return new Promise((resolve) => {
        // Prevent multiple simultaneous scrolls
        if (window.scrollUtils.isScrolling) {
            console.log('ScrollUtils - Already scrolling, ignoring request');
            return resolve();
        }

        window.scrollUtils.isScrolling = true;

        // Calculate target position
        const offset = calculatePreciseScrollOffset();
        const elementTop = getElementDocumentTop(targetElement);
        const targetPosition = Math.max(0, elementTop - offset);

        console.log('ScrollUtils - Scroll calculation:', {
            elementTop,
            offset,
            targetPosition,
            currentScroll: window.pageYOffset
        });

        // Force category strip to remain sticky during and after scroll
    const categoryStrip = document.getElementById('category-strip-wrapper');
    if (categoryStrip && !categoryStrip.classList.contains('sticky')) {
        categoryStrip.classList.add('sticky');
        // Also update placeholder
        const placeholder = document.querySelector('.category-strip-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
            placeholder.style.height = categoryStrip.offsetHeight + 'px';
        }
    }

        // Initial smooth scroll
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Multi-step correction for perfect positioning
        let correctionStep = 0;
        const maxCorrections = 3;

        function performCorrection() {
            setTimeout(() => {
                correctionStep++;

                // Recalculate for precision
                const currentOffset = calculatePreciseScrollOffset();
                const currentElementTop = getElementDocumentTop(targetElement);
                const currentTarget = Math.max(0, currentElementTop - currentOffset);
                const currentScroll = window.pageYOffset;
                const difference = Math.abs(currentScroll - currentTarget);

                console.log(`ScrollUtils - Correction ${correctionStep}:`, {
                    currentTarget,
                    currentScroll,
                    difference
                });

                if (difference > 3 && correctionStep < maxCorrections) {
                    // Smooth correction
                    window.scrollTo({
                        top: currentTarget,
                        behavior: correctionStep === maxCorrections ? 'auto' : 'smooth'
                    });

                    performCorrection();
                } else {
                    // Final pixel-perfect adjustment
                    setTimeout(() => {
                        const finalOffset = calculatePreciseScrollOffset();
                        const finalElementTop = getElementDocumentTop(targetElement);
                        const finalTarget = Math.max(0, finalElementTop - finalOffset);
                        const finalScroll = window.pageYOffset;

                        if (Math.abs(finalScroll - finalTarget) > 1) {
                            window.scrollTo(0, finalTarget);
                            console.log('ScrollUtils - Final pixel correction applied');
                        }

                        // Reset state
                        setTimeout(() => {
                            window.scrollUtils.isScrolling = false;
                            console.log('=== PRECISION SCROLL COMPLETE ===');
                            resolve();
                        }, 100);
                    }, 150);
                }
            }, correctionStep === 1 ? 600 : 300); // Longer delay for first correction
        }

        // Start correction sequence
        performCorrection();
    });
}

/**
 * Enhanced category click handler with smooth scrolling
 */
function handleCategoryClick(event) {
    event.preventDefault();

    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
        console.error('ScrollUtils - Section not found:', targetId);
        return;
    }

    console.log('ScrollUtils - Category click handler triggered for:', targetId);

    // Close any open menus/popups
    if (typeof hideCategoriesPopup === 'function') {
        hideCategoriesPopup();
    }
    if (typeof closeMainMenu === 'function') {
        closeMainMenu();
    }

    // Close desktop menu popup if open
    const menuPopup = document.getElementById('menu-categories-popup');
    if (menuPopup && menuPopup.classList.contains('show')) {
        menuPopup.classList.remove('show');
    }

    // Wait for menus to close, then scroll
    setTimeout(() => {
        scrollToSectionWithPrecision(targetElement).then(() => {
            // Update URL after successful scroll
            history.replaceState(null, null, href);
        });
    }, 200);
}

/**
 * Initialize scroll utilities when DOM is ready
 */
function initializeScrollUtils() {
    console.log('Initializing Scroll Utils...');

    // Handle all category items with unified approach
    function attachCategoryHandlers() {
        // Desktop category items (menu popup)
        const desktopItems = document.querySelectorAll('.menu-popup-item, .category-item');
        desktopItems.forEach(item => {
            // Remove existing listeners to prevent duplicates
            item.removeEventListener('click', handleCategoryClick);
            item.addEventListener('click', handleCategoryClick);
        });

        // Mobile category items
        const mobileItems = document.querySelectorAll('.mobile-category-item');
        mobileItems.forEach(item => {
            item.removeEventListener('click', handleCategoryClick);
            item.addEventListener('click', handleCategoryClick);
        });

        console.log(`ScrollUtils - Attached handlers to ${desktopItems.length} desktop and ${mobileItems.length} mobile items`);
    }

    // Initial setup
    attachCategoryHandlers();

    // Re-attach handlers when new content is added dynamically
    const observer = new MutationObserver((mutations) => {
        let shouldReattach = false;

        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList?.contains('menu-popup-item') ||
                            node.classList?.contains('category-item') ||
                            node.classList?.contains('mobile-category-item') ||
                            node.querySelector?.('.menu-popup-item, .category-item, .mobile-category-item')) {
                            shouldReattach = true;
                        }
                    }
                });
            }
        });

        if (shouldReattach) {
            console.log('ScrollUtils - Reattaching handlers for new elements');
            setTimeout(attachCategoryHandlers, 100);
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('Scroll utilities initialized successfully!');
}

// Expose functions globally for other scripts
window.scrollToSectionWithPrecision = scrollToSectionWithPrecision;
window.calculatePreciseScrollOffset = calculatePreciseScrollOffset;
window.getElementDocumentTop = getElementDocumentTop;
window.handleCategoryClick = handleCategoryClick;

// Initialize based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeScrollUtils, 100);
    });
} else {
    setTimeout(initializeScrollUtils, 100);
}

// Fallback initialization
window.addEventListener('load', () => {
    setTimeout(initializeScrollUtils, 200);
});

console.log('Scroll utilities module loaded and ready');