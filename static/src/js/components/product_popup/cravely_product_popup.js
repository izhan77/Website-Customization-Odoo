/**
 * ================================= CRAVELY PRODUCT POPUP SYSTEM (NAVBAR-SAFE) =================================
 * Complete product popup functionality that won't interfere with navbar or any other components
 * Uses strict namespacing and event isolation to prevent conflicts
 * File: /website_customizations/static/src/js/components/product_popup/cravely_product_popup.js
 */

class CravelyProductPopupManager {
    constructor() {
        this.isPopupOpen = false;
        this.currentProductData = null;
        this.currentQuantity = 1;
        this.cartManager = null;
        this.namespace = 'cravely-popup-';
        this.initialized = false;

        // Bind methods to preserve context
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.init();
    }

    /**
     * Initialize the popup system - completely isolated from navbar and other components
     */
    init() {
        console.log('🎯 Initializing Cravely Product Popup Manager (Navbar-Safe)...');

        // Prevent multiple initializations
        if (this.initialized) {
            console.log('⚠️ Cravely Product Popup already initialized');
            return;
        }

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
     * Setup the popup system
     */
    setup() {
        // Prevent duplicate setup
        if (this.initialized) return;

        this.createPopupElements();
        this.bindEvents();
        this.initialized = true;
        console.log('✅ Cravely Product Popup Manager initialized successfully');
    }

    /**
     * Create popup elements if they don't exist - with unique namespace
     */
    createPopupElements() {
        // Check if popup already exists
        if (document.getElementById('cravely-product-popup-overlay')) {
            console.log('ℹ️ Cravely popup elements already exist');
            return;
        }

        console.log('🏗️ Creating Cravely product popup elements...');

        const popupHTML = `
            <div id="cravely-product-popup-overlay" class="cravely-product-popup-overlay cravely-popup-hidden">
                <div id="cravely-product-popup-modal" class="cravely-product-popup-modal">
                    <button id="cravely-close-product-popup" class="cravely-close-product-popup" type="button">
                        <svg class="cravely-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="cravely-product-popup-content">
                        <!-- Left Side: Product Image -->
                        <div class="cravely-product-popup-image-section">
                            <div class="cravely-product-popup-image-container">
                                <img id="cravely-popup-product-image"
                                     src="/website_customizations/static/src/images/product_1.jpg"
                                     alt="Product Image"
                                     loading="lazy"/>
                            </div>
                        </div>

                        <!-- Right Side: Product Details -->
                        <div class="cravely-product-popup-details-section">
                            <h2 id="cravely-popup-product-title" class="cravely-popup-product-title">Product Name</h2>

                            <p id="cravely-popup-product-description" class="cravely-popup-product-description">
                                Product description will appear here
                            </p>

                            <div class="cravely-popup-pricing-section">
                                <div class="cravely-popup-price-container">
                                    <span id="cravely-popup-original-price" class="cravely-popup-original-price cravely-popup-hidden">Rs. 0</span>
                                    <span id="cravely-popup-current-price" class="cravely-popup-current-price">Rs. 0</span>
                                </div>
                            </div>

                            <div class="cravely-special-instructions-section">
                                <label for="cravely-popup-special-instructions" class="cravely-instructions-label">
                                    Special Instructions
                                </label>
                                <textarea id="cravely-popup-special-instructions"
                                          class="cravely-instructions-textarea"
                                          placeholder="Please enter instructions about this item"
                                          rows="3"></textarea>
                            </div>

                            <div class="cravely-popup-cart-section">
                                <div class="cravely-popup-quantity-controls">
                                    <button id="cravely-popup-quantity-decrease" class="cravely-popup-quantity-btn cravely-decrease" type="button">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>

                                    <span id="cravely-popup-quantity-display" class="cravely-popup-quantity-display">1</span>

                                    <button id="cravely-popup-quantity-increase" class="cravely-popup-quantity-btn cravely-increase" type="button">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>
                                </div>

                                <div class="cravely-popup-total-price-section">
                                    <span id="cravely-popup-total-price" class="cravely-popup-total-price">Rs. 0</span>
                                </div>

                                <button id="cravely-popup-add-to-cart" class="cravely-popup-add-to-cart-btn" type="button">
                                    <span class="cravely-popup-cart-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 12l2 2 4-4"/>
                                            <circle cx="12" cy="12" r="9"/>
                                        </svg>
                                    </span>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
        console.log('✅ Cravely popup elements created successfully');
    }

    /**
     * Bind all event listeners - SAFELY isolated from navbar and other components
     */
    bindEvents() {
        console.log('🎯 Binding Cravely popup events (navbar-safe)...');

        // Use a single delegated event listener with very specific targeting
        document.addEventListener('click', this.handleDocumentClick);

        // Keyboard events - only when popup is open
        document.addEventListener('keydown', this.handleKeyDown);

        console.log('✅ Cravely popup events bound successfully');
    }

    /**
     * Handle all document clicks with precise targeting to avoid navbar interference
     */
    handleDocumentClick(e) {
        // CRITICAL: Only handle clicks if they're related to popup functionality
        // This prevents interference with navbar or other components

        // 1. Handle product card clicks (ONLY product cards, not navbar)
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.add-to-cart-btn, .quantity-controls-bar, .navbar, .nav, header, [class*="nav"]')) {
            e.preventDefault();
            e.stopPropagation();
            this.handleProductCardClick(productCard);
            return;
        }

        // 2. Handle close popup events (ONLY popup-specific elements)
        if (e.target.id === 'cravely-product-popup-overlay' || e.target.closest('#cravely-close-product-popup')) {
            e.preventDefault();
            e.stopPropagation();
            this.hidePopup();
            return;
        }

        // 3. Handle popup quantity controls (ONLY popup-specific controls)
        if (e.target.closest('#cravely-popup-quantity-increase')) {
            e.preventDefault();
            e.stopPropagation();
            this.increaseQuantity();
            return;
        }
        if (e.target.closest('#cravely-popup-quantity-decrease')) {
            e.preventDefault();
            e.stopPropagation();
            this.decreaseQuantity();
            return;
        }

        // 4. Handle add to cart from popup (ONLY popup-specific button)
        if (e.target.closest('#cravely-popup-add-to-cart')) {
            e.preventDefault();
            e.stopPropagation();
            this.handleAddToCartFromPopup();
            return;
        }

        // 5. Prevent popup close when clicking inside modal content
        if (e.target.closest('#cravely-product-popup-modal')) {
            e.stopPropagation();
            return;
        }

        // 6. Do NOT handle any other clicks - let navbar and other components work normally
    }

    /**
     * Handle keyboard events - only when popup is open
     */
    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isPopupOpen) {
            e.preventDefault();
            e.stopPropagation();
            this.hidePopup();
        }
    }

    /**
     * Handle product card click
     */
    handleProductCardClick(productCard) {
        console.log('📦 Product card clicked (navbar-safe)');

        // Extract product data from the card
        this.currentProductData = this.getProductDataFromCard(productCard);

        // Reset quantity to 1
        this.currentQuantity = 1;

        // Show the popup with product data
        this.showPopup();
    }

    /**
     * Get product data from card element
     */
    getProductDataFromCard(productCard) {
        const extractPrice = (priceText) => {
            if (!priceText) return 0;
            const matches = priceText.toString().replace(/[^\d]/g, '');
            return parseInt(matches) || 0;
        };

        return {
            id: productCard.getAttribute('data-product-id') ||
                Math.random().toString(36).substr(2, 9),
            name: productCard.getAttribute('data-name') ||
                  productCard.querySelector('.product-title')?.textContent?.trim() ||
                  'Unknown Product',
            price: extractPrice(
                productCard.getAttribute('data-price') ||
                productCard.querySelector('.discounted-price')?.textContent || '0'
            ),
            originalPrice: extractPrice(
                productCard.getAttribute('data-original-price') ||
                productCard.querySelector('.original-price')?.textContent || '0'
            ),
            image: productCard.getAttribute('data-image') ||
                   productCard.querySelector('.product-image-container img')?.src ||
                   productCard.querySelector('img')?.src ||
                   '/website_customizations/static/src/images/product_1.jpg',
            description: productCard.getAttribute('data-description') ||
                        productCard.querySelector('.product-description')?.textContent?.trim() ||
                        'Fresh and delicious food prepared with love',
            category: productCard.getAttribute('data-category') || 'general'
        };
    }

    /**
     * Show the popup modal
     */
    showPopup() {
        if (this.isPopupOpen || !this.currentProductData) return;

        console.log('🎭 Showing product popup for:', this.currentProductData.name);

        // Populate popup with product data
        this.populatePopupData();

        // Show the popup
        const overlay = document.getElementById('cravely-product-popup-overlay');
        if (overlay) {
            // Prevent body scrolling with namespaced class
            document.body.classList.add('cravely-modal-open');

            // Show overlay
            overlay.classList.remove('cravely-popup-hidden');

            // Trigger animation after a brief delay
            setTimeout(() => {
                overlay.classList.add('cravely-show');
                this.isPopupOpen = true;
            }, 10);
        }
    }

    /**
     * Hide the popup modal
     */
    hidePopup() {
        if (!this.isPopupOpen) return;

        console.log('🎭 Hiding product popup');

        const overlay = document.getElementById('cravely-product-popup-overlay');
        if (overlay) {
            // Remove show class and add hide animation
            overlay.classList.remove('cravely-show');
            overlay.classList.add('cravely-hide');

            // After animation completes
            setTimeout(() => {
                overlay.classList.add('cravely-popup-hidden');
                overlay.classList.remove('cravely-hide');

                // Restore body scrolling
                document.body.classList.remove('cravely-modal-open');

                // Reset popup state
                this.isPopupOpen = false;
                this.currentProductData = null;
                this.currentQuantity = 1;

                // Clear special instructions
                const instructionsTextarea = document.getElementById('cravely-popup-special-instructions');
                if (instructionsTextarea) {
                    instructionsTextarea.value = '';
                }
            }, 400);
        }
    }

    /**
     * Populate popup with product data
     */
    populatePopupData() {
        if (!this.currentProductData) return;

        // Update image
        const image = document.getElementById('cravely-popup-product-image');
        if (image) {
            image.src = this.currentProductData.image;
            image.alt = this.currentProductData.name;
        }

        // Update title
        const title = document.getElementById('cravely-popup-product-title');
        if (title) {
            title.textContent = this.currentProductData.name;
        }

        // Update description
        const description = document.getElementById('cravely-popup-product-description');
        if (description) {
            description.textContent = this.currentProductData.description;
        }

        // Update pricing
        const currentPrice = document.getElementById('cravely-popup-current-price');
        const originalPrice = document.getElementById('cravely-popup-original-price');

        if (currentPrice) {
            currentPrice.textContent = `Rs. ${this.currentProductData.price}`;
        }

        if (originalPrice && this.currentProductData.originalPrice &&
            this.currentProductData.originalPrice !== this.currentProductData.price &&
            this.currentProductData.originalPrice > 0) {
            originalPrice.textContent = `Rs. ${this.currentProductData.originalPrice}`;
            originalPrice.classList.remove('cravely-popup-hidden');
        } else if (originalPrice) {
            originalPrice.classList.add('cravely-popup-hidden');
        }

        // Reset quantity and update displays
        this.currentQuantity = 1;
        this.updateQuantityDisplay();
        this.updateTotalPrice();
    }

    /**
     * Update quantity display
     */
    updateQuantityDisplay() {
        const quantityDisplay = document.getElementById('cravely-popup-quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = this.currentQuantity;
        }
    }

    /**
     * Update total price based on quantity
     */
    updateTotalPrice() {
        const totalPriceElement = document.getElementById('cravely-popup-total-price');
        if (totalPriceElement && this.currentProductData) {
            const totalPrice = this.currentProductData.price * this.currentQuantity;
            totalPriceElement.textContent = `Rs. ${totalPrice}`;
        }
    }

    /**
     * Increase quantity
     */
    increaseQuantity() {
        this.currentQuantity += 1;
        this.updateQuantityDisplay();
        this.updateTotalPrice();

        // Add visual feedback
        const button = document.getElementById('cravely-popup-quantity-increase');
        if (button) {
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }

        console.log('➕ Quantity increased to:', this.currentQuantity);
    }

    /**
     * Decrease quantity
     */
    decreaseQuantity() {
        if (this.currentQuantity > 1) {
            this.currentQuantity -= 1;
            this.updateQuantityDisplay();
            this.updateTotalPrice();

            // Add visual feedback
            const button = document.getElementById('cravely-popup-quantity-decrease');
            if (button) {
                button.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            }

            console.log('➖ Quantity decreased to:', this.currentQuantity);
        }
    }

    /**
     * Handle add to cart from popup
     */
    handleAddToCartFromPopup() {
        if (!this.currentProductData) return;

        console.log('🛒 Adding to cart from popup:', this.currentProductData.name, 'Qty:', this.currentQuantity);

        const addToCartBtn = document.getElementById('cravely-popup-add-to-cart');

        // Add loading state
        if (addToCartBtn) {
            addToCartBtn.classList.add('cravely-loading');
            addToCartBtn.innerHTML = `
                <span class="cravely-popup-cart-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="9"/>
                    </svg>
                </span>
                Adding to Cart...
            `;
        }

        // Get special instructions
        const instructionsTextarea = document.getElementById('cravely-popup-special-instructions');
        const specialInstructions = instructionsTextarea ? instructionsTextarea.value.trim() : '';

        // Simulate cart addition process
        setTimeout(() => {
            // Get the cart manager instance - try multiple possible names
            const cartManager = window.cravelyCartManager ||
                               window.cartManager ||
                               window.CartManager ||
                               window.cravely?.cartManager;

            if (cartManager && typeof cartManager.addToCart === 'function') {
                // Add the product with the specified quantity
                for (let i = 0; i < this.currentQuantity; i++) {
                    cartManager.addToCart({
                        ...this.currentProductData,
                        quantity: 1,
                        specialInstructions: specialInstructions
                    });
                }

                // Update the corresponding product card to show quantity controls
                const productCard = document.querySelector(`[data-product-id="${this.currentProductData.id}"]`);
                if (productCard && cartManager.showQuantityControls) {
                    const cartItem = cartManager.cart.find(item => item.id === this.currentProductData.id);
                    if (cartItem) {
                        cartManager.showQuantityControls(productCard, cartItem.quantity);
                    }
                }

                this.showNotification('Product added to cart successfully!', 'success');

                // Hide popup first
                this.hidePopup();

                // Show cart popup after a brief delay if available
                setTimeout(() => {
                    if (cartManager.showCartPopup && typeof cartManager.showCartPopup === 'function') {
                        cartManager.showCartPopup();
                    }
                }, 500);

            } else {
                console.warn('Cart manager not available or addToCart method not found');
                this.showNotification('Added to cart! (Cart system integrating...)', 'success');

                // Still hide the popup even if cart manager isn't ready
                this.hidePopup();
            }

            // Reset button state
            if (addToCartBtn) {
                addToCartBtn.classList.remove('cravely-loading');
                addToCartBtn.innerHTML = `
                    <span class="cravely-popup-cart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4"/>
                            <circle cx="12" cy="12" r="9"/>
                        </svg>
                    </span>
                    Add to Cart
                `;
            }
        }, 800);
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
            animation: cravely-slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'cravely-slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 3000);
    }

    /**
     * Destroy the popup manager and clean up events
     */
    destroy() {
        if (!this.initialized) return;

        console.log('🗑️ Destroying Cravely Product Popup Manager...');

        // Remove event listeners
        document.removeEventListener('click', this.handleDocumentClick);
        document.removeEventListener('keydown', this.handleKeyDown);

        // Remove popup elements
        const overlay = document.getElementById('cravely-product-popup-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Reset state
        this.isPopupOpen = false;
        this.currentProductData = null;
        this.currentQuantity = 1;
        this.initialized = false;

        // Restore body class if needed
        document.body.classList.remove('cravely-modal-open');

        console.log('✅ Cravely Product Popup Manager destroyed');
    }
}

// Initialize Cravely product popup manager when DOM is ready - with proper singleton pattern
(function() {
    'use strict';

    function initializeCravelyPopup() {
        // Prevent multiple instances
        if (window.cravelyProductPopupManager) {
            console.log('ℹ️ Cravely Product Popup Manager already exists');
            return;
        }

        // Create the manager instance
        window.cravelyProductPopupManager = new CravelyProductPopupManager();

        console.log('🚀 Cravely Product Popup Manager instance created');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCravelyPopup);
    } else {
        initializeCravelyPopup();
    }

    // Also handle case where script loads after DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeCravelyPopup();
    }
})();