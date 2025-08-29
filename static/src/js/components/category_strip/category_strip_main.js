/**
 * ENHANCED PERFECT STICKY Category Strip with BULLETPROOF Positioning
 * File: /website_customizations/static/src/js/components/category_strip/category_strip_main.js
 */

class CategoryStripComplete {
    constructor() {
        this.categoryStrip = null;
        this.navbar = null;
        this.scrollContainer = null;
        this.leftArrow = null;
        this.rightArrow = null;
        this.placeholder = null;
        this.currentTransform = 0;
        this.isSticky = false;
        this.originalTop = 0;
        this.hasUserScrolled = false;
        this.isScrolling = false;
        this.scrollAnimation = null;
        this.navbarHeight = 0;
        this.isNavigating = false;
        this.categoryStripHeight = 0;
        this.stickyOffset = 0;
        this.categoryButtons = [];
        this.sectionObserver = null;
        this.lastActiveSection = null;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.categoryStrip = document.getElementById('category-strip-wrapper');
        this.scrollContainer = document.getElementById('categories-container');
        this.leftArrow = document.getElementById('scroll-left');
        this.rightArrow = document.getElementById('scroll-right');

        if (!this.categoryStrip || !this.scrollContainer || !this.leftArrow || !this.rightArrow) {
            setTimeout(() => this.setup(), 500);
            return;
        }

        // Get all category buttons
        this.categoryButtons = Array.from(this.scrollContainer.querySelectorAll('.category-item'));

        this.findOrCreatePlaceholder();
        this.calculateDimensions();
        this.setupHorizontalScroll();
        this.setupBulletproofStickyBehavior();
        this.setupEnhancedScrolling();
        this.setupMenuSectionObserver();
        this.setupScrollListener();

        setTimeout(() => this.updateArrowStates(), 100);
    }

    calculateDimensions() {
        this.originalTop = this.categoryStrip.offsetTop;
        this.categoryStripHeight = this.categoryStrip.offsetHeight;
        this.stickyOffset = 0;
    }

    findOrCreatePlaceholder() {
        this.placeholder = document.querySelector('.category-strip-placeholder');

        if (!this.placeholder) {
            this.placeholder = document.createElement('div');
            this.placeholder.className = 'category-strip-placeholder';
            this.categoryStrip.parentNode.insertBefore(this.placeholder, this.categoryStrip.nextSibling);
        }

        this.resetPlaceholder();
    }

    resetPlaceholder() {
        if (this.placeholder) {
            this.placeholder.style.height = '0px';
            this.placeholder.style.display = 'none';
        }
    }

    setupBulletproofStickyBehavior() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleBulletproofStickyScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.recalculateDimensions();
        });
    }

    handleBulletproofStickyScroll() {
        if (!this.categoryStrip || (window.scrollUtils && window.scrollUtils.isScrolling)) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldBeSticky = scrollTop > this.originalTop;

        if (shouldBeSticky && !this.isSticky) {
            this.makeBulletproofSticky();
        } else if (!shouldBeSticky && this.isSticky) {
            this.removeBulletproofSticky();
        }
    }

    makeBulletproofSticky() {
        if (this.isSticky) return;

        this.isSticky = true;
        const exactHeight = this.categoryStrip.offsetHeight;

        if (this.placeholder) {
            this.placeholder.style.height = exactHeight + 'px';
            this.placeholder.style.display = 'block';
        }

        this.categoryStrip.style.position = 'fixed';
        this.categoryStrip.style.top = this.stickyOffset + 'px';
        this.categoryStrip.style.left = '0';
        this.categoryStrip.style.right = '0';
        this.categoryStrip.style.zIndex = '9999';
        this.categoryStrip.style.width = '100%';
        this.categoryStrip.classList.add('sticky');
    }

    removeBulletproofSticky() {
        if (!this.isSticky) return;

        this.isSticky = false;

        if (this.placeholder) {
            this.placeholder.style.height = '0px';
            this.placeholder.style.display = 'none';
        }

        this.categoryStrip.style.position = '';
        this.categoryStrip.style.top = '';
        this.categoryStrip.style.left = '';
        this.categoryStrip.style.right = '';
        this.categoryStrip.style.zIndex = '';
        this.categoryStrip.style.width = '';
        this.categoryStrip.classList.remove('sticky');
    }

    recalculateDimensions() {
        if (!this.isSticky) {
            this.originalTop = this.categoryStrip.offsetTop;
        }
        this.categoryStripHeight = this.categoryStrip.offsetHeight;

        if (this.isSticky && this.placeholder) {
            const currentHeight = this.categoryStrip.offsetHeight;
            this.placeholder.style.height = currentHeight + 'px';
            this.categoryStrip.style.top = this.stickyOffset + 'px';
        }
    }

    setupHorizontalScroll() {
        this.leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.hasUserScrolled = true;
            this.smartScrollLeft();
        });

        this.rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.hasUserScrolled = true;
            this.smartScrollRight();
        });

        this.setupTouchScrolling();
        this.setupWheelScrolling();

        window.addEventListener('resize', () => {
            this.updateArrowStates();
        });
    }

    smartScrollLeft() {
        const containerWidth = this.scrollContainer.parentElement.offsetWidth;
        const averageButtonWidth = this.calculateAverageButtonWidth();
        const buttonsToShow = 3;
        const smartScrollAmount = averageButtonWidth * buttonsToShow;

        const maxScroll = 0;
        this.smoothScrollTo(Math.min(this.currentTransform + smartScrollAmount, maxScroll));
    }

    smartScrollRight() {
        const containerWidth = this.scrollContainer.parentElement.offsetWidth;
        const contentWidth = this.scrollContainer.scrollWidth;
        const averageButtonWidth = this.calculateAverageButtonWidth();
        const buttonsToShow = 3;
        const smartScrollAmount = averageButtonWidth * buttonsToShow;

        const maxScroll = -(contentWidth - containerWidth);
        this.smoothScrollTo(Math.max(this.currentTransform - smartScrollAmount, maxScroll));
    }

    calculateAverageButtonWidth() {
        if (this.categoryButtons.length === 0) return 120;

        let totalWidth = 0;
        this.categoryButtons.forEach(button => {
            totalWidth += button.offsetWidth + 12;
        });

        return totalWidth / this.categoryButtons.length;
    }

    setupEnhancedScrolling() {
        // Store original handler
        const originalHandleCategoryClick = window.handleCategoryClick;

        if (originalHandleCategoryClick) {
            window.handleCategoryClick = function(event) {
                event.preventDefault();

                const href = this.getAttribute('href');
                if (!href || !href.startsWith('#')) return;

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (!targetElement) return;

                // Set active state immediately
                const activeItem = document.querySelector(`.category-item[href="#${targetId}"]`);
                if (activeItem && window.categoryStripComplete) {
                    window.categoryStripComplete.setActiveCategory(activeItem);
                    window.categoryStripComplete.centerActiveItem(activeItem);
                }

                // Call original handler for vertical scrolling
                originalHandleCategoryClick.call(this, event);
            };
        }

        // Re-attach handlers with new behavior
        setTimeout(() => {
            const items = document.querySelectorAll('.category-item');
            items.forEach(item => {
                item.removeEventListener('click', window.handleCategoryClick);
                item.addEventListener('click', window.handleCategoryClick);
            });
        }, 300);
    }

    setupScrollListener() {
        let ticking = false;
        let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        window.addEventListener('scroll', () => {
            if (!ticking && !this.isNavigating &&
                (!window.scrollUtils || !window.scrollUtils.isScrolling)) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                    // Only detect scroll direction if there's significant movement
                    if (Math.abs(scrollTop - lastScrollTop) > 50) {
                        this.detectActiveSectionOnScroll();
                        lastScrollTop = scrollTop;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    detectActiveSectionOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const offset = this.isSticky ? this.categoryStripHeight + 30 : 200;

        let activeSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            if (!section.id) return;

            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = rect.height;
            const sectionBottom = sectionTop + sectionHeight;

            // Calculate distance from viewport center
            const viewportCenter = scrollTop + (windowHeight / 2);
            const sectionCenter = sectionTop + (sectionHeight / 2);
            const distance = Math.abs(viewportCenter - sectionCenter);

            // Check if section is in view
            const isInView = (
                (sectionTop <= scrollTop + windowHeight - offset) &&
                (sectionBottom >= scrollTop + offset)
            );

            if (isInView && distance < closestDistance) {
                closestDistance = distance;
                activeSection = section.id;
            }
        });

        if (activeSection && activeSection !== this.lastActiveSection) {
            this.lastActiveSection = activeSection;
            const activeItem = document.querySelector(`.category-item[href="#${activeSection}"]`);

            if (activeItem) {
                this.setActiveCategory(activeItem);

                // Auto-scroll the category strip to show the active button
                if (!this.isItemFullyVisible(activeItem)) {
                    this.centerActiveItem(activeItem);
                }
            }
        }
    }

    setupMenuSectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }

        const options = {
            root: null,
            rootMargin: `-${this.categoryStripHeight + 50}px 0px -${window.innerHeight - this.categoryStripHeight - 150}px 0px`,
            threshold: 0.2
        };

        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isNavigating &&
                    (!window.scrollUtils || !window.scrollUtils.isScrolling)) {
                    const sectionId = entry.target.id;
                    const activeItem = document.querySelector(`.category-item[href="#${sectionId}"]`);

                    if (activeItem) {
                        this.setActiveCategory(activeItem);

                        // Auto-scroll the category strip when section comes into view
                        if (!this.isItemFullyVisible(activeItem)) {
                            this.centerActiveItem(activeItem);
                        }
                    }
                }
            });
        }, options);

        sections.forEach(section => {
            this.sectionObserver.observe(section);
        });
    }

    isItemFullyVisible(item) {
        if (!item) return false;

        const wrapper = document.getElementById('categories-wrapper');
        if (!wrapper) return false;

        const itemRect = item.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        return (
            itemRect.left >= wrapperRect.left &&
            itemRect.right <= wrapperRect.right
        );
    }

    centerActiveItem(item) {
        if (!item || this.isNavigating) return;

        const wrapper = document.getElementById('categories-wrapper');
        if (!wrapper) return;

        const itemOffsetLeft = item.offsetLeft;
        const wrapperWidth = wrapper.offsetWidth;
        const itemWidth = item.offsetWidth;

        // Calculate position to show 2-3 buttons visible around the active one
        const buttonsToShowBefore = 1.5;
        const averageButtonWidth = this.calculateAverageButtonWidth();
        const offset = averageButtonWidth * buttonsToShowBefore;

        const scrollPosition = itemOffsetLeft - offset;
        const contentWidth = this.scrollContainer.scrollWidth;
        const maxScroll = 0;
        const minScroll = -(contentWidth - wrapperWidth);

        const targetTransform = Math.max(Math.min(-scrollPosition, maxScroll), minScroll);
        this.smoothScrollTo(targetTransform);
    }

    setupTouchScrolling() {
        let isDown = false;
        let startX;
        let scrollLeft;

        this.scrollContainer.addEventListener('mousedown', (e) => {
            if (this.isNavigating) return;
            isDown = true;
            this.hasUserScrolled = true;
            startX = e.pageX - this.scrollContainer.offsetLeft;
            scrollLeft = this.currentTransform;
            this.scrollContainer.style.cursor = 'grabbing';
        });

        this.scrollContainer.addEventListener('mouseleave', () => {
            isDown = false;
            this.scrollContainer.style.cursor = 'grab';
        });

        this.scrollContainer.addEventListener('mouseup', () => {
            isDown = false;
            this.scrollContainer.style.cursor = 'grab';
        });

        this.scrollContainer.addEventListener('mousemove', (e) => {
            if (!isDown || this.isNavigating) return;
            e.preventDefault();
            const x = e.pageX - this.scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            this.currentTransform = scrollLeft - walk;
            this.applyTransform();
            this.updateArrowStates();
        });

        // Touch events
        this.scrollContainer.addEventListener('touchstart', (e) => {
            if (this.isNavigating) return;
            isDown = true;
            this.hasUserScrolled = true;
            startX = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            scrollLeft = this.currentTransform;
        }, { passive: true });

        this.scrollContainer.addEventListener('touchend', () => {
            isDown = false;
        });

        this.scrollContainer.addEventListener('touchmove', (e) => {
            if (!isDown || this.isNavigating) return;
            const x = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            this.currentTransform = scrollLeft - walk;
            this.applyTransform();
            this.updateArrowStates();
        }, { passive: true });
    }

    setupWheelScrolling() {
        this.scrollContainer.addEventListener('wheel', (e) => {
            if (this.isNavigating) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                this.currentTransform -= e.deltaX * 1.5;
                this.hasUserScrolled = true;

                const containerWidth = this.scrollContainer.parentElement.offsetWidth;
                const contentWidth = this.scrollContainer.scrollWidth;
                const maxScroll = -(contentWidth - containerWidth);

                this.currentTransform = Math.min(Math.max(this.currentTransform, maxScroll), 0);
                this.applyTransform();
                this.updateArrowStates();
            }
        }, { passive: false });
    }

    smoothScrollTo(targetPosition) {
        if (this.scrollAnimation) {
            cancelAnimationFrame(this.scrollAnimation);
        }

        const startPosition = this.currentTransform;
        const distance = targetPosition - startPosition;
        const duration = 400;
        let startTime = null;

        const animateScroll = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const ease = this.easeOutCubic(progress);
            this.currentTransform = startPosition + (distance * ease);

            this.applyTransform();
            this.updateArrowStates();

            if (progress < 1) {
                this.scrollAnimation = requestAnimationFrame(animateScroll);
            } else {
                this.scrollAnimation = null;
            }
        };

        this.scrollAnimation = requestAnimationFrame(animateScroll);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    applyTransform() {
        this.scrollContainer.style.transform = `translateX(${this.currentTransform}px)`;
    }

    updateArrowStates() {
        if (!this.scrollContainer) return;

        const containerWidth = this.scrollContainer.parentElement.offsetWidth;
        const contentWidth = this.scrollContainer.scrollWidth;

        // Left arrow
        if (this.currentTransform >= 0) {
            this.leftArrow.classList.add('disabled');
            this.leftArrow.disabled = true;
            this.leftArrow.style.display = 'none';
        } else {
            this.leftArrow.classList.remove('disabled');
            this.leftArrow.disabled = false;
            this.leftArrow.style.display = 'flex';
        }

        // Right arrow
        if (Math.abs(this.currentTransform) >= contentWidth - containerWidth - 5) {
            this.rightArrow.classList.add('disabled');
            this.rightArrow.disabled = true;
            this.rightArrow.style.display = 'none';
        } else {
            this.rightArrow.classList.remove('disabled');
            this.rightArrow.disabled = false;
            this.rightArrow.style.display = 'flex';
        }
    }

    setActiveCategory(activeItem) {
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });

        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    destroy() {
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
    }

    navigateToSection(sectionId) {
        const categoryItem = document.querySelector(`.category-item[href="#${sectionId}"]`);
        if (categoryItem) {
            categoryItem.click();
        }
    }
}

// Initialize
function initializeCategoryStrip() {
    if (typeof window.scrollToSectionWithPrecision === 'function') {
        if (window.categoryStripComplete) {
            window.categoryStripComplete.destroy();
        }

        window.categoryStripComplete = new CategoryStripComplete();
    } else {
        setTimeout(initializeCategoryStrip, 200);
    }
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoryStrip);
} else {
    initializeCategoryStrip();
}