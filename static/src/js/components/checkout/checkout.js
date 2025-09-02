/**
 * ================================= CHECKOUT PAGE JAVASCRIPT =================================
 * Complete checkout functionality with Odoo sales order integration
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

        // User and order IDs from sessionStorage
        this.userId = null;
        this.orderId = null;

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
        this.loadStoredIds();
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
     * Detect order type from URL parameters and sessionStorage
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
     * Load user ID and order ID from sessionStorage
     */
    loadStoredIds() {
        try {
            const storedOrderData = sessionStorage.getItem('orderMethodSelected');
            if (storedOrderData) {
                const parsedData = JSON.parse(storedOrderData);
                this.userId = parsedData.userId || null;
                this.orderId = parsedData.orderId || null;

                console.log('👤 Loaded stored IDs - User:', this.userId, 'Order:', this.orderId);
            }
        } catch (e) {
            console.warn('Failed to load stored IDs:', e);
        }
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

        // Update order type indicator in UI if exists
        this.updateOrderTypeIndicator();
    }

    /**
     * Update order type indicator in UI
     */
    updateOrderTypeIndicator() {
        const orderTypeIndicator = document.getElementById('order-type-indicator');
        if (orderTypeIndicator) {
            orderTypeIndicator.textContent = this.isDeliveryOrder ? 'Delivery Order' : 'Pickup Order';
        }
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
                ? 'Delivery Information'
                : 'Pickup Information';
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

                // Extract order type from cart data if available
                if (this.cartData.orderType) {
                    this.orderType = this.cartData.orderType;
                    this.isDeliveryOrder = this.orderType === 'delivery';
                    console.log('🎯 Order type from cart data:', this.orderType);
                }

                // Extract user and order IDs from cart data if available
                if (this.cartData.userId) this.userId = this.cartData.userId;
                if (this.cartData.orderId) this.orderId = this.cartData.orderId;

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
     * Collect all form data - ENHANCED FOR ODOO with order type
     */
    collectOrderData() {
        this.orderData = {
            // Customer information
            customerName: document.getElementById('customer-name')?.value?.trim(),
            customerPhone: document.getElementById('country-code')?.value + document.getElementById('customer-phone')?.value?.trim(),
            customerEmail: document.getElementById('customer-email')?.value?.trim(),

            // Order type information (CRITICAL for Odoo integration)
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

            // Order details - IMPORTANT: This is what Odoo needs
            items: this.cartData.items.map(item => ({
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                image: item.image || '',
                id: item.id || null
            })),
            subtotal: parseFloat(this.cartData.subtotal),
            tax: parseFloat(this.cartData.tax),
            deliveryFee: parseFloat(this.cartData.deliveryFee),
            grandTotal: parseFloat(this.cartData.grandTotal),

            // User and order IDs for tracking
            userId: this.userId,
            orderId: this.orderId,

            // Metadata
            orderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            orderTime: new Date().toTimeString().split(' ')[0], // HH:MM:SS format

            // Card details (if online payment)
            ...(this.paymentMethod === 'online' && {
                cardNumber: document.getElementById('card-number')?.value?.replace(/\s/g, ''),
                cardExpiry: document.getElementById('card-expiry')?.value,
                cardName: document.getElementById('card-name')?.value?.trim(),
                selectedBank: document.getElementById('bank-select')?.value
            })
        };

        console.log('📦 Order data prepared for Odoo:', this.orderData);
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
     * Setup payment method toggle functionality - MISSING METHOD FIXED
     */
    setupPaymentToggle() {
        // Initialize payment method selection
        const paymentRadios = document.querySelectorAll('input[name="payment-method"]');

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });

        // Set default payment method
        const defaultPayment = document.getElementById('payment-cash');
        if (defaultPayment) {
            defaultPayment.checked = true;
            this.handlePaymentMethodChange('cash');
        }

        console.log('💳 Payment toggle setup completed');
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

        // Skip validation if field is not required
        if (!field.hasAttribute('required') && !value) {
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
     * Enhanced error handling for place order
     */
    async handlePlaceOrder(event) {
        event.preventDefault();

        console.log('📝 Processing order with Odoo integration...');

        // Test connection first
        try {
            await this.testConnection();
        } catch (error) {
            console.log('❌ Connection test failed, but continuing...');
        }

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

            // Validate collected data
            if (!this.orderData.items || this.orderData.items.length === 0) {
                throw new Error('No items in cart. Please add items before checkout.');
            }

            // Send order to Odoo backend
            console.log('🚀 Submitting order to Odoo...');
            const result = await this.submitOrderToOdoo(this.orderData);

            if (result && result.success) {
                // Update order data with response
                this.orderData.salesOrderId = result.sales_order_id;
                this.orderData.orderId = result.order_id;

                // Show success
                this.showOrderConfirmation();

                // Clear cart from session storage
                sessionStorage.removeItem('checkoutCart');

                console.log('🎉 Order created successfully in Odoo!');
                console.log('📋 Order Details:', {
                    orderId: result.order_id,
                    salesOrderId: result.sales_order_id,
                    customerId: result.customer_id,
                    total: result.order_total,
                    orderType: this.orderType
                });

                this.showNotification('Order placed successfully!', 'success');
                return; // Exit successfully
            } else {
                throw new Error(result?.error || 'Failed to create order');
            }

        } catch (error) {
            console.error('❌ Order processing error:', error);

            // SPECIAL CASE: If error contains 'Unknown server error' but we see order data,
            // the order might have been created successfully despite JavaScript parsing issues
            if (error.message.includes('Unknown server error') ||
                error.message.includes('Invalid server response')) {

                console.log('⚠️ Possible parsing error, but order may have been created');
                console.log('🔍 Check Sales → Quotations in Odoo to verify order creation');

                // Show a different message
                this.showNotification('Order may have been placed successfully. Please check Sales → Quotations to verify.', 'warning');

            } else {
                // Handle other errors normally
                let errorMessage = 'Failed to process order.';

                if (error.message.includes('HTTP 500')) {
                    errorMessage = 'Server error. Please check server logs for details.';
                } else if (error.message.includes('HTTP 404')) {
                    errorMessage = 'Checkout endpoint not found. Please check your routes.';
                } else if (error.message.includes('Connection')) {
                    errorMessage = 'Connection error. Please check your internet connection.';
                } else {
                    errorMessage = error.message || 'Unknown error occurred.';
                }

                this.showNotification(errorMessage, 'error');
            }

            // Also show in console for debugging
            console.log('📊 Debug Info:');
            console.log('- Order Data:', this.orderData);
            console.log('- Error:', error);
            console.log('- Error Stack:', error.stack);

        } finally {
            this.setPlaceOrderLoading(false);
        }
    }

    /**
 * Submit order to Odoo backend - FIXED FOR ODOO JSON-RPC
 */
async submitOrderToOdoo(orderData) {
    try {
        console.log('📤 Sending order to Odoo backend...');
        console.log('📋 Order data being sent:', JSON.stringify(orderData, null, 2));

        const response = await fetch('/checkout/process-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(orderData)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response status text:', response.statusText);

        if (!response.ok) {
            let errorText = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorBody = await response.text();
                console.log('❌ Error response body:', errorBody);
                errorText += ` - ${errorBody}`;
            } catch (e) {
                console.log('Could not read error response body');
            }
            throw new Error(errorText);
        }

        const result = await response.json();
        console.log('📨 Server response:', result);

        // Handle Odoo's JSON-RPC response format
        let actualResult = result;

        // If it's wrapped in Odoo's JSON-RPC format
        if (result.jsonrpc && result.result) {
            actualResult = result.result;
            console.log('📨 Extracted result from JSON-RPC:', actualResult);
        }

        // Check for JSON-RPC level errors first
        if (result.error) {
            console.error('❌ JSON-RPC error:', result.error);
            throw new Error(result.error.message || result.error);
        }

        // Check for application level errors
        if (actualResult && actualResult.error) {
            console.error('❌ Server returned error:', actualResult.error);
            throw new Error(actualResult.error);
        }

        // Check for success - this should catch your case
        if (actualResult && actualResult.success === true) {
            console.log('🎉 Server confirmed success!', actualResult);
            return actualResult;
        }

        // If actualResult exists but success is not explicitly true, still return it
        if (actualResult) {
            console.log('📊 Returning result even without explicit success flag:', actualResult);
            return actualResult;
        }

        // If we get here, something is wrong with the response format
        console.error('❌ Unexpected response format:', result);
        throw new Error('Invalid server response format');

    } catch (error) {
        console.error('❌ Error in submitOrderToOdoo:', error);
        throw error;
    }
}

    /**
     * Test connection to server
     */
    async testConnection() {
        try {
            console.log('🧪 Testing connection to server...');

            const response = await fetch('/checkout/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Connection test successful:', result);
                return result;
            } else {
                throw new Error(`Connection test failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            throw error;
        }
    }

    /**
     * Collect all form data - ENHANCED FOR ODOO
     */
    collectOrderData() {
        this.orderData = {
            // Customer information
            customerName: document.getElementById('customer-name')?.value?.trim(),
            customerPhone: document.getElementById('country-code')?.value + document.getElementById('customer-phone')?.value?.trim(),
            customerEmail: document.getElementById('customer-email')?.value?.trim(),
            customerCountry: document.getElementById('customer-country')?.value,
            customerState: document.getElementById('customer-state')?.value,
            customerZipcode: document.getElementById('customer-zipcode')?.value?.trim(),
            customerAddress: document.getElementById('customer-address')?.value?.trim(),

            // Payment information
            paymentMethod: this.paymentMethod,

            // Order details - IMPORTANT: This is what Odoo needs
            items: this.cartData.items.map(item => ({
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                image: item.image || '',
                id: item.id || null
            })),
            subtotal: parseFloat(this.cartData.subtotal),
            tax: parseFloat(this.cartData.tax),
            deliveryFee: parseFloat(this.cartData.deliveryFee),
            grandTotal: parseFloat(this.cartData.grandTotal),

            // Metadata
            orderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            orderTime: new Date().toTimeString().split(' ')[0], // HH:MM:SS format

            // Card details (if online payment)
            ...(this.paymentMethod === 'online' && {
                cardNumber: document.getElementById('card-number')?.value?.replace(/\s/g, ''),
                cardExpiry: document.getElementById('card-expiry')?.value,
                cardName: document.getElementById('card-name')?.value?.trim(),
                selectedBank: document.getElementById('bank-select')?.value
            })
        };

        console.log('📦 Order data prepared for Odoo:', this.orderData);
    }

    /**
     * Set loading state for place order button
     */
    setPlaceOrderLoading(loading) {
        const button = document.getElementById('place-order-btn');
        if (!button) return;

        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.classList.remove('hidden');
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (btnText) btnText.style.display = 'block';
            if (btnLoading) btnLoading.classList.add('hidden');
        }
    }

    /**
     * Show order confirmation modal - UPDATED FOR ODOO
     */
    showOrderConfirmation() {
        const modal = document.getElementById('order-confirmation-modal');
        if (!modal) return;

        // Populate confirmation details
        document.getElementById('confirmation-order-id').textContent = this.orderData.orderId || '#12345';
        document.getElementById('confirmation-total').textContent = `Rs. ${this.orderData.grandTotal}`;
        document.getElementById('confirmation-payment').textContent = this.getPaymentMethodDisplayText();

        // Add order type to confirmation if available
        const orderTypeElement = document.getElementById('confirmation-order-type');
        if (orderTypeElement) {
            orderTypeElement.textContent = this.isDeliveryOrder ? 'Delivery' : 'Pickup';
        }

        // Calculate estimated delivery time
        const estimatedTime = this.calculateDeliveryTime();
        document.getElementById('confirmation-delivery').textContent = estimatedTime;

        // Show modal with animation
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log('Order confirmation displayed for Odoo order:', this.orderData.salesOrderId);

        // Dispatch order completion event
const orderCompletedEvent = new CustomEvent('orderCompleted', {
    detail: { orderData: this.orderData }
});
document.dispatchEvent(orderCompletedEvent);
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
     * Calculate estimated delivery time
     */
    calculateDeliveryTime() {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + (35 * 60 * 1000)); // Add 35 minutes

        const timeString = deliveryTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `${timeString} (35-45 minutes)`;
    }

    redirectToMenu() {
    this.hideOrderConfirmation();

    // Clear cart completely
    if (window.cravelyCartManager) {
        window.cravelyCartManager.clearCartCompletely();
    }

    // Generate new order ID
    if (window.orderMethodSelector && typeof window.orderMethodSelector.generateNewOrderId === 'function') {
        window.orderMethodSelector.generateNewOrderId();
    }

    // Clear checkout storage
    sessionStorage.removeItem('checkoutCart');

    setTimeout(() => {
        window.location.href = '/';
    }, 500);
}

    /**
     * Handle track order button click
     */
    handleTrackOrder() {
        this.hideOrderConfirmation();

        // If we have a sales order ID, we could redirect to Odoo's order tracking
        if (this.orderData.salesOrderId) {
            this.showNotification(`Your order ${this.orderData.orderId} is being prepared! We will notify you via SMS.`, 'success');
        } else {
            this.showNotification('Order tracking will be available soon! We will notify you via SMS.', 'success');
        }

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
     * PUBLIC API: Test order creation (for debugging)
     */
    async testOrderCreation() {
        try {
            const testData = {
                customerName: 'Test Customer',
                customerPhone: '+92300123456',
                customerEmail: 'test@example.com',
                customerAddress: '123 Test Street, Test City',
                customerCountry: 'Pakistan',
                customerState: 'Sindh',
                customerZipcode: '12345',
                paymentMethod: 'cash',
                items: [
                    {
                        name: 'Test Biryani',
                        price: 500,
                        quantity: 2
                    }
                ],
                subtotal: 1000,
                tax: 150,
                deliveryFee: 200,
                grandTotal: 1350,
                orderDate: '2024-12-10',
                orderTime: '14:30:00'
            };

            const result = await this.submitOrderToOdoo(testData);
            console.log('Test order result:', result);
            return result;

        } catch (error) {
            console.error('Test order failed:', error);
            throw error;
        }
    }

    /**
     * Public API methods
     */
    getOrderData() {
        return this.orderData;
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

    /**
 * Recalculate totals based on order type
 */
recalculateTotals() {
    if (!this.cartData) return;

    this.cartData.deliveryFee = this.deliveryFee;
    this.cartData.tax = Math.round(this.cartData.subtotal * this.taxRate);
    this.cartData.grandTotal = this.cartData.subtotal + this.cartData.tax + this.deliveryFee;

    console.log('🔢 Totals recalculated:', {
        subtotal: this.cartData.subtotal,
        tax: this.cartData.tax,
        deliveryFee: this.cartData.deliveryFee,
        grandTotal: this.cartData.grandTotal
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
