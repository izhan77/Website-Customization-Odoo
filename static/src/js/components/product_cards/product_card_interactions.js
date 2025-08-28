///**
// * Product Card Interactions
// * Handles all product card functionality including add to cart, quantity controls
// */
//
//class ProductCardInteractions {
//    constructor() {
//        this.cartManager = window.cartManager;
//        this.init();
//    }
//
//    init() {
//        console.log('🛍️ Initializing Product Card Interactions...');
//
//        // Wait for DOM to be fully ready
//        if (document.readyState === 'loading') {
//            document.addEventListener('DOMContentLoaded', () => {
//                this.setupEventListeners();
//            });
//        } else {
//            this.setupEventListeners();
//        }
//    }
//
//    setupEventListeners() {
//        // Add to cart button events
//        document.addEventListener('click', (e) => {
//            // Add to cart button
//            if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
//                this.handleAddToCart(e);
//            }
//
//            // Quantity increase button
//            if (e.target.classList.contains('quantity-increase-btn') || e.target.closest('.quantity-increase-btn')) {
//                this.handleQuantityIncrease(e);
//            }
//
//            // Quantity decrease button
//            if (e.target.classList.contains('quantity-decrease-btn') || e.target.closest('.quantity-decrease-btn')) {
//                this.handleQuantityDecrease(e);
//            }
//        });
//
//        console.log('✅ Product Card Interactions initialized');
//    }
//
//    handleAddToCart(event) {
//        event.preventDefault();
//        event.stopPropagation();
//
//        const button = event.target.closest('.add-to-cart-btn');
//        const productCard = button.closest('.product-card');
//
//        if (!productCard) {
//            console.warn('Product card not found');
//            return;
//        }
//
//        const productData = this.getProductDataFromCard(productCard);
//
//        // Add loading state
//        this.setButtonLoadingState(button, true);
//
//        // Add to cart with brief delay for better UX
//        setTimeout(() => {
//            if (this.cartManager) {
//                this.cartManager.addToCart(productData);
//                this.showQuantityControls(productCard, 1);
//                this.cartManager.showCartPopup();
//            } else {
//                console.error('Cart manager not available');
//                // Fallback: Show a basic notification
//                this.showNotification('Item added to cart!', 'success');
//                this.showQuantityControls(productCard, 1);
//            }
//
//            this.setButtonLoadingState(button, false);
//        }, 300);
//    }
//
//    handleQuantityIncrease(event) {
//        event.preventDefault();
//        event.stopPropagation();
//
//        const button = event.target.closest('.quantity-increase-btn');
//        const productCard = button.closest('.product-card');
//        const productId = productCard.getAttribute('data-product-id');
//
//        if (this.cartManager) {
//            const cartItem = this.cartManager.cart.find(item => item.id === productId);
//            if (cartItem) {
//                cartItem.quantity += 1;
//                this.cartManager.updateCartTotals();
//                this.updateQuantityDisplay(productCard, cartItem.quantity);
//                this.cartManager.updateCartPopupDisplay();
//                this.cartManager.updateCartSidebarContent();
//                this.cartManager.showCartPopup();
//            }
//        } else {
//            // Fallback: Just update the UI
//            const quantityDisplay = productCard.querySelector('.quantity-display');
//            let quantity = parseInt(quantityDisplay.textContent) || 1;
//            quantity += 1;
//            quantityDisplay.textContent = quantity;
//            this.showNotification(`Quantity increased to ${quantity}`, 'info');
//        }
//    }
//
//    handleQuantityDecrease(event) {
//        event.preventDefault();
//        event.stopPropagation();
//
//        const button = event.target.closest('.quantity-decrease-btn');
//        const productCard = button.closest('.product-card');
//        const productId = productCard.getAttribute('data-product-id');
//
//        if (this.cartManager) {
//            const cartItemIndex = this.cartManager.cart.findIndex(item => item.id === productId);
//            if (cartItemIndex !== -1) {
//                const cartItem = this.cartManager.cart[cartItemIndex];
//
//                if (cartItem.quantity > 1) {
//                    cartItem.quantity -= 1;
//                    this.cartManager.updateCartTotals();
//                    this.updateQuantityDisplay(productCard, cartItem.quantity);
//                    this.cartManager.updateCartPopupDisplay();
//                    this.cartManager.updateCartSidebarContent();
//                } else {
//                    // Remove item from cart and show add to cart button
//                    this.cartManager.cart.splice(cartItemIndex, 1);
//                    this.cartManager.updateCartTotals();
//                    this.showAddToCartButton(productCard);
//                    this.cartManager.updateCartPopupDisplay();
//                    this.cartManager.updateCartSidebarContent();
//                    this.cartManager.updatePopularItems();
//
//                    if (this.cartManager.cart.length === 0) {
//                        this.cartManager.hideCartPopup();
//                    }
//                }
//            }
//        } else {
//            // Fallback: Just update the UI
//            const quantityDisplay = productCard.querySelector('.quantity-display');
//            let quantity = parseInt(quantityDisplay.textContent) || 1;
//
//            if (quantity > 1) {
//                quantity -= 1;
//                quantityDisplay.textContent = quantity;
//                this.showNotification(`Quantity decreased to ${quantity}`, 'info');
//            } else {
//                this.showAddToCartButton(productCard);
//                this.showNotification('Item removed from cart', 'info');
//            }
//        }
//    }
//
//    getProductDataFromCard(productCard) {
//        // Extract numeric price from text (e.g., "Rs. 999" → 999)
//        const extractPrice = (priceText) => {
//            if (!priceText) return 0;
//            const matches = priceText.toString().replace(/[^\d]/g, '');
//            return parseInt(matches) || 0;
//        };
//
//        const discountedPriceText = productCard.querySelector('.discounted-price')?.textContent || '0';
//        const originalPriceText = productCard.querySelector('.original-price')?.textContent || '0';
//
//        return {
//            id: productCard.getAttribute('data-product-id'),
//            name: productCard.getAttribute('data-name') || productCard.querySelector('.product-title')?.textContent?.trim() || 'Unknown Product',
//            price: extractPrice(discountedPriceText),
//            originalPrice: extractPrice(originalPriceText),
//            image: productCard.getAttribute('data-image') || productCard.querySelector('.product-image-container img')?.src || '/website_customizations/static/src/images/product_1.jpg',
//            description: productCard.querySelector('.product-description')?.textContent?.trim() || 'Fresh and delicious food',
//            category: productCard.getAttribute('data-category') || 'general',
//            quantity: 1
//        };
//    }
//
//    showQuantityControls(productCard, quantity = 1) {
//        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
//        const quantityBar = productCard.querySelector('.quantity-controls-bar');
//        const quantityDisplay = productCard.querySelector('.quantity-display');
//
//        if (addToCartBtn && quantityBar && quantityDisplay) {
//            addToCartBtn.classList.add('hidden');
//            quantityBar.classList.remove('hidden');
//            quantityBar.classList.add('show');
//            quantityDisplay.textContent = quantity;
//        }
//    }
//
//    showAddToCartButton(productCard) {
//        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
//        const quantityBar = productCard.querySelector('.quantity-controls-bar');
//
//        if (addToCartBtn && quantityBar) {
//            quantityBar.classList.remove('show');
//            quantityBar.classList.add('hide');
//
//            setTimeout(() => {
//                quantityBar.classList.add('hidden');
//                quantityBar.classList.remove('hide');
//                addToCartBtn.classList.remove('hidden');
//            }, 300);
//        }
//    }
//
//    updateQuantityDisplay(productCard, quantity) {
//        const quantityDisplay = productCard.querySelector('.quantity-display');
//        if (quantityDisplay) {
//            quantityDisplay.textContent = quantity;
//        }
//    }
//
//    setButtonLoadingState(button, loading) {
//        const addText = button.querySelector('.add-text');
//        const spinner = button.querySelector('.loading-spinner');
//
//        if (loading) {
//            button.disabled = true;
//            if (addText) addText.style.opacity = '0';
//            if (spinner) spinner.classList.remove('hidden');
//        } else {
//            button.disabled = false;
//            if (addText) addText.style.opacity = '1';
//            if (spinner) spinner.classList.add('hidden');
//        }
//    }
//
//    showNotification(message, type = 'info') {
//        const notification = document.createElement('div');
//        const colors = {
//            success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
//            error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
//            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
//            info: { bg: '#f0f9ff', border: '#7abfba', text: '#0c4a6e' }
//        };
//
//        const color = colors[type] || colors.info;
//
//        notification.style.cssText = `
//            position: fixed;
//            top: 20px;
//            right: 20px;
//            background: ${color.bg};
//            color: ${color.text};
//            padding: 16px 20px;
//            border-radius: 12px;
//            border-left: 4px solid ${color.border};
//            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//            z-index: 10001;
//            font-weight: 600;
//            max-width: 350px;
//            font-family: 'Montserrat', sans-serif;
//            animation: slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//        `;
//
//        // Add animation styles if not already added
//        if (!document.getElementById('notification-styles')) {
//            const style = document.createElement('style');
//            style.id = 'notification-styles';
//            style.textContent = `
//                @keyframes slideInNotification {
//                    from { transform: translateX(100%); opacity: 0; }
//                    to { transform: translateX(0); opacity: 1; }
//                }
//            `;
//            document.head.appendChild(style);
//        }
//
//        notification.textContent = message;
//        document.body.appendChild(notification);
//
//        setTimeout(() => {
//            notification.style.animation = 'slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
//            setTimeout(() => {
//                notification.remove();
//            }, 400);
//        }, 3000);
//    }
//}
//
//// Initialize when DOM is ready
//document.addEventListener('DOMContentLoaded', function() {
//    // Initialize product card interactions
//    window.productCardInteractions = new ProductCardInteractions();
//});