/**
 * DYNAMIC MENU LOADER
 * Handles dynamic loading of categories and menu sections
 */

class DynamicMenuLoader {
    constructor() {
        this.categories = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        console.log('🚀 Initializing Dynamic Menu Loader...');

        // Show skeleton loaders
        this.showCategorySkeleton();
        this.showMenuSectionsSkeleton();

        // Load categories
        await this.loadCategories();

        // Render categories and menu sections
        this.renderCategoryStrip();
        this.renderMenuSections();

        // Hide skeletons and show content
        this.hideSkeletons();
    }

    async loadCategories() {
        try {
            this.isLoading = true;
            console.log('📡 Loading categories from backend...');

            const response = await fetch('/order-mode/categories/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.categories = data.categories;
                console.log(`✅ Loaded ${this.categories.length} categories from backend`);
            } else {
                console.error('❌ Failed to load categories:', data.error);
                // Fallback to default categories
                this.categories = this.getDefaultCategories();
            }

        } catch (error) {
            console.error('❌ Error loading categories:', error);
            // Fallback to default categories
            this.categories = this.getDefaultCategories();
        } finally {
            this.isLoading = false;
        }
    }

    getDefaultCategories() {
        // Default categories if backend fails
        return [
            { id: 1, name: 'Rice Box', slug: 'rice-box', product_count: 0 },
            { id: 2, name: 'Fish & Chips', slug: 'fish-chips', product_count: 0 },
            { id: 3, name: 'Pasta', slug: 'pasta', product_count: 0 },
            { id: 4, name: 'Turkish Feast', slug: 'turkish-feast', product_count: 0 },
            { id: 5, name: 'Wraps & Rolls', slug: 'wraps-rolls', product_count: 0 },
            { id: 6, name: 'New Arrivals', slug: 'new-arrivals', product_count: 0 },
            { id: 7, name: 'Soups & Salads', slug: 'soups-salads', product_count: 0 },
            { id: 8, name: 'Cold Drinks', slug: 'cold-drinks', product_count: 0 },
            { id: 9, name: 'Hot Beverages', slug: 'hot-beverages', product_count: 0 },
            { id: 10, name: 'Desserts', slug: 'desserts', product_count: 0 },
            { id: 11, name: 'BBQ Specials', slug: 'bbq-specials', product_count: 0 },
            { id: 12, name: 'Fast Food', slug: 'fast-food', product_count: 0 }
        ];
    }

    showCategorySkeleton() {
        const categoryContainer = document.getElementById('categories-container');
        if (!categoryContainer) return;

        // Clear existing content
        categoryContainer.innerHTML = '';

        // Add skeleton items
        for (let i = 0; i < 8; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'category-item-skeleton';
            skeletonItem.innerHTML = `
                <div class="skeleton-category-name"></div>
            `;
            categoryContainer.appendChild(skeletonItem);
        }
    }

    showMenuSectionsSkeleton() {
        const menuSectionsContainer = document.getElementById('menu-sections-container');
        if (!menuSectionsContainer) return;

        // Clear existing content
        menuSectionsContainer.innerHTML = '';

        // Add skeleton sections
        for (let i = 0; i < 6; i++) {
            const skeletonSection = document.createElement('div');
            skeletonSection.className = 'menu-section-skeleton';
            skeletonSection.innerHTML = `
                <div class="skeleton-section-title"></div>
                <div class="skeleton-section-description"></div>
                <div class="skeleton-products-grid">
                    ${Array(4).fill('<div class="skeleton-product-card"></div>').join('')}
                </div>
            `;
            menuSectionsContainer.appendChild(skeletonSection);
        }
    }

    renderCategoryStrip() {
        const categoryContainer = document.getElementById('categories-container');
        if (!categoryContainer) return;

        // Clear skeleton
        categoryContainer.innerHTML = '';

        // Add category items
        this.categories.forEach(category => {
            const categoryItem = document.createElement('a');
            categoryItem.href = `#${category.slug}-section`;
            categoryItem.className = 'category-item';
            categoryItem.setAttribute('data-section', `${category.slug}-section`);
            categoryItem.textContent = category.name;

            categoryContainer.appendChild(categoryItem);
        });

        // Reinitialize category strip functionality
        if (window.categoryStripHorizontal) {
            window.categoryStripHorizontal.setup();
        }
    }

    renderMenuSections() {
        const menuSectionsContainer = document.getElementById('menu-sections-container');
        if (!menuSectionsContainer) return;

        // Clear skeleton
        menuSectionsContainer.innerHTML = '';

        // Add menu sections
        this.categories.forEach(category => {
            const section = document.createElement('section');
            section.id = `${category.slug}-section`;
            section.className = 'menu-section py-16 bg-white';

            section.innerHTML = `
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12">
                        <h2 style="font-family: 'Roboto Condensed' !important; letter-spacing: -0.065em; margin-bottom: 0px !important;"
                            class="text-[5rem] md:text-[6rem] text-gray-900">${category.name.toUpperCase()}
                        </h2>
                        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                            Delicious ${category.name} options prepared with care
                        </p>
                    </div>

                    <!-- Product Grid Container -->
                    <div class="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8">
                        <!-- Products will be loaded here by DynamicProductLoader -->
                    </div>

                    <img src="/website_customizations/static/src/images/seperator-line.png" class="w-full h-[3rem] object-cover mt-5" alt="Line Seperator"/>
                </div>
            `;

            menuSectionsContainer.appendChild(section);
        });

        // Initialize product loading for these sections
        if (window.dynamicProductLoader) {
            // Update the category mapping in product loader
            const categoryMapping = {};
            this.categories.forEach(cat => {
                categoryMapping[`${cat.slug}-section`] = cat.slug;
            });

            window.dynamicProductLoader.categoryMapping = categoryMapping;
            window.dynamicProductLoader.loadAllCategoriesSimultaneously();
        }
    }

    hideSkeletons() {
        // Remove skeleton classes and show actual content
        document.querySelectorAll('.category-item-skeleton, .menu-section-skeleton').forEach(el => {
            el.classList.remove('skeleton');
        });
    }

    // Method to add new category (will be called when new category is created in backend)
    addNewCategory(categoryData) {
        console.log('➕ Adding new category:', categoryData);

        // Add to categories array
        this.categories.push(categoryData);

        // Update UI
        this.renderCategoryStrip();
        this.renderMenuSections();
    }
}

// Initialize
function initializeDynamicMenu() {
    window.dynamicMenuLoader = new DynamicMenuLoader();
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDynamicMenu);
} else {
    initializeDynamicMenu();
}