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

    connectCartToCheckout() {
        // Override the checkout handler in cart manager
        if (this.cartManager) {
            const originalHandleCheckout = this.cartManager.handleCheckout.bind(this.cartManager);

            this.cartManager.handleCheckout = () => {
                if (this.cartManager.cart.length === 0) {
                    this.showNotice('Your cart is empty. Add items to proceed to checkout.');
                    return;
                }

                // Prepare cart data for checkout
                const cartData = this.prepareCartDataForCheckout();

                // Store in sessionStorage for checkout page
                sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));

                // Redirect to checkout page
                window.location.href = '/checkout';
            };

            console.log('✅ Checkout handler integrated');
        }

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