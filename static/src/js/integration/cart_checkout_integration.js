// File: /website_customizations/static/src/js/integration/cart_checkout_integration.js

/**
 * Cart-Checkout Integration System
 * Connects the CravelyCartManager with CheckoutManager for seamless order flow
 * UPDATED: Added order type detection and URL parameter passing
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
     * Get current order type from multiple sources
     */
    getCurrentOrderType() {
        // Method 1: Check URL parameters (if we're on a page with order_type)
        const urlParams = new URLSearchParams(window.location.search);
        const urlOrderType = urlParams.get('order_type');
        if (urlOrderType && (urlOrderType === 'delivery' || urlOrderType === 'pickup')) {
            console.log('🔗 Order type from URL:', urlOrderType);
            return urlOrderType;
        }

        // Method 2: Check order method selector global instance
        if (window.orderMethodSelector && typeof window.orderMethodSelector.getCurrentType === 'function') {
            const selectorType = window.orderMethodSelector.getCurrentType();
            if (selectorType) {
                console.log('🎛️ Order type from selector:', selectorType);
                return selectorType;
            }
        }

        // Method 3: Check sessionStorage for stored order method
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

        // Method 4: Check active toggle button states (fallback)
        const activeDeliveryBtn = document.querySelector('#delivery-btn.active, .delivery-toggle.active, [data-type="delivery"].active');
        const activePickupBtn = document.querySelector('#pickup-btn.active, .pickup-toggle.active, [data-type="pickup"].active');
        
        if (activePickupBtn) {
            console.log('🏪 Order type from active button: pickup');
            return 'pickup';
        } else if (activeDeliveryBtn) {
            console.log('🚚 Order type from active button: delivery');
            return 'delivery';
        }

        // Method 5: Check for any order type indicators in the DOM
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

                // Prepare cart data for checkout
                const cartData = this.prepareCartDataForCheckout();

                // Store in sessionStorage for checkout page
                sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));

                // Also ensure order method is stored
                const orderMethodData = {
                    type: orderType,
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

    /**
     * Enhance all checkout buttons and links to include order type
     */
    enhanceCheckoutButtons() {
        console.log('🔧 Enhancing checkout buttons with order type...');

        // Find all possible checkout elements
        const checkoutSelectors = [
            'a[href="/checkout"]',
            'a[href*="checkout"]',
            'button[data-action="checkout"]',
            '.checkout-btn',
            '#checkout-button',
            '.proceed-to-checkout',
            '[onclick*="checkout"]',
            '.cravely-checkout-btn',
            '#cravely-checkout-now'
        ];

        const checkoutElements = document.querySelectorAll(checkoutSelectors.join(', '));

        checkoutElements.forEach(element => {
            // Remove existing enhanced listeners
            element.removeEventListener('click', this.handleCheckoutClick);
            
            // Add our enhanced click handler
            element.addEventListener('click', (event) => this.handleCheckoutClick(event, element));
            
            // Also update href if it's a link
            if (element.tagName === 'A') {
                this.updateCheckoutHref(element);
            }
        });

        console.log(`✅ Enhanced ${checkoutElements.length} checkout elements`);

        // Set up a periodic check for dynamically added elements
        setInterval(() => {
            const newElements = document.querySelectorAll(checkoutSelectors.join(', '));
            let newCount = 0;
            
            newElements.forEach(element => {
                if (!element.hasAttribute('data-checkout-enhanced')) {
                    element.setAttribute('data-checkout-enhanced', 'true');
                    element.addEventListener('click', (event) => this.handleCheckoutClick(event, element));
                    
                    if (element.tagName === 'A') {
                        this.updateCheckoutHref(element);
                    }
                    newCount++;
                }
            });
            
            if (newCount > 0) {
                console.log(`🔄 Enhanced ${newCount} new checkout elements`);
            }
        }, 2000);
    }

    /**
     * Handle checkout button/link click with order type
     */
    handleCheckoutClick(event, element) {
        console.log('🛒 Checkout element clicked:', element);
        
        // Get current order type
        const orderType = this.getCurrentOrderType();
        
        if (orderType) {
            console.log('📦 Order type detected for checkout:', orderType);
            
            // Store order method data
            const orderMethodData = {
                type: orderType,
                timestamp: Date.now(),
                source: 'checkout_button'
            };
            sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderMethodData));
            
            // If this is going through cart manager, let it handle
            if (element.getAttribute('onclick') && element.getAttribute('onclick').includes('cartManager')) {
                console.log('🔄 Letting cart manager handle checkout');
                return; // Let the cart manager's enhanced handler take over
            }
            
            // Otherwise handle directly
            event.preventDefault();
            event.stopPropagation();
            
            // Check if cart has items (if cart manager available)
            if (this.cartManager && this.cartManager.cart.length === 0) {
                this.showNotice('Your cart is empty. Add items to proceed to checkout.');
                return;
            }
            
            // Build checkout URL with order type
            const checkoutUrl = this.buildCheckoutUrl(orderType);
            
            console.log('🚀 Direct redirect to checkout:', checkoutUrl);
            window.location.href = checkoutUrl;
        } else {
            console.log('⚠️ No order type detected, proceeding with default checkout');
            // Let the normal checkout flow continue, but still try to detect
            const defaultUrl = this.buildCheckoutUrl('delivery');
            if (event.target.tagName === 'A') {
                event.preventDefault();
                window.location.href = defaultUrl;
            }
        }
    }

    /**
     * Update href attribute of checkout links with order type
     */
    updateCheckoutHref(linkElement) {
        const orderType = this.getCurrentOrderType();
        if (orderType) {
            const newHref = this.buildCheckoutUrl(orderType);
            linkElement.href = newHref;
            console.log('🔗 Updated link href to:', newHref);
        }
    }

    prepareCartDataForCheckout() {
        if (!this.cartManager) return null;

        const tax = Math.round(this.cartManager.cartTotal * this.cartManager.taxRate);
        const grandTotal = this.cartManager.cartTotal + tax + this.cartManager.deliveryFee;

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
            grandTotal: grandTotal
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

                // Keep the order type when going back to menu
                const orderType = this.getCurrentOrderType();
                const homeUrl = orderType && orderType !== 'delivery' 
                    ? `/?order_type=${orderType}` 
                    : '/';

                window.location.href = homeUrl;
            }
        });

        // Handle "Add more items" from cart sidebar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cravely-add-more-items-btn')) {
                e.preventDefault();
                e.stopPropagation();

                // Keep the order type when adding more items
                const orderType = this.getCurrentOrderType();

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
                    // Redirect to home and scroll to menu, keeping order type
                    const homeUrl = orderType && orderType !== 'delivery' 
                        ? `/?order_type=${orderType}#menu` 
                        : '/#menu';
                    window.location.href = homeUrl;
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

        // Listen for order type changes and update checkout links
        document.addEventListener('orderTypeChanged', () => {
            console.log('🔄 Order type changed, updating checkout links...');
            setTimeout(() => {
                this.enhanceCheckoutButtons();
            }, 100);
        });

        // Also listen to the order method selector events
        document.addEventListener('orderMethodToggle', (e) => {
            console.log('🔄 Order method toggled:', e.detail);
            setTimeout(() => {
                this.enhanceCheckoutButtons();
            }, 100);
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
    }

    showNotice(message, duration = 3000) {
        // Create a temporary notice if none exists
        let notice = document.getElementById('checkout-integration-notice');
        
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'checkout-integration-notice';
            notice.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fee2e2;
                color: #dc2626;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #dc2626;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 10001;
                font-weight: 600;
                max-width: 300px;
                display: none;
            `;
            document.body.appendChild(notice);
        }

        notice.textContent = message;
        notice.style.display = 'block';

        setTimeout(() => {
            notice.style.display = 'none';
        }, duration);
    }

    /**
     * Public API methods for testing
     */
    testCheckout() {
        const orderType = this.getCurrentOrderType();
        console.log('🧪 Test checkout - Order type:', orderType);
        
        const checkoutUrl = this.buildCheckoutUrl(orderType);
        console.log('🧪 Would redirect to:', checkoutUrl);
        
        return { orderType, checkoutUrl };
    }

    forceOrderType(orderType) {
        if (orderType === 'delivery' || orderType === 'pickup') {
            const orderMethodData = {
                type: orderType,
                timestamp: Date.now(),
                source: 'forced'
            };
            sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderMethodData));
            console.log('🔧 Forced order type to:', orderType);
            
            // Update checkout links
            this.enhanceCheckoutButtons();
        }
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

// Export for testing
window.CartCheckoutIntegration = CartCheckoutIntegration;