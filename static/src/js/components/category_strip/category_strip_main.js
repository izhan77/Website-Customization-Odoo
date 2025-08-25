/**
 * Enhanced Category Strip with FIXED Scrolling Functionality
 * FIXED: Precise scrolling to sections with accurate offset calculations
 */
class CategoryStripComplete {
    constructor() {
        this.categoryStrip = null;
        this.navbar = null;
        this.scrollContainer = null;
        this.leftArrow = null;
        this.rightArrow = null;
        this.placeholder = null;
        this.scrollAmount = 200;
        this.currentTransform = 0;
        this.isSticky = false;
        this.originalTop = 0;
        this.hasUserScrolled = false;
        this.isScrolling = false;
        this.scrollAnimation = null;
        this.navbarHeight = 0;
        this.isNavigating = false;
        this.categoryStripHeight = 0;

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
        this.navbar = document.querySelector('header, .navbar, #main-navbar, nav');
        this.scrollContainer = document.getElementById('categories-container');
        this.leftArrow = document.getElementById('scroll-left');
        this.rightArrow = document.getElementById('scroll-right');

        if (!this.categoryStrip || !this.scrollContainer || !this.leftArrow || !this.rightArrow) {
            console.warn('Category strip elements not found, retrying...');
            setTimeout(() => this.setup(), 500);
            return;
        }

        this.originalTop = this.categoryStrip.offsetTop;
        this.navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
        this.categoryStripHeight = this.categoryStrip.offsetHeight;

        this.createPlaceholder();
        this.setupHorizontalScroll();
        this.setupCategoryClicks();
        this.setupStickyBehavior();
        this.setupActiveStates();

        // Update arrow states after initialization
        setTimeout(() => this.updateArrowStates(), 100);

        console.log('Enhanced Category Strip initialized successfully!');
        console.log('Navbar height:', this.navbarHeight);
        console.log('Category strip height:', this.categoryStripHeight);
        console.log('Original top:', this.originalTop);
    }

    createPlaceholder() {
        let placeholder = document.querySelector('.category-strip-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'category-strip-placeholder';
            this.categoryStrip.parentNode.insertBefore(placeholder, this.categoryStrip.nextSibling);
        }
        this.placeholder = placeholder;
    }

    setupHorizontalScroll() {
        this.leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.hasUserScrolled = true;
            this.scrollLeft();
        });

        this.rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.hasUserScrolled = true;
            this.scrollRight();
        });

        this.setupTouchScrolling();
        this.setupWheelScrolling();
        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.updateArrowStates();
        });
    }

    updateDimensions() {
        this.originalTop = this.categoryStrip.offsetTop;
        this.navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
        this.categoryStripHeight = this.categoryStrip.offsetHeight;
        console.log('Updated dimensions - Navbar:', this.navbarHeight, 'Strip:', this.categoryStripHeight);
    }

    setupTouchScrolling() {
        let isDown = false;
        let startX;
        let scrollLeft;

        this.scrollContainer.addEventListener('mousedown', (e) => {
            if (this.isNavigating) return;
            isDown = true;
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

                const containerWidth = this.scrollContainer.parentElement.offsetWidth;
                const contentWidth = this.scrollContainer.scrollWidth;
                const maxScroll = -(contentWidth - containerWidth);

                this.currentTransform = Math.min(Math.max(this.currentTransform, maxScroll), 0);
                this.applyTransform();
                this.updateArrowStates();
                this.hasUserScrolled = true;
            }
        }, { passive: false });
    }

    scrollLeft() {
        const maxScroll = 0;
        this.smoothScrollTo(Math.min(this.currentTransform + this.scrollAmount, maxScroll));
    }

    scrollRight() {
        const containerWidth = this.scrollContainer.parentElement.offsetWidth;
        const contentWidth = this.scrollContainer.scrollWidth;
        const maxScroll = -(contentWidth - containerWidth);
        this.smoothScrollTo(Math.max(this.currentTransform - this.scrollAmount, maxScroll));
    }

    smoothScrollTo(targetPosition) {
        if (this.scrollAnimation) {
            cancelAnimationFrame(this.scrollAnimation);
        }

        const startPosition = this.currentTransform;
        const distance = targetPosition - startPosition;
        const duration = 300;
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
            if (!this.hasUserScrolled || this.currentTransform === 0) {
                this.leftArrow.style.display = 'none';
            }
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

    setupStickyBehavior() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleStickyScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.updateArrowStates();
        });
    }

    handleStickyScroll() {
        if (!this.categoryStrip) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldBeSticky = scrollTop >= this.originalTop;

        if (shouldBeSticky && !this.isSticky) {
            this.makeSticky();
        } else if (!shouldBeSticky && this.isSticky) {
            this.removeSticky();
        }
    }

    makeSticky() {
        if (this.isSticky) return;

        this.isSticky = true;
        const stripHeight = this.categoryStrip.offsetHeight;

        // Set placeholder
        this.placeholder.style.height = stripHeight + 'px';
        this.placeholder.style.display = 'block';

        // Apply sticky styles
        this.categoryStrip.classList.add('sticky');
    }

    removeSticky() {
        if (!this.isSticky) return;

        this.isSticky = false;

        // Remove placeholder
        this.placeholder.style.height = '0px';
        this.placeholder.style.display = 'none';

        // Remove sticky styles
        this.categoryStrip.classList.remove('sticky');
    }

    setupCategoryClicks() {
        const categoryItems = document.querySelectorAll('.category-item');

        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.isNavigating = true;

                const href = item.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    console.log('Clicked section ID:', sectionId);
                    this.scrollToSection(sectionId, item);
                }

                // Reset navigation flag after a delay
                setTimeout(() => {
                    this.isNavigating = false;
                }, 1000);
            });
        });
    }

    scrollToSection(sectionId, clickedItem) {
        // Set active category immediately
        this.setActiveCategory(clickedItem);

        // Find the target section - FIXED LOGIC
        let targetElement = document.getElementById(sectionId);

        console.log('Looking for section:', sectionId);
        console.log('Found element:', targetElement);

        if (!targetElement) {
            console.warn(`Section with ID "${sectionId}" not found`);
            return;
        }

        // FIXED: Calculate precise scroll position
        this.scrollToExactSection(targetElement);

        // Update URL hash after scroll
        setTimeout(() => {
            history.replaceState(null, null, `#${sectionId}`);
        }, 600);

        // Scroll category into view in the strip
        this.scrollCategoryIntoView(clickedItem);
    }

    scrollToExactSection(targetElement) {
        // FIXED: More precise offset calculation
        const offset = this.calculatePreciseScrollOffset();
        const elementPosition = this.getElementTop(targetElement);
        const offsetPosition = elementPosition - offset;

        console.log('Element position:', elementPosition);
        console.log('Calculated offset:', offset);
        console.log('Final scroll position:', offsetPosition);

        // Smooth scroll to section with precise positioning
        window.scrollTo({
            top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative position
            behavior: 'smooth'
        });
    }

    getElementTop(element) {
        // More accurate way to get element's top position
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return rect.top + scrollTop;
    }

    calculatePreciseScrollOffset() {
        // FIXED: Always calculate as if category strip will be sticky
        let totalOffset = this.categoryStripHeight;

        // Add navbar height if it exists and is visible
        if (this.navbar) {
            const navbarStyle = window.getComputedStyle(this.navbar);
            if (navbarStyle.position === 'fixed' || navbarStyle.position === 'sticky') {
                totalOffset += this.navbarHeight;
            }
        }

        // Add a small buffer for perfect alignment (REDUCED from 20 to 10)
        totalOffset += 10;

        console.log('Calculated offset - Navbar:', this.navbarHeight, 'Strip:', this.categoryStripHeight, 'Total:', totalOffset);

        return totalOffset;
    }

    setupActiveStates() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking && !this.isNavigating) {
                requestAnimationFrame(() => {
                    this.updateActiveStateOnScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updateActiveStateOnScroll() {
        if (this.isNavigating) return;

        // Look for sections with IDs that match your category links
        const sections = document.querySelectorAll('section[id]');
        const scrollTop = window.pageYOffset + this.calculatePreciseScrollOffset();

        let activeSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            if (!section.id) return;

            const top = this.getElementTop(section);
            const distance = Math.abs(top - scrollTop);

            if (distance < closestDistance) {
                closestDistance = distance;
                activeSection = section.id;
            }
        });

        if (activeSection) {
            // Find category item that matches the section ID exactly
            const activeItem = document.querySelector(`.category-item[href="#${activeSection}"]`);

            if (activeItem) {
                this.setActiveCategory(activeItem);
                // Only auto-scroll category strip if user hasn't manually scrolled it recently
                if (!this.hasUserScrolled) {
                    this.scrollCategoryIntoView(activeItem);
                }
            }
        }
    }

    scrollCategoryIntoView(categoryItem) {
        if (this.isNavigating) return;

        const wrapper = document.getElementById('categories-wrapper');
        if (!wrapper || !categoryItem) return;

        const itemRect = categoryItem.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        if (itemRect.left < wrapperRect.left || itemRect.right > wrapperRect.right) {
            const itemOffsetLeft = categoryItem.offsetLeft;
            const wrapperWidth = wrapper.offsetWidth;
            const itemWidth = categoryItem.offsetWidth;
            const scrollPosition = itemOffsetLeft - (wrapperWidth / 2) + (itemWidth / 2);

            const contentWidth = this.scrollContainer.scrollWidth;
            const maxScroll = 0;
            const minScroll = -(contentWidth - wrapperWidth);

            this.smoothScrollTo(Math.max(Math.min(-scrollPosition, maxScroll), minScroll));
        }
    }

    setActiveCategory(activeItem) {
        // Remove active class from all items
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current item
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // Public method to scroll to a specific section (can be called externally)
    navigateToSection(sectionId) {
        const categoryItem = document.querySelector(`.category-item[href="#${sectionId}"]`);
        if (categoryItem) {
            categoryItem.click();
        }
    }

    // Public method to get current active section
    getCurrentActiveSection() {
        const activeItem = document.querySelector('.category-item.active');
        return activeItem ? activeItem.getAttribute('href').substring(1) : null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.categoryStripComplete = new CategoryStripComplete();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    window.categoryStripComplete = new CategoryStripComplete();
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryStripComplete;
}