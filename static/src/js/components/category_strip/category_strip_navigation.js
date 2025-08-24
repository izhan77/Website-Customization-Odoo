/**
 * Category Strip Navigation Handler
 * Handles category clicks, section scrolling, and active states
 */
class CategoryStripNavigation {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        this.setupCategoryClicks();
        this.setupActiveStates();
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
            const offset = this.main.navbarHeight + 80; // navbar + category strip height
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
        const scrollTop = window.pageYOffset + this.main.navbarHeight + 100;

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

            const contentWidth = this.main.scrollContainer.scrollWidth;
            const maxScroll = 0;
            const minScroll = -(contentWidth - wrapperWidth);

            // Use the scroll module's smoothScrollTo method
            if (this.main.scroll) {
                this.main.scroll.smoothScrollTo(Math.max(Math.min(-scrollPosition, maxScroll), minScroll));
            }
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