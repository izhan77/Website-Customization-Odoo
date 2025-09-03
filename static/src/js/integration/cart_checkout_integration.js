// File: /website_customizations/static/src/js/integration/cart_checkout_integration.js

/**
 * Cart-Checkout Integration System
 * Connects the CravelyCartManager with CheckoutManager for seamless order flow
 */

class CartCheckoutIntegration {
    constructor() {
        this.cartManager = null;
        this.checkoutManager = null;
        this.isInitialized = false;

        this.init();
    }

    init() {
        console.log('🔄 Initializing Cart-Checkout Integration...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupIntegration();
            });
        } else {
            this.setupIntegration();
        }
    }

    setupIntegration() {
    // Wait for both managers to be available
    this.waitForManagers().then(() => {
        this.connectCartToCheckout();
        this.enhanceCheckoutButtons(); // Add this line
        this.setupNavigation();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ Cart-Checkout Integration initialized successfully');
    }).catch(error => {
        console.error('Failed to initialize integration:', error);
    });
}

    waitForManagers() {
        return new Promise((resolve, reject) => {
            const maxWaitTime = 10000; // 10 seconds max
            const startTime = Date.now();

            const checkManagers = () => {
                if (window.cravelyCartManager && (window.checkoutManager || !this.isOnCheckoutPage())) {
                    this.cartManager = window.cravelyCartManager;
                    this.checkoutManager = window.checkoutManager;
                    resolve();
                    return;
                }

                if (Date.now() - startTime > maxWaitTime) {
                    reject(new Error('Managers not available after 10 seconds'));
                    return;
                }

                setTimeout(checkManagers, 100);
            };

            checkManagers();
        });
    }

    isOnCheckoutPage() {
        return document.querySelector('.checkout-page-wrapper') !== null;
    }

    /**
     * Get current order type from multiple sources with priority
     */
    getCurrentOrderType() {
        // Priority 1: Check URL parameters (most immediate)
        const urlParams = new URLSearchParams(window.location.search);
        const urlOrderType = urlParams.get('order_type');
        if (urlOrderType && (urlOrderType === 'delivery' || urlOrderType === 'pickup')) {
            console.log('🔗 Order type from URL:', urlOrderType);
            return urlOrderType;
        }

        // Priority 2: Check sessionStorage for stored order method
        try {
            const storedOrder = sessionStorage.getItem('orderMethodSelected');
            if (storedOrder) {
                const orderData = JSON.parse(storedOrder);
                if (orderData.type) {
                    console.log('💾 Order type from storage:', orderData.type);
                    return orderData.type;
                }
            }
        } catch (e) {
            console.warn('Failed to parse stored order data:', e);
        }

        // Priority 3: Check order method selector global instance
        if (window.orderMethodSelector && typeof window.orderMethodSelector.getCurrentType === 'function') {
            const selectorType = window.orderMethodSelector.getCurrentType();
            if (selectorType) {
                console.log('🎛️ Order type from selector:', selectorType);
                return selectorType;
            }
        }

        // Priority 4: Check active toggle button states
        const activeDeliveryBtn = document.querySelector('#delivery-btn.active, .delivery-toggle.active, [data-type="delivery"].active');
        const activePickupBtn = document.querySelector('#pickup-btn.active, .pickup-toggle.active, [data-type="pickup"].active');

        if (activePickupBtn) {
            console.log('🏪 Order type from active button: pickup');
            return 'pickup';
        } else if (activeDeliveryBtn) {
            console.log('🚚 Order type from active button: delivery');
            return 'delivery';
        }

        // Priority 5: Check for any order type indicators in the DOM
        const orderTypeIndicators = document.querySelectorAll('[data-order-type]');
        for (const indicator of orderTypeIndicators) {
            const orderType = indicator.dataset.orderType;
            if (orderType && (orderType === 'delivery' || orderType === 'pickup')) {
                console.log('📋 Order type from DOM indicator:', orderType);
                return orderType;
            }
        }

        console.log('❓ No order type found, defaulting to delivery');
        return 'delivery'; // Default fallback
    }

    /**
     * Build checkout URL with order type parameter
     */
    buildCheckoutUrl(orderType) {
        const baseUrl = '/checkout';
        const url = new URL(baseUrl, window.location.origin);

        if (orderType) {
            url.searchParams.set('order_type', orderType);
        }

        console.log('🔗 Built checkout URL:', url.toString());
        return url.toString();
    }

    /**
     * Get stored user ID and order ID from sessionStorage
     */
    getStoredOrderIds() {
    try {
        const storedOrder = sessionStorage.getItem('orderMethodSelected');
        if (storedOrder) {
            const orderData = JSON.parse(storedOrder);
            return {
                userId: orderData.userId || null,
                orderId: orderData.orderId || null,
                odooOrderId: orderData.odooOrderId || null,
                salesOrderId: orderData.salesOrderId || null
            };
        }
    } catch (e) {
        console.warn('Failed to parse stored order IDs:', e);
    }
    return { userId: null, orderId: null, odooOrderId: null, salesOrderId: null };
}

    connectCartToCheckout() {
        // Override the checkout handler in cart manager
        if (this.cartManager) {
            const originalHandleCheckout = this.cartManager.handleCheckout.bind(this.cartManager);

            this.cartManager.handleCheckout = () => {
                console.log('🛒 Enhanced checkout handler called');

                if (this.cartManager.cart.length === 0) {
                    this.showNotice('Your cart is empty. Add items to proceed to checkout.');
                    return;
                }

                // Get current order type
                const orderType = this.getCurrentOrderType();
                console.log('📦 Proceeding to checkout with order type:', orderType);

                // Get stored user ID and order ID
                const { userId, orderId } = this.getStoredOrderIds();
                console.log('👤 User ID:', userId, 'Order ID:', orderId);

                // Prepare cart data for checkout
                const cartData = this.prepareCartDataForCheckout();

                // Store in sessionStorage for checkout page
                sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));

                // Also ensure order method is stored with IDs
                const orderMethodData = {
                    type: orderType,
                    userId: userId,
                    orderId: orderId,
                    timestamp: Date.now(),
                    source: 'cart_checkout'
                };
                sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderMethodData));

                // Build checkout URL with order type
                const checkoutUrl = this.buildCheckoutUrl(orderType);

                console.log('🚀 Redirecting to checkout:', checkoutUrl);
                window.location.href = checkoutUrl;
            };

            console.log('✅ Checkout handler integrated with order type support');
        }

        // Also enhance any direct checkout buttons/links
        this.enhanceCheckoutButtons();

        // Enhance checkout manager to use cart data
        if (this.checkoutManager && this.cartManager) {
            const originalLoadCartData = this.checkoutManager.loadCartData.bind(this.checkoutManager);

            this.checkoutManager.loadCartData = () => {
                // First try to get from sessionStorage (from cart)
                try {
                    const storedCart = sessionStorage.getItem('checkoutCart');
                    if (storedCart) {
                        this.checkoutManager.cartData = JSON.parse(storedCart);
                        console.log('📦 Cart data loaded from sessionStorage:', this.checkoutManager.cartData);
                        return;
                    }
                } catch (error) {
                    console.error('Error loading cart from sessionStorage:', error);
                }

                // Fall back to original implementation
                originalLoadCartData();
            };

            console.log('✅ Checkout cart loading enhanced');
        }
    }

    prepareCartDataForCheckout() {
        if (!this.cartManager) return null;

        const tax = Math.round(this.cartManager.cartTotal * this.cartManager.taxRate);
        const grandTotal = this.cartManager.cartTotal + tax + this.cartManager.deliveryFee;

        // Get order type information
        const orderType = this.getCurrentOrderType();
        const { userId, orderId } = this.getStoredOrderIds();

        return {
            items: this.cartManager.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                specialInstructions: item.specialInstructions || ''
            })),
            subtotal: this.cartManager.cartTotal,
            tax: tax,
            deliveryFee: this.cartManager.deliveryFee,
            grandTotal: grandTotal,
            orderType: orderType,
            userId: userId,
            orderId: orderId
        };
    }

    setupNavigation() {
        // Handle "Browse Menu Again" button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#view-menu-btn') ||
                (e.target.id === 'view-menu-btn')) {
                e.preventDefault();

                // Clear cart if needed
                if (this.cartManager) {
                    this.cartManager.cart = [];
                    this.cartManager.updateCartTotals();
                    this.cartManager.updateCartSidebarContent();
                    this.cartManager.updateCartPopupDisplay();
                    this.cartManager.updateCartSummary();
                    this.cartManager.updatePopularItems();
                }

                // Redirect to home
                window.location.href = '/';
            }
        });

        // Handle "Add more items" from cart sidebar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-add-more-items-btn')) {
                e.preventDefault();
                e.stopPropagation();

                // Scroll to menu section on homepage
                if (window.location.pathname === '/') {
                    const menuSection = document.querySelector('.menu-section') ||
                                       document.querySelector('#rice-box-section') ||
                                       document.querySelector('.product-grid');
                    if (menuSection) {
                        menuSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                } else {
                    // Redirect to home and scroll to menu
                    window.location.href = '/#menu';
                }

                // Close cart sidebar
                if (this.cartManager) {
                    this.cartManager.hideCartSidebar();
                }
            }
        });
    }

    setupEventListeners() {
        // Listen for order completion
        document.addEventListener('orderCompleted', (e) => {
            if (this.cartManager) {
                // Clear the cart after successful order
                this.cartManager.cart = [];
                this.cartManager.updateCartTotals();
                this.cartManager.updateCartSidebarContent();
                this.cartManager.updateCartPopupDisplay();
                this.cartManager.updateCartSummary();
                this.cartManager.updatePopularItems();

                console.log('🛒 Cart cleared after successful order');
            }
        });

        // Enhance the checkout manager's processOrder method to dispatch event
        if (this.checkoutManager) {
            const originalProcessOrder = this.checkoutManager.processOrder.bind(this.checkoutManager);

            this.checkoutManager.processOrder = async () => {
                try {
                    const result = await originalProcessOrder();

                    // Dispatch custom event for order completion
                    const orderCompletedEvent = new CustomEvent('orderCompleted', {
                        detail: {
                            orderData: this.checkoutManager.orderData
                        }
                    });
                    document.dispatchEvent(orderCompletedEvent);

                    return result;
                } catch (error) {
                    console.error('Order processing failed:', error);
                    throw error;
                }
            };
        }

        // Listen for order completion from checkout
        document.addEventListener('orderCompleted', (e) => {
    if (this.cartManager) {
        this.cartManager.clearCartCompletely();
        console.log('Cart cleared after successful order');
    }
});

        // Listen for browse menu button specifically
        document.addEventListener('click', (e) => {
    if (e.target.id === 'view-menu-btn' || e.target.closest('#view-menu-btn')) {
        console.log('Browse menu button clicked - clearing cart');
        if (this.cartManager) {
            this.cartManager.clearCartCompletely();
        }

        // Generate new order ID
        if (window.orderMethodSelector && typeof window.orderMethodSelector.generateNewOrderId === 'function') {
            window.orderMethodSelector.generateNewOrderId();
        }
    }
});
    }

    showNotice(message, duration = 3000) {
        const notice = document.getElementById('checkout-integration-notice');
        if (!notice) return;

        notice.textContent = message;
        notice.style.display = 'block';

        setTimeout(() => {
            notice.style.display = 'none';
        }, duration);
    }

    /**
 * Handle checkout directly from integration
 */
handleCheckout() {
    if (!this.cartManager || this.cartManager.cart.length === 0) {
        this.showNotice('Your cart is empty. Add items to proceed to checkout.');
        return;
    }

    // Get current order type
    const orderType = this.getCurrentOrderType();
    console.log('📦 Proceeding to checkout with order type:', orderType);

    // Get stored user ID and order ID
    const { userId, orderId } = this.getStoredOrderIds();
    console.log('👤 User ID:', userId, 'Order ID:', orderId);

    // Prepare cart data for checkout
    const cartData = this.prepareCartDataForCheckout();

    // Store in sessionStorage for checkout page
    sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));

    // Also ensure order method is stored with IDs
    const orderMethodData = {
        type: orderType,
        userId: userId,
        orderId: orderId,
        timestamp: Date.now(),
        source: 'cart_checkout'
    };
    sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderMethodData));

    // Build checkout URL with order type
    const checkoutUrl = this.buildCheckoutUrl(orderType);

    console.log('🚀 Redirecting to checkout:', checkoutUrl);
    window.location.href = checkoutUrl;
}

/**
 * Enhance checkout buttons to use our integration
 */
enhanceCheckoutButtons() {
    console.log('🔧 Enhancing checkout buttons...');

    // Find checkout buttons
    const checkoutButtons = document.querySelectorAll('#cravely-checkout-btn, .cravely-checkout-btn');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleCheckout();
        });
    });

    console.log(`✅ Enhanced ${checkoutButtons.length} checkout buttons`);
}
}

// Initialize the integration
document.addEventListener('DOMContentLoaded', function() {
    if (!window.cartCheckoutIntegration) {
        window.cartCheckoutIntegration = new CartCheckoutIntegration();
    }
});

if (document.readyState !== 'loading' && !window.cartCheckoutIntegration) {
    window.cartCheckoutIntegration = new CartCheckoutIntegration();
}