/**
 * Main Category Strip Entry Point
 * Initializes and coordinates all category strip functionality
 */
class CategoryStrip {
    constructor() {
        this.main = null;
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
        // Small delay to ensure all DOM elements are rendered
        setTimeout(() => {
            this.main = new CategoryStripMain();
            console.log('Category strip initialized successfully!');
        }, 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.categoryStrip = new CategoryStrip();
});

if (document.readyState !== 'loading') {
    window.categoryStrip = new CategoryStrip();
}