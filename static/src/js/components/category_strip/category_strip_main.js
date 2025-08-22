/**
 * Category Strip Main Controller
 * Handles sticky behavior, menu button scroll, and category clicks
 */

class CategoryStripMain {
    constructor() {
        this.categoryStrip = null;
        this.isSticky = false;
        this.originalTop = 0;

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
        this.categoryStrip = document.getElementById('category-strip');

        if (!this.categoryStrip) {
            console.warn('Category strip not found');
            return;
        }

        this.setupStickyBehavior();
        this.setupMenuButtonScroll();
        this.setupCategoryClicks();
        this.setupCategoryActiveStates();
    }

    setupStickyBehavior() {
        // Get original position
        this.originalTop = this.categoryStrip.getBoundingClientRect().top + window.pageYOffset;

        // Add scroll listener
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset;

        if (scrollTop >= this.originalTop && !this.isSticky) {
            // Make sticky
            this.categoryStrip.classList.add('sticky');
            this.isSticky = true;
        } else if (scrollTop < this.originalTop && this.isSticky) {
            // Remove sticky
            this.categoryStrip.classList.remove('sticky');
            this.isSticky = false;
        }
    }

    setupMenuButtonScroll() {
        // Find menu button in navbar (both desktop and mobile)
        const menuButtons = document.querySelectorAll('a[href="/menu"], a[href="#menu"]');

        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToCategoryStrip();
            });
        });

        // Also handle mobile menu button if it exists
        const mobileMenuButton = document.getElementById('mobile-menu-toggle');
        if (mobileMenuButton) {
            // Check if it should scroll to menu instead of opening mobile menu
            // You might want to add a specific menu scroll button in mobile view
        }
    }

    scrollToCategoryStrip() {
        const targetPosition = this.originalTop - 20; // Small offset

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Highlight the category strip briefly
        this.categoryStrip.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.categoryStrip.style.transform = 'scale(1)';
        }, 200);
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
        // First, update active state
        this.setActiveCategory(clickedItem);

        // Try to find the section
        let targetElement = document.getElementById(sectionId);

        // If section doesn't exist, create a placeholder or scroll to a default position
        if (!targetElement) {
            // Create sections dynamically or scroll to a default position
            targetElement = this.createOrFindSection(sectionId);
        }

        if (targetElement) {
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 100;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    createOrFindSection(sectionId) {
        // Try to find existing sections or create placeholders
        // This is a fallback - ideally sections should exist in your page
        let section = document.querySelector(`[data-section="${sectionId}"]`);

        if (!section) {
            // Look for sections with similar names or create a placeholder
            const contentArea = document.querySelector('.main-content') || document.body;
            section = document.createElement('div');
            section.id = sectionId;
            section.setAttribute('data-section', sectionId);
            section.className = 'menu-section py-16';
            section.innerHTML = `
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold mb-8 text-center">${this.formatSectionTitle(sectionId)}</h2>
                    <p class="text-center text-gray-600">Content for ${this.formatSectionTitle(sectionId)} will be displayed here.</p>
                </div>
            `;
            contentArea.appendChild(section);
        }

        return section;
    }

    formatSectionTitle(sectionId) {
        return sectionId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    setupCategoryActiveStates() {
        // Set active state based on scroll position
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateActiveStateOnScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateActiveStateOnScroll() {
        const sections = document.querySelectorAll('[data-section]');
        const scrollTop = window.pageYOffset + 150;

        let activeSection = null;
        sections.forEach(section => {
            const top = section.getBoundingClientRect().top + window.pageYOffset;
            const bottom = top + section.offsetHeight;

            if (scrollTop >= top && scrollTop < bottom) {
                activeSection = section.getAttribute('data-section') || section.id;
            }
        });

        if (activeSection) {
            const activeItem = document.querySelector(`.category-item[href="#${activeSection}"]`);
            if (activeItem) {
                this.setActiveCategory(activeItem);
            }
        }
    }

    setActiveCategory(activeItem) {
        // Remove active class from all items
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            item.classList.remove('bg-[#f39c12]', 'text-black');
            item.classList.add('bg-[#34495e]', 'text-white');
        });

        // Add active class to clicked item
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.classList.remove('bg-[#34495e]', 'text-white');
            activeItem.classList.add('bg-[#f39c12]', 'text-black');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.categoryStripMain = new CategoryStripMain();
});