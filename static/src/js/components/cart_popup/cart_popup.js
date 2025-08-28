/**
 * ================================= ENHANCED CART SYSTEM =================================
 * Complete cart functionality with:
 * 1. Product card quantity controls (add/remove buttons)
 * 2. Dynamic cart popup and sidebar with real product data
 * 3. Popular items from actual menu sections
 * 4. Proper state management and UI synchronization
 * 5. Smooth animations and responsive design
 */

class CartManager {
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
        this.popupDisplayTime = 3500;

        // Initialize the cart system
        this.init();
    }

    /**
     * Initialize the cart system
     */
    init() {
        console.log('🛒 Initializing Cart Manager...');

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
        //this.injectCartStyles();
        this.bindAllEvents();
        this.initializeQuantityControls();
        console.log('✅ Cart Manager initialized successfully');
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
        if (document.getElementById('cart-view-popup') && document.getElementById('cart-sidebar-overlay')) {
            this.updatePopularItems();
            return;
        }

        console.log('🏗️ Creating cart UI elements...');

        // Create cart popup
        const popupHTML = `
            <div id="cart-view-popup" class="cart-view-popup hidden" style="display: none !important; pointer-events: none !important;">
                <div class="cart-popup-container">
                    <div class="success-notification">
                        <div class="success-icon">
                            <svg class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="9"/>
                            </svg>
                        </div>
                        <span class="success-text">Item added to cart</span>
                    </div>
                    <button id="view-cart-btn" class="view-cart-button">
                        <span class="cart-count-badge">0</span>
                        <span class="view-cart-text">View Cart</span>
                        <span class="cart-total-price">Rs. 0</span>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);

        // Create cart sidebar
        const sidebarHTML = `
            <div id="cart-sidebar-overlay" class="cart-sidebar-overlay hidden" style="display: none !important; pointer-events: none !important;">
                <div id="cart-sidebar" class="cart-sidebar">
                    <div class="cart-sidebar-header">
                        <h2 class="cart-title">Your Cart</h2>
                        <button id="close-cart-btn" class="close-cart-btn">
                            <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="cart-scrollable-content" id="cart-scrollable-content">
                        <div class="cart-items-section" id="cart-items-container">
                            <div class="empty-cart-state">
                                <div class="empty-cart-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="m1 1 4 4 2.4 12h11.6"></path>
                                    </svg>
                                </div>
                                <p class="empty-cart-message">Your cart is empty</p>
                                <p class="empty-cart-subtitle">Add some delicious items to get started</p>
                            </div>
                        </div>

                        <div class="add-more-items-section" id="add-more-section">
                            <button class="add-more-items-btn" id="add-more-items-btn">
                                <span class="add-icon">+</span>
                                Add more items
                            </button>
                        </div>

                        <div class="popular-items-section" id="popular-items-section">
                            <h3 class="popular-items-title">Popular with your order</h3>
                            <p class="popular-items-subtitle">Customers often buy these together</p>
                            <div class="popular-items-grid" id="popular-items-grid"></div>
                        </div>

                        <div class="cart-summary-section" id="cart-summary" style="display: none;">
                            <div class="summary-row">
                                <span class="summary-label">Subtotal</span>
                                <span class="summary-value" id="subtotal-amount">Rs. 0</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Tax (15%)</span>
                                <span class="summary-value" id="tax-amount">Rs. 0</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Delivery Fee</span>
                                <span class="summary-value">Rs. ${this.deliveryFee}</span>
                            </div>
                            <div class="summary-row total-row">
                                <span class="summary-label">Grand Total</span>
                                <span class="summary-value" id="grand-total-amount">Rs. ${this.deliveryFee}</span>
                            </div>
                        </div>

                        <div class="checkout-section" id="checkout-section" style="display: none;">
                            <button class="checkout-btn" id="checkout-btn">
                                <span class="checkout-text">Proceed to Checkout</span>
                                <svg class="checkout-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12,5 19,12 12,19"></polyline>
                                </svg>
                            </button>
                        </div>

                        <div class="delivery-info" id="delivery-info" style="display: none;">
                            <p class="delivery-text">Sorry, we are closed right now but pre-orders can be placed.</p>
                            <p class="delivery-text">Your order will be delivered approximately on <span class="delivery-date">August 28, 2025</span> at <span class="delivery-time">1:30 PM</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);

        this.updatePopularItems();
    }

    /**
     * Bind all event listeners
     */
    bindAllEvents() {
        // Product card events
        this.bindProductCardEvents();

        // Cart popup events
        this.bindCartPopupEvents();

        // Cart sidebar events
        this.bindCartSidebarEvents();

        // Popular items events
        this.bindPopularItemsEvents();

        // Keyboard events
        this.bindKeyboardEvents();

        console.log('🎯 All event listeners bound successfully');
    }

    /**
     * Bind product card related events
     */
    bindProductCardEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                this.handleAddToCart(e);
            }
        });

        // Quantity increase buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-increase-btn') || e.target.closest('.quantity-increase-btn')) {
                this.handleQuantityIncrease(e);
            }
        });

        // Quantity decrease buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-decrease-btn') || e.target.closest('.quantity-decrease-btn')) {
                this.handleQuantityDecrease(e);
            }
        });
    }

    /**
     * Bind cart popup events
     */
    bindCartPopupEvents() {
        // View cart button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#view-cart-btn')) {
                this.showCartSidebar();
            }
        });
    }

    /**
     * Bind cart sidebar events
     */
    bindCartSidebarEvents() {
        // Close cart sidebar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#close-cart-btn')) {
                this.hideCartSidebar();
            }
        });

        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cart-sidebar-overlay') {
                this.hideCartSidebar();
            }
        });

        // Cart item controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item-btn') || e.target.closest('.delete-item-btn')) {
                this.handleCartItemDelete(e);
            }
            if (e.target.classList.contains('quantity-plus-btn') || e.target.closest('.quantity-plus-btn')) {
                this.handleCartItemQuantityIncrease(e);
            }
            if (e.target.classList.contains('quantity-minus-btn') || e.target.closest('.quantity-minus-btn')) {
                this.handleCartItemQuantityDecrease(e);
            }
        });

        // Add more items button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#add-more-items-btn')) {
                this.handleAddMoreItems();
            }
        });

        // Checkout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#checkout-btn')) {
                this.handleCheckout();
            }
        });
    }

    /**
     * Bind popular items events
     */
    bindPopularItemsEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popular-add-btn') || e.target.closest('.popular-add-btn')) {
                this.handlePopularItemAdd(e);
            }
        });
    }

    /**
     * Bind keyboard events
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
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
     * Handle add to cart button click
     */
    handleAddToCart(event) {
        event.preventDefault();
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
            this.showCartPopup();
            this.setButtonLoadingState(button, false);
        }, 300);
    }

    /**
     * Handle quantity increase from product card
     */
    handleQuantityIncrease(event) {
        event.preventDefault();
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
            this.showCartPopup();
        }
    }

    /**
     * Handle quantity decrease from product card
     */
    handleQuantityDecrease(event) {
        event.preventDefault();
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
            } else {
                // Remove item from cart and show add to cart button
                this.cart.splice(cartItemIndex, 1);
                this.updateCartTotals();
                this.showAddToCartButton(productCard);
                this.updateCartPopupDisplay();
                this.updateCartSidebarContent();
                this.updatePopularItems();

                if (this.cart.length === 0) {
                    this.hideCartPopup();
                }
            }
        }
    }

    /**
     * Handle cart item deletion from sidebar
     */
    handleCartItemDelete(event) {
        const cartItem = event.target.closest('.cart-item');
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
            this.updatePopularItems();

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
     * Handle cart item quantity increase from sidebar
     */
    handleCartItemQuantityIncrease(event) {
        const cartItem = event.target.closest('.cart-item');
        if (!cartItem) return;

        const productId = cartItem.getAttribute('data-product-id');
        const cartProduct = this.cart.find(item => item.id === productId);

        if (cartProduct) {
            cartProduct.quantity += 1;
            this.updateCartTotals();
            this.updateCartSidebarContent();
            this.updateCartPopupDisplay();

            // Update product card quantity display
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                this.updateQuantityDisplay(productCard, cartProduct.quantity);
            }
        }
    }

    /**
     * Handle cart item quantity decrease from sidebar
     */
    handleCartItemQuantityDecrease(event) {
        const cartItem = event.target.closest('.cart-item');
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
                this.updatePopularItems();

                // Reset product card to add to cart button
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    this.showAddToCartButton(productCard);
                }

                if (this.cart.length === 0) {
                    // Don't hide view cart here, let it stay
                }
            }
        }
    }

    /**
     * Handle popular item add
     */
    handlePopularItemAdd(event) {
        const popularItem = event.target.closest('.popular-item');
        if (!popularItem) return;

        const productId = popularItem.getAttribute('data-product-id');
        let productData = this.menuProducts.find(p => p.id === productId);

        if (!productData) {
            // Fallback data from DOM
            productData = {
                id: productId,
                name: popularItem.querySelector('.popular-item-name').textContent.trim(),
                price: parseInt(popularItem.getAttribute('data-price')),
                image: popularItem.querySelector('img').src,
                quantity: 1,
                category: 'popular'
            };
        } else {
            productData = { ...productData, quantity: 1 };
        }

        const button = popularItem.querySelector('.popular-add-btn');
        const originalText = button.textContent;

        // Visual feedback
        button.textContent = '✓';
        button.style.background = '#10b981';

        this.addToCart(productData);
        this.updateCartSidebarContent();

        // Update corresponding product card if it exists
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            const cartItem = this.cart.find(item => item.id === productId);
            this.showQuantityControls(productCard, cartItem.quantity);
        }

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1000);
    }

    /**
 * Handle add more items button - scroll to first category
 */
handleAddMoreItems() {
    this.hideCartSidebar();

    // Show cart popup again since we're adding more items
    if (this.cart.length > 0) {
        this.showCartPopup();
    }

    // Smooth scroll to first menu section
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
 * Get product data from card element with proper class handling
 */
getProductDataFromCard(productCard) {
    // Extract price from text content
    const priceText = productCard.getAttribute('data-price') ||
                     productCard.querySelector('.discounted-price')?.textContent || '0';

    // Extract original price from text content
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

    /**
     * Handle checkout process
     */
    handleCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty! Please add items before checkout.', 'error');
            return;
        }

        const checkoutData = {
            items: this.cart,
            subtotal: this.cartTotal,
            tax: Math.round(this.cartTotal * this.taxRate),
            deliveryFee: this.deliveryFee,
            grandTotal: this.cartTotal + Math.round(this.cartTotal * this.taxRate) + this.deliveryFee,
            timestamp: new Date().toISOString(),
            orderDate: new Date().toLocaleDateString(),
            orderTime: new Date().toLocaleTimeString()
        };

        // Store in sessionStorage for checkout page
        sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));

        // Show loading state
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <span>Redirecting to Checkout...</span>
            `;
            checkoutBtn.disabled = true;
        }

        // Redirect after delay
        setTimeout(() => {
            // For now, just show success message since checkout page isn't implemented yet
            this.showNotification('Checkout functionality will be available soon! Cart data has been saved.', 'success');

            // Reset checkout button
            if (checkoutBtn) {
                checkoutBtn.innerHTML = `
                    <span class="checkout-text">Proceed to Checkout</span>
                    <svg class="checkout-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                `;
                checkoutBtn.disabled = false;
            }
        }, 1500);
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
        this.updatePopularItems();

        console.log('🛒 Product added to cart:', productData);
    }

    /**
     * Update cart totals and count
     */
    updateCartTotals() {
        this.cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.cartTotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Show cart popup with animation
     */
    showCartPopup() {
    const popup = document.getElementById('cart-view-popup');
    if (!popup) return;

    // Reset classes
    popup.classList.remove('show', 'hide', 'hidden');

    // Show popup
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    // Only auto-hide the success notification, keep view cart button visible
    setTimeout(() => {
        this.hideSuccessNotification();
    }, this.popupDisplayTime);
}

    /**
     * Hide cart popup
     */
    /**
 * Hide cart popup only if cart is empty
 */
hideCartPopup() {
    const popup = document.getElementById('cart-view-popup');
    if (!popup || popup.classList.contains('hidden') || this.cart.length > 0) return;

    popup.classList.remove('show');
    popup.classList.add('hide');

    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('hide');
    }, 300);
}

// In showCartSidebar method:
showCartSidebar() {
    this.hideCartPopup();
    this.ensureNavbarVisibility();

    const overlay = document.getElementById('cart-sidebar-overlay');
    if (!overlay) return;

    this.isCartOpen = true;
    this.updateCartSidebarContent();

    // Add class to body to prevent scrolling
    document.body.classList.add('cart-open');

    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// In hideCartSidebar method:
hideCartSidebar() {
    const overlay = document.getElementById('cart-sidebar-overlay');
    if (!overlay) return;

    this.isCartOpen = false;

    // Remove class from body to restore scrolling
    document.body.classList.remove('cart-open');

    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

    /**
     * Update cart popup display
     */
    updateCartPopupDisplay() {
        const cartCountBadge = document.querySelector('.cart-count-badge');
        const cartTotalPrice = document.querySelector('.cart-total-price');

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
 * Update cart sidebar content with proper section ordering
 */
updateCartSidebarContent() {
    const container = document.getElementById('cart-items-container');
    const summarySection = document.getElementById('cart-summary');
    const checkoutSection = document.getElementById('checkout-section');
    const deliveryInfo = document.getElementById('delivery-info');
    const addMoreSection = document.getElementById('add-more-section');
    const popularSection = document.getElementById('popular-items-section');

    if (!container) return;

    if (this.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <div class="empty-cart-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4 2.4 12h11.6"></path>
                    </svg>
                </div>
                <p class="empty-cart-message">Your cart is empty</p>
                <p class="empty-cart-subtitle">Add some delicious items to get started</p>
            </div>
        `;

        // Hide sections when cart is empty
        if (summarySection) summarySection.style.display = 'none';
        if (checkoutSection) checkoutSection.style.display = 'none';
        if (deliveryInfo) deliveryInfo.style.display = 'none';
        if (addMoreSection) addMoreSection.style.display = 'block';
        if (popularSection) popularSection.style.display = 'none';

        return;
    }

    // Show cart items
    container.innerHTML = this.cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy"/>
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <span class="cart-item-price">Rs. ${item.price}</span>
            </div>
            <div class="cart-item-controls">
                <button class="delete-item-btn">
                    <svg class="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                </button>
                <div class="quantity-controls">
                    <button class="quantity-minus-btn">-</button>
                    <span class="quantity-number">${item.quantity}</span>
                    <button class="quantity-plus-btn">+</button>
                </div>
            </div>
        </div>
    `).join('');

    // Show and update summary sections
    this.updateCartSummary();
    if (summarySection) summarySection.style.display = 'block';
    if (checkoutSection) checkoutSection.style.display = 'block';
    if (deliveryInfo) deliveryInfo.style.display = 'block';
    if (addMoreSection) addMoreSection.style.display = 'block'; // Show add more section
    if (popularSection) popularSection.style.display = 'block'; // Show popular section

    // Reorder sections - add more items before popular items
    if (addMoreSection && popularSection) {
        popularSection.parentNode.insertBefore(addMoreSection, popularSection);
    }
}


/**
 * Inject CSS styles into the document
 */

 // Add this method to your CartManager class
ensureNavbarVisibility() {
    // Force navbar to top layer when cart is open
    const navbar = document.querySelector('.custom-navbar, #main-navbar');
    if (navbar) {
        navbar.style.zIndex = '1070';
    }
}


    /**
     * Update cart summary
     */
    updateCartSummary() {
        const subtotalEl = document.getElementById('subtotal-amount');
        const taxEl = document.getElementById('tax-amount');
        const grandTotalEl = document.getElementById('grand-total-amount');

        const tax = Math.round(this.cartTotal * this.taxRate);
        const grandTotal = this.cartTotal + tax + this.deliveryFee;

        if (subtotalEl) subtotalEl.textContent = `Rs. ${this.cartTotal}`;
        if (taxEl) taxEl.textContent = `Rs. ${tax}`;
        if (grandTotalEl) grandTotalEl.textContent = `Rs. ${grandTotal}`;
    }

    /**
     * Update popular items section
     */
    updatePopularItems() {
        const popularItemsGrid = document.getElementById('popular-items-grid');
        if (!popularItemsGrid) return;

        // Get available products (not in cart)
        const availableProducts = this.menuProducts.filter(product =>
            !this.cart.some(cartItem => cartItem.id === product.id)
        );

        const randomProducts = this.getRandomProducts(availableProducts, 4);

        popularItemsGrid.innerHTML = randomProducts.map(product => `
            <div class="popular-item" data-product-id="${product.id}" data-price="${product.price}">
                <div class="popular-item-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy"/>
                </div>
                <div class="popular-item-details">
                    <span class="popular-item-price">Rs. ${product.price}</span>
                    <p class="popular-item-name">${product.name}</p>
                </div>
                <button class="popular-add-btn">+</button>
            </div>
        `).join('');
    }

    /**
     * Show quantity controls for a product card
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

    /**
     * Show add to cart button for a product card
     */
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

    /**
     * Update quantity display for a product card
     */
    updateQuantityDisplay(productCard, quantity) {
        const quantityDisplay = productCard.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = quantity;
        }
    }

    /**
     * Set button loading state
     */
    setButtonLoadingState(button, loading) {
        const addText = button.querySelector('.add-text');
        const spinner = button.querySelector('.loading-spinner');

        if (loading) {
            button.disabled = true;
            addText.style.opacity = '0';
            if (spinner) spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            addText.style.opacity = '1';
            if (spinner) spinner.classList.add('hidden');
        }
    }

    /**
     * Get product data from card element
     */
    getProductDataFromCard(productCard) {
        return {
            id: productCard.getAttribute('data-product-id'),
            name: productCard.getAttribute('data-name') || productCard.querySelector('.product-title')?.textContent?.trim() || 'Unknown Product',
            price: this.extractPrice(productCard.getAttribute('data-price') || productCard.querySelector('.discounted-price')?.textContent || '0'),
            originalPrice: this.extractPrice(productCard.getAttribute('data-original-price') || productCard.querySelector('.original-price')?.textContent || '0'),
            image: productCard.getAttribute('data-image') || productCard.querySelector('.product-image-container img')?.src || '/website_customizations/static/src/images/product_1.jpg',
            description: productCard.querySelector('.product-description')?.textContent?.trim() || 'Fresh and delicious food',
            category: productCard.getAttribute('data-category') || 'general',
            quantity: 1
        };
    }

    /**
     * Get random products from array
     */
    getRandomProducts(products, count) {
        if (products.length === 0) {
            return [
                { id: 'fallback-1', name: 'Chicken Biryani Box', price: 950, image: '/website_customizations/static/src/images/product_1.jpg' },
                { id: 'fallback-2', name: 'Turkish Kebab Platter', price: 1599, image: '/website_customizations/static/src/images/product_1.jpg' },
                { id: 'fallback-3', name: 'Premium Kebsa Box', price: 1850, image: '/website_customizations/static/src/images/product_1.jpg' },
                { id: 'fallback-4', name: 'Executive Lunch Box', price: 1450, image: '/website_customizations/static/src/images/product_1.jpg' }
            ].slice(0, count);
        }

        return products.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, products.length));
    }

    /**
     * Extract numeric price from text
     */
    extractPrice(priceText) {
        if (!priceText) return 0;
        const matches = priceText.toString().replace(/[^\d]/g, '');
        return parseInt(matches) || 0;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
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

        // Add animation styles
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInNotification {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 4000);
    }

    /**
 * Hide only the success notification, keep view cart button
 */
hideSuccessNotification() {
    const popup = document.getElementById('cart-view-popup');
    const successNotification = popup?.querySelector('.success-notification');

    if (successNotification) {
        successNotification.style.opacity = '0';
        successNotification.style.transform = 'scale(0.8)';
        successNotification.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            successNotification.style.display = 'none';
        }, 300);
    }
}

    /**
     * Public API methods
     */
    getCart() {
        return {
            items: this.cart,
            count: this.cartCount,
            total: this.cartTotal,
            grandTotal: this.cartTotal + Math.round(this.cartTotal * this.taxRate) + this.deliveryFee
        };
    }

    clearCart() {
        this.cart = [];
        this.updateCartTotals();
        this.updateCartSidebarContent();
        this.updateCartPopupDisplay();
        this.updatePopularItems();
        this.hideCartPopup();

        // Reset all product cards to add to cart buttons
        document.querySelectorAll('.product-card').forEach(card => {
            this.showAddToCartButton(card);
        });
    }

}

// Initialize cart manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!window.cartManager) {
        window.cartManager = new CartManager();
    }
});

// Also handle case where DOM is already loaded
if (document.readyState !== 'loading' && !window.cartManager) {
    window.cartManager = new CartManager();
}














/**
 * FIXED MENU POPUP - Below Navbar Positioning & No Blinking
 * File: /website_customizations/static/src/js/components/navbar/menu_popup.js
 */
(function () {
    'use strict';

    // ================================= STATE & CONFIGURATION =================================
    let menuPopupInitialized = false;
    let hoverTimeout = null;
    let hideTimeout = null;
    let isMouseOverPopup = false;
    let isMouseOverTrigger = false;
    let resizeTimeout = null;
    let popupReady = false;
    let isScrolling = false;
    let scrollTimeout = null;
    let navbarHeight = 0;

    // Constants
    const NAVBAR_SELECTOR = 'header, .navbar, #main-navbar, nav';
    const CATEGORY_STRIP_SELECTOR = '#category-strip-wrapper';
    const HOVER_DELAY = 150;
    const HIDE_DELAY = 300;
    const SCROLL_HIDE_DELAY = 50;

    // ================================= UTILITY FUNCTIONS =================================

    function isMobileDevice() {
        return window.innerWidth <= 1023;
    }

    /**
     * FIXED: Calculate navbar height accurately
     */
    function calculateNavbarHeight() {
        const navbar = document.querySelector(NAVBAR_SELECTOR);
        if (navbar) {
            // Force layout calculation
            navbar.offsetHeight;
            const computedStyle = window.getComputedStyle(navbar);
            const position = computedStyle.position;

            if (position === 'fixed' || position === 'sticky') {
                navbarHeight = Math.round(navbar.getBoundingClientRect().height);
                console.log('Calculated navbar height:', navbarHeight);
                return navbarHeight;
            }
        }
        navbarHeight = 80; // Fallback
        return navbarHeight;
    }

    /**
     * FIXED: Get element position with precise calculations
     */
    function getExactElementTop(element) {
        if (!element) return 0;
        element.offsetHeight; // Force layout
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return Math.round(rect.top + scrollTop);
    }

    /**
     * FIXED: Calculate total header offset for scrolling
     */
    function getPreciseHeaderHeight() {
        let totalHeight = navbarHeight;

        // Add category strip height if it exists
        const categoryStrip = document.querySelector(CATEGORY_STRIP_SELECTOR);
        if (categoryStrip) {
            categoryStrip.offsetHeight; // Force layout
            const stripRect = categoryStrip.getBoundingClientRect();
            const stripHeight = Math.round(stripRect.height);
            totalHeight += stripHeight;
            console.log('Category strip height:', stripHeight);
        }

        totalHeight += 15; // Buffer for perfect alignment
        console.log('Total header height for scrolling:', totalHeight);
        return totalHeight;
    }

    // ================================= POPUP MANAGEMENT =================================

    /**
     * FIXED: Force hide popup without blinking
     */
    function forceHidePopup() {
        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup) return;

        console.log('Force hiding popup');

        // FIXED: Immediate hiding without transitions to prevent blinking
        menuPopup.style.transition = 'none';
        menuPopup.style.visibility = 'hidden';
        menuPopup.style.opacity = '0';
        menuPopup.style.transform = 'translateY(-100%)';
        menuPopup.style.pointerEvents = 'none';
        menuPopup.classList.remove('show', 'positioned');

        // Restore transitions after hiding
        requestAnimationFrame(() => {
            if (menuPopup) {
                menuPopup.style.transition = '';
            }
        });

        popupReady = false;
    }

    /**
     * FIXED: Prepare popup positioning below navbar
     */
    function preparePopup() {
        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup) return false;

        // Calculate current navbar height
        const currentNavbarHeight = calculateNavbarHeight();

        // FIXED: Set CSS custom property for navbar height
        menuPopup.style.setProperty('--navbar-height', currentNavbarHeight + 'px');

        // FIXED: Position below navbar, not at top: 0
        menuPopup.style.top = currentNavbarHeight + 'px';

        // FIXED: Initially hidden state - no blinking
        menuPopup.style.transition = 'none'; // Disable transitions during setup
        menuPopup.style.visibility = 'hidden';
        menuPopup.style.opacity = '0';
        menuPopup.style.transform = 'translateY(-100%)';
        menuPopup.style.pointerEvents = 'none';

        // Setup responsive height
        const maxHeight = `calc(100vh - ${currentNavbarHeight}px - 20px)`;
        menuPopup.style.maxHeight = maxHeight;

        menuPopup.classList.add('positioned');

        // Re-enable transitions after setup
        requestAnimationFrame(() => {
            if (menuPopup) {
                menuPopup.style.transition = '';
            }
        });

        popupReady = true;
        console.log('Popup prepared below navbar at:', currentNavbarHeight + 'px');
        return true;
    }

    /**
     * FIXED: Show popup with smooth animation from below navbar
     */
    function showPopupNow() {
        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup || !popupReady) return;

        console.log('Showing popup');

        // Make visible
        menuPopup.style.visibility = 'visible';
        menuPopup.style.pointerEvents = 'all';

        // Animate in from below navbar
        requestAnimationFrame(() => {
            menuPopup.classList.add('show');
            menuPopup.style.opacity = '1';
            menuPopup.style.transform = 'translateY(0)';

            // Stagger animation for items
            const cards = menuPopup.querySelectorAll('.menu-popup-item');
            cards.forEach((card, index) => {
                card.style.setProperty('--animation-delay', `${index * 0.03}s`);
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 30);
            });
        });
    }

    /**
     * Show popup with preparation
     */
    function showPopup() {
        if (isScrolling) return;

        clearTimeout(hideTimeout);
        isMouseOverTrigger = true;

        if (!preparePopup()) return;
        setTimeout(showPopupNow, 10);
    }

    /**
     * Hide popup smoothly
     */
    function hidePopup() {
        clearTimeout(hoverTimeout);

        if (!isMouseOverPopup && !isMouseOverTrigger) {
            const menuPopup = document.getElementById('menu-categories-popup');
            if (menuPopup && menuPopup.classList.contains('show')) {
                console.log('Hiding popup');

                menuPopup.classList.remove('show');
                menuPopup.style.opacity = '0';
                menuPopup.style.transform = 'translateY(-100%)';

                // Reset item animations
                const cards = menuPopup.querySelectorAll('.menu-popup-item');
                cards.forEach(card => {
                    card.style.transition = '';
                    card.style.opacity = '';
                    card.style.transform = '';
                    card.style.removeProperty('--animation-delay');
                });

                setTimeout(forceHidePopup, 350);
            }
        }
    }

    // ================================= SCROLL FUNCTIONS =================================

    /**
     * FIXED: Ultimate precision scroll with multi-pass correction
     */
    function scrollToElementWithPrecision(targetElement) {
        if (!targetElement) {
            console.error('Target element is null');
            return;
        }

        console.log('=== STARTING PRECISION SCROLL ===');
        console.log('Target element:', targetElement.id);

        isScrolling = true;

        // Step 1: Initial calculation and scroll
        function performInitialScroll() {
            return new Promise((resolve) => {
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(targetElement);
                const targetPosition = Math.max(0, elementTop - headerHeight);

                console.log('Initial scroll calculation:', {
                    elementTop,
                    headerHeight,
                    targetPosition,
                    currentScroll: window.pageYOffset
                });

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                setTimeout(resolve, 400);
            });
        }

        // Step 2: First correction pass
        function performFirstCorrection() {
            return new Promise((resolve) => {
                const headerHeight = getPreciseHeaderHeight();
                const elementTop = getExactElementTop(targetElement);
                const targetPosition = Math.max(0, elementTop - headerHeight);
                const currentScroll = window.pageYOffset;
                const difference = Math.abs(currentScroll - targetPosition);

                console.log('First correction:', {
                    elementTop,
                    headerHeight,
                    targetPosition,
                    currentScroll,
                    difference
                });

                if (difference > 3) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    setTimeout(resolve, 300);
                } else {
                    resolve();
                }
            });
        }

        // Step 3: Final pixel-perfect correction
        function performFinalCorrection() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const headerHeight = getPreciseHeaderHeight();
                    const elementTop = getExactElementTop(targetElement);
                    const targetPosition = Math.max(0, elementTop - headerHeight);
                    const currentScroll = window.pageYOffset;
                    const difference = targetPosition - currentScroll;

                    console.log('Final correction:', {
                        elementTop,
                        headerHeight,
                        targetPosition,
                        currentScroll,
                        difference
                    });

                    if (Math.abs(difference) > 1) {
                        // Instantaneous pixel-perfect positioning
                        window.scrollTo(0, targetPosition);
                    }

                    console.log('Final position:', window.pageYOffset);
                    console.log('=== SCROLL COMPLETE ===');

                    resolve();
                }, 100);
            });
        }

        // Execute scroll sequence
        performInitialScroll()
            .then(() => performFirstCorrection())
            .then(() => performFinalCorrection())
            .then(() => {
                setTimeout(() => {
                    isScrolling = false;
                }, 300);
            })
            .catch((error) => {
                console.error('Scroll error:', error);
                isScrolling = false;
            });
    }

    /**
     * FIXED: Enhanced category click handler
     */
    function handleCategoryClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const item = event.currentTarget;
        const href = item.getAttribute('href');

        console.log('=== CATEGORY CLICK EVENT ===');
        console.log('Clicked href:', href);

        if (!href || !href.startsWith('#')) {
            console.error('Invalid href:', href);
            return;
        }

        // Visual feedback
        const card = item.querySelector('.menu-popup-card');
        if (card) {
            card.style.transform = 'translateY(-2px) scale(0.95)';
            setTimeout(() => card.style.transform = '', 150);
        }

        // Hide popup immediately
        forceHidePopup();
        isMouseOverPopup = false;
        isMouseOverTrigger = false;

        // Find target element
        const targetId = href.slice(1);
        console.log('Looking for section:', targetId);

        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.error('Section not found:', targetId);

            // Enhanced debugging
            const allSections = document.querySelectorAll('section[id], div[id], article[id]');
            console.log('Available sections:');
            allSections.forEach(section => {
                console.log(`- ${section.id} (tag: ${section.tagName})`);
            });
            return;
        }

        console.log('Target found:', targetElement);

        // Wait for popup to close, then scroll with precision
        setTimeout(() => {
            scrollToElementWithPrecision(targetElement);
        }, 200);

        // Update URL after scroll sequence completes
        setTimeout(() => {
            console.log('Updating URL to:', href);
            history.replaceState(null, '', href);
        }, 1500);
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
        if (!isScrolling) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (popupReady && !isScrolling) {
                    forceHidePopup();
                    isMouseOverPopup = false;
                    isMouseOverTrigger = false;
                }
            }, SCROLL_HIDE_DELAY);
        }
    }

    /**
     * Handle resize events
     */
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate navbar height
            calculateNavbarHeight();

            // Update popup positioning if visible
            if (popupReady) {
                const menuPopup = document.getElementById('menu-categories-popup');
                if (menuPopup) {
                    menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');
                    menuPopup.style.top = navbarHeight + 'px';
                    menuPopup.style.maxHeight = `calc(100vh - ${navbarHeight}px - 20px)`;
                }
            }
        }, 250);
    }

    // ================================= INITIALIZATION =================================

    function initMenuPopup() {
        if (menuPopupInitialized) return true;

        const menuTrigger = document.getElementById('menu-hover-trigger');
        const menuPopup = document.getElementById('menu-categories-popup');

        if (!menuTrigger || !menuPopup) {
            console.error('Menu elements not found');
            return false;
        }

        console.log('Initializing fixed menu popup system');
        menuPopupInitialized = true;

        // Calculate initial navbar height
        calculateNavbarHeight();

        // Force hide popup initially to prevent blinking
        forceHidePopup();

        // ================================= EVENT LISTENERS =================================

        // Desktop hover handlers
        menuTrigger.addEventListener('mouseenter', function () {
            if (!isMobileDevice()) {
                isMouseOverTrigger = true;
                clearTimeout(hideTimeout);
                hoverTimeout = setTimeout(showPopup, HOVER_DELAY);
            }
        });

        menuTrigger.addEventListener('mouseleave', function () {
            if (!isMobileDevice()) {
                isMouseOverTrigger = false;
                clearTimeout(hoverTimeout);
                hideTimeout = setTimeout(hidePopup, HIDE_DELAY);
            }
        });

        menuPopup.addEventListener('mouseenter', function () {
            if (!isMobileDevice()) {
                isMouseOverPopup = true;
                clearTimeout(hideTimeout);
            }
        });

        menuPopup.addEventListener('mouseleave', function () {
            if (!isMobileDevice()) {
                isMouseOverPopup = false;
                hideTimeout = setTimeout(hidePopup, 200);
            }
        });

        // Mobile click handler
        menuTrigger.addEventListener('click', function(e) {
            if (isMobileDevice()) {
                e.preventDefault();
                if (popupReady && menuPopup.classList.contains('show')) {
                    hidePopup();
                } else {
                    showPopup();
                }
            }
        });

        // Category item handlers
        const popupItems = menuPopup.querySelectorAll('.menu-popup-item');
        popupItems.forEach((item) => {
            item.addEventListener('click', handleCategoryClick);
        });

        // Global handlers
        document.addEventListener('click', function (e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                forceHidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                forceHidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        console.log('Fixed menu popup system initialized - navbar height:', navbarHeight);
        return true;
    }

    // ================================= INITIALIZATION STRATEGIES =================================

    function tryInitialize() {
        if (initMenuPopup()) return;
        setTimeout(tryInitialize, 500);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInitialize, 100));
    } else {
        setTimeout(tryInitialize, 100);
    }

    window.addEventListener('load', () => setTimeout(tryInitialize, 200));

    // Enhanced debug methods
    window.menuPopupDebug = {
        scrollTo: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                console.log(`=== MANUAL DEBUG SCROLL TO: ${sectionId} ===`);
                scrollToElementWithPrecision(element);
            } else {
                console.error(`Section not found: ${sectionId}`);
                this.listSections();
            }
        },

        listSections: function() {
            const sections = document.querySelectorAll('section[id], div[id], article[id]');
            console.log('=== ALL SECTIONS WITH IDS ===');
            sections.forEach(s => {
                const rect = s.getBoundingClientRect();
                console.log(`${s.id}: ${s.tagName.toLowerCase()}, top: ${getExactElementTop(s)}, visible: ${s.offsetParent !== null}`);
            });
            return Array.from(sections);
        },

        testNavbarHeight: function() {
            const height = calculateNavbarHeight();
            console.log('Current navbar height:', height);
            return height;
        }
    };

})();