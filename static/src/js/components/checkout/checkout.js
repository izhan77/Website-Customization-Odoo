/**
 * ================================= CHECKOUT PAGE JAVASCRIPT =================================
 * Complete checkout functionality with form validation, payment handling, and order processing
 * UPDATED: Added order type detection and conditional field display
 * File: /website_customizations/static/src/js/components/checkout/checkout.js
 */

class CheckoutManager {
    constructor() {
        // State management
        this.cartData = null;
        this.orderData = {};
        this.paymentMethod = 'cash';
        this.formValid = false;
        this.deliveryFee = 200;
        this.taxRate = 0.15;
        
        // Order type detection
        this.orderType = 'delivery'; // default
        this.isDeliveryOrder = true;

        // Initialize when DOM is ready
        this.init();
    }

    /**
     * Initialize the checkout system
     */
    init() {
        console.log('🛒 Initializing Checkout Manager...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    /**
     * Setup all checkout functionality
     */
    setup() {
        this.detectOrderType();
        this.loadCartData();
        this.populateOrderSummary();
        this.setupOrderTypeUI();
        this.bindEventListeners();
        this.initializeFormValidation();
        this.setupPaymentToggle();
        this.setupCardFormatting();
        console.log('✅ Checkout Manager initialized successfully');
    }

    /**
     * Detect order type from URL parameters
     */
    detectOrderType() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderTypeParam = urlParams.get('order_type');
        
        if (orderTypeParam) {
            this.orderType = orderTypeParam;
            this.isDeliveryOrder = orderTypeParam === 'delivery';
        } else {
            // Check if order method selector has stored data
            const storedOrderData = sessionStorage.getItem('orderMethodSelected');
            if (storedOrderData) {
                try {
                    const parsedData = JSON.parse(storedOrderData);
                    this.orderType = parsedData.type || 'delivery';
                    this.isDeliveryOrder = this.orderType === 'delivery';
                } catch (e) {
                    console.warn('Failed to parse stored order data:', e);
                }
            }
        }

        console.log('🎯 Order type detected:', this.orderType);
        console.log('🚚 Is delivery order:', this.isDeliveryOrder);
    }

    /**
     * Setup UI based on order type
     */
    setupOrderTypeUI() {
        console.log('🎨 Setting up UI for order type:', this.orderType);

        // Hide/show address fields based on order type
        this.toggleAddressFields();
        
        // Update payment method text
        this.updatePaymentMethodText();
        
        // Update delivery fee based on order type
        this.updateDeliveryFee();
    }

    /**
     * Toggle address fields visibility based on order type
     */
    toggleAddressFields() {
        const fieldsToHide = [
            'customer-country',
            'customer-state', 
            'customer-zipcode',
            'customer-address'
        ];

        fieldsToHide.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const formGroup = field?.closest('.form-group');
            const formRow = field?.closest('.form-row');
            
            if (!this.isDeliveryOrder) {
                // Hide field and its container
                if (formGroup) {
                    formGroup.style.display = 'none';
                    // Remove required attribute for pickup orders
                    if (field) {
                        field.removeAttribute('required');
                    }
                }
                
                // Hide entire form row if all fields in it are hidden
                if (formRow) {
                    const visibleFields = Array.from(formRow.querySelectorAll('.form-group'))
                        .filter(group => group.style.display !== 'none');
                    
                    if (visibleFields.length === 0) {
                        formRow.style.display = 'none';
                    }
                }
            } else {
                // Show field for delivery orders
                if (formGroup) {
                    formGroup.style.display = '';
                    // Add back required attribute for delivery orders
                    if (field) {
                        field.setAttribute('required', 'required');
                    }
                }
                
                if (formRow) {
                    formRow.style.display = '';
                }
            }
        });

        // Update section titles and descriptions
        const customerInfoSection = document.querySelector('.customer-info-section .section-title');
        if (customerInfoSection) {
            customerInfoSection.textContent = this.isDeliveryOrder 
                ? 'Customer Information' 
                : 'Customer Information';
        }

        console.log(`${this.isDeliveryOrder ? '🚚' : '🏪'} Address fields ${this.isDeliveryOrder ? 'shown' : 'hidden'}`);
    }

    /**
     * Update payment method text based on order type
     */
    updatePaymentMethodText() {
        const cashPaymentLabel = document.querySelector('label[for="payment-cash"] .payment-text');
        if (cashPaymentLabel) {
            cashPaymentLabel.textContent = this.isDeliveryOrder 
                ? 'Cash on Delivery' 
                : 'Pay with Cash on Counter';
        }

        console.log(`💳 Payment text updated to: ${this.isDeliveryOrder ? 'Cash on Delivery' : 'Pay with Cash on Counter'}`);
    }

    /**
     * Update delivery fee based on order type
     */
    updateDeliveryFee() {
        if (!this.isDeliveryOrder) {
            this.deliveryFee = 0; // No delivery fee for pickup orders
            
            // Update the UI label
            const shippingLabel = document.querySelector('.summary-row .summary-label');
            if (shippingLabel && shippingLabel.textContent.includes('Shipping')) {
                shippingLabel.textContent = 'Service Fee';
            }
        }

        console.log(`💰 ${this.isDeliveryOrder ? 'Delivery' : 'Service'} fee set to: Rs. ${this.deliveryFee}`);
    }

    /**
     * Load cart data from sessionStorage or fallback
     */
    loadCartData() {
        try {
            // Try to get cart data from sessionStorage (set by cart system)
            const storedCart = sessionStorage.getItem('checkoutCart');
            if (storedCart) {
                this.cartData = JSON.parse(storedCart);
                console.log('📦 Cart data loaded from storage:', this.cartData);
                this.recalculateTotals();
                return;
            }

            // Fallback: Get from window.cartManager if available
            if (window.cartManager && typeof window.cartManager.getCart === 'function') {
                const cartInfo = window.cartManager.getCart();
                this.cartData = {
                    items: cartInfo.items,
                    subtotal: cartInfo.total,
                    tax: Math.round(cartInfo.total * this.taxRate),
                    deliveryFee: this.deliveryFee,
                    grandTotal: cartInfo.total + Math.round(cartInfo.total * this.taxRate) + this.deliveryFee
                };
                console.log('📦 Cart data loaded from cartManager:', this.cartData);
                return;
            }

            // Final fallback: Demo data
            const demoSubtotal = 2549;
            this.cartData = {
                items: [
                    {
                        id: 'demo-1',
                        name: 'Chicken Biryani Box',
                        price: 950,
                        quantity: 1,
                        image: '/website_customizations/static/src/images/product_1.jpg'
                    },
                    {
                        id: 'demo-2',
                        name: 'Turkish Kebab Platter',
                        price: 1599,
                        quantity: 1,
                        image: '/website_customizations/static/src/images/product_1.jpg'
                    }
                ],
                subtotal: demoSubtotal,
                tax: Math.round(demoSubtotal * this.taxRate),
                deliveryFee: this.deliveryFee,
                grandTotal: demoSubtotal + Math.round(demoSubtotal * this.taxRate) + this.deliveryFee
            };
            console.log('📦 Using demo cart data:', this.cartData);

        } catch (error) {
            console.error('Error loading cart data:', error);
            this.cartData = { 
                items: [], 
                subtotal: 0, 
                tax: 0, 
                deliveryFee: this.deliveryFee, 
                grandTotal: this.deliveryFee 
            };
        }
    }

    /**
     * Recalculate totals based on order type
     */
    recalculateTotals() {
        if (!this.cartData) return;

        this.cartData.deliveryFee = this.deliveryFee;
        this.cartData.grandTotal = this.cartData.subtotal + this.cartData.tax + this.deliveryFee;
        
        console.log('🔢 Totals recalculated:', {
            subtotal: this.cartData.subtotal,
            tax: this.cartData.tax,
            deliveryFee: this.cartData.deliveryFee,
            grandTotal: this.cartData.grandTotal
        });
    }

    /**
     * Populate order summary with cart data
     */
    populateOrderSummary() {
        if (!this.cartData) return;

        // Update main total display
        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) {
            checkoutTotal.textContent = `Rs. ${this.cartData.grandTotal}`;
        }

        // Populate order items
        const orderItemsContainer = document.getElementById('checkout-order-items');
        if (orderItemsContainer && this.cartData.items) {
            orderItemsContainer.innerHTML = this.cartData.items.map(item => `
                <div class="order-item">
                    <div class="item-image">
                        <img src="${item.image || '/website_customizations/static/src/images/product_1.jpg'}"
                             alt="${item.name}" loading="lazy"/>
                    </div>
                    <div class="item-details">
                        <h4 class="item-name">${item.name}</h4>
                        <p class="item-quantity-price">Qty: ${item.quantity} × Rs. ${item.price}</p>
                    </div>
                    <div class="item-total">Rs. ${item.price * item.quantity}</div>
                </div>
            `).join('');
        }

        // Update summary calculations
        document.getElementById('checkout-subtotal').textContent = `Rs. ${this.cartData.subtotal}`;
        document.getElementById('checkout-shipping').textContent = `Rs. ${this.cartData.deliveryFee}`;
        document.getElementById('checkout-tax').textContent = `Rs. ${this.cartData.tax}`;
        document.getElementById('checkout-final-total').textContent = `Rs. ${this.cartData.grandTotal}`;

        // Update shipping label based on order type
        const shippingLabelElement = document.querySelector('.summary-row .summary-label');
        if (shippingLabelElement && shippingLabelElement.textContent.includes('Shipping')) {
            shippingLabelElement.textContent = this.isDeliveryOrder ? 'Shipping' : 'Service Fee';
        }
    }

    /**
     * Bind all event listeners
     */
    bindEventListeners() {
        // Payment method change
        document.addEventListener('change', (e) => {
            if (e.target.name === 'payment-method') {
                this.handlePaymentMethodChange(e.target.value);
            }
        });

        // Form submission
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                this.handlePlaceOrder(e);
            });
        }

        // Modal close events
        const closeConfirmationBtn = document.getElementById('close-confirmation-btn');
        const viewMenuBtn = document.getElementById('view-menu-btn');
        const trackOrderBtn = document.getElementById('track-order-btn');

        if (closeConfirmationBtn) {
            closeConfirmationBtn.addEventListener('click', () => {
                this.hideOrderConfirmation();
            });
        }

        if (viewMenuBtn) {
            viewMenuBtn.addEventListener('click', () => {
                this.redirectToMenu();
            });
        }

        if (trackOrderBtn) {
            trackOrderBtn.addEventListener('click', () => {
                this.handleTrackOrder();
            });
        }

        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('confirmation-modal-overlay')) {
                this.hideOrderConfirmation();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideOrderConfirmation();
            }
        });
    }

    /**
     * Handle payment method change
     */
    handlePaymentMethodChange(method) {
        this.paymentMethod = method;
        const onlineDetails = document.querySelector('.online-payment-details');

        // Update payment option styling
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });

        const selectedOption = document.querySelector(`[data-payment="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Show/hide online payment details
        if (method === 'online' && onlineDetails) {
            onlineDetails.style.display = 'block';
            onlineDetails.classList.add('fade-in');
            this.makeCardFieldsRequired(true);
        } else if (onlineDetails) {
            onlineDetails.style.display = 'none';
            onlineDetails.classList.remove('fade-in');
            this.makeCardFieldsRequired(false);
        }

        console.log('💳 Payment method changed to:', method);
    }

    /**
     * Make card fields required or optional
     */
    makeCardFieldsRequired(required) {
        const cardFields = [
            'card-number',
            'card-expiry',
            'card-cvv',
            'card-name',
            'bank-select'
        ];

        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (required) {
                    field.setAttribute('required', 'required');
                } else {
                    field.removeAttribute('required');
                }
            }
        });
    }

    /**
     * Setup card number formatting and validation
     */
    setupCardFormatting() {
        const cardNumberInput = document.getElementById('card-number');
        const cardExpiryInput = document.getElementById('card-expiry');
        const cardCvvInput = document.getElementById('card-cvv');

        // Card number formatting
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
                this.detectCardType(value);
            });
        }

        // Expiry date formatting
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV numeric only
        if (cardCvvInput) {
            cardCvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    }

    /**
     * Detect and display card type
     */
    detectCardType(cardNumber) {
        const cardTypeIndicator = document.querySelector('.card-type-indicator');
        if (!cardTypeIndicator) return;

        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (cleanNumber.startsWith('4')) {
            cardTypeIndicator.className = 'card-type-indicator visa';
        } else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) {
            cardTypeIndicator.className = 'card-type-indicator mastercard';
        } else {
            cardTypeIndicator.className = 'card-type-indicator';
        }
    }

    /**
     * Initialize form validation
     */
    initializeFormValidation() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldId = field.id;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(field);

        // Skip validation if field is not required or hidden
        if (!field.hasAttribute('required') || field.closest('.form-group')?.style.display === 'none') {
            return true;
        }

        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Specific validation rules
        switch (fieldType) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'tel':
                const phoneRegex = /^\d{10,15}$/;
                if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
        }

        // Field-specific validation
        switch (fieldId) {
            case 'card-number':
                if (value && value.replace(/\s/g, '').length < 13) {
                    isValid = false;
                    errorMessage = 'Please enter a valid card number';
                }
                break;

            case 'card-expiry':
                if (value && !/^\d{2}\/\d{2}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter MM/YY format';
                }
                break;

            case 'card-cvv':
                if (value && (value.length < 3 || value.length > 4)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid CVV';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.showFieldSuccess(field);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        field.parentNode.appendChild(errorSpan);
    }

    /**
     * Show field success
     */
    showFieldSuccess(field) {
        field.classList.add('success');
        field.classList.remove('error');
        this.clearFieldError(field);
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const form = document.getElementById('checkout-form');
        if (!form) return false;

        let allValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            // Skip hidden fields
            if (field.closest('.form-group')?.style.display === 'none') {
                return;
            }
            
            if (!this.validateField(field)) {
                allValid = false;
            }
        });

        // Additional validation for online payments
        if (this.paymentMethod === 'online') {
            const cardFields = ['card-number', 'card-expiry', 'card-cvv', 'card-name', 'bank-select'];
            cardFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !this.validateField(field)) {
                    allValid = false;
                }
            });
        }

        this.formValid = allValid;
        return allValid;
    }

    /**
     * Handle place order button click
     */
    async handlePlaceOrder(event) {
        event.preventDefault();

        console.log('📝 Processing order...');

        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        // Show loading state
        this.setPlaceOrderLoading(true);

        try {
            // Collect form data
            this.collectOrderData();

            // Simulate API call delay
            await this.processOrder();

            // Show success
            this.showOrderConfirmation();

        } catch (error) {
            console.error('Order processing error:', error);
            this.showNotification('Failed to process order. Please try again.', 'error');
        } finally {
            this.setPlaceOrderLoading(false);
        }
    }

    /**
     * Collect all form data
     */
    collectOrderData() {
        this.orderData = {
            // Customer information
            customerName: document.getElementById('customer-name')?.value?.trim(),
            customerPhone: document.getElementById('customer-phone')?.value?.trim(),
            customerEmail: document.getElementById('customer-email')?.value?.trim(),

            // Order type information
            orderType: this.orderType,
            isDeliveryOrder: this.isDeliveryOrder,

            // Conditional address fields (only for delivery)
            ...(this.isDeliveryOrder && {
                customerCountry: document.getElementById('customer-country')?.value,
                customerState: document.getElementById('customer-state')?.value,
                customerZipcode: document.getElementById('customer-zipcode')?.value?.trim(),
                customerAddress: document.getElementById('customer-address')?.value?.trim(),
            }),

            // Payment information
            paymentMethod: this.paymentMethod,

            // Order details
            items: this.cartData.items,
            subtotal: this.cartData.subtotal,
            tax: this.cartData.tax,
            deliveryFee: this.cartData.deliveryFee,
            grandTotal: this.cartData.grandTotal,

            // Metadata
            orderDate: new Date().toLocaleDateString(),
            orderTime: new Date().toLocaleTimeString(),
            orderId: this.generateOrderId(),

            // Card details (if online payment)
            ...(this.paymentMethod === 'online' && {
                cardNumber: document.getElementById('card-number')?.value?.replace(/\s/g, ''),
                cardExpiry: document.getElementById('card-expiry')?.value,
                cardName: document.getElementById('card-name')?.value?.trim(),
                selectedBank: document.getElementById('bank-select')?.value
            })
        };

        console.log('Order data collected:', this.orderData);
    }

    /**
     * Process the order (simulate API call)
     */
    async processOrder() {
        return new Promise((resolve, reject) => {
            // Simulate processing time
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) { // 90% success rate
                    console.log('Order processed successfully');

                    // Store order in sessionStorage for tracking
                    sessionStorage.setItem('lastOrder', JSON.stringify(this.orderData));

                    // Clear cart data
                    sessionStorage.removeItem('checkoutCart');

                    resolve(this.orderData);
                } else {
                    reject(new Error('Payment processing failed'));
                }
            }, 2000);
        });
    }

    /**
     * Generate unique order ID
     */
    generateOrderId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `#${timestamp}${random}`;
    }

    /**
     * Set loading state for place order button
     */
    setPlaceOrderLoading(loading) {
        const button = document.getElementById('place-order-btn');
        if (!button) return;

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    /**
     * Show order confirmation modal
     */
    showOrderConfirmation() {
        const modal = document.getElementById('order-confirmation-modal');
        if (!modal) return;

        // Populate confirmation details
        document.getElementById('confirmation-order-id').textContent = this.orderData.orderId;
        document.getElementById('confirmation-total').textContent = `Rs. ${this.orderData.grandTotal}`;
        document.getElementById('confirmation-payment').textContent = this.getPaymentMethodDisplayText();

        // Calculate estimated delivery/pickup time
        const estimatedTime = this.calculateEstimatedTime();
        document.getElementById('confirmation-delivery').textContent = estimatedTime;

        // Show modal with animation
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log('Order confirmation displayed');
    }

    /**
     * Get payment method display text
     */
    getPaymentMethodDisplayText() {
        if (this.paymentMethod === 'cash') {
            return this.isDeliveryOrder ? 'Cash on Delivery' : 'Pay with Cash on Counter';
        }
        return 'Online Payment';
    }

    /**
     * Hide order confirmation modal
     */
    hideOrderConfirmation() {
        const modal = document.getElementById('order-confirmation-modal');
        if (!modal) return;

        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 400);

        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Calculate estimated delivery/pickup time
     */
    calculateEstimatedTime() {
        const now = new Date();
        const estimatedMinutes = this.isDeliveryOrder ? 35 : 15; // Pickup is faster
        const estimatedTime = new Date(now.getTime() + (estimatedMinutes * 60 * 1000));

        const timeString = estimatedTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const timeRange = this.isDeliveryOrder ? '35-45 minutes' : '15-20 minutes';
        const action = this.isDeliveryOrder ? 'delivery' : 'pickup';

        return `${timeString} (${timeRange} for ${action})`;
    }

    /**
     * Handle view menu button click
     */
    redirectToMenu() {
        this.hideOrderConfirmation();

        // Redirect to homepage or menu section
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    }

    /**
     * Handle track order button click
     */
    handleTrackOrder() {
        this.hideOrderConfirmation();

        // Show track order functionality
        const trackMessage = this.isDeliveryOrder 
            ? 'Order tracking will be available soon! We will notify you via SMS.'
            : 'Your order is being prepared! We will notify you when it\'s ready for pickup.';
            
        this.showNotification(trackMessage, 'success');

        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.checkout-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `checkout-notification ${type}`;

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

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInNotification 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 5000);
    }

    /**
     * Public API methods
     */
    getOrderData() {
        return this.orderData;
    }

    getOrderType() {
        return this.orderType;
    }

    isDelivery() {
        return this.isDeliveryOrder;
    }

    resetForm() {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.reset();
        }

        // Reset payment method
        document.getElementById('payment-cash').checked = true;
        this.handlePaymentMethodChange('cash');

        // Clear all validation states
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
            this.clearFieldError(field);
            field.classList.remove('success', 'error');
        });
    }
}

// Initialize checkout manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on checkout page
    if (document.querySelector('.checkout-page-wrapper')) {
        if (!window.checkoutManager) {
            window.checkoutManager = new CheckoutManager();
        }
    }
});

// Also handle case where DOM is already loaded
if (document.readyState !== 'loading' && document.querySelector('.checkout-page-wrapper')) {
    if (!window.checkoutManager) {
        window.checkoutManager = new CheckoutManager();
    }
}