/**
 * ================================= DYNAMIC PRODUCT LOADER =================================
 * Updated to work with dynamic categories and no hardcoded URLs
 */

class DynamicProductLoader {
    constructor() {
        this.products = [];
        this.isLoading = false;
        this.initialized = false;

        // Use relative paths for API endpoints
        this.apiConfig = {
            endpoints: {
                allProducts: '/order-mode/products/all',
                categoryProducts: '/order-mode/products/category/',
                singleProduct: '/order-mode/products/single/',
                searchProducts: '/order-mode/products/search'
            }
        };

        this.init();
    }

    init() {
        console.log('🔄 Initializing Dynamic Product Loader...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        if (this.initialized) return;

        try {
            // STEP 1: IMMEDIATELY show skeleton loading for ALL sections at once
            this.showAllSkeletonLoaders();

            // STEP 2: Wait for skeleton animation (3-4 seconds) - ONE TIME ONLY
            console.log('⏰ Skeleton animation playing for 3.5 seconds for ALL sections...');
            await this.delay(3500); // 3.5 seconds skeleton animation

            // STEP 3: Load ALL categories simultaneously (no delays between sections)
            console.log('🚀 Loading ALL backend products simultaneously...');
            await this.loadAllCategoriesSimultaneously();

            // STEP 4: Hide all skeletons and show results
            this.hideAllSkeletonLoaders();
            await this.delay(300); // Small transition delay
            this.showAllLoadedContent();

            this.initialized = true;
            console.log('✅ One-time product loading completed successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Dynamic Product Loader:', error);
            // Hide all skeletons on error and show static content
            this.hideAllSkeletonLoaders();
            this.showStaticContent();
        }
    }

    showAllSkeletonLoaders() {
        console.log('💀 Showing skeleton loaders for all sections immediately...');

        // Use requestAnimationFrame for smoother initial rendering
        requestAnimationFrame(() => {
            // Find all product grids and show skeleton loading
            const sections = document.querySelectorAll('section[id]');

            sections.forEach(section => {
                const productGrid = section.querySelector('.product-grid');
                if (productGrid) {
                    // FIRST: Hide all static cards immediately
                    const staticCards = productGrid.querySelectorAll('.product-card:not(.skeleton-product-card)');
                    staticCards.forEach(card => {
                        card.style.display = 'none';
                    });

                    // THEN: Add skeleton cards with animation
                    const skeletonHTML = this.createSkeletonCardsHTML(4);
                    const skeletonContainer = document.createElement('div');
                    skeletonContainer.classList.add('skeleton-cards-container');
                    skeletonContainer.innerHTML = skeletonHTML;
                    productGrid.appendChild(skeletonContainer);

                    console.log(`💀 Added skeleton loader to ${section.id}`);
                }
            });
        });
    }

    hideAllSkeletonLoaders() {
        console.log('✅ Hiding all skeleton loaders...');

        // Add fade-out animation before removal
        document.querySelectorAll('.skeleton-cards-container').forEach(container => {
            container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            container.style.opacity = '0';
            container.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                container.remove();
            }, 300);
        });
    }

    showStaticContent() {
        console.log('📦 Showing static content as fallback...');

        // Show all static product cards with fade-in animation
        document.querySelectorAll('.product-grid').forEach(grid => {
            grid.classList.add('loaded');
            const cards = grid.querySelectorAll('.product-card:not(.skeleton-product-card)');
            cards.forEach((card, index) => {
                card.style.display = 'flex';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                // Stagger the animation
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    }

    async loadAllCategoriesSimultaneously() {
        console.log('🚀 Loading ALL categories simultaneously...');

        // Get all sections with IDs
        const sections = document.querySelectorAll('section[id]');

        // Create promises for all sections at once
        const loadingPromises = Array.from(sections).map(async (section) => {
            try {
                const sectionId = section.id;

                // Skip sections that don't look like category sections
                if (!sectionId.includes('-section')) {
                    return { sectionId, success: false, reason: 'not_a_category_section' };
                }

                // Fetch products from backend using section ID as category slug
                const fullUrl = `${this.apiConfig.endpoints.categoryProducts}${sectionId}`;
                console.log(`🔗 Fetching ${sectionId}: ${fullUrl}`);

                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    signal: AbortSignal.timeout(8000) // 8 second timeout
                });

                if (!response.ok) {
                    console.log(`❌ Failed to fetch ${sectionId} (Status: ${response.status})`);
                    return { sectionId, success: false, reason: 'fetch_failed', status: response.status };
                }

                const data = await response.json();

                if (data.success && data.products && data.products.length > 0) {
                    console.log(`✅ Loaded ${data.products.length} products for ${sectionId}`);
                    return { sectionId, success: true, products: data.products };
                } else {
                    console.log(`📭 No products returned for ${sectionId}`);
                    return { sectionId, success: false, reason: 'no_products' };
                }

            } catch (error) {
                console.error(`❌ Error loading section:`, error);
                return { sectionId, success: false, reason: 'network_error', error: error.message };
            }
        });

        // Wait for ALL requests to complete
        const results = await Promise.allSettled(loadingPromises);

        // Store results for processing after skeleton removal
        this.loadingResults = results.map(result => result.value || result.reason);

        console.log('📊 All category loading completed:', this.loadingResults);
    }

    showAllLoadedContent() {
        console.log('🎨 Showing all loaded content...');

        this.loadingResults.forEach((result, index) => {
            if (!result || !result.sectionId) return;

            const section = document.getElementById(result.sectionId);
            if (!section) return;

            if (result.success && result.products) {
                // Show backend products
                setTimeout(() => {
                    this.showBackendProducts(section, result.products);
                }, index * 100); // Stagger appearance by 100ms
            } else {
                // Show static content as fallback
                setTimeout(() => {
                    this.showStaticContentForSection(result.sectionId);
                }, index * 100);

                console.log(`📦 Showing static content for ${result.sectionId} (Reason: ${result.reason})`);
            }
        });
    }

    showBackendProducts(section, products) {
        const productGrid = section.querySelector('.product-grid');
        if (!productGrid) return;

        console.log(`🎯 Adding ${products.length} backend products to grid`);

        // STEP 1: Remove all static cards completely (they're already hidden)
        const staticCards = productGrid.querySelectorAll('.product-card:not(.skeleton-product-card)');
        staticCards.forEach(card => card.remove());

        // STEP 2: Create new cards from backend data
        products.forEach((product, index) => {
            const productCardHTML = this.createProductCardHTML(product);
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = productCardHTML;
            const newCard = tempContainer.firstElementChild;

            // Add with initial hidden state
            newCard.style.opacity = '0';
            newCard.style.transform = 'translateY(20px)';
            newCard.classList.add('backend-product', 'fade-in');
            productGrid.appendChild(newCard);

            // Animate in with stagger (no delay here, controlled by showAllLoadedContent)
            setTimeout(() => {
                newCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                newCard.style.opacity = '1';
                newCard.style.transform = 'translateY(0)';
            }, 50); // Very short delay for smooth rendering
        });

        // Mark grid as loaded
        productGrid.classList.add('loaded');
        console.log(`✅ Added ${products.length} backend products with animations`);
    }

    showStaticContentForSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const productGrid = section.querySelector('.product-grid');
        if (!productGrid) return;

        console.log(`📦 Showing static content for ${sectionId}`);

        // Hide skeleton for this section
        const skeletonContainer = productGrid.querySelector('.skeleton-cards-container');
        if (skeletonContainer) {
            skeletonContainer.style.transition = 'opacity 0.3s ease';
            skeletonContainer.style.opacity = '0';

            setTimeout(() => {
                skeletonContainer.remove();
            }, 300);
        }

        // Wait for skeleton to fade out, then show static cards
        setTimeout(() => {
            const staticCards = productGrid.querySelectorAll('.product-card:not(.skeleton-product-card)');
            staticCards.forEach((card, index) => {
                card.style.display = 'flex';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                // Animate in with stagger
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });

            productGrid.classList.add('loaded');
        }, 300);
    }

    createSkeletonCardsHTML(count = 4) {
        let skeletonHTML = '';

        for (let i = 0; i < count; i++) {
            skeletonHTML += `
                <div class="skeleton-product-card" style="animation-delay: ${i * 0.1}s">
                    <!-- Skeleton Image -->
                    <div class="skeleton-product-image"></div>

                    <!-- Skeleton Details -->
                    <div class="skeleton-product-details">
                        <!-- Skeleton Title -->
                        <div class="skeleton-product-title"></div>

                        <!-- Skeleton Description -->
                        <div class="skeleton-product-description">
                            <div class="skeleton-description-line"></div>
                            <div class="skeleton-description-line"></div>
                        </div>

                        <!-- Skeleton Pricing Section -->
                        <div class="skeleton-pricing-section">
                            <div class="skeleton-price-container"></div>
                        </div>

                        <!-- Skeleton Cart Action Section -->
                        <div class="skeleton-cart-action-section">
                            <div class="skeleton-product-button"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        return skeletonHTML;
    }

    createProductCardHTML(product) {
        // Create product card HTML that matches your existing structure
        return `
            <div class="product-card backend-product"
                 data-product-id="${product.id}"
                 data-category="${product.category_slug || 'general'}"
                 data-name="${product.name}"
                 data-price="${product.price}"
                 data-original-price="${product.original_price || product.price}"
                 data-image="${product.image}">

                <!-- Product Image Container -->
                <div class="product-image-container">
                    <img src="${product.image || '/website_customizations/static/src/images/product_1.jpg'}"
                         alt="${product.name}"
                         loading="lazy"/>

                    ${!product.in_stock ? `
                        <div class="stock-overlay">
                            <span class="stock-text">Out of Stock</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Product Details Container -->
                <div class="product-details">
                    <!-- Product Title -->
                    <h3 class="product-title">${product.name}</h3>

                    <!-- Product Description -->
                    <p class="product-description">${product.short_description || product.description || 'Fresh and delicious food prepared with love'}</p>

                    <!-- Pricing Section -->
                    <div class="pricing-section">
                        <div class="price-container">
                            ${product.original_price && product.original_price !== product.price ? `
                                <span class="original-price">${product.currency || 'Rs.'} ${product.original_price}</span>
                            ` : ''}
                            <span class="discounted-price">${product.currency || 'Rs.'} ${product.price}</span>
                        </div>
                    </div>

                    <!-- Cart Action Section -->
                    <div class="cart-action-section">
                        <!-- Add to Cart Button -->
                        <button class="add-to-cart-btn" data-product-id="${product.id}">
                            <span class="add-text">ADD TO CART</span>
                            <div class="loading-spinner hidden">
                                <div class="spinner"></div>
                            </div>
                        </button>

                        <!-- Quantity Controls Bar -->
                        <div class="quantity-controls-bar hidden">
                            <button class="quantity-decrease-btn" data-product-id="${product.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <span class="quantity-display">1</span>
                            <button class="quantity-increase-btn" data-product-id="${product.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Debug method to test connection
    async testConnection() {
        console.log('🧪 Testing backend connection...');

        try {
            const testUrl = `${this.apiConfig.endpoints.allProducts}`;
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log(`🔗 Test URL: ${testUrl}`);
            console.log(`📊 Response Status: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend connection successful:', data);
                return true;
            } else {
                console.log('❌ Backend connection failed:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Backend connection error:', error);
            return false;
        }
    }

    // Method to force reload all products (useful for debugging)
    async forceReloadAll() {
        console.log('🔄 Force reloading all products...');
        this.initialized = false;
        this.loadingResults = [];

        // Clear all current content
        this.hideAllSkeletonLoaders();
        document.querySelectorAll('.product-grid .product-card').forEach(card => {
            card.style.display = 'none';
        });

        // Wait a bit for cleanup
        await this.delay(500);

        // Reload everything
        await this.setup();
    }
}

// Initialize the product loader
function initializeProductLoader() {
    if (!window.dynamicProductLoader) {
        console.log('🚀 Initializing Product Loader immediately...');
        window.dynamicProductLoader = new DynamicProductLoader();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductLoader);
} else {
    initializeProductLoader();
}

// Make it globally available for debugging
window.DynamicProductLoader = DynamicProductLoader;

// Enhanced global debug functions
window.testProductEndpoints = function() {
    if (window.dynamicProductLoader) {
        window.dynamicProductLoader.testConnection();
    } else {
        console.error('Dynamic Product Loader not initialized');
    }
};

window.reloadAllProducts = function() {
    if (window.dynamicProductLoader) {
        window.dynamicProductLoader.forceReloadAll();
    } else {
        console.error('Dynamic Product Loader not initialized');
    }
};

// Quick test function for immediate debugging
window.quickTest = function() {
    console.log('🔍 Quick test of current state:');

    // Check if loader exists
    if (window.dynamicProductLoader) {
        console.log('✅ Product loader exists');
        console.log('📊 Initialized:', window.dynamicProductLoader.initialized);
        console.log('⏳ Loading:', window.dynamicProductLoader.isLoading);
    } else {
        console.log('❌ Product loader not found');
    }

    // Check skeleton state
    const skeletonCount = document.querySelectorAll('.skeleton-product-card').length;
    const backendCount = document.querySelectorAll('.backend-product').length;
    const staticCount = document.querySelectorAll('.product-card:not(.skeleton-product-card):not(.backend-product)').length;

    console.log(`💀 Skeleton cards: ${skeletonCount}`);
    console.log(`🎯 Backend cards: ${backendCount}`);
    console.log(`📦 Static cards: ${staticCount}`);
};