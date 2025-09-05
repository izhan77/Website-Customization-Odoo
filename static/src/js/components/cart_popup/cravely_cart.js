/**
 * ================================= NAVBAR-SAFE CART SYSTEM (FIXED) =================================
 * Fixed cart functionality with proper success notification timing
 * File: /website_customizations/static/src/js/components/cart_popup/cravely_cart.js
 */

class CravelyCartManager {
    constructor() {
        // Cart state management
        this.cart = [];
        this.lastOrderType = this.getCurrentOrderType();
        this.cartTotal = 0;
        this.cartCount = 0;
        this.isCartOpen = false;
        this.menuProducts = [];

        // Settings
        this.deliveryFee = 200;
        this.taxRate = 0.15;
        this.popupDisplayTime = 3000; // FIXED: 3 seconds for success notification

        // Namespace for all cart operations
        this.namespace = 'cravely-cart-';

        // Popular items state
        this.popularItems = [];
        this.scrollPosition = 0;

        // FIXED: Proper timer management to prevent conflicts
        this.successNotificationTimer = null;
        this.cartPopupState = 'hidden'; // 'hidden', 'showing', 'visible', 'hiding'

        // Storage management flags
        this.isOrderCompleted = false;

        // Initialize the cart system
        this.init();
    }

    /**
     * Initialize the cart system - completely isolated from navbar
     */
    init() {
        console.log('🛒 Initializing Cravely Cart Manager (Fixed)...');

        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    setup() {
    this.loadMenuProducts();
    this.createCartElements();
    this.bindAllEvents();
    this.initializeQuantityControls();
    this.loadCartFromStorage();

    // Clear any lingering timers from previous page loads
    this.clearAllTimers();

    this.setupOrderTypeChangeListener();

    console.log('✅ Cravely Cart Manager initialized successfully');
}

/**
 * Monitor order type changes and update cart accordingly
 */
setupOrderTypeChangeListener() {
    // Check for order type changes every second
    setInterval(() => {
        const currentOrderType = this.getCurrentOrderType();

        if (currentOrderType !== this.lastOrderType) {
            console.log(`🔄 Order type changed from ${this.lastOrderType} to ${currentOrderType}`);
            this.lastOrderType = currentOrderType;

            // Update all cart displays
            this.updateCartPopupDisplay();
            this.updateCartSummary();
            this.updateDeliveryInfoMessage(currentOrderType);
        }
    }, 1000); // Check every second
}

/**
 * Get current order type from various sources
 */
getCurrentOrderType() {
    // Check URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlOrderType = urlParams.get('order_type');
    if (urlOrderType) return urlOrderType;

    // Check sessionStorage
    try {
        const storedOrder = sessionStorage.getItem('orderMethodSelected');
        if (storedOrder) {
            const orderData = JSON.parse(storedOrder);
            if (orderData.type) return orderData.type;
        }
    } catch (e) {}

    return 'delivery'; // Default
}

    /**
 * Load cart from sessionStorage
 */
loadCartFromStorage() {
    try {
        const storedCart = sessionStorage.getItem('cravely-cart-data');
        if (storedCart) {
            const cartData = JSON.parse(storedCart);
            if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
                this.cart = cartData.items;
                this.updateCartTotals();
                this.updateCartPopupDisplay();
                this.updateCartSidebarContent();
                this.updateCartSummary();
                this.initializeQuantityControls();
                if (this.cart.length > 0) {
                    this.showCartPopupOnly();
                }
            }
        }
    } catch (error) {
        this.clearCartStorage();
    }
}

/**
 * Save cart to sessionStorage
 */
saveCartToStorage() {
    try {
        const cartData = {
            items: this.cart,
            total: this.cartTotal,
            count: this.cartCount,
            timestamp: Date.now()
        };
        sessionStorage.setItem('cravely-cart-data', JSON.stringify(cartData));
    } catch (error) {
        console.error('Failed to save cart:', error);
    }
}

/**
 * Clear cart storage
 */
clearCartStorage() {
    sessionStorage.removeItem('cravely-cart-data');
}

/**
 * Clear all timers to prevent conflicts
 */
clearAllTimers() {
    if (this.successNotificationTimer) {
        clearTimeout(this.successNotificationTimer);
        this.successNotificationTimer = null;
    }

    // Hide any visible success notifications
    const popup = document.getElementById('cravely-cart-view-popup');
    const successNotification = popup?.querySelector('.cravely-success-notification');
    if (successNotification) {
        successNotification.style.display = 'none';
    }

    // Reset popup state
    this.cartPopupState = 'hidden';
}

    /**
     * Load all products from menu sections for dynamic functionality
     */
    loadMenuProducts() {
        const productCards = document.querySelectorAll('.product-card');
        this.menuProducts = [];

        productCards.forEach((card, index) => {
            const productData = {
                id: card.getAttribute('data-product-id') || `product-${Date.now()}-${index}`,
                name: card.getAttribute('data-name') || card.querySelector('.product-title')?.textContent?.trim() || 'Unknown Product',
                price: this.extractPrice(card.getAttribute('data-price') || card.querySelector('.discounted-price')?.textContent || '0'),
                originalPrice: this.extractPrice(card.getAttribute('data-original-price') || card.querySelector('.original-price')?.textContent || '0'),
                image: card.getAttribute('data-image') || card.querySelector('.product-image-container img')?.src || '/website_customizations/static/src/images/product_1.jpg',
                description: card.querySelector('.product-description')?.textContent?.trim() || 'Fresh and delicious food',
                category: card.getAttribute('data-category') || 'general'
            };

            this.menuProducts.push(productData);
        });

        console.log(`📦 Loaded ${this.menuProducts.length} products from menu sections`);
    }

    /**
     * Create cart popup and sidebar elements if they don't exist
     */
    createCartElements() {
        // Check if elements already exist
        if (document.getElementById('cravely-cart-view-popup') && document.getElementById('cravely-cart-sidebar-overlay')) {
            this.updatePopularItems();
            return;
        }

        console.log('🏗️ Creating Cravely cart UI elements...');

        // Create cart popup with namespace-specific elements - FIXED: Lower z-index
        const popupHTML = `
            <div id="cravely-cart-view-popup" class="cravely-cart-view-popup cravely-cart-hidden" style="z-index: 9999;">
                <div class="cravely-cart-popup-container">
                    <div class="cravely-success-notification">
                        <div class="cravely-success-icon">
                            <svg class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="9"/>
                            </svg>
                        </div>
                        <span class="cravely-success-text">Item added to cart</span>
                    </div>
                    <button id="cravely-view-cart-btn" class="cravely-view-cart-button">
                        <span class="cravely-cart-count-badge">0</span>
                        <span class="cravely-view-cart-text">View Cart</span>
                        <span class="cravely-cart-total-price">Rs. 0</span>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);

        // Create cart sidebar with namespace-specific elements - FIXED: Lower z-index
        const sidebarHTML = `
            <div id="cravely-cart-sidebar-overlay" class="cravely-cart-sidebar-overlay cravely-cart-hidden" style="z-index: 9998;">
                <div id="cravely-cart-sidebar" class="cravely-cart-sidebar">
                    <div class="cravely-cart-sidebar-header">
                        <h2 class="cravely-cart-title">Your Cart</h2>
                        <button id="cravely-close-cart-btn" class="cravely-close-cart-btn">
                            <svg class="cravely-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="cravely-cart-scrollable-content" id="cravely-cart-scrollable-content">
                        <div class="cravely-cart-items-section" id="cravely-cart-items-container">
                            <div class="cravely-empty-cart-state">
                                <div class="cravely-empty-cart-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="m1 1 4 4 2.4 12h11.6"></path>
                                    </svg>
                                </div>
                                <p class="cravely-empty-cart-message">Your cart is empty</p>
                                <p class="cravely-empty-cart-subtitle">Add some delicious items to get started</p>
                            </div>
                        </div>

                        <div class="cravely-add-more-items-section" id="cravely-add-more-section">
                            <button class="cravely-add-more-items-btn" id="cravely-add-more-items-btn">
                                <span class="cravely-add-icon">+</span>
                                Add more items
                            </button>
                        </div>

                        <div class="cravely-popular-items-section" id="cravely-popular-items-section">
                            <h3 class="cravely-popular-items-title">Popular with your order</h3>
                            <p class="cravely-popular-items-subtitle">Customers often buy these together</p>
                            <div class="cravely-popular-items-scroll-container">
                                <button class="cravely-scroll-nav-btn cravely-scroll-left-btn" id="cravely-scroll-left">
                                    <svg class="cravely-scroll-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15,18 9,12 15,6"></polyline>
                                    </svg>
                                </button>
                                <div class="cravely-popular-items-grid" id="cravely-popular-items-grid">
                                    <!-- Popular items will be dynamically inserted here -->
                                </div>
                                <button class="cravely-scroll-nav-btn cravely-scroll-right-btn" id="cravely-scroll-right">
                                    <svg class="cravely-scroll-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9,18 15,12 9,6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="cravely-cart-summary-section" id="cravely-cart-summary">
                            <div class="cravely-summary-row">
                                <span class="cravely-summary-label">Subtotal</span>
                                <span class="cravely-summary-value" id="cravely-subtotal-amount">Rs. 0</span>
                            </div>
                            <div class="cravely-summary-row">
                                <span class="cravely-summary-label">Tax (15%)</span>
                                <span class="cravely-summary-value" id="cravely-tax-amount">Rs. 0</span>
                            </div>
                            <div class="cravely-summary-row cravely-total-row">
                                <span class="cravely-summary-label">Grand Total</span>
                                <span class="cravely-summary-value" id="cravely-grand-total-amount">Rs. ${this.deliveryFee}</span>
                            </div>
                        </div>

                        <div class="cravely-checkout-section" id="cravely-checkout-section">
                            <button class="cravely-checkout-btn" id="cravely-checkout-btn">
                                <span class="cravely-checkout-text">Checkout</span>
                                <svg class="cravely-checkout-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12,5 19,12 12,19"></polyline>
                                </svg>
                            </button>
                        </div>

                        <div class="cravely-delivery-info" id="cravely-delivery-info">
                            <p class="cravely-delivery-text">Sorry, we are closed right now but pre-orders can be placed.</p>
                            <p class="cravely-delivery-text">Your order will be delivered approximately on <span class="cravely-delivery-date">August 31, 2025</span> at <span class="cravely-delivery-time">12:45 PM</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);

        this.updatePopularItems();
    }

    /**
     * Bind all event listeners - SAFELY isolated from navbar
     */
    bindAllEvents() {
        // CRITICAL: Only bind to cart-specific elements to avoid navbar conflicts
        this.bindProductCardEvents();
        this.bindCartPopupEvents();
        this.bindCartSidebarEvents();
        this.bindKeyboardEvents();
        this.bindPopularItemsEvents();

        console.log('🎯 Cravely cart event listeners bound successfully (navbar-safe)');
    }

    /**
     * Bind popular items events
     */
    bindPopularItemsEvents() {
        // Scroll navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-scroll-left')) {
                e.stopPropagation();
                this.scrollPopularItems('left');
            }
            if (e.target.closest('#cravely-scroll-right')) {
                e.stopPropagation();
                this.scrollPopularItems('right');
            }
        });

        // Add popular item to cart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cravely-popular-item-add-btn') || e.target.closest('.cravely-popular-item-add-btn')) {
                e.stopPropagation();
                this.handlePopularItemAdd(e);
            }
        });
    }

    /**
     * Bind product card related events - Safe selectors only
     */
    bindProductCardEvents() {
        // CRITICAL: Use specific event delegation that won't interfere with navbar
        document.addEventListener('click', (e) => {
            // Only handle if it's specifically an add-to-cart button
            if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                // Don't stop propagation - let other handlers work
                this.handleAddToCart(e);
            }
        });

        // Quantity control events - specific to product cards
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-increase-btn') || e.target.closest('.quantity-increase-btn')) {
                this.handleQuantityIncrease(e);
            }
            if (e.target.classList.contains('quantity-decrease-btn') || e.target.closest('.quantity-decrease-btn')) {
                this.handleQuantityDecrease(e);
            }
        });
    }

    /**
     * Bind cart popup events - Only for cart-specific elements
     */
    bindCartPopupEvents() {
        // View cart button - specific ID selector
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-view-cart-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.showCartSidebar();
            }
        });
    }

    /**
     * Bind cart sidebar events - Only for cart-specific elements
     */
    bindCartSidebarEvents() {
        // Close cart sidebar - specific to cart close button only
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-close-cart-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.hideCartSidebar();
            }
        });

        // Close on overlay click - only for cart overlay
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cravely-cart-sidebar-overlay') {
                this.hideCartSidebar();
            }
        });

        // Cart item controls - specific to cart elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cravely-delete-item-btn') || e.target.closest('.cravely-delete-item-btn')) {
                e.stopPropagation();
                this.handleCartItemDelete(e);
            }
            if (e.target.classList.contains('cravely-quantity-plus-btn') || e.target.closest('.cravely-quantity-plus-btn')) {
                e.stopPropagation();
                this.handleCartItemQuantityIncrease(e);
            }
            if (e.target.classList.contains('cravely-quantity-minus-btn') || e.target.closest('.cravely-quantity-minus-btn')) {
                e.stopPropagation();
                this.handleCartItemQuantityDecrease(e);
            }
        });

        // Add more items button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-add-more-items-btn')) {
                e.stopPropagation();
                this.handleAddMoreItems();
            }
        });

        // Checkout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-checkout-btn')) {
                e.stopPropagation();
                this.handleCheckout();
            }
        });
    }

    /**
     * Bind keyboard events - Only for cart operations
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Only handle escape if cart is open
            if (e.key === 'Escape' && this.isCartOpen) {
                this.hideCartSidebar();
            }
        });
    }

    /**
     * Initialize quantity controls for all product cards
     */
    initializeQuantityControls() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productId = card.getAttribute('data-product-id');
            const cartItem = this.cart.find(item => item.id === productId);

            if (cartItem) {
                this.showQuantityControls(card, cartItem.quantity);
            } else {
                this.showAddToCartButton(card);
            }
        });
    }

    /**
 * Generate popular items from backend products
 */
generatePopularItems() {
    // Try to get backend products from all loaded sections
    const backendProducts = [];

    // Collect all backend products from the DOM
    document.querySelectorAll('.product-card.backend-product').forEach(card => {
        const productData = {
            id: card.getAttribute('data-product-id'),
            name: card.getAttribute('data-name') || card.querySelector('.product-title')?.textContent?.trim(),
            price: parseInt(card.getAttribute('data-price') || '0'),
            image: card.getAttribute('data-image') || card.querySelector('img')?.src,
            category: card.getAttribute('data-category')
        };

        if (productData.id && productData.name) {
            backendProducts.push(productData);
        }
    });

    console.log(`Found ${backendProducts.length} backend products for popular items`);

    // Filter out items already in cart
    const availableProducts = backendProducts.filter(product =>
        !this.cart.some(cartItem => cartItem.id === product.id)
    );

    // If we have backend products, use them
    if (availableProducts.length > 0) {
        // Shuffle and return random selection
        const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(8, shuffled.length));
    }

    // Fallback to static products if no backend products
    if (this.menuProducts.length > 0) {
        const staticAvailable = this.menuProducts.filter(product =>
            !this.cart.some(cartItem => cartItem.id === product.id)
        );
        const shuffled = staticAvailable.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(8, shuffled.length));
    }

    return [];
}

    /**
 * Update popular items section - ENHANCED
 */
updatePopularItems() {
    const popularItemsGrid = document.getElementById('cravely-popular-items-grid');
    const popularItemsSection = document.getElementById('cravely-popular-items-section');

    if (!popularItemsGrid || !popularItemsSection) {
        return;
    }

    // Wait a bit for backend products to load if they haven't yet
    if (document.querySelectorAll('.backend-product').length === 0) {
        // Try again in 2 seconds if no backend products loaded yet
        setTimeout(() => this.updatePopularItems(), 2000);
    }

    this.popularItems = this.generatePopularItems();

    if (this.popularItems.length === 0) {
        popularItemsSection.style.display = 'none';
        return;
    }

    popularItemsSection.style.display = 'block';

    const popularItemsHTML = this.popularItems.map((item, index) => `
        <div class="cravely-popular-item" data-product-id="${item.id}" style="animation-delay: ${index * 0.1}s">
            <img src="${item.image}" alt="${item.name}" class="cravely-popular-item-image" loading="lazy"/>
            <div class="cravely-popular-item-content">
                <h4 class="cravely-popular-item-name">${item.name}</h4>
                <span class="cravely-popular-item-price">Rs. ${item.price}</span>
                <button class="cravely-popular-item-add-btn" title="Add to cart">+</button>
            </div>
        </div>
    `).join('');

    popularItemsGrid.innerHTML = popularItemsHTML;
    this.scrollPosition = 0;
}

    /**
     * Scroll popular items horizontally
     */
    scrollPopularItems(direction) {
        const grid = document.getElementById('cravely-popular-items-grid');
        if (!grid) return;

        const scrollAmount = 150;
        const maxScroll = grid.scrollWidth - grid.clientWidth;

        if (direction === 'left') {
            this.scrollPosition = Math.max(0, this.scrollPosition - scrollAmount);
        } else {
            this.scrollPosition = Math.min(maxScroll, this.scrollPosition + scrollAmount);
        }

        grid.scrollTo({
            left: this.scrollPosition,
            behavior: 'smooth'
        });
    }

    /**
 * Handle popular item add to cart - FIXED
 */
handlePopularItemAdd(event) {
    const popularItem = event.target.closest('.cravely-popular-item');
    if (!popularItem) return;

    const productId = popularItem.getAttribute('data-product-id');

    // FIX: Find the product in popularItems array instead of menuProducts
    const product = this.popularItems.find(p => p.id === productId);

    if (product) {
        // Add visual feedback
        const addBtn = popularItem.querySelector('.cravely-popular-item-add-btn');
        const originalContent = addBtn.innerHTML;

        addBtn.innerHTML = '✓';
        addBtn.style.background = '#10b981';

        setTimeout(() => {
            addBtn.innerHTML = originalContent;
            addBtn.style.background = '';
        }, 1000);

        // Add to cart - ensure quantity is set
        this.addToCart({...product, quantity: 1});

        // Update popular items to remove this item
        setTimeout(() => {
            this.updatePopularItems();
        }, 500);

        // Update cart displays
        this.updateCartPopupDisplay();
        this.updateCartSidebarContent();
        this.updateCartSummary();

        // Show success notification with proper timing
        this.showSuccessNotificationWithTimer();
    }
}

    /**
     * FIXED: Handle add to cart button click with proper success notification timing
     */
    handleAddToCart(event) {
        const button = event.target.closest('.add-to-cart-btn');
        const productCard = button.closest('.product-card');

        if (!productCard) {
            console.warn('Product card not found');
            return;
        }

        const productData = this.getProductDataFromCard(productCard);

        // Add loading state
        this.setButtonLoadingState(button, true);

        // Simulate brief loading for better UX
        setTimeout(() => {
            this.addToCart(productData);
            this.showQuantityControls(productCard, 1);

            // FIXED: Show success notification with proper timing
            this.showSuccessNotificationWithTimer();

            this.setButtonLoadingState(button, false);
            this.updatePopularItems(); // Refresh popular items
        }, 300);
    }

    /**
     * Handle quantity increase from product card
     */
    handleQuantityIncrease(event) {
        const button = event.target.closest('.quantity-increase-btn');
        const productCard = button.closest('.product-card');
        const productId = productCard.getAttribute('data-product-id');

        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += 1;
            this.updateCartTotals();
            this.updateQuantityDisplay(productCard, cartItem.quantity);
            this.updateCartPopupDisplay();
            this.updateCartSidebarContent();
            this.updateCartSummary();
            this.saveCartToStorage();

            // Show cart popup but NO success notification for quantity changes
            this.showCartPopupOnly();
        }
    }

    /**
     * Handle quantity decrease from product card
     */
    handleQuantityDecrease(event) {
        const button = event.target.closest('.quantity-decrease-btn');
        const productCard = button.closest('.product-card');
        const productId = productCard.getAttribute('data-product-id');

        const cartItemIndex = this.cart.findIndex(item => item.id === productId);
        if (cartItemIndex !== -1) {
            const cartItem = this.cart[cartItemIndex];

            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                this.updateCartTotals();
                this.updateQuantityDisplay(productCard, cartItem.quantity);
                this.updateCartPopupDisplay();
                this.updateCartSidebarContent();
                this.updateCartSummary();
                this.saveCartToStorage();

                // Show cart popup but NO success notification for quantity changes
                this.showCartPopupOnly();
            } else {
                // Remove item from cart and show add to cart button
                this.cart.splice(cartItemIndex, 1);
                this.updateCartTotals();
                this.showAddToCartButton(productCard);
                this.updateCartPopupDisplay();
                this.updateCartSidebarContent();
                this.updateCartSummary();
                this.saveCartToStorage();
                this.updatePopularItems(); // Refresh popular items

                if (this.cart.length === 0) {
                    this.hideCartPopup();
                }
            }
        }
    }

    /**
     * Add product to cart
     */
    addToCart(productData) {
        const existingProductIndex = this.cart.findIndex(item => item.id === productData.id);

        if (existingProductIndex !== -1) {
            this.cart[existingProductIndex].quantity += (productData.quantity || 1);
        } else {
            this.cart.push({
                ...productData,
                quantity: productData.quantity || 1
            });
        }

        this.updateCartTotals();
        this.updateCartPopupDisplay();
        this.updateCartSummary();
        this.saveCartToStorage();

        console.log('🛒 Product added to Cravely cart:', productData);
    }

    /**
     * Update cart totals and count
     */
    updateCartTotals() {
        this.cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.cartTotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Update cart summary section
     */
    /**
 * Update cart summary section
 */
updateCartSummary() {
    const subtotalEl = document.getElementById('cravely-subtotal-amount');
    const taxEl = document.getElementById('cravely-tax-amount');
    const grandTotalEl = document.getElementById('cravely-grand-total-amount');
    const checkoutBtn = document.getElementById('cravely-checkout-btn');

    if (subtotalEl) {
        subtotalEl.textContent = `Rs. ${this.cartTotal}`;
    }

    const tax = Math.round(this.cartTotal * this.taxRate);
    if (taxEl) {
        taxEl.textContent = `Rs. ${tax}`;
    }

    // Get current order type
    const orderType = this.getCurrentOrderType();

    // Create or update the dynamic fee/discount row
    this.createOrUpdateDynamicRow(orderType);

    // Calculate grand total based on order type
    let grandTotal;
    if (orderType === 'pickup') {
        // For pickup: subtotal + tax (no delivery fee, no discount)
        grandTotal = this.cartTotal + tax;
    } else {
        // For delivery: subtotal + tax + delivery fee
        grandTotal = this.cartTotal + tax + this.deliveryFee;
    }

    if (grandTotalEl) {
        grandTotalEl.textContent = `Rs. ${grandTotal}`;
    }

    // Enable/disable checkout button
    if (checkoutBtn) {
        if (this.cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
        }
    }

    // Update delivery info message
    this.updateDeliveryInfoMessage(orderType);
}

    /**
 * Create or update the dynamic row (delivery fee or pickup discount)
 */
/**
 * Create or update the dynamic row (delivery fee or pickup discount)
 */
createOrUpdateDynamicRow(orderType) {
    const summarySection = document.querySelector('.cravely-cart-summary-section');
    if (!summarySection) return;

    // Find the tax row and total row
    const taxRow = summarySection.querySelector('.cravely-summary-row:nth-child(2)');
    const totalRow = summarySection.querySelector('.cravely-total-row');

    // Check if dynamic row already exists
    let dynamicRow = summarySection.querySelector('.cravely-dynamic-row');

    if (!dynamicRow) {
        // Create new dynamic row
        dynamicRow = document.createElement('div');
        dynamicRow.className = 'cravely-summary-row cravely-dynamic-row';

        // Insert between tax row and total row
        if (taxRow && totalRow) {
            taxRow.insertAdjacentElement('afterend', dynamicRow);
        }
    }

    // Update the dynamic row content based on order type
    if (orderType === 'pickup') {
        // No delivery fee for pickup
        dynamicRow.style.display = 'none';
    } else {
        // Show delivery fee for delivery
        dynamicRow.innerHTML = `
            <span class="cravely-summary-label">Delivery Fee</span>
            <span class="cravely-summary-value">Rs. ${this.deliveryFee}</span>
        `;
        dynamicRow.style.display = 'flex';
        dynamicRow.style.opacity = '0';
        setTimeout(() => {
            dynamicRow.style.transition = 'opacity 0.3s ease';
            dynamicRow.style.opacity = '1';
        }, 50);
    }
}

    /**
 * Update delivery info message based on time and order type
 */
    updateDeliveryInfoMessage(orderType) {
    const deliveryInfo = document.getElementById('cravely-delivery-info');
    if (!deliveryInfo) return;

    const hour = new Date().getHours();
    let message = '';
    let bgColor = '#fef3cd'; // Default yellow for closed
    let isOpen = true; // Assume open for now - you can add your business hours logic

    if (orderType === 'pickup') {
        // Pickup messages
        if (hour >= 0 && hour < 6) {
            message = '🌙 Night owl? Place your pickup order now. It\'ll be hot, ready, and waiting for you—no delays.';
        } else if (hour >= 6 && hour < 11) {
            message = '☀️ Grab & Go! Order now for a lightning-fast pickup. Your perfect breakfast is waiting, no wait-time guaranteed.';
        } else if (hour >= 11 && hour < 16) {
            message = '⏱️ Your lunch break is precious! Skip the queue. Order online and your food will be ready the moment you arrive.';
        } else {
            message = '🚀 Dinner on your terms! Order ahead and walk straight out with your food. Perfect for a hassle-free night in.';
        }
    } else {
        // Delivery messages
        if (hour >= 0 && hour < 6) {
            message = '🌙 Midnight cravings? We\'ve got you. Your favorite dishes are just a few clicks away. Proceed to checkout for a cozy delivery.';
        } else if (hour >= 6 && hour < 11) {
            message = '☀️ Good Morning! Start your day right. A delicious breakfast will be at your door before you finish your first coffee. Place your order!';
        } else if (hour >= 11 && hour < 16) {
            message = '🍳 Lunchtime escape! Skip the line and avoid the crowd. Get your fresh, hot lunch delivered to your desk or doorstep.';
        } else {
            message = '🌟 Dinner is served! (Well, almost). Let our chefs handle tonight\'s meal while you relax. Finalize your order for a swift delivery.';
        }
    }

    // Check if restaurant is open (example: 9 AM to 11 PM)
    if (hour < 9 || hour >= 23) {
        isOpen = false;
        bgColor = '#fef3cd'; // Yellow for closed
        message = 'Sorry, we are closed right now but pre-orders can be placed. ' + message;
    } else {
        bgColor = '#d1fae5'; // Light green for open
    }

    deliveryInfo.style.backgroundColor = bgColor;
    deliveryInfo.style.borderRadius = '8px';
    deliveryInfo.style.padding = '16px 20px';
    deliveryInfo.innerHTML = `<p class="cravely-delivery-text" style="color: #374151; font-size: 13px; line-height: 1.5;">${message}</p>`;
}

    /**
     * FIXED: Show cart popup only (without success notification)
     */
    showCartPopupOnly() {
        const popup = document.getElementById('cravely-cart-view-popup');
    if (!popup) return;

    // Don't show cart popup on checkout page
    if (window.location.pathname.includes('/checkout')) {
        return;
    }

        // Skip if already visible or showing
    if (this.cartPopupState === 'visible' || this.cartPopupState === 'showing') {
        return;
    }

        this.cartPopupState = 'showing';

        // Reset classes
        popup.classList.remove('cravely-cart-show', 'cravely-cart-hide', 'cravely-cart-hidden');

        // Show popup
        setTimeout(() => {
            popup.classList.add('cravely-cart-show');
            this.cartPopupState = 'visible';
        }, 10);
    }

    /**
     * FIXED: Show success notification with proper timer - single call, no conflicts
     */
    showSuccessNotificationWithTimer() {
        const popup = document.getElementById('cravely-cart-view-popup');
        const successNotification = popup?.querySelector('.cravely-success-notification');

        if (!popup || !successNotification) return;

        // Don't show success notification on checkout page
    if (window.location.pathname.includes('/checkout')) {
        return;
    }

        // Clear any existing timer to prevent conflicts
        if (this.successNotificationTimer) {
            clearTimeout(this.successNotificationTimer);
            this.successNotificationTimer = null;
        }

        // Reset popup state
        this.cartPopupState = 'showing';

        // Reset all classes and ensure fresh start
        popup.classList.remove('cravely-cart-show', 'cravely-cart-hide', 'cravely-cart-hidden');

        // Ensure success notification is visible
        successNotification.style.display = 'flex';
        successNotification.style.opacity = '1';
        successNotification.style.transform = 'scale(1)';
        successNotification.style.transition = 'all 0.3s ease';

        // Show the popup with a small delay to ensure smooth animation
        setTimeout(() => {
            popup.classList.add('cravely-cart-show');
            this.cartPopupState = 'visible';
        }, 50);

        // Set timer to hide success notification after specified time
        this.successNotificationTimer = setTimeout(() => {
            this.hideSuccessNotificationOnly();
        }, this.popupDisplayTime);

        console.log('✅ Success notification shown with timer set for', this.popupDisplayTime, 'ms');
    }

    /**
     * FIXED: Hide only success notification smoothly, keep cart popup if cart has items
     */
    hideSuccessNotificationOnly() {
        const popup = document.getElementById('cravely-cart-view-popup');
        const successNotification = popup?.querySelector('.cravely-success-notification');

        if (!successNotification) return;

        // Clear timer
        if (this.successNotificationTimer) {
            clearTimeout(this.successNotificationTimer);
            this.successNotificationTimer = null;
        }

        // Hide success notification with smooth animation
        successNotification.style.opacity = '0';
        successNotification.style.transform = 'scale(0.9)';
        successNotification.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            successNotification.style.display = 'none';
        }, 300);

        console.log('✅ Success notification hidden smoothly');
    }

    /**
     * Hide cart popup only if cart is empty
     */
    hideCartPopup() {
        const popup = document.getElementById('cravely-cart-view-popup');
        if (!popup || this.cart.length > 0) return;

        this.cartPopupState = 'hiding';

        popup.classList.remove('cravely-cart-show');
        popup.classList.add('cravely-cart-hide');

        setTimeout(() => {
            popup.classList.add('cravely-cart-hidden');
            popup.classList.remove('cravely-cart-hide');
            this.cartPopupState = 'hidden';
        }, 300);
    }

    /**
     * Show cart sidebar
     */
    showCartSidebar() {
        this.hideCartPopup();

        const overlay = document.getElementById('cravely-cart-sidebar-overlay');
        if (!overlay) return;

        this.isCartOpen = true;
        this.updateCartSidebarContent();
        this.updatePopularItems();
        this.updateCartSummary();

        // Add class to body to prevent scrolling - with namespace
        document.body.classList.add('cravely-cart-modal-open');

        overlay.classList.remove('cravely-cart-hidden');
        setTimeout(() => {
            overlay.classList.add('cravely-cart-show');
        }, 10);
    }

    /**
     * Hide cart sidebar
     */
    hideCartSidebar() {
        const overlay = document.getElementById('cravely-cart-sidebar-overlay');
        if (!overlay) return;

        this.isCartOpen = false;

        // Remove class from body to restore scrolling
        document.body.classList.remove('cravely-cart-modal-open');

        overlay.classList.remove('cravely-cart-show');
        setTimeout(() => {
            overlay.classList.add('cravely-cart-hidden');
        }, 300);
    }

    /**
 * Update cart popup display - FIXED pricing calculation
 */
updateCartPopupDisplay() {
    const cartCountBadge = document.querySelector('.cravely-cart-count-badge');
    const cartTotalPrice = document.querySelector('.cravely-cart-total-price');

    if (cartCountBadge) {
        cartCountBadge.textContent = this.cartCount;
    }

    if (cartTotalPrice) {
        // FIX: Use the same calculation as the sidebar
        const tax = Math.round(this.cartTotal * this.taxRate);
        const orderType = this.getCurrentOrderType();

       let grandTotal;
        if (orderType === 'pickup') {
            // No discount for pickup
            grandTotal = this.cartTotal + tax;
        } else {
            grandTotal = this.cartTotal + tax + this.deliveryFee;
        }

        cartTotalPrice.textContent = `Rs. ${grandTotal}`;
    }
}

    /**
     * Update cart sidebar content
     */
    updateCartSidebarContent() {
        const container = document.getElementById('cravely-cart-items-container');

        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cravely-empty-cart-state">
                    <div class="cravely-empty-cart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="m1 1 4 4 2.4 12h11.6"></path>
                        </svg>
                    </div>
                    <p class="cravely-empty-cart-message">Your cart is empty</p>
                    <p class="cravely-empty-cart-subtitle">Add some delicious items to get started</p>
                </div>
            `;
            return;
        }

        // Show cart items with special instructions
        container.innerHTML = this.cart.map(item => `
            <div class="cravely-cart-item" data-product-id="${item.id}">
                <div class="cravely-cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy"/>
                </div>
                <div class="cravely-cart-item-details">
                    <h4 class="cravely-cart-item-name">${item.name}</h4>
                    <span class="cravely-cart-item-price">Rs. ${item.price}</span>
                    ${item.specialInstructions ? `
                        <div class="cravely-cart-item-instructions">
                            <span class="cravely-instructions-label">Special Instructions:</span>
                            <p class="cravely-instructions-text">${item.specialInstructions}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="cravely-cart-item-controls">
                    <button class="cravely-delete-item-btn">
                        <svg class="cravely-delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                    <div class="cravely-quantity-controls">
                        <button class="cravely-quantity-minus-btn">-</button>
                        <span class="cravely-quantity-number">${item.quantity}</span>
                        <button class="cravely-quantity-plus-btn">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
 * Handle checkout button click - FIXED to redirect to checkout
 */
handleCheckout() {
    if (this.cart.length === 0) {
        return;
    }

    console.log('🚀 Proceeding to checkout with cart:', this.cart);

    // Use the cart-checkout integration if available
    if (window.cartCheckoutIntegration) {
        window.cartCheckoutIntegration.handleCheckout();
        return;
    }

    // Fallback: Use the enhanced checkout handler
    const orderType = this.getCurrentOrderType();
    const checkoutUrl = this.buildCheckoutUrl(orderType);

    console.log('🔗 Redirecting to checkout:', checkoutUrl);
    window.location.href = checkoutUrl;
}

/**
 * Get current order type (for fallback)
 */
getCurrentOrderType() {
    try {
        const storedOrder = sessionStorage.getItem('orderMethodSelected');
        if (storedOrder) {
            const orderData = JSON.parse(storedOrder);
            return orderData.type || 'delivery';
        }
    } catch (e) {
        console.warn('Failed to parse stored order data:', e);
    }
    return 'delivery';
}

/**
 * Build checkout URL (for fallback)
 */
buildCheckoutUrl(orderType) {
    const baseUrl = '/checkout';
    const url = new URL(baseUrl, window.location.origin);

    if (orderType) {
        url.searchParams.set('order_type', orderType);
    }

    return url.toString();
}

    /**
     * Show checkout success (placeholder for actual checkout integration)
     */
    showCheckoutSuccess() {
        // This is where you'd integrate with your actual checkout system
        alert('Checkout functionality - integrate with your payment system here!');
    }

    /**
     * Handle cart item delete
     */
    handleCartItemDelete(event) {
        const cartItem = event.target.closest('.cravely-cart-item');
        if (!cartItem) return;

        const productId = cartItem.getAttribute('data-product-id');

        // Add animation
        cartItem.style.opacity = '0';
        cartItem.style.transform = 'translateX(-100%)';

        setTimeout(() => {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.updateCartTotals();
            this.updateCartSidebarContent();
            this.updateCartPopupDisplay();
            this.updateCartSummary();
            this.updatePopularItems(); // Refresh popular items

            // Reset product card to add to cart button
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                this.showAddToCartButton(productCard);
            }

            if (this.cart.length === 0) {
                this.hideCartPopup();
                this.saveCartToStorage();
            }
        }, 300);
    }

    /**
     * Handle cart item quantity increase
     */
    handleCartItemQuantityIncrease(event) {
        const cartItem = event.target.closest('.cravely-cart-item');
        if (!cartItem) return;

        const productId = cartItem.getAttribute('data-product-id');
        const cartProduct = this.cart.find(item => item.id === productId);

        if (cartProduct) {
            cartProduct.quantity += 1;
            this.updateCartTotals();
            this.updateCartSidebarContent();
            this.updateCartPopupDisplay();
            this.updateCartSummary();
            this.saveCartToStorage();

            // Update product card quantity display
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                this.updateQuantityDisplay(productCard, cartProduct.quantity);
            }
            this.saveCartToStorage();
        }
    }

    /**
     * Handle cart item quantity decrease
     */
    handleCartItemQuantityDecrease(event) {
        const cartItem = event.target.closest('.cravely-cart-item');
        if (!cartItem) return;

        const productId = cartItem.getAttribute('data-product-id');
        const cartProductIndex = this.cart.findIndex(item => item.id === productId);

        if (cartProductIndex !== -1) {
            const cartProduct = this.cart[cartProductIndex];

            if (cartProduct.quantity > 1) {
                cartProduct.quantity -= 1;
                this.updateCartTotals();
                this.updateCartSidebarContent();
                this.updateCartPopupDisplay();
                this.updateCartSummary();
                this.saveCartToStorage();

                // Update product card quantity display
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    this.updateQuantityDisplay(productCard, cartProduct.quantity);
                }
                this.saveCartToStorage();
            } else {
                // Remove item from cart
                this.cart.splice(cartProductIndex, 1);
                this.updateCartTotals();
                this.updateCartSidebarContent();
                this.updateCartPopupDisplay();
                this.updateCartSummary();
                this.saveCartToStorage();
                this.updatePopularItems(); // Refresh popular items

                // Reset product card to add to cart button
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    this.showAddToCartButton(productCard);
                }

                if (this.cart.length === 0) {
                    this.hideCartPopup();
                }
                this.saveCartToStorage();
            }
        }
    }

    /**
     * Utility methods
     */
    showQuantityControls(productCard, quantity = 1) {
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        const quantityBar = productCard.querySelector('.quantity-controls-bar');
        const quantityDisplay = productCard.querySelector('.quantity-display');

        if (addToCartBtn && quantityBar && quantityDisplay) {
            addToCartBtn.classList.add('hidden');
            quantityBar.classList.remove('hidden');
            quantityBar.classList.add('show');
            quantityDisplay.textContent = quantity;
        }
    }

    showAddToCartButton(productCard) {
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        const quantityBar = productCard.querySelector('.quantity-controls-bar');

        if (addToCartBtn && quantityBar) {
            quantityBar.classList.remove('show');
            quantityBar.classList.add('hide');

            setTimeout(() => {
                quantityBar.classList.add('hidden');
                quantityBar.classList.remove('hide');
                addToCartBtn.classList.remove('hidden');
            }, 300);
        }
    }

    updateQuantityDisplay(productCard, quantity) {
        const quantityDisplay = productCard.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = quantity;
        }
    }

    setButtonLoadingState(button, loading) {
        const addText = button.querySelector('.add-text');
        const spinner = button.querySelector('.loading-spinner');

        if (loading) {
            button.disabled = true;
            if (addText) addText.style.opacity = '0';
            if (spinner) spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            if (addText) addText.style.opacity = '1';
            if (spinner) spinner.classList.add('hidden');
        }
    }

    getProductDataFromCard(productCard) {
        const priceText = productCard.getAttribute('data-price') ||
                         productCard.querySelector('.discounted-price')?.textContent || '0';
        const originalPriceText = productCard.getAttribute('data-original-price') ||
                                productCard.querySelector('.original-price')?.textContent || '0';

        return {
            id: productCard.getAttribute('data-product-id'),
            name: productCard.getAttribute('data-name') ||
                  productCard.querySelector('.product-title')?.textContent?.trim() || 'Unknown Product',
            price: this.extractPrice(priceText),
            originalPrice: this.extractPrice(originalPriceText),
            image: productCard.getAttribute('data-image') ||
                  productCard.querySelector('.product-image-container img')?.src ||
                  '/website_customizations/static/src/images/product_1.jpg',
            description: productCard.querySelector('.product-description')?.textContent?.trim() ||
                        'Fresh and delicious food',
            category: productCard.getAttribute('data-category') || 'general',
            quantity: 1
        };
    }

    extractPrice(priceText) {
        if (!priceText) return 0;
        const matches = priceText.toString().replace(/[^\d]/g, '');
        return parseInt(matches) || 0;
    }

    /**
     * FIXED: Reset and show success notification - called from product popup
     */
    resetAndShowSuccessNotification() {
        // This method is called from the product popup
        // Use the same logic as showSuccessNotificationWithTimer
        this.showSuccessNotificationWithTimer();
    }

    /**
     * FIXED: Legacy method for compatibility
     */
    hideSuccessNotification() {
        // Use the new method for consistency
        this.hideSuccessNotificationOnly();
    }

    handleAddMoreItems() {
        this.hideCartSidebar();
        // Scroll to menu sections
        const menuSection = document.querySelector('.menu-section') ||
                           document.querySelector('#rice-box-section') ||
                           document.querySelector('.product-grid');

        if (menuSection) {
            menuSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
 * Clear entire cart
 */
clearCartCompletely() {
    this.cart = [];
    this.cartTotal = 0;
    this.cartCount = 0;
    this.clearCartStorage();
    this.updateCartPopupDisplay();
    this.updateCartSidebarContent();
    this.updateCartSummary();
    this.hideCartPopup();

    // Reset all product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        this.showAddToCartButton(card);
    });
}
}

// Initialize Cravely cart manager when DOM is ready - with namespace
document.addEventListener('DOMContentLoaded', function() {
    if (!window.cravelyCartManager) {
        window.cravelyCartManager = new CravelyCartManager();
    }
});

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
    if (window.cravelyCartManager && window.cravelyCartManager.successNotificationTimer) {
        clearTimeout(window.cravelyCartManager.successNotificationTimer);
    }
});

// Also handle case where DOM is already loaded
if (document.readyState !== 'loading' && !window.cravelyCartManager) {
    window.cravelyCartManager = new CravelyCartManager();
}