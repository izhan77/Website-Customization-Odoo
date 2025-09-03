/**
 * FIXED SCROLL UTILITIES - Perfect Precision Scrolling
 * File: /website_customizations/static/src/js/utils/scroll_utils.js
 * FIXES: Precise offset calculation, perfect positioning
 */

// Global state management
window.scrollUtils = window.scrollUtils || {
    isScrolling: false,
    cachedNavbarHeight: 0,
    cachedStripHeight: 0,
    lastCalculationTime: 0
};

/**
 * FIXED: Calculate exact scroll offset for perfect positioning
 */
function calculatePreciseScrollOffset() {
    const now = Date.now();

    // Recalculate more frequently for accuracy
    if (now - window.scrollUtils.lastCalculationTime < 50 &&
        (window.scrollUtils.cachedNavbarHeight + window.scrollUtils.cachedStripHeight) > 0) {
        const total = window.scrollUtils.cachedNavbarHeight + window.scrollUtils.cachedStripHeight + 10;
        return total;
    }

    let totalOffset = 0;
    window.scrollUtils.lastCalculationTime = now;

    // FIXED: Better navbar detection and height calculation
    const navbar = document.querySelector('#main-navbar, header, .navbar, nav');
    if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        totalOffset += navbarHeight;
        window.scrollUtils.cachedNavbarHeight = navbarHeight;
    }

    // FIXED: Category strip height - always account for it when sticky
    const categoryStrip = document.getElementById('category-strip-wrapper');
    if (categoryStrip) {
        const stripHeight = categoryStrip.offsetHeight;

        // If the strip exists, always add its height (it will be sticky during scroll)
        totalOffset += stripHeight;
        window.scrollUtils.cachedStripHeight = stripHeight;
    }

    // FIXED: Increased buffer to hide separator lines from previous sections
    totalOffset -= 20; // Increased buffer to scroll past separator lines

    console.log('ScrollUtils - Calculated offset:', totalOffset, {
        navbar: window.scrollUtils.cachedNavbarHeight,
        strip: window.scrollUtils.cachedStripHeight
    });

    return totalOffset;
}

/**
 * FIXED: Get element's exact position
 */
function getElementDocumentTop(element) {
    if (!element) return 0;

    let offsetTop = 0;
    let currentElement = element;

    // More accurate position calculation
    while (currentElement) {
        offsetTop += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
    }

    return offsetTop;
}

/**
 * FIXED: Main smooth scroll function with perfect precision
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

        // FIXED: Force category strip to be sticky immediately
        const categoryStrip = document.getElementById('category-strip-wrapper');
        if (categoryStrip) {
            // Make sure it becomes sticky before calculating
            categoryStrip.classList.add('sticky');
            categoryStrip.style.position = 'fixed';
            categoryStrip.style.top = '0px';
            categoryStrip.style.left = '0';
            categoryStrip.style.right = '0';
            categoryStrip.style.width = '100%';
            categoryStrip.style.zIndex = '9999';

            // Show placeholder
            const placeholder = document.querySelector('.category-strip-placeholder');
            if (placeholder) {
                placeholder.style.display = 'block';
                placeholder.style.height = categoryStrip.offsetHeight + 'px';
            }
        }

        // Wait a moment for sticky to apply, then calculate
        setTimeout(() => {
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

            // Perform the scroll
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Single correction after scroll completes
            setTimeout(() => {
                const finalOffset = calculatePreciseScrollOffset();
                const finalElementTop = getElementDocumentTop(targetElement);
                const finalTarget = Math.max(0, finalElementTop - finalOffset);
                const currentScroll = window.pageYOffset;
                const difference = Math.abs(currentScroll - finalTarget);

                console.log('ScrollUtils - Final check:', {
                    finalTarget,
                    currentScroll,
                    difference
                });

                // Final correction if needed
                if (difference > 5) {
                    window.scrollTo({
                        top: finalTarget,
                        behavior: 'auto'
                    });
                    console.log('ScrollUtils - Final correction applied');
                }

                // Reset state
                setTimeout(() => {
                    window.scrollUtils.isScrolling = false;
                    console.log('=== PRECISION SCROLL COMPLETE ===');
                    resolve();
                }, 100);
            }, 800); // Wait for smooth scroll to complete

        }, 50); // Small delay for sticky to apply
    });
}

/**
 * FIXED: Category click handler
 */
function handleCategoryClick(event) {
    event.preventDefault();

    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const targetId = href.substring(1);

    // Check if we're on checkout page
    const isCheckoutPage = window.location.pathname.includes('/checkout');

    if (isCheckoutPage) {
        console.log('ScrollUtils - On checkout page, redirecting to homepage for:', targetId);

        // Close any open menus/popups
        if (typeof hideCategoriesPopup === 'function') {
            hideCategoriesPopup();
        }
        if (typeof closeMainMenu === 'function') {
            closeMainMenu();
        }

        // Close desktop menu popup
        const menuPopup = document.getElementById('menu-categories-popup');
        if (menuPopup && menuPopup.classList.contains('show')) {
            menuPopup.classList.remove('show');
        }

        // Store the target section for homepage to scroll to
        sessionStorage.setItem('scrollToSection', targetId);

        // Redirect to homepage
        window.location.href = '/';

    } else {
        // Standard behavior for non-checkout pages
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

        // Close desktop menu popup
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
        }, 100);
    }
}

/**
 * Initialize scroll utilities
 */
function initializeScrollUtils() {
    console.log('Initializing Scroll Utils...');

    function attachCategoryHandlers() {
        // Desktop category items
        const desktopItems = document.querySelectorAll('.menu-popup-item, .category-item');
        desktopItems.forEach(item => {
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

    // Re-attach handlers for dynamic content
    const observer = new MutationObserver((mutations) => {
        let shouldReattach = false;

        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
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
            setTimeout(attachCategoryHandlers, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('Scroll utilities initialized successfully!');
}

// Expose functions globally
window.scrollToSectionWithPrecision = scrollToSectionWithPrecision;
window.calculatePreciseScrollOffset = calculatePreciseScrollOffset;
window.getElementDocumentTop = getElementDocumentTop;
window.handleCategoryClick = handleCategoryClick;

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeScrollUtils, 100);
    });
} else {
    setTimeout(initializeScrollUtils, 100);
}

window.addEventListener('load', () => {
    setTimeout(initializeScrollUtils, 200);
});

console.log('Scroll utilities module loaded and ready');