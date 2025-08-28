/**
 * UNIFIED SCROLL SYSTEM - Single Source of Truth for All Navigation
 * File: /website_customizations/static/src/js/components/shared/unified_scroll.js
 *
 * This system prevents conflicts between menu popup and category strip calculations
 */
(function() {
    'use strict';

    // ================================= UNIFIED CONFIGURATION =================================
    const SCROLL_CONFIG = {
        NAVBAR_SELECTOR: 'header, .navbar, #main-navbar, nav',
        CATEGORY_STRIP_SELECTOR: '#category-strip-wrapper',
        SCROLL_OFFSET_BUFFER: 15, // Single buffer value
        ANIMATION_DURATION: 400,
        CORRECTION_DELAY: 450,
        FINAL_CORRECTION_DELAY: 100,
        PIXEL_TOLERANCE: 2
    };

    // Global state
    let isScrolling = false;
    let scrollObserver = null;
    let lastCalculatedHeight = null;
    let scrollSystemReady = false;

    // ================================= SINGLE SCROLL CALCULATION SYSTEM =================================

    /**
     * MASTER HEIGHT CALCULATION - Used by all systems
     */
    function getMasterHeaderHeight() {
        // Use cached value if available and recent
        if (lastCalculatedHeight && lastCalculatedHeight.timestamp > Date.now() - 100) {
            return lastCalculatedHeight.height;
        }

        let totalHeight = 0;
        console.log('=== MASTER HEADER HEIGHT CALCULATION ===');

        // Force layout recalculation
        document.body.offsetHeight;

        // Calculate navbar height
        const navbar = document.querySelector(SCROLL_CONFIG.NAVBAR_SELECTOR);
        let navbarHeight = 0;
        if (navbar) {
            navbar.offsetHeight; // Force layout
            const computedStyle = window.getComputedStyle(navbar);
            const position = computedStyle.position;

            if (position === 'fixed' || position === 'sticky') {
                navbarHeight = Math.round(navbar.getBoundingClientRect().height);
                totalHeight += navbarHeight;
                console.log('Navbar height:', navbarHeight);
            }
        }

        // Calculate category strip height
        const categoryStrip = document.querySelector(SCROLL_CONFIG.CATEGORY_STRIP_SELECTOR);
        let stripHeight = 0;
        if (categoryStrip) {
            categoryStrip.offsetHeight; // Force layout
            stripHeight = Math.round(categoryStrip.getBoundingClientRect().height);
            totalHeight += stripHeight;
            console.log('Category strip height:', stripHeight);
        }

        // Add buffer
        totalHeight += SCROLL_CONFIG.SCROLL_OFFSET_BUFFER;

        console.log('MASTER Total header height:', totalHeight);

        // Cache the result
        lastCalculatedHeight = {
            height: totalHeight,
            navbar: navbarHeight,
            strip: stripHeight,
            timestamp: Date.now()
        };

        return totalHeight;
    }

    /**
     * MASTER ELEMENT POSITION CALCULATION
     */
    function getMasterElementTop(element) {
        if (!element) return 0;

        // Force layout recalculation on the element
        element.offsetHeight;

        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return Math.round(rect.top + scrollTop);
    }

    /**
     * MASTER SCROLL FUNCTION - Single source of truth
     */
    function masterScrollToSection(targetElement, source = 'unknown') {
        if (!targetElement) {
            console.error('Target element is null');
            return Promise.reject('No target element');
        }

        if (isScrolling) {
            console.log('Scroll already in progress, queuing...');
            return new Promise((resolve) => {
                setTimeout(() => {
                    masterScrollToSection(targetElement, source).then(resolve);
                }, 100);
            });
        }

        console.log(`=== MASTER SCROLL TO: ${targetElement.id} (from ${source}) ===`);
        isScrolling = true;

        return new Promise((resolve) => {
            // Step 1: Initial precise scroll
            function performInitialScroll() {
                return new Promise((resolveStep) => {
                    const headerHeight = getMasterHeaderHeight();
                    const elementTop = getMasterElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);

                    console.log('Initial scroll:', {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll: window.pageYOffset
                    });

                    // Clear any cached height to force recalculation
                    lastCalculatedHeight = null;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    setTimeout(resolveStep, SCROLL_CONFIG.ANIMATION_DURATION);
                });
            }

            // Step 2: Correction with fresh calculation
            function performCorrection() {
                return new Promise((resolveStep) => {
                    // Force fresh calculation
                    lastCalculatedHeight = null;

                    const headerHeight = getMasterHeaderHeight();
                    const elementTop = getMasterElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = Math.abs(currentScroll - targetPosition);

                    console.log('Correction scroll:', {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll,
                        difference
                    });

                    if (difference > SCROLL_CONFIG.PIXEL_TOLERANCE) {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'auto' // Instant correction
                        });
                    }

                    setTimeout(resolveStep, SCROLL_CONFIG.FINAL_CORRECTION_DELAY);
                });
            }

            // Step 3: Final pixel-perfect adjustment
            function performFinalAdjustment() {
                return new Promise((resolveStep) => {
                    // One final recalculation after everything has settled
                    lastCalculatedHeight = null;

                    const headerHeight = getMasterHeaderHeight();
                    const elementTop = getMasterElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = targetPosition - currentScroll;

                    console.log('Final adjustment:', {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll,
                        difference
                    });

                    if (Math.abs(difference) > 1) {
                        window.scrollTo(0, targetPosition);
                        console.log('Final pixel correction applied');
                    }

                    console.log(`Final position: ${window.pageYOffset}`);
                    console.log('=== MASTER SCROLL COMPLETE ===');

                    resolveStep();
                });
            }

            // Execute scroll sequence
            performInitialScroll()
                .then(() => performCorrection())
                .then(() => performFinalAdjustment())
                .then(() => {
                    setTimeout(() => {
                        isScrolling = false;
                        resolve();
                    }, 100);
                })
                .catch((error) => {
                    console.error('Master scroll error:', error);
                    isScrolling = false;
                    resolve();
                });
        });
    }

    /**
     * SCROLL BY SECTION ID - Convenience function
     */
    function scrollToSectionById(sectionId, source = 'unknown') {
        console.log(`Attempting to scroll to: ${sectionId}`);

        const targetElement = document.getElementById(sectionId);
        if (!targetElement) {
            console.error(`Section not found: ${sectionId}`);

            // Debug: List all available sections
            const allSections = document.querySelectorAll('section[id], div[id*="section"]');
            console.log('Available sections:');
            allSections.forEach(section => {
                console.log(`- ${section.id} (${section.tagName})`);
            });

            return Promise.reject('Section not found');
        }

        return masterScrollToSection(targetElement, source);
    }

    // ================================= INTEGRATION HELPERS =================================

    /**
     * Get consistent header height for other systems
     */
    function getHeaderHeight() {
        return getMasterHeaderHeight();
    }

    /**
     * Check if currently scrolling
     */
    function isCurrentlyScrolling() {
        return isScrolling;
    }

    /**
     * Force recalculation of header heights
     */
    function recalculateHeights() {
        lastCalculatedHeight = null;
        return getMasterHeaderHeight();
    }

    // ================================= GLOBAL API =================================

    // Create global scroll system
    window.unifiedScrollSystem = {
        // Primary scroll functions
        scrollToElement: masterScrollToSection,
        scrollToSection: scrollToSectionById,

        // Utility functions
        getHeaderHeight: getHeaderHeight,
        isScrolling: isCurrentlyScrolling,
        recalculate: recalculateHeights,

        // For debugging
        debug: {
            getMasterHeight: getMasterHeaderHeight,
            getElementTop: getMasterElementTop,
            listSections: function() {
                const sections = document.querySelectorAll('section[id], div[id*="section"]');
                console.log('=== ALL SECTIONS ===');
                sections.forEach(section => {
                    const top = getMasterElementTop(section);
                    console.log(`${section.id}: top=${top}, visible=${section.offsetParent !== null}`);
                });
                return Array.from(sections);
            },
            testScroll: function(sectionId) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const headerHeight = getMasterHeaderHeight();
                    const elementTop = getMasterElementTop(element);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    console.log(`Test calculation for ${sectionId}:`, {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll: window.pageYOffset
                    });
                }
            }
        }
    };

    // ================================= INITIALIZATION =================================

    function initUnifiedScrollSystem() {
        console.log('Initializing Unified Scroll System...');

        // Clear any cached heights
        lastCalculatedHeight = null;

        // Mark as ready
        scrollSystemReady = true;

        // Recalculate on resize
        window.addEventListener('resize', function() {
            setTimeout(() => {
                lastCalculatedHeight = null;
            }, 100);
        });

        console.log('Unified Scroll System ready!');
    }

    // Initialize immediately or on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUnifiedScrollSystem);
    } else {
        initUnifiedScrollSystem();
    }

    // Also expose for manual initialization
    window.initUnifiedScrollSystem = initUnifiedScrollSystem;

})();