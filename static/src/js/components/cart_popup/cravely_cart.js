/**
 * ================================= ENHANCED CART MANAGER WITH CHECKOUT TRANSITION =================================
 * Enhanced cart functionality with beautiful checkout transition
 * File: /website_customizations/static/src/js/components/cart_popup/cravely_cart.js
 */

class CravelyCartManager {
    constructor() {
        // Cart state management
        this.cart = [];
        this.cartTotal = 0;
        this.cartCount = 0;
        this.isCartOpen = false;
        this.menuProducts = [];

        // Settings
        this.deliveryFee = 200;
        this.taxRate = 0.15;
        this.popupDisplayTime = 3000;

        // Namespace for all cart operations
        this.namespace = 'cravely-cart-';

        // Popular items state
        this.popularItems = [];
        this.scrollPosition = 0;

        // Timer management
        this.successNotificationTimer = null;
        this.cartPopupState = 'hidden';

        // Checkout transition state
        this.isCheckingOut = false;

        // Initialize the cart system
        this.init();
    }

    /**
     * Initialize the cart system - completely isolated from navbar
     */
    init() {
        console.log('🛒 Initializing Enhanced Cravely Cart Manager with Checkout Transition...');

        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    /**
     * Setup all cart functionality
     */
    setup() {
        this.loadMenuProducts();
        this.createCartElements();
        this.bindAllEvents();
        this.initializeQuantityControls();
        console.log('✅ Enhanced Cravely Cart Manager initialized successfully');
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

        console.log('🏗️ Creating Enhanced Cravely cart UI elements...');

        // Create cart popup with namespace-specific elements
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

        // Create cart sidebar with enhanced checkout functionality
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
                            <div class="cravely-summary-row">
                                <span class="cravely-summary-label">Delivery Fee</span>
                                <span class="cravely-summary-value">Rs. ${this.deliveryFee}</span>
                            </div>
                            <div class="cravely-summary-row cravely-total-row">
                                <span class="cravely-summary-label">Grand Total</span>
                                <span class="cravely-summary-value" id="cravely-grand-total-amount">Rs. ${this.deliveryFee}</span>
                            </div>
                        </div>

                        <div class="cravely-checkout-section" id="cravely-checkout-section">
                            <button class="cravely-checkout-btn" id="cravely-checkout-btn">
                                <div class="cravely-checkout-content">
                                    <div class="cravely-checkout-normal-state">
                                        <span class="cravely-checkout-text">Checkout</span>
                                        <svg class="cravely-checkout-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12,5 19,12 12,19"></polyline>
                                        </svg>
                                    </div>
                                    <div class="cravely-checkout-loading-state" style="display: none;">
                                        <div class="cravely-checkout-spinner">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                            </svg>
                                        </div>
                                        <span class="cravely-checkout-loading-text">Proceeding to checkout...</span>
                                    </div>
                                    <div class="cravely-checkout-success-state" style="display: none;">
                                        <div class="cravely-checkout-success-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M9 12l2 2 4-4"/>
                                                <circle cx="12" cy="12" r="9"/>
                                            </svg>
                                        </div>
                                        <span class="cravely-checkout-success-text">Redirecting...</span>
                                    </div>
                                </div>
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

        console.log('🎯 Enhanced Cravely cart event listeners bound successfully (navbar-safe)');
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

        // Enhanced checkout button with beautiful transition
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-checkout-btn')) {
                e.stopPropagation();
                this.handleEnhancedCheckout();
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
     * ENHANCED: Beautiful checkout transition with multiple states
     */
    async handleEnhancedCheckout() {
        if (this.cart.length === 0 || this.isCheckingOut) {
            return;
        }

        console.log('🚀 Starting enhanced checkout process...');

        this.isCheckingOut = true;
        const checkoutBtn = document.getElementById('cravely-checkout-btn');

        if (!checkoutBtn) {
            console.error('Checkout button not found');
            return;
        }

        try {
            // PHASE 1: Show loading state with animation
            await this.showCheckoutLoadingState(checkoutBtn);

            // PHASE 2: Prepare cart data for checkout
            const checkoutData = this.prepareCheckoutData();

            // PHASE 3: Store cart data for checkout page
            await this.storeCheckoutData(checkoutData);

            // PHASE 4: Show success state
            await this.showCheckoutSuccessState(checkoutBtn);

            // PHASE 5: Navigate to checkout page with smooth transition
            await this.navigateToCheckout();

        } catch (error) {
            console.error('Enhanced checkout error:', error);
            this.showCheckoutError(checkoutBtn);
        }
    }

    /**
     * Show loading state with beautiful animation
     */
    async showCheckoutLoadingState(checkoutBtn) {
        return new Promise((resolve) => {
            const normalState = checkoutBtn.querySelector('.cravely-checkout-normal-state');
            const loadingState = checkoutBtn.querySelector('.cravely-checkout-loading-state');

            // Disable button
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('loading');

            // Hide normal state
            normalState.style.opacity = '0';
            normalState.style.transform = 'scale(0.9)';

            setTimeout(() => {
                normalState.style.display = 'none';
                loadingState.style.display = 'flex';

                // Animate loading state in
                setTimeout(() => {
                    loadingState.style.opacity = '1';
                    loadingState.style.transform = 'scale(1)';

                    // Start spinner animation
                    const spinner = loadingState.querySelector('.cravely-checkout-spinner svg');
                    if (spinner) {
                        spinner.style.animation = 'spin 1s linear infinite';
                    }

                    // Resolve after loading animation completes
                    setTimeout(resolve, 1500); // 1.5 seconds loading
                }, 50);
            }, 300);
        });
    }

    /**
     * Prepare checkout data
     */
    prepareCheckoutData() {
        const tax = Math.round(this.cartTotal * this.taxRate);
        const grandTotal = this.cartTotal + tax + this.deliveryFee;

        return {
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                specialInstructions: item.specialInstructions || null
            })),
            subtotal: this.cartTotal,
            tax: tax,
            deliveryFee: this.deliveryFee,
            grandTotal: grandTotal,
            itemCount: this.cartCount,
            timestamp: Date.now()
        };
    }

    /**
     * Store checkout data for checkout page
     */
    async storeCheckoutData(checkoutData) {
        return new Promise((resolve) => {
            try {
                // Store in sessionStorage for checkout page
                sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));

                // Also send to server if needed
                if (window.location.origin) {
                    fetch('/checkout/update-cart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(checkoutData)
                    }).catch(error => {
                        console.log('Server update failed, using local storage only:', error);
                    });
                }

                setTimeout(resolve, 500); // Simulate processing time
            } catch (error) {
                console.error('Error storing checkout data:', error);
                resolve(); // Continue even if storage fails
            }
        });
    }

    /**
     * Show success state with beautiful animation
     */
    async showCheckoutSuccessState(checkoutBtn) {
        return new Promise((resolve) => {
            const loadingState = checkoutBtn.querySelector('.cravely-checkout-loading-state');
            const successState = checkoutBtn.querySelector('.cravely-checkout-success-state');

            // Hide loading state
            loadingState.style.opacity = '0';
            loadingState.style.transform = 'scale(0.9)';

            setTimeout(() => {
                loadingState.style.display = 'none';
                successState.style.display = 'flex';

                // Animate success state in
                setTimeout(() => {
                    successState.style.opacity = '1';
                    successState.style.transform = 'scale(1)';

                    // Success icon animation
                    const successIcon = successState.querySelector('.cravely-checkout-success-icon');
                    if (successIcon) {
                        successIcon.style.animation = 'successPulse 0.6s ease';
                    }

                    // Update button styling
                    checkoutBtn.classList.add('success');

                    setTimeout(resolve, 800); // Show success for 0.8 seconds
                }, 50);
            }, 300);
        });
    }

    /**
     * Navigate to checkout page with smooth transition
     */
    async navigateToCheckout() {
        return new Promise((resolve) => {
            // Add page transition class
            document.body.classList.add('page-transitioning');

            // Start sidebar fade out
            const sidebar = document.getElementById('cravely-cart-sidebar-overlay');
            if (sidebar) {
                sidebar.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
                sidebar.style.opacity = '0';
                sidebar.style.visibility = 'hidden';
            }

            // Navigate after transition
            setTimeout(() => {
                // Clear checkout state
                this.isCheckingOut = false;

                // Navigate to checkout page
                window.location.href = '/checkout';
                resolve();
            }, 600);
        });
    }

    /**
     * Show checkout error state
     */
    showCheckoutError(checkoutBtn) {
        const loadingState = checkoutBtn.querySelector('.cravely-checkout-loading-state');
        const normalState = checkoutBtn.querySelector('.cravely-checkout-normal-state');

        // Reset to normal state
        loadingState.style.display = 'none';
        normalState.style.display = 'flex';
        normalState.style.opacity = '1';
        normalState.style.transform = 'scale(1)';

        // Reset button
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('loading');
        this.isCheckingOut = false;

        // Show error message
        this.showNotification('Checkout failed. Please try again.', 'error');
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.cravely-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `cravely-notification ${type}`;

        const colors = {
            success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
            error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
            info: { bg: '#f0f9ff', border: '#7abfba', text: '#0c4a6e' }
        };

        const color = colors[type] || colors.info;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 16px 20px;
            border-radius: 12px;
            border-left: 4px solid ${color.border};
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-weight: 600;
            max-width: 350px;
            font-family: 'Montserrat', sans-serif;
            animation: slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 4000);
    }

    // [Rest of the methods remain the same as in the original cart manager...]
    // Including all the existing methods like:
    // - initializeQuantityControls()
    // - generatePopularItems()
    // - updatePopularItems()
    // - scrollPopularItems()
    // - handlePopularItemAdd()
    // - handleAddToCart()
    // - handleQuantityIncrease/Decrease()
    // - addToCart()
    // - updateCartTotals()
    // - updateCartSummary()
    // - showSuccessNotificationWithTimer()
    // - hideSuccessNotificationOnly()
    // - showCartSidebar()
    // - hideCartSidebar()
    // - updateCartPopupDisplay()
    // - updateCartSidebarContent()
    // - handleCartItemDelete()
    // - handleCartItemQuantity methods
    // - All utility methods
    // - handleAddMoreItems()

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
     * Generate popular items from menu products
     */
    generatePopularItems() {
        if (this.menuProducts.length === 0) {
            return [];
        }

        // Get products not in cart
        const availableProducts = this.menuProducts.filter(product =>
            !this.cart.some(cartItem => cartItem.id === product.id)
        );

        // If we have fewer available products than needed, include some cart items
        let popularProducts = [...availableProducts];

        if (popularProducts.length < 6) {
            const cartProductIds = this.cart.map(item => item.id);
            const cartProducts = this.menuProducts.filter(product =>
                cartProductIds.includes(product.id)
            );
            popularProducts = [...availableProducts, ...cartProducts];
        }

        // Shuffle and take random 6-8 items
        const shuffled = popularProducts.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(8, shuffled.length));
    }

    /**
     * Update popular items section
     */
    updatePopularItems() {
        const popularItemsGrid = document.getElementById('cravely-popular-items-grid');
        const popularItemsSection = document.getElementById('cravely-popular-items-section');

        if (!popularItemsGrid || !popularItemsSection) {
            return;
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
     * Handle popular item add to cart
     */
    handlePopularItemAdd(event) {
        const popularItem = event.target.closest('.cravely-popular-item');
        if (!popularItem) return;

        const productId = popularItem.getAttribute('data-product-id');
        const product = this.menuProducts.find(p => p.id === productId);

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

            // Add to cart
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
     * Handle add to cart button click with proper success notification timing
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

            // Show success notification with proper timing
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

        const grandTotal = this.cartTotal + tax + this.deliveryFee;
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
    }

    /**
     * Show cart popup only (without success notification)
     */
    showCartPopupOnly() {
        const popup = document.getElementById('cravely-cart-view-popup');
        if (!popup) return;

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
     * Show success notification with proper timer - single call, no conflicts
     */
    showSuccessNotificationWithTimer() {
        const popup = document.getElementById('cravely-cart-view-popup');
        const successNotification = popup?.querySelector('.cravely-success-notification');

        if (!popup || !successNotification) return;

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
     * Hide only success notification smoothly, keep cart popup if cart has items
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
     * Update cart popup display
     */
    updateCartPopupDisplay() {
        const cartCountBadge = document.querySelector('.cravely-cart-count-badge');
        const cartTotalPrice = document.querySelector('.cravely-cart-total-price');

        if (cartCountBadge) {
            cartCountBadge.textContent = this.cartCount;
        }

        if (cartTotalPrice) {
            const tax = Math.round(this.cartTotal * this.taxRate);
            const grandTotal = this.cartTotal + tax + this.deliveryFee;
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

            // Update product card quantity display
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                this.updateQuantityDisplay(productCard, cartProduct.quantity);
            }
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

                // Update product card quantity display
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    this.updateQuantityDisplay(productCard, cartProduct.quantity);
                }
            } else {
                // Remove item from cart
                this.cart.splice(cartProductIndex, 1);
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
                }
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
}

// Initialize Enhanced Cravely cart manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!window.cravelyCartManager) {
        window.cravelyCartManager = new CravelyCartManager();
    }
});

// Also handle case where DOM is already loaded
if (document.readyState !== 'loading' && !window.cravelyCartManager) {
    window.cravelyCartManager = new CravelyCartManager();
}