/**
 * CORRECT Category Strip - Sticky at Top of Screen
 */

class CategoryStripComplete {
    constructor() {
        this.categoryStrip = null;
        this.scrollContainer = null;
        this.leftArrow = null;
        this.rightArrow = null;
        this.placeholder = null;
        this.currentTransform = 0;
        this.isSticky = false;
        this.originalTop = 0;
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
        this.categoryStrip = document.getElementById('category-strip-wrapper');
        this.scrollContainer = document.getElementById('categories-container');
        this.leftArrow = document.getElementById('scroll-left');
        this.rightArrow = document.getElementById('scroll-right');

        if (!this.categoryStrip || !this.scrollContainer || !this.leftArrow || !this.rightArrow) {
            setTimeout(() => this.setup(), 500);
            return;
        }

        this.categoryButtons = Array.from(this.scrollContainer.querySelectorAll('.category-item'));

        this.findOrCreatePlaceholder();
        this.calculateOriginalPosition();
        this.setupHorizontalScroll();
        this.setupStickyBehavior();

        setTimeout(() => this.updateArrowStates(), 100);
    }

    calculateOriginalPosition() {
        // Store the original position of category strip
        this.originalTop = this.categoryStrip.offsetTop;
        console.log('Category strip original position:', this.originalTop);
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
            this.recalculatePosition();
        });
    }

    handleStickyScroll() {
    if (!this.categoryStrip || (window.scrollUtils && window.scrollUtils.isScrolling)) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Recalculate original position on each scroll to be precise
    if (!this.isSticky) {
        this.originalTop = this.categoryStrip.offsetTop;
    }

    const shouldBeSticky = scrollTop > this.originalTop;

    if (shouldBeSticky && !this.isSticky) {
        this.makeSticky();
    } else if (!shouldBeSticky && this.isSticky) {
        this.removeSticky();
    }
}

    makeSticky() {
        if (this.isSticky) return;

        console.log('Making category strip sticky at top');
        this.isSticky = true;
        const exactHeight = this.categoryStrip.offsetHeight;

        // Show placeholder to maintain layout
        if (this.placeholder) {
            this.placeholder.style.height = exactHeight + 'px';
            this.placeholder.style.display = 'block';
        }

        // Make sticky at very top of screen
        this.categoryStrip.style.position = 'fixed';
        this.categoryStrip.style.top = '0px'; // AT THE VERY TOP
        this.categoryStrip.style.left = '0';
        this.categoryStrip.style.right = '0';
        this.categoryStrip.style.zIndex = '1000'; // ABOVE NAVBAR
        this.categoryStrip.style.width = '100%';
        this.categoryStrip.classList.add('sticky');
    }

    removeSticky() {
    if (!this.isSticky) return;

    console.log('Removing sticky, returning to original position');
    this.isSticky = false;

    // Hide placeholder FIRST
    if (this.placeholder) {
        this.placeholder.style.height = '0px';
        this.placeholder.style.display = 'none';
    }

    // Remove ALL sticky styles to return to original position
    this.categoryStrip.style.position = 'relative'; // Force back to normal flow
    this.categoryStrip.style.top = 'auto';
    this.categoryStrip.style.left = 'auto';
    this.categoryStrip.style.right = 'auto';
    this.categoryStrip.style.zIndex = '30'; // Original z-index
    this.categoryStrip.style.width = 'auto';
    this.categoryStrip.classList.remove('sticky');

    // Force reflow to ensure it returns to original position
    this.categoryStrip.offsetHeight;
}

    recalculatePosition() {
        if (!this.isSticky) {
            this.originalTop = this.categoryStrip.offsetTop;
        }

        if (this.isSticky && this.placeholder) {
            const currentHeight = this.categoryStrip.offsetHeight;
            this.placeholder.style.height = currentHeight + 'px';
        }
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
            totalWidth += button.offsetWidth + 12;
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
    if (typeof window.scrollToSectionWithPrecision === 'function') {
        if (window.categoryStripComplete) {
            window.categoryStripComplete.destroy?.();
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