/**
 * Category Strip Scroll Handler
 * Handles all scrolling functionality including touch, wheel, and arrow controls
 */
class CategoryStripScroll {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        this.setupHorizontalScroll();
        this.setupTouchScrolling();
        this.setupWheelScrolling();
        window.addEventListener('resize', () => this.main.updateArrowStates());
    }

    setupHorizontalScroll() {
        // Left arrow click
        this.main.leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.main.hasUserScrolled = true;
            this.scrollLeft();
        });

        // Right arrow click
        this.main.rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.main.hasUserScrolled = true;
            this.scrollRight();
        });
    }

    setupTouchScrolling() {
        let isDown = false;
        let startX;
        let scrollLeft;
        let startTime;
        let velocity = 0;

        // Mouse events
        this.main.scrollContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - this.main.scrollContainer.offsetLeft;
            scrollLeft = this.main.currentTransform;
            startTime = Date.now();
            this.main.scrollContainer.style.cursor = 'grabbing';
            this.main.scrollContainer.style.userSelect = 'none';
        });

        this.main.scrollContainer.addEventListener('mouseleave', () => {
            isDown = false;
            this.main.scrollContainer.style.cursor = 'grab';
            this.main.scrollContainer.style.userSelect = 'auto';
        });

        this.main.scrollContainer.addEventListener('mouseup', () => {
            isDown = false;
            this.main.scrollContainer.style.cursor = 'grab';
            this.main.scrollContainer.style.userSelect = 'auto';
        });

        this.main.scrollContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - this.main.scrollContainer.offsetLeft;
            const walk = (x - startX) * 3; // Increased multiplier for faster movement
            const newTransform = scrollLeft + walk;

            // Apply boundaries
            const containerWidth = this.main.scrollContainer.parentElement.offsetWidth;
            const contentWidth = this.main.scrollContainer.scrollWidth;
            const maxScroll = -(contentWidth - containerWidth);

            this.main.currentTransform = Math.min(Math.max(newTransform, maxScroll), 0);
            this.main.applyTransform();
            this.main.updateArrowStates();
        });

        // Touch events for mobile/tablet
        this.main.scrollContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - this.main.scrollContainer.offsetLeft;
            scrollLeft = this.main.currentTransform;
            startTime = Date.now();
        }, { passive: true });

        this.main.scrollContainer.addEventListener('touchend', (e) => {
            isDown = false;
            // Add momentum scrolling
            if (velocity !== 0) {
                this.applyMomentum(velocity);
            }
        });

        this.main.scrollContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - this.main.scrollContainer.offsetLeft;
            const walk = (x - startX) * 3; // Increased multiplier for smoother touch
            const newTransform = scrollLeft + walk;

            // Calculate velocity for momentum
            const currentTime = Date.now();
            const timeDiff = currentTime - startTime;
            if (timeDiff > 0) {
                velocity = walk / timeDiff;
            }

            // Apply boundaries
            const containerWidth = this.main.scrollContainer.parentElement.offsetWidth;
            const contentWidth = this.main.scrollContainer.scrollWidth;
            const maxScroll = -(contentWidth - containerWidth);

            this.main.currentTransform = Math.min(Math.max(newTransform, maxScroll), 0);
            this.main.applyTransform();
            this.main.updateArrowStates();
            this.main.hasUserScrolled = true;
        }, { passive: false });
    }

    applyMomentum(velocity) {
        const friction = 0.95;
        const minVelocity = 0.1;

        const animate = () => {
            velocity *= friction;

            if (Math.abs(velocity) < minVelocity) {
                return;
            }

            const newTransform = this.main.currentTransform + velocity * 20;

            // Apply boundaries
            const containerWidth = this.main.scrollContainer.parentElement.offsetWidth;
            const contentWidth = this.main.scrollContainer.scrollWidth;
            const maxScroll = -(contentWidth - containerWidth);

            this.main.currentTransform = Math.min(Math.max(newTransform, maxScroll), 0);
            this.main.applyTransform();
            this.main.updateArrowStates();

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    setupWheelScrolling() {
        // Handle trackpad/touchpad horizontal scrolling
        this.main.scrollContainer.addEventListener('wheel', (e) => {
            // Check if this is a horizontal scroll event or use deltaY for vertical wheel
            let deltaX = e.deltaX;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                deltaX = e.deltaY; // Use vertical scroll if stronger
            }

            if (Math.abs(deltaX) > 0) {
                e.preventDefault();

                // Increased multiplier for more responsive scrolling
                this.main.currentTransform -= deltaX * 2.5;

                // Apply boundaries
                const containerWidth = this.main.scrollContainer.parentElement.offsetWidth;
                const contentWidth = this.main.scrollContainer.scrollWidth;
                const maxScroll = -(contentWidth - containerWidth);

                this.main.currentTransform = Math.min(Math.max(this.main.currentTransform, maxScroll), 0);
                this.main.applyTransform();
                this.main.updateArrowStates();
                this.main.hasUserScrolled = true;
            }
        }, { passive: false });
    }

    scrollLeft() {
        const maxScroll = 0;
        const targetPosition = Math.min(this.main.currentTransform + this.main.scrollAmount, maxScroll);
        this.smoothScrollTo(targetPosition);
    }

    scrollRight() {
        const containerWidth = this.main.scrollContainer.parentElement.offsetWidth;
        const contentWidth = this.main.scrollContainer.scrollWidth;
        const maxScroll = -(contentWidth - containerWidth);
        const targetPosition = Math.max(this.main.currentTransform - this.main.scrollAmount, maxScroll);
        this.smoothScrollTo(targetPosition);
    }

    smoothScrollTo(targetPosition) {
        if (this.main.scrollAnimation) {
            cancelAnimationFrame(this.main.scrollAnimation);
        }

        const startPosition = this.main.currentTransform;
        const distance = targetPosition - startPosition;
        const duration = 300; // ms
        let startTime = null;

        const animateScroll = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Easing function for smooth animation
            const ease = this.main.easeOutCubic(progress);
            this.main.currentTransform = startPosition + (distance * ease);

            this.main.applyTransform();
            this.main.updateArrowStates();

            if (progress < 1) {
                this.main.scrollAnimation = requestAnimationFrame(animateScroll);
            } else {
                this.main.scrollAnimation = null;
            }
        };

        this.main.scrollAnimation = requestAnimationFrame(animateScroll);
    }
}