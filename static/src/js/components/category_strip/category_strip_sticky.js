/**
 * Category Strip Sticky Handler
 * Handles sticky positioning and related behaviors
 */
class CategoryStripSticky {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        this.setupStickyBehavior();
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
            this.main.originalTop = this.main.categoryStrip.offsetTop;
            this.main.navbarHeight = this.main.navbar ? this.main.navbar.offsetHeight : 80;
            this.main.updateArrowStates();
        });
    }

    handleStickyScroll() {
        if (!this.main.categoryStrip) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldBeSticky = scrollTop > (this.main.originalTop - this.main.navbarHeight);

        if (shouldBeSticky && !this.main.isSticky) {
            this.makeSticky();
        } else if (!shouldBeSticky && this.main.isSticky) {
            this.removeSticky();
        }
    }

    makeSticky() {
        if (this.main.isSticky) return;

        this.main.isSticky = true;
        const stripHeight = this.main.categoryStrip.offsetHeight;

        // Set placeholder
        this.main.placeholder.style.height = stripHeight + 'px';
        this.main.placeholder.style.display = 'block';

        // Apply sticky styles
        this.main.categoryStrip.classList.add('sticky');
    }

    removeSticky() {
        if (!this.main.isSticky) return;

        this.main.isSticky = false;

        // Remove placeholder
        this.main.placeholder.style.height = '0px';
        this.main.placeholder.style.display = 'none';

        // Remove sticky styles
        this.main.categoryStrip.classList.remove('sticky');
    }
}