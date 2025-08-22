/**
 * Category Strip Horizontal Scroll Functionality
 * Handles left/right arrow navigation
 */

class CategoryStripScroll {
    constructor() {
        this.container = null;
        this.leftArrow = null;
        this.rightArrow = null;
        this.scrollAmount = 200;
        this.currentTransform = 0;

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.container = document.getElementById('categories-container');
        this.leftArrow = document.getElementById('scroll-left');
        this.rightArrow = document.getElementById('scroll-right');

        if (!this.container || !this.leftArrow || !this.rightArrow) {
            console.warn('Category strip elements not found');
            return;
        }

        this.setupEventListeners();
        this.updateArrowStates();
    }

    setupEventListeners() {
        // Left arrow click
        this.leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollLeft();
        });

        // Right arrow click
        this.rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollRight();
        });

        // Update arrows on window resize
        window.addEventListener('resize', () => {
            this.updateArrowStates();
        });
    }

    scrollLeft() {
        const maxScroll = 0;
        this.currentTransform = Math.min(this.currentTransform + this.scrollAmount, maxScroll);
        this.applyTransform();
        this.updateArrowStates();
    }

    scrollRight() {
        const containerWidth = this.container.parentElement.offsetWidth;
        const contentWidth = this.container.scrollWidth;
        const maxScroll = -(contentWidth - containerWidth);

        this.currentTransform = Math.max(this.currentTransform - this.scrollAmount, maxScroll);
        this.applyTransform();
        this.updateArrowStates();
    }

    applyTransform() {
        this.container.style.transform = `translateX(${this.currentTransform}px)`;
    }

    updateArrowStates() {
        if (!this.container) return;

        const containerWidth = this.container.parentElement.offsetWidth;
        const contentWidth = this.container.scrollWidth;

        // Disable left arrow if at start
        if (this.currentTransform >= 0) {
            this.leftArrow.classList.add('disabled');
        } else {
            this.leftArrow.classList.remove('disabled');
        }

        // Disable right arrow if at end
        if (Math.abs(this.currentTransform) >= contentWidth - containerWidth) {
            this.rightArrow.classList.add('disabled');
        } else {
            this.rightArrow.classList.remove('disabled');
        }
    }

    // Reset scroll position
    reset() {
        this.currentTransform = 0;
        this.applyTransform();
        this.updateArrowStates();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.categoryStripScroll = new CategoryStripScroll();
});