/**
 * SIMPLIFIED Category Strip - Horizontal Scrolling Only
 * Removed all sticky behavior and vertical scrolling logic
 */

class CategoryStripHorizontal {
    constructor() {
        this.scrollContainer = null;
        this.leftArrow = null;
        this.rightArrow = null;
        this.currentTransform = 0;
        this.categoryButtons = [];

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
        this.scrollContainer = document.getElementById('categories-container');
        this.leftArrow = document.getElementById('scroll-left');
        this.rightArrow = document.getElementById('scroll-right');

        if (!this.scrollContainer || !this.leftArrow || !this.rightArrow) {
            setTimeout(() => this.setup(), 500);
            return;
        }

        this.categoryButtons = Array.from(this.scrollContainer.querySelectorAll('.category-item'));
        this.setupHorizontalScroll();
        this.setupActiveStateTracking();

        setTimeout(() => this.updateArrowStates(), 100);
    }

    setupHorizontalScroll() {
        this.leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.smartScrollLeft();
        });

        this.rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.smartScrollRight();
        });

        this.setupTouchScrolling();
        this.setupWheelScrolling();

        window.addEventListener('resize', () => {
            this.updateArrowStates();
        });
    }

    setupActiveStateTracking() {
        // Track scroll position to update active category
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveStateOnScroll();
            }, 100);
        }, { passive: true });

        // Initial update
        this.updateActiveStateOnScroll();
    }

    updateActiveStateOnScroll() {
        // All sections with IDs
        const sections = document.querySelectorAll('section[id]');
        const scrollTop = window.pageYOffset + 140; // Offset for navbar + category strip

        let activeSection = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            // Check if we're inside this section
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
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
        if (!categoryItem) return;

        const wrapper = document.getElementById('categories-wrapper');
        if (!wrapper) return;

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

    smartScrollLeft() {
        const averageButtonWidth = this.calculateAverageButtonWidth();
        const smartScrollAmount = averageButtonWidth * 3;
        const maxScroll = 0;
        this.smoothScrollTo(Math.min(this.currentTransform + smartScrollAmount, maxScroll));
    }

    smartScrollRight() {
        const containerWidth = this.scrollContainer.parentElement.offsetWidth;
        const contentWidth = this.scrollContainer.scrollWidth;
        const averageButtonWidth = this.calculateAverageButtonWidth();
        const smartScrollAmount = averageButtonWidth * 3;
        const maxScroll = -(contentWidth - containerWidth);
        this.smoothScrollTo(Math.max(this.currentTransform - smartScrollAmount, maxScroll));
    }

    calculateAverageButtonWidth() {
        if (this.categoryButtons.length === 0) return 120;

        let totalWidth = 0;
        this.categoryButtons.forEach(button => {
            totalWidth += button.offsetWidth + 12; // Include gap
        });

        return totalWidth / this.categoryButtons.length;
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
        this.scrollContainer.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                this.currentTransform -= e.deltaX * 1.5;

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
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
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
}

// Initialize
function initializeCategoryStrip() {
    window.categoryStripHorizontal = new CategoryStripHorizontal();
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoryStrip);
} else {
    initializeCategoryStrip();
}