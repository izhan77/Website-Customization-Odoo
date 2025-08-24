/**
 * Complete Category Strip with Sticky Functionality
 * Handles scrolling, navigation, and sticky behavior
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
        this.hasUserScrolled = false; // Track if user has interacted with arrows
        this.isScrolling = false;
        this.scrollAnimation = null;

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
        this.navbar = document.querySelector('header, .navbar, #main-navbar');
        this.scrollContainer = document.getElementById('categories-container');
        this.leftArrow = document.getElementById('scroll-left');
        this.rightArrow = document.getElementById('scroll-right');

        if (!this.categoryStrip || !this.scrollContainer || !this.leftArrow || !this.rightArrow) {
            console.warn('Category strip elements not found, retrying...');
            setTimeout(() => this.setup(), 500);
            return;
        }

        this.originalTop = this.categoryStrip.offsetTop;
        this.navbarHeight = this.navbar ? this.navbar.offsetHeight : 80;

        this.createPlaceholder();
        this.setupHorizontalScroll();
        this.setupCategoryClicks();
        this.setupStickyBehavior();
        this.setupActiveStates();

        // Update arrow states after a small delay to ensure proper calculation
        setTimeout(() => this.updateArrowStates(), 100);

        console.log('Category strip initialized successfully!');
    }

    createPlaceholder() {
        let placeholder = document.querySelector('.category-strip-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'category-strip-placeholder';
            placeholder.style.height = '0px';
            placeholder.style.display = 'none';
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
        this.setupWheelScrolling(); // Add wheel/trackpad scrolling
        window.addEventListener('resize', () => this.updateArrowStates());
    }

    setupTouchScrolling() {
        let isDown = false;
        let startX;
        let scrollLeft;

        this.scrollContainer.addEventListener('mousedown', (e) => {
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
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - this.scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            this.currentTransform = scrollLeft - walk;
            this.applyTransform();
            this.updateArrowStates();
        });

        // Touch events
        this.scrollContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            scrollLeft = this.currentTransform;
        }, { passive: true });

        this.scrollContainer.addEventListener('touchend', () => {
            isDown = false;
        });

        this.scrollContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - this.scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            this.currentTransform = scrollLeft - walk;
            this.applyTransform();
            this.updateArrowStates();
        }, { passive: true });
    }

    setupWheelScrolling() {
        // Handle trackpad/touchpad horizontal scrolling
        this.scrollContainer.addEventListener('wheel', (e) => {
            // Check if this is a horizontal scroll event
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();

                // Fixed direction - now scrolling left moves content left, right moves content right
                this.currentTransform -= e.deltaX * 1.5; // Increased multiplier for smoother feel

                // Apply boundaries
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
        const duration = 300; // ms
        let startTime = null;

        const animateScroll = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Easing function for smooth animation
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
            // Hide left arrow if user hasn't scrolled or is back at start
            if (!this.hasUserScrolled || this.currentTransform === 0) {
                this.leftArrow.style.display = 'none';
            }
        } else {
            this.leftArrow.classList.remove('disabled');
            this.leftArrow.disabled = false;
            // Show left arrow when scrolled to the right
            this.leftArrow.style.display = 'flex';
        }

        // Right arrow
        if (Math.abs(this.currentTransform) >= contentWidth - containerWidth - 5) { // Added small buffer for rounding errors
            this.rightArrow.classList.add('disabled');
            this.rightArrow.disabled = true;
            // Hide right arrow when at the end
            this.rightArrow.style.display = 'none';
        } else {
            this.rightArrow.classList.remove('disabled');
            this.rightArrow.disabled = false;
            // Show right arrow when not at the end
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
            this.originalTop = this.categoryStrip.offsetTop;
            this.navbarHeight = this.navbar ? this.navbar.offsetHeight : 80;
            this.updateArrowStates();
        });
    }

    handleStickyScroll() {
        if (!this.categoryStrip) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldBeSticky = scrollTop > (this.originalTop - this.navbarHeight);

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
                const href = item.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    this.scrollToSection(sectionId, item);
                }
            });
        });
    }

    scrollToSection(sectionId, clickedItem) {
        this.setActiveCategory(clickedItem);

        let targetElement = document.getElementById(sectionId);
        if (!targetElement) {
            targetElement = document.querySelector(`[data-section="${sectionId}"]`);
        }
        if (!targetElement) {
            targetElement = this.createPlaceholderSection(sectionId);
        }

        if (targetElement) {
            const offset = this.navbarHeight + 80; // navbar + category strip height
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            setTimeout(() => {
                history.replaceState(null, null, `#${sectionId}`);
            }, 500);
        }
    }

    createPlaceholderSection(sectionId) {
        const section = document.createElement('div');
        section.id = sectionId;
        section.className = 'menu-section py-16 bg-gray-50 min-h-[400px]';
        section.innerHTML = `
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold mb-8 text-center text-gray-800">${this.formatSectionTitle(sectionId)}</h2>
                <div class="text-center">
                    <p class="text-lg text-gray-600 mb-4">Menu items for ${this.formatSectionTitle(sectionId)} will be displayed here.</p>
                </div>
            </div>
        `;
        document.body.appendChild(section);
        return section;
    }

    formatSectionTitle(sectionId) {
        return sectionId.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    setupActiveStates() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateActiveStateOnScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updateActiveStateOnScroll() {
        const sections = document.querySelectorAll('[data-section], .menu-section, [id*="-section"]');
        const scrollTop = window.pageYOffset + this.navbarHeight + 100;

        let activeSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            const top = section.getBoundingClientRect().top + window.pageYOffset;
            const distance = Math.abs(top - scrollTop);

            if (distance < closestDistance && section.id) {
                closestDistance = distance;
                activeSection = section.id;
            }
        });

        if (activeSection) {
            const activeItem = document.querySelector(`.category-item[href="#${activeSection}"]`);
            if (activeItem) {
                this.setActiveCategory(activeItem);
                this.scrollCategoryIntoView(activeItem);
            }
        }
    }

    scrollCategoryIntoView(categoryItem) {
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
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });

        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.categoryStripComplete = new CategoryStripComplete();
});

if (document.readyState !== 'loading') {
    window.categoryStripComplete = new CategoryStripComplete();
}