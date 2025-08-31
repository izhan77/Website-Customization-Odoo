/**
 * ================================= PRODUCT POPUP MODAL SYSTEM =================================
 * Handles product card clicks to show detailed product popup modal
 * Integrates seamlessly with existing cart system
 * File: /website_customizations/static/src/js/components/product_popup/product_popup.js
 */

class ProductPopupManager {
    constructor() {
        this.isPopupOpen = false;
        this.currentProductData = null;
        this.currentQuantity = 1;
        this.cartManager = null;

        this.init();
    }

    /**
     * Initialize the popup system
     */
    init() {
        console.log('🎯 Initializing Product Popup Manager...');

        // Wait for DOM and cart manager to be ready
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
        // Wait a bit for cart manager to initialize
        setTimeout(() => {
            this.cartManager = window.cartManager;
            this.createPopupElements();
            this.bindEvents();
            console.log('✅ Product Popup Manager initialized');
        }, 100);
    }

    /**
     * Create popup elements if they don't exist
     */
    createPopupElements() {
        // Check if popup already exists
        if (document.getElementById('product-popup-overlay')) {
            return;
        }

        console.log('🏗️ Creating product popup elements...');

        const popupHTML = `
            <div id="product-popup-overlay" class="product-popup-overlay hidden">
                <div id="product-popup-modal" class="product-popup-modal">
                    <button id="close-product-popup" class="close-product-popup">
                        <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="product-popup-content">
                        <!-- Left Side: Product Image -->
                        <div class="product-popup-image-section">
                            <div class="product-popup-image-container">
                                <img id="popup-product-image"
                                     src="/website_customizations/static/src/images/product_1.jpg"
                                     alt="Product Image"
                                     loading="lazy"/>
                            </div>
                        </div>

                        <!-- Right Side: Product Details -->
                        <div class="product-popup-details-section">
                            <h2 id="popup-product-title" class="popup-product-title">Product Name</h2>

                            <p id="popup-product-description" class="popup-product-description">
                                Product description will appear here
                            </p>

                            <div class="popup-pricing-section">
                                <div class="popup-price-container">
                                    <span id="popup-original-price" class="popup-original-price hidden">Rs. 0</span>
                                    <span id="popup-current-price" class="popup-current-price">Rs. 0</span>
                                </div>
                            </div>

                            <div class="special-instructions-section">
                                <label for="popup-special-instructions" class="instructions-label">
                                    Special Instructions
                                </label>
                                <textarea id="popup-special-instructions"
                                          class="instructions-textarea"
                                          placeholder="Please enter instructions about this item"
                                          rows="3"></textarea>
                            </div>

                            <div class="popup-cart-section">
                                <div class="popup-quantity-controls">
                                    <button id="popup-quantity-decrease" class="popup-quantity-btn decrease">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>

                                    <span id="popup-quantity-display" class="popup-quantity-display">1</span>

                                    <button id="popup-quantity-increase" class="popup-quantity-btn increase">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>
                                </div>

                                <div class="popup-total-price-section">
                                    <span id="popup-total-price" class="popup-total-price">Rs. 0</span>
                                </div>

                                <button id="popup-add-to-cart" class="popup-add-to-cart-btn">
                                    <span class="popup-cart-icon">
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
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        console.log('🎯 Binding popup events...');

        // Product card click events
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.closest('.add-to-cart-btn, .quantity-controls-bar')) {
                this.handleProductCardClick(productCard);
            }
        });

        // Close popup events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'product-popup-overlay' || e.target.closest('#close-product-popup')) {
                this.hidePopup();
            }
        });

        // Popup quantity controls
        document.addEventListener('click', (e) => {
            if (e.target.closest('#popup-quantity-increase')) {
                this.increaseQuantity();
            }
            if (e.target.closest('#popup-quantity-decrease')) {
                this.decreaseQuantity();
            }
        });

        // Add to cart from popup
        document.addEventListener('click', (e) => {
            if (e.target.closest('#popup-add-to-cart')) {
                this.handleAddToCartFromPopup();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPopupOpen) {
                this.hidePopup();
            }
        });

        // Prevent popup close when clicking inside modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('#product-popup-modal')) {
                e.stopPropagation();
            }
        });
    }

    /**
     * Handle product card click
     */
    handleProductCardClick(productCard) {
        console.log('📦 Product card clicked');

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
            id: productCard.getAttribute('data-product-id'),
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
                   '/website_customizations/static/src/images/product_1.jpg',
            description: productCard.querySelector('.product-description')?.textContent?.trim() ||
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
        const overlay = document.getElementById('product-popup-overlay');
        if (overlay) {
            // Prevent body scrolling
            document.body.classList.add('modal-open');

            // Show overlay
            overlay.classList.remove('hidden');

            // Trigger animation after a brief delay
            setTimeout(() => {
                overlay.classList.add('show');
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

        const overlay = document.getElementById('product-popup-overlay');
        if (overlay) {
            // Remove show class and add hide animation
            overlay.classList.remove('show');
            overlay.classList.add('hide');

            // After animation completes
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('hide');

                // Restore body scrolling
                document.body.classList.remove('modal-open');

                // Reset popup state
                this.isPopupOpen = false;
                this.currentProductData = null;
                this.currentQuantity = 1;

                // Clear special instructions
                const instructionsTextarea = document.getElementById('popup-special-instructions');
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
        const image = document.getElementById('popup-product-image');
        if (image) {
            image.src = this.currentProductData.image;
            image.alt = this.currentProductData.name;
        }

        // Update title
        const title = document.getElementById('popup-product-title');
        if (title) {
            title.textContent = this.currentProductData.name;
        }

        // Update description
        const description = document.getElementById('popup-product-description');
        if (description) {
            description.textContent = this.currentProductData.description;
        }

        // Update pricing
        const currentPrice = document.getElementById('popup-current-price');
        const originalPrice = document.getElementById('popup-original-price');

        if (currentPrice) {
            currentPrice.textContent = `Rs. ${this.currentProductData.price}`;
        }

        if (originalPrice && this.currentProductData.originalPrice &&
            this.currentProductData.originalPrice !== this.currentProductData.price) {
            originalPrice.textContent = `Rs. ${this.currentProductData.originalPrice}`;
            originalPrice.classList.remove('hidden');
        } else if (originalPrice) {
            originalPrice.classList.add('hidden');
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
        const quantityDisplay = document.getElementById('popup-quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = this.currentQuantity;
        }
    }

    /**
     * Update total price based on quantity
     */
    updateTotalPrice() {
        const totalPriceElement = document.getElementById('popup-total-price');
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
        const button = document.getElementById('popup-quantity-increase');
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
            const button = document.getElementById('popup-quantity-decrease');
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

        const addToCartBtn = document.getElementById('popup-add-to-cart');

        // Add loading state
        if (addToCartBtn) {
            addToCartBtn.classList.add('loading');
            addToCartBtn.innerHTML = `
                <span class="popup-cart-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="9"/>
                    </svg>
                </span>
                Adding to Cart...
            `;
        }

        // Get special instructions
        const instructionsTextarea = document.getElementById('popup-special-instructions');
        const specialInstructions = instructionsTextarea ? instructionsTextarea.value.trim() : '';

        // Prepare product data with quantity and instructions
        const productToAdd = {
            ...this.currentProductData,
            quantity: this.currentQuantity,
            specialInstructions: specialInstructions
        };

        // Add to cart using cart manager
        setTimeout(() => {
            if (this.cartManager) {
                // Add the product with the specified quantity
                for (let i = 0; i < this.currentQuantity; i++) {
                    this.cartManager.addToCart({
                        ...this.currentProductData,
                        quantity: 1,
                        specialInstructions: specialInstructions
                    });
                }

                // Update the corresponding product card to show quantity controls
                const productCard = document.querySelector(`[data-product-id="${this.currentProductData.id}"]`);
                if (productCard) {
                    const cartItem = this.cartManager.cart.find(item => item.id === this.currentProductData.id);
                    if (cartItem) {
                        this.cartManager.showQuantityControls(productCard, cartItem.quantity);
                    }
                }

                // Hide popup first
                this.hidePopup();

                // Show cart popup after a brief delay
                setTimeout(() => {
                    this.cartManager.showCartPopup();
                }, 500);

            } else {
                console.error('Cart manager not available');
                this.showNotification('Cart system not ready. Please try again.', 'error');
            }

            // Reset button state
            if (addToCartBtn) {
                addToCartBtn.classList.remove('loading');
                addToCartBtn.innerHTML = `
                    <span class="popup-cart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4"/>
                            <circle cx="12" cy="12" r="9"/>
                        </svg>
                    </span>
                    Add to Cart
                `;
            }
        }, 600);
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

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 3000);
    }

    /**
     * Extract numeric price from text
     */
    extractPrice(priceText) {
        if (!priceText) return 0;
        const matches = priceText.toString().replace(/[^\d]/g, '');
        return parseInt(matches) || 0;
    }
}

// Initialize product popup manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!window.productPopupManager) {
        window.productPopupManager = new ProductPopupManager();
    }
});

// Also handle case where DOM is already loaded
if (document.readyState !== 'loading' && !window.productPopupManager) {
    window.productPopupManager = new ProductPopupManager();
}