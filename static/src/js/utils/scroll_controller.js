/**
 * UNIFIED SCROLL CONTROLLER - Single Source of Truth
 * Replace ALL your scroll files with this one
 * File: /website_customizations/static/src/js/utils/scroll_controller.js
 */

class UnifiedScrollController {
    constructor() {
        // Singleton pattern - only ONE instance
        if (window.scrollController) {
            return window.scrollController;
        }

        // Core state
        this.isScrolling = false;
        this.scrollQueue = [];
        this.activeScrollId = null;

        // Cached measurements
        this.cachedMeasurements = {
            navbar: 0,
            strip: 0,
            lastUpdate: 0
        };

        // Configuration
        this.config = {
            scrollDuration: 800,
            offsetBuffer: 20, // Extra pixels to ensure section title is visible
            measurementCacheDuration: 100, // ms
            scrollCompleteDelay: 100 // ms to wait after scroll completes
        };

        // Initialize
        this.init();

        // Store singleton
        window.scrollController = this;
    }

    /**
 * Generate category slug to match backend
 */
generateSlug(name) {
    return name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/&/g, '')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-section';
}

    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('🚀 Unified Scroll Controller initializing...');

        // Setup category strip sticky behavior ONCE
        this.setupCategoryStrip();

        // Attach event handlers ONCE
        this.attachEventHandlers();

        // Handle initial navigation if coming from another page
        this.handleInitialNavigation();

        console.log('✅ Unified Scroll Controller ready');
    }

    /**
     * Setup category strip sticky behavior
     */
    setupCategoryStrip() {
        this.categoryStrip = document.getElementById('category-strip-wrapper');
        if (!this.categoryStrip) return;

        this.originalStripTop = this.categoryStrip.offsetTop;
        this.isStripSticky = false;

        // Create placeholder once
        this.stripPlaceholder = document.querySelector('.category-strip-placeholder');
        if (!this.stripPlaceholder) {
            this.stripPlaceholder = document.createElement('div');
            this.stripPlaceholder.className = 'category-strip-placeholder';
            this.categoryStrip.parentNode.insertBefore(
                this.stripPlaceholder,
                this.categoryStrip.nextSibling
            );
        }

        this.setupHorizontalScrolling();
        this.setupActiveTracking();

        // Single scroll handler for sticky
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    this.updateStickyState();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });
    }

    /**
     * Update sticky state for category strip
     */
    updateStickyState() {
        if (!this.categoryStrip || this.isScrolling) return;

        const scrollTop = window.pageYOffset;

        // Make sticky when scrolled past original position
        if (!this.isStripSticky && scrollTop > this.originalStripTop) {
            this.makeStripSticky();
        }
        // Remove sticky when scrolled back up
        else if (this.isStripSticky && scrollTop <= this.originalStripTop) {
            this.removeStripSticky();
        }
    }

    makeStripSticky() {
        if (this.isStripSticky) return;

        this.isStripSticky = true;
        const stripHeight = this.categoryStrip.offsetHeight;

        // Show placeholder
        this.stripPlaceholder.style.height = stripHeight + 'px';
        this.stripPlaceholder.style.display = 'block';

        // Make strip sticky at top
        this.categoryStrip.style.position = 'fixed';
        this.categoryStrip.style.top = '0';
        this.categoryStrip.style.left = '0';
        this.categoryStrip.style.right = '0';
        this.categoryStrip.style.width = '100%';
        this.categoryStrip.style.zIndex = '1000';
        this.categoryStrip.classList.add('sticky');

        console.log('📍 Category strip sticky');
    }

    removeStripSticky() {
        if (!this.isStripSticky) return;

        this.isStripSticky = false;

        // Hide placeholder
        this.stripPlaceholder.style.height = '0';
        this.stripPlaceholder.style.display = 'none';

        // Remove sticky
        this.categoryStrip.style.position = '';
        this.categoryStrip.style.top = '';
        this.categoryStrip.style.left = '';
        this.categoryStrip.style.right = '';
        this.categoryStrip.style.width = '';
        this.categoryStrip.style.zIndex = '';
        this.categoryStrip.classList.remove('sticky');

        console.log('📍 Category strip normal');
    }

    /**
 * Setup horizontal scrolling for category strip
 */
setupHorizontalScrolling() {
    this.scrollContainer = document.getElementById('categories-container');
    this.leftArrow = document.getElementById('scroll-left');
    this.rightArrow = document.getElementById('scroll-right');
    this.currentTransform = 0;

    if (!this.scrollContainer || !this.leftArrow || !this.rightArrow) return;

    // Arrow click handlers
    this.leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollStripLeft();
    });

    this.rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollStripRight();
    });

    // Initial arrow state
    this.updateArrowVisibility();
}

/**
 * Setup active state tracking while scrolling
 */
setupActiveTracking() {
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            this.updateActiveCategoryOnScroll();
        }, 100);
    }, { passive: true });
}

/**
 * Update active category based on scroll position
 */
updateActiveCategoryOnScroll() {
    if (this.isScrolling) return; // Don't update during manual scrolling

    const sections = document.querySelectorAll('section[id]');
    const scrollTop = window.pageYOffset + this.calculateOffset() + 50; // Better offset

    let activeSection = null;
    let closestDistance = Infinity;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionMiddle = sectionTop + (sectionHeight / 2);

        // Calculate distance from viewport center
        const distance = Math.abs(scrollTop - sectionMiddle);

        if (distance < closestDistance && scrollTop >= sectionTop - 100) {
            closestDistance = distance;
            activeSection = section.id;
        }
    });

    if (activeSection) {
        this.setActiveCategory(activeSection);
    }
}

setupActiveTracking() {
    let scrollTimeout;
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;

        // Only update if scrolled significantly
        if (Math.abs(scrollTop - lastScrollTop) > 50) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveCategoryOnScroll();
                lastScrollTop = scrollTop;
            }, 150);
        }
    }, { passive: true });
}

/**
 * Scroll strip left
 */
scrollStripLeft() {
    const scrollAmount = 300;
    this.currentTransform = Math.min(this.currentTransform + scrollAmount, 0);
    this.applyStripTransform();
}

/**
 * Scroll strip right
 */
scrollStripRight() {
    const wrapper = document.getElementById('categories-wrapper');
    if (!wrapper) return;

    const containerWidth = wrapper.offsetWidth;
    const contentWidth = this.scrollContainer.scrollWidth;
    const maxScroll = -(contentWidth - containerWidth);
    const scrollAmount = 300;

    this.currentTransform = Math.max(this.currentTransform - scrollAmount, maxScroll);
    this.applyStripTransform();
}

/**
 * Apply transform to strip container
 */
applyStripTransform() {
    this.scrollContainer.style.transform = `translateX(${this.currentTransform}px)`;
    this.updateArrowVisibility();
}

/**
 * Update arrow visibility based on scroll position
 */
updateArrowVisibility() {
    const wrapper = document.getElementById('categories-wrapper');
    if (!wrapper) return;

    const containerWidth = wrapper.offsetWidth;
    const contentWidth = this.scrollContainer.scrollWidth;

    // Left arrow
    if (this.currentTransform >= 0) {
        this.leftArrow.style.display = 'none';
    } else {
        this.leftArrow.style.display = 'flex';
    }

    // Right arrow
    if (Math.abs(this.currentTransform) >= contentWidth - containerWidth - 5) {
        this.rightArrow.style.display = 'none';
    } else {
        this.rightArrow.style.display = 'flex';
    }
}

    /**
     * Attach all event handlers ONCE
     */
    attachEventHandlers() {
    console.log('🎯 Attaching event handlers for ALL category types...');

    // Use event delegation for ALL category clicks from ANY source
    document.addEventListener('click', (e) => {
        const target = e.target.closest(
            '.category-item, .menu-popup-item, .mobile-category-item, [data-category], [data-section]'
        );

        if (target) {
            e.preventDefault();
            this.handleCategoryClick(target);
        }
    });

    console.log('✅ Event handlers attached via delegation');
}

    /**
     * Handle category click
     */
    handleCategoryClick(element) {
    const href = element.getAttribute('href');
    const dataCategory = element.getAttribute('data-category');
    const dataSection = element.getAttribute('data-section');

    // Get target ID from any possible attribute
    const targetId = dataCategory || dataSection || (href ? href.substring(1) : null);

    console.log('🎯 Category clicked:', { href, dataCategory, dataSection, targetId });

    if (!targetId) {
        console.error('❌ No target ID found for category click');
        return;
    }

    // Close all popups when clicking any category
    this.closeAllPopups();

    // Scroll to section
    this.scrollToSection(targetId);
}

    /**
     * Main scroll method - SINGLE source of truth
     */
    scrollToSection(targetId) {
        // Generate unique scroll ID
        const scrollId = Date.now() + '_' + Math.random();

        // If already scrolling, queue this request
        if (this.isScrolling) {
            console.log('⏳ Queueing scroll to:', targetId);
            this.scrollQueue.push({ targetId, scrollId });
            return;
        }

        // Get target element
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            console.error('❌ Target not found:', targetId);
            this.processQueue();
            return;
        }

        // Start scrolling
        this.performScroll(targetElement, scrollId);
    }

    /**
     * Perform the actual scroll
     */
    performScroll(targetElement, scrollId) {
        console.log('🎯 Starting scroll to:', targetElement.id);

        this.isScrolling = true;
        this.activeScrollId = scrollId;

        // Force category strip to be sticky before calculating
        if (this.categoryStrip && !this.isStripSticky) {
            this.makeStripSticky();
        }

        // Calculate offset ONCE with fresh measurements
        const offset = this.calculateOffset();

        // Get target position
        const targetTop = this.getElementTop(targetElement);
        const scrollTarget = Math.max(0, targetTop - offset);

        console.log('📐 Scroll calculation:', {
            targetTop,
            offset,
            scrollTarget,
            current: window.pageYOffset
        });

        // Perform smooth scroll
        this.smoothScrollTo(scrollTarget, () => {
            // Verify position after scroll
            setTimeout(() => {
                const currentPos = window.pageYOffset;
                const finalOffset = this.calculateOffset();
                const finalTarget = Math.max(0, targetTop - finalOffset);
                const error = Math.abs(currentPos - finalTarget);

                console.log('✅ Scroll complete. Error:', error + 'px');

                // Correction if needed
                if (error > 5) {
                    window.scrollTo({ top: finalTarget, behavior: 'auto' });
                    console.log('🔧 Position corrected');
                }

                // Update active category
                this.setActiveCategory(targetElement.id);

                // Mark complete
                this.isScrolling = false;
                this.activeScrollId = null;

                // Process queue
                setTimeout(() => this.processQueue(), 50);

            }, this.config.scrollCompleteDelay);
        });
    }

    /**
     * Calculate scroll offset ACCURATELY
     */
    calculateOffset() {
        const now = Date.now();

        // Use cache if fresh
        if (now - this.cachedMeasurements.lastUpdate < this.config.measurementCacheDuration) {
            return this.cachedMeasurements.navbar +
                   this.cachedMeasurements.strip -
                   this.config.offsetBuffer;
        }

        let offset = 0;

        // Navbar height (if exists and visible)
        const navbar = document.querySelector('#main-navbar, header, .navbar');
        if (navbar && navbar.offsetHeight) {
            offset += navbar.offsetHeight;
            this.cachedMeasurements.navbar = navbar.offsetHeight;
        }

        // Category strip height (if sticky)
        if (this.categoryStrip && this.isStripSticky) {
            offset += this.categoryStrip.offsetHeight;
            this.cachedMeasurements.strip = this.categoryStrip.offsetHeight;
        }

        // Subtract buffer to show section titles
        offset -= this.config.offsetBuffer;

        this.cachedMeasurements.lastUpdate = now;

        return offset;
    }

    /**
     * Get element's position from top of document
     */
    getElementTop(element) {
        let top = 0;
        let el = element;

        while (el) {
            top += el.offsetTop;
            el = el.offsetParent;
        }

        return top;
    }

    /**
     * Smooth scroll with easing
     */
    smoothScrollTo(target, callback) {
        const start = window.pageYOffset;
        const distance = target - start;
        const startTime = performance.now();

        const ease = (t) => {
            // Ease-in-out cubic
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.config.scrollDuration, 1);
            const easeProgress = ease(progress);

            window.scrollTo(0, start + (distance * easeProgress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
            }
        };

        requestAnimationFrame(animate);
    }

    smoothScrollStripTo(targetScroll) {
    const container = document.getElementById('categories-container');
    const wrapper = document.getElementById('categories-wrapper');
    const contentWidth = container.scrollWidth;
    const wrapperWidth = wrapper.offsetWidth;

    // Calculate bounds
    const maxScroll = Math.max(0, contentWidth - wrapperWidth);
    const boundedScroll = Math.min(Math.max(-targetScroll, -maxScroll), 0);

    // Smooth animation
    container.style.transition = 'transform 0.5s ease-in-out';
    this.currentTransform = boundedScroll;
    container.style.transform = `translateX(${this.currentTransform}px)`;

    // Update arrows after transition
    setTimeout(() => {
        this.updateArrowVisibility();
    }, 500);
}

    /**
     * Process queued scrolls
     */
    processQueue() {
        if (this.scrollQueue.length > 0) {
            const next = this.scrollQueue.shift();
            console.log('📋 Processing queued scroll:', next.targetId);
            this.scrollToSection(next.targetId);
        }
    }

    /**
     * Set active category in strip
     */
    setActiveCategory(sectionId) {
    // Remove all active states
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        item.style.transform = 'scale(1)';
        item.style.fontWeight = 'normal';
    });

    // Find and activate matching category
    const selector = `.category-item[href="#${sectionId}"], .category-item[data-section="${sectionId}"]`;
    const activeItem = document.querySelector(selector);

    if (activeItem) {
        // Add visual active state
        activeItem.classList.add('active');
        activeItem.style.transform = 'scale(1.05)';
        activeItem.style.fontWeight = '600';
        activeItem.style.transition = 'all 0.3s ease';

        // Scroll to make active item visible with context
        this.scrollCategoryIntoView(activeItem);

        console.log('✅ Active category:', sectionId);
    } else {
        console.warn('⚠️ Could not find category item for section:', sectionId);
    }
}

    /**
     * Scroll category strip to show active item
     */
    scrollCategoryIntoView(item) {
    const container = document.getElementById('categories-container');
    const wrapper = document.getElementById('categories-wrapper');

    if (!container || !wrapper || !item) return;

    const itemRect = item.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperWidth = wrapper.offsetWidth;
    const itemWidth = item.offsetWidth;
    const itemOffsetLeft = item.offsetLeft;

    // Calculate visible area boundaries
    const visibleLeft = Math.abs(this.currentTransform);
    const visibleRight = visibleLeft + wrapperWidth;

    // Check if item is outside view or too close to edges
    const isLeftEdge = itemOffsetLeft < visibleLeft + (wrapperWidth * 0.2); // 20% from left
    const isRightEdge = itemOffsetLeft + itemWidth > visibleRight - (wrapperWidth * 0.2); // 20% from right
    const isOutsideLeft = itemOffsetLeft < visibleLeft;
    const isOutsideRight = itemOffsetLeft + itemWidth > visibleRight;

    if (isOutsideLeft || isOutsideRight || isLeftEdge || isRightEdge) {
        // Smart positioning: center the item with context (show 2-3 items on each side)
        const targetScroll = itemOffsetLeft - (wrapperWidth / 2) + (itemWidth / 2);

        // Apply smooth scrolling
        this.smoothScrollStripTo(targetScroll);
    }
}

    /**
     * Close all popups
     */
    closeAllPopups() {
        // Desktop menu popup
        const menuPopup = document.getElementById('menu-categories-popup');
        if (menuPopup) {
            menuPopup.classList.remove('show');
        }

        // Mobile menu
        if (typeof window.closeMainMenu === 'function') {
            window.closeMainMenu();
        }

        // Mobile categories
        if (typeof window.hideCategoriesPopup === 'function') {
            window.hideCategoriesPopup();
        }
    }

    /**
     * Handle checkout page redirect
     */
    handleCheckoutRedirect(targetId) {
        console.log('🛒 On checkout, redirecting to home with target:', targetId);
        sessionStorage.setItem('scrollToSection', targetId);
        window.location.href = '/';
    }

    /**
     * Handle initial navigation from other pages
     */
    handleInitialNavigation() {
    const targetSection = sessionStorage.getItem('scrollToSection');

    if (targetSection) {
        console.log('🎯 Initial navigation to:', targetSection);
        sessionStorage.removeItem('scrollToSection');

        // More robust waiting for page load
        const attemptScroll = (attempts = 0) => {
            const targetElement = document.getElementById(targetSection);

            if (targetElement) {
                // Wait a bit more for everything to settle
                setTimeout(() => {
                    this.scrollToSection(targetSection);
                }, 300);
            } else if (attempts < 20) {
                // Try again
                setTimeout(() => attemptScroll(attempts + 1), 100);
            }
        };

        // Start attempting
        attemptScroll();
    }
}
}

// Initialize ONE controller
const scrollController = new UnifiedScrollController();

// Expose for debugging
window.UnifiedScrollController = UnifiedScrollController;