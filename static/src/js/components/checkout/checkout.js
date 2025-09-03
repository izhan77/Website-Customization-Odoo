/**
 * ================================= CHECKOUT PAGE JAVASCRIPT =================================
 * Complete checkout functionality with Odoo sales order integration
 * File: /website_customizations/static/src/js/components/checkout/checkout.js
 */

 // Pakistan States/Provinces and Cities Data
// Add this data at the top of your checkout.js file

const PAKISTAN_DATA = {
    provinces: {
        'Sindh': [
            'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas',
            'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu', 'Badin', 'Thatta',
            'Tando Allahyar', 'Tando Muhammad Khan', 'Umerkot', 'Sanghar',
            'Ghotki', 'Kashmor', 'Jamshoro', 'Matiari'
        ],
        'Punjab': [
            'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot',
            'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang', 'Gujrat', 'Kasur',
            'Rahim Yar Khan', 'Sahiwal', 'Okara', 'Wah Cantonment', 'Dera Ghazi Khan',
            'Mirpur', 'Kamoke', 'Mandi Bahauddin', 'Jhelum', 'Sadiqabad', 'Khanewal',
            'Hafizabad', 'Kohat', 'Jacobabad', 'Muzaffargarh', 'Khanpur', 'Chiniot'
        ],
        'Khyber Pakhtunkhwa': [
            'Peshawar', 'Mardan', 'Mingora', 'Kohat', 'Dera Ismail Khan', 'Bannu',
            'Swabi', 'Charsadda', 'Nowshera', 'Mansehra', 'Abbottabad', 'Karak',
            'Hangu', 'Parachinar', 'Lakki Marwat', 'Chitral', 'Wazirabad', 'Tank',
            'Haripur', 'Timergara', 'Miramshah', 'Wana', 'Kurram', 'Orakzai'
        ],
        'Balochistan': [
            'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Zhob', 'Gwadar',
            'Sibi', 'Loralai', 'Pishin', 'Mastung', 'Kalat', 'Lasbela', 'Nasirabad',
            'Jaffarabad', 'Dera Bugti', 'Kohlu', 'Barkhan', 'Musakhel', 'Sherani'
        ],
        'Islamabad Capital Territory': [
            'Islamabad'
        ],
        'Azad Kashmir': [
            'Muzaffarabad', 'Mirpur', 'Kotli', 'Bhimber', 'Rawalakot', 'Palandri',
            'Bagh', 'Sudhanoti', 'Neelum', 'Haveli'
        ],
        'Gilgit-Baltistan': [
            'Gilgit', 'Skardu', 'Hunza', 'Ghanche', 'Shigar', 'Nagar', 'Astore',
            'Diamer', 'Ghizer', 'Kharmang'
        ]
    }
};

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
 * Initialize custom dropdowns for location
 */
initializeCustomDropdowns() {
    console.log('🎛️ Initializing custom dropdowns...');

    this.selectedProvince = null;
    this.selectedCity = null;
    this.selectedPaymentMethod = null;

    // Setup province dropdown
    this.setupProvinceDropdown();

    // Setup city dropdown (initially disabled)
    this.setupCityDropdown();

    // Setup dropdown event listeners
    this.setupDropdownEvents();

    console.log('✅ Custom dropdowns initialized');
}

/**
 * Hide cart elements on checkout page to prevent z-index conflicts
 */
hideCartElementsOnCheckout() {
    // Hide cart popup and sidebar when on checkout page
    const cartPopup = document.getElementById('cravely-cart-view-popup');
    const cartSidebar = document.getElementById('cravely-cart-sidebar-overlay');

    if (cartPopup) {
        cartPopup.style.display = 'none';
        cartPopup.style.visibility = 'hidden';
    }

    if (cartSidebar) {
        cartSidebar.style.display = 'none';
        cartSidebar.style.visibility = 'hidden';
    }

    console.log('🛒 Cart elements hidden on checkout page');
}


/**
 * Setup province dropdown options
 */
setupProvinceDropdown() {
    const provinceOptions = document.getElementById('province-options');
    if (!provinceOptions) return;

    provinceOptions.innerHTML = '';

    Object.keys(PAKISTAN_DATA.provinces).forEach(province => {
        const option = document.createElement('div');
        option.className = 'custom-dropdown-option';
        option.textContent = province;
        option.setAttribute('data-value', province);

        option.addEventListener('click', () => {
            this.selectProvince(province);
        });

        provinceOptions.appendChild(option);
    });
}

/**
 * Setup city dropdown based on selected province
 */
setupCityDropdown() {
    const cityDropdown = document.getElementById('city-dropdown');
    if (!cityDropdown) return;

    // Initially disable city dropdown
    cityDropdown.classList.add('disabled');

    const citySelected = document.getElementById('city-selected');
    const cityOptions = document.getElementById('city-options');

    if (citySelected) {
        citySelected.querySelector('span').textContent = 'Select City';
        citySelected.querySelector('span').classList.add('placeholder');
    }

    if (cityOptions) {
        cityOptions.innerHTML = '';
    }
}

/**
 * Select province and populate cities
 */
selectProvince(province) {
    console.log('🏛️ Province selected:', province);

    this.selectedProvince = province;

    // Update province display
    const provinceSelected = document.getElementById('province-selected');
    const provinceHidden = document.getElementById('customer-state');

    if (provinceSelected) {
        const span = provinceSelected.querySelector('span');
        span.textContent = province;
        span.classList.remove('placeholder');
        // Fix styling
        span.style.backgroundColor = 'transparent';
        span.style.border = 'none';
        span.style.padding = '0';
        span.style.margin = '0';
    }

    if (provinceHidden) {
        provinceHidden.value = province;
    }

    // Close province dropdown
    document.getElementById('province-dropdown').classList.remove('open');

    // Enable and populate city dropdown
    this.populateCityDropdown(province);

    // Reset city selection
    this.selectedCity = null;
    const citySelected = document.getElementById('city-selected');
    const cityHidden = document.getElementById('customer-city');

    if (citySelected) {
        const span = citySelected.querySelector('span');
        span.textContent = 'Select City';
        span.classList.add('placeholder');
        // Fix styling
        span.style.backgroundColor = 'transparent';
        span.style.border = 'none';
        span.style.padding = '0';
        span.style.margin = '0';
    }

    if (cityHidden) {
        cityHidden.value = '';
    }

    // Apply styling fix
    this.fixPlaceholderStyling();
}

/**
 * Fix placeholder styling for dropdowns
 */
fixPlaceholderStyling() {
    // Fix province dropdown placeholder
    const provinceSpan = document.querySelector('#province-selected span');
    if (provinceSpan && provinceSpan.textContent === 'Select State/Province') {
        provinceSpan.classList.add('placeholder');
        provinceSpan.style.backgroundColor = 'transparent';
        provinceSpan.style.border = 'none';
        provinceSpan.style.padding = '0';
        provinceSpan.style.margin = '0';
    }

    // Fix city dropdown placeholder
    const citySpan = document.querySelector('#city-selected span');
    if (citySpan && citySpan.textContent === 'Select City') {
        citySpan.classList.add('placeholder');
        citySpan.style.backgroundColor = 'transparent';
        citySpan.style.border = 'none';
        citySpan.style.padding = '0';
        citySpan.style.margin = '0';
    }

    // Remove any inline styles that might cause gray backgrounds
    document.querySelectorAll('.custom-dropdown-selected span').forEach(span => {
        span.style.backgroundColor = 'transparent';
        span.style.border = 'none';
        span.style.padding = '0';
        span.style.margin = '0';
    });
}

/**
 * Populate city dropdown based on province
 */
populateCityDropdown(province) {
    const cityDropdown = document.getElementById('city-dropdown');
    const cityOptions = document.getElementById('city-options');

    if (!cityDropdown || !cityOptions) return;

    // Enable city dropdown
    cityDropdown.classList.remove('disabled');

    // Clear existing options
    cityOptions.innerHTML = '';

    // Get cities for the selected province
    const cities = PAKISTAN_DATA.provinces[province] || [];

    cities.forEach(city => {
        const option = document.createElement('div');
        option.className = 'custom-dropdown-option';
        option.textContent = city;
        option.setAttribute('data-value', city);

        option.addEventListener('click', () => {
            this.selectCity(city);
        });

        cityOptions.appendChild(option);
    });

    console.log(`🏙️ ${cities.length} cities loaded for ${province}`);
}

/**
 * Select city
 */
selectCity(city) {
    console.log('🏙️ City selected:', city);

    this.selectedCity = city;

    // Update city display
    const citySelected = document.getElementById('city-selected');
    const cityHidden = document.getElementById('customer-city');

    if (citySelected) {
        const span = citySelected.querySelector('span');
        span.textContent = city;
        span.classList.remove('placeholder');
        // Fix styling
        span.style.backgroundColor = 'transparent';
        span.style.border = 'none';
        span.style.padding = '0';
        span.style.margin = '0';
    }

    if (cityHidden) {
        cityHidden.value = city;
    }

    // Close city dropdown
    document.getElementById('city-dropdown').classList.remove('open');

    // Apply styling fix
    this.fixPlaceholderStyling();
}

/**
 * Setup dropdown click events
 */
setupDropdownEvents() {
    // Province dropdown events
    const provinceDropdown = document.getElementById('province-dropdown');
    const provinceSelected = document.getElementById('province-selected');

    if (provinceSelected) {
        provinceSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown('province-dropdown');
        });
    }

    // City dropdown events
    const cityDropdown = document.getElementById('city-dropdown');
    const citySelected = document.getElementById('city-selected');

    if (citySelected) {
        citySelected.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!cityDropdown.classList.contains('disabled')) {
                this.toggleDropdown('city-dropdown');
            }
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            this.closeAllDropdowns();
        }
    });
}

/**
 * Toggle dropdown open/close
 */
toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // Close other dropdowns first
    const allDropdowns = document.querySelectorAll('.custom-dropdown');
    allDropdowns.forEach(dd => {
        if (dd.id !== dropdownId) {
            dd.classList.remove('open');
        }
    });

    // Toggle current dropdown
    dropdown.classList.toggle('open');
}

/**
 * Close all dropdowns
 */
closeAllDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        dropdown.classList.remove('open');
    });
}

/**
 * Initialize payment method selection
 */
initializePaymentMethods() {
    console.log('💳 Initializing payment methods...');

    // Setup payment method cards
    this.setupPaymentMethodCards();

    // Setup payment back button
    this.setupPaymentBackButton();

    console.log('✅ Payment methods initialized');
}

/**
 * Setup payment method card selection
 */
setupPaymentMethodCards() {
    const paymentCards = document.querySelectorAll('.payment-method-card');

    paymentCards.forEach(card => {
        card.addEventListener('click', () => {
            const method = card.getAttribute('data-method');
            this.selectPaymentSubMethod(method);
        });
    });
}

/**
 * Select payment sub-method
 */
selectPaymentSubMethod(method) {
    console.log('💳 Payment sub-method selected:', method);

    this.selectedPaymentMethod = method;

    // Update card selection states
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`[data-method="${method}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Show payment details form
    this.showPaymentDetailsForm(method);
}

/**
 * Show payment details form based on method
 */
showPaymentDetailsForm(method) {
    const paymentDetailsForm = document.querySelector('.payment-details-form');
    const methodsSelection = document.querySelector('.payment-methods-selection');
    const cardDetails = document.getElementById('card-details');
    const walletDetails = document.getElementById('wallet-details');

    if (!paymentDetailsForm) return;

    // Hide method selection, show details form
    if (methodsSelection) {
        methodsSelection.style.display = 'none';
    }

    paymentDetailsForm.style.display = 'block';

    // Show appropriate details section
    if (method === 'card') {
        if (cardDetails) cardDetails.style.display = 'block';
        if (walletDetails) walletDetails.style.display = 'none';
        this.makeCardFieldsRequired(true);
    } else {
        if (cardDetails) cardDetails.style.display = 'none';
        if (walletDetails) {
            walletDetails.style.display = 'block';
            this.updateWalletDescription(method);
        }
        this.makeCardFieldsRequired(false);
    }
}

/**
 * Update wallet description based on selected method
 */
updateWalletDescription(method) {
    const walletDescription = document.getElementById('wallet-description');
    if (!walletDescription) return;

    const descriptions = {
        'easypaisa': 'Enter your EasyPaisa mobile number to proceed with payment',
        'jazzcash': 'Enter your JazzCash mobile number to proceed with payment',
        'sadapay': 'Enter your SadaPay mobile number to proceed with payment'
    };

    walletDescription.textContent = descriptions[method] || 'Enter your mobile number to proceed with payment';
}

/**
 * Setup payment back button
 */
setupPaymentBackButton() {
    const backBtn = document.getElementById('payment-back-btn');
    if (!backBtn) return;

    backBtn.addEventListener('click', () => {
        this.showPaymentMethodSelection();
    });
}

/**
 * Show payment method selection (back from details)
 */
showPaymentMethodSelection() {
    const paymentDetailsForm = document.querySelector('.payment-details-form');
    const methodsSelection = document.querySelector('.payment-methods-selection');

    if (methodsSelection) {
        methodsSelection.style.display = 'block';
    }

    if (paymentDetailsForm) {
        paymentDetailsForm.style.display = 'none';
    }

    // Clear selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });

    this.selectedPaymentMethod = null;
    this.makeCardFieldsRequired(false);
}

/**
 * UPDATED: Handle payment method change with dynamic text
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

        // Reset to show method selection
        this.showPaymentMethodSelection();
    } else if (onlineDetails) {
        onlineDetails.style.display = 'none';
        onlineDetails.classList.remove('fade-in');
        this.makeCardFieldsRequired(false);
    }

    console.log('💳 Payment method changed to:', method);
}

/**
 * UPDATED: Make card fields required based on selected payment method
 */
makeCardFieldsRequired(required) {
    const cardFields = [
        'card-number',
        'card-expiry',
        'card-cvv',
        'card-name'
    ];

    const walletFields = [
        'wallet-phone'
    ];

    // Handle card fields
    cardFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (required && this.selectedPaymentMethod === 'card') {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        }
    });

    // Handle wallet fields
    walletFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (required && this.selectedPaymentMethod !== 'card') {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        }
    });
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
    this.preventInitialFlicker();
    this.loadStoredIds();
    this.loadCartData();
    this.populateOrderSummary();
    this.setupOrderTypeUI();

    // NEW: Initialize custom dropdowns and payment methods
    this.initializeCustomDropdowns();
    this.initializePaymentMethods();
    this.fixPlaceholderStyling();

    this.hideCartElementsOnCheckout();

    this.bindEventListeners();
    this.initializeFormValidation();
    this.setupPaymentToggle();
    this.setupCardFormatting();
    console.log('✅ Checkout Manager initialized successfully with custom features');
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

    // Update section title
    this.updateSectionTitle();
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

    toggleAddressFields() {
    const fieldsToToggle = [
        'customer-state',
        'customer-zipcode',
        'customer-address'
    ];

    // Handle province/state dropdown
    const provinceDropdown = document.getElementById('province-dropdown');
    const provinceFormGroup = provinceDropdown?.closest('.form-group');

    // Handle city dropdown - ALWAYS HIDE FOR PICKUP
    const cityDropdown = document.getElementById('city-dropdown');
    const cityFormGroup = cityDropdown?.closest('.form-group');

    if (!this.isDeliveryOrder) {
        // PICKUP MODE: Hide state, city, zip, address
        if (provinceFormGroup) {
            provinceFormGroup.style.display = 'none';
            const stateField = document.getElementById('customer-state');
            if (stateField) {
                stateField.removeAttribute('required');
            }
        }

        // ALWAYS hide city for pickup
        if (cityFormGroup) {
            cityFormGroup.style.display = 'none';
            const cityField = document.getElementById('customer-city');
            if (cityField) {
                cityField.removeAttribute('required');
            }
        }

        // Hide other fields
        fieldsToToggle.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const formGroup = field?.closest('.form-group');

            if (formGroup) {
                formGroup.style.display = 'none';
                if (field) {
                    field.removeAttribute('required');
                }
            }
        });

    } else {
        // DELIVERY MODE: Show all fields
        if (provinceFormGroup) {
            provinceFormGroup.style.display = '';
            const stateField = document.getElementById('customer-state');
            if (stateField) {
                stateField.setAttribute('required', 'required');
            }
        }

        // Show city for delivery
        if (cityFormGroup) {
            cityFormGroup.style.display = '';
            const cityField = document.getElementById('customer-city');
            if (cityField) {
                cityField.setAttribute('required', 'required');
            }
        }

        // Show other fields
        fieldsToToggle.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const formGroup = field?.closest('.form-group');

            if (formGroup) {
                formGroup.style.display = '';
                if (field) {
                    field.setAttribute('required', 'required');
                }
            }
        });
    }

    console.log(`${this.isDeliveryOrder ? '🚚' : '🏪'} Address fields ${this.isDeliveryOrder ? 'shown' : 'hidden'}, city ${this.isDeliveryOrder ? 'shown' : 'always hidden for pickup'}`);
}

    /**
 * NEW: Update section title based on order type
 */
updateSectionTitle() {
    const sectionTitle = document.querySelector('.customer-info-section .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = this.isDeliveryOrder ? 'Delivery Information' : 'Pickup Information';
    }
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
        customerPhone: '+92' + document.getElementById('customer-phone')?.value?.trim(),
        customerEmail: document.getElementById('customer-email')?.value?.trim(),

        // Order type information (CRITICAL for Odoo integration)
        orderType: this.orderType,
        isDeliveryOrder: this.isDeliveryOrder,

        // Updated location fields
        customerCountry: 'Pakistan', // Fixed for Pakistan
        customerState: document.getElementById('customer-state')?.value || this.selectedProvince,
        customerCity: document.getElementById('customer-city')?.value || this.selectedCity,
        customerZipcode: this.isDeliveryOrder ?
            document.getElementById('customer-zipcode')?.value?.trim() : '00000',
        customerAddress: this.isDeliveryOrder ?
            document.getElementById('customer-address')?.value?.trim() : 'Pickup Order - No Address Required',

        // Payment information - Updated for new payment system
        paymentMethod: this.paymentMethod,
        paymentSubMethod: this.selectedPaymentMethod, // New field for online payment sub-methods

        // Order details
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
        orderDate: new Date().toISOString().split('T')[0],
        orderTime: new Date().toTimeString().split(' ')[0],

        // Payment details based on selected method
        ...(this.paymentMethod === 'online' && this.selectedPaymentMethod === 'card' && {
            cardNumber: document.getElementById('card-number')?.value?.replace(/\s/g, ''),
            cardExpiry: document.getElementById('card-expiry')?.value,
            cardName: document.getElementById('card-name')?.value?.trim()
        }),

        ...(this.paymentMethod === 'online' && this.selectedPaymentMethod !== 'card' && {
            walletPhone: '+92' + document.getElementById('wallet-phone')?.value?.trim(),
            walletProvider: this.selectedPaymentMethod
        })
    };

    console.log('📦 Order data prepared for Odoo with custom features:', this.orderData);
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
 * NEW: Listen for order type changes from Order Mode popup
 * Add this to your bindEventListeners method
 */
listenForOrderTypeChanges() {
    let lastProcessedOrderType = this.orderType;
    let isProcessingChange = false;
    let changeTimeout = null;

    // Function to process order type change
    const processOrderTypeChange = (newOrderType) => {
        if (isProcessingChange || newOrderType === lastProcessedOrderType) return;

        console.log('🔄 Processing order type change:', newOrderType);

        // Clear any pending changes
        if (changeTimeout) {
            clearTimeout(changeTimeout);
        }

        // Set processing flag and prevent UI flicker
        isProcessingChange = true;
        this.preventUIFlicker();

        // Update internal state immediately
        this.orderType = newOrderType;
        this.isDeliveryOrder = newOrderType === 'delivery';
        lastProcessedOrderType = newOrderType;

        // Apply changes after a brief delay to prevent flicker
        changeTimeout = setTimeout(() => {
            this.applyOrderTypeChangeWithAnimation();

            // Reset processing flag
            setTimeout(() => {
                isProcessingChange = false;
                changeTimeout = null;
            }, 100);
        }, 50); // Very short delay to prevent flicker
    };

    // Listen for order type change events
    document.addEventListener('orderTypeChanged', (event) => {
        if (event.detail && event.detail.orderType) {
            processOrderTypeChange(event.detail.orderType);
        }
    });

    // Storage events
    window.addEventListener('storage', (event) => {
        if (event.key === 'orderMethodSelected') {
            try {
                const orderData = JSON.parse(event.newValue);
                if (orderData.type) {
                    processOrderTypeChange(orderData.type);
                }
            } catch (e) {
                console.warn('Error parsing order method data:', e);
            }
        }
    });

    // Periodic check (reduced frequency)
    setInterval(() => {
        if (!isProcessingChange) {
            const storedOrderData = sessionStorage.getItem('orderMethodSelected');
            if (storedOrderData) {
                try {
                    const parsedData = JSON.parse(storedOrderData);
                    if (parsedData.type) {
                        processOrderTypeChange(parsedData.type);
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
        }
    }, 3000); // Check every 3 seconds instead of 2
}
checkForOrderTypeChanges() {
    const storedOrderData = sessionStorage.getItem('orderMethodSelected');
    if (storedOrderData) {
        try {
            const parsedData = JSON.parse(storedOrderData);
            if (parsedData.type && parsedData.type !== this.orderType) {
                console.log('🔄 Periodic order type change detected:', parsedData.type);
                this.orderType = parsedData.type;
                this.isDeliveryOrder = this.orderType === 'delivery';
                this.applyOrderTypeChangeWithAnimation();
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }
}
applyOrderTypeChangeWithAnimation() {
    console.log('🎬 Applying smooth order type change:', this.orderType);

    // Get elements that need updating
    const form = document.getElementById('checkout-form');
    const sectionTitle = document.querySelector('.customer-info-section .section-title');

    // Add smooth transition
    if (form) {
        form.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Update section title with animation
    if (sectionTitle) {
        sectionTitle.style.transition = 'opacity 0.15s ease';
        sectionTitle.style.opacity = '0.5';

        setTimeout(() => {
            sectionTitle.textContent = this.isDeliveryOrder ? 'Delivery Information' : 'Pickup Information';
            sectionTitle.style.opacity = '1';
        }, 75);
    }

    // Update all UI elements
    this.setupOrderTypeUI();
    this.updateDeliveryFee();
    this.recalculateTotals();
    this.populateOrderSummary();

    // Reset form fields for pickup mode
    if (!this.isDeliveryOrder) {
        const fieldsToReset = ['customer-state', 'customer-city', 'customer-zipcode', 'customer-address'];
        fieldsToReset.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                // Clear any validation states
                this.clearFieldError(field);
                field.classList.remove('error', 'success');
            }
        });

        // Reset dropdown states
        this.selectedProvince = null;
        this.selectedCity = null;

        // Reset dropdown displays
        const provinceSpan = document.querySelector('#province-selected span');
        const citySpan = document.querySelector('#city-selected span');

        if (provinceSpan) {
            provinceSpan.textContent = 'Select State/Province';
            provinceSpan.classList.add('placeholder');
        }

        if (citySpan) {
            citySpan.textContent = 'Select City';
            citySpan.classList.add('placeholder');
        }
    }

    console.log('✅ Smooth order type change completed');
}
preventUIFlicker() {
    // Lock the current UI state to prevent flickering
    const form = document.getElementById('checkout-form');
    if (form) {
        form.style.opacity = '0.7';
        form.style.pointerEvents = 'none';
        form.style.transition = 'opacity 0.2s ease';
    }

    // Re-enable after a short delay
    setTimeout(() => {
        if (form) {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
        }
    }, 300);
}
preventInitialFlicker() {
    // Hide form briefly during initialization to prevent flicker
    const form = document.getElementById('checkout-form');
    if (form) {
        form.style.opacity = '0';
        form.style.transition = 'opacity 0.3s ease';

        // Show form after initialization is complete
        setTimeout(() => {
            form.style.opacity = '1';
        }, 100);
    }
}

    /**
     * Bind all event listeners
     */
    /**
 * REPLACE your existing bindEventListeners method with this updated version
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
            this.hideOrderConfirmation(true);
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

    // NEW: Listen for order type changes
    this.listenForOrderTypeChanges();
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
            // MUCH MORE LENIENT: Accept any 10 or 11 digit number
            const cleanPhone = value.replace(/\D/g, '');

            if (value && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
                isValid = false;
                errorMessage = 'Please enter 10 or 11 digits';
            }
            // Removed the "must start with 3" requirement - too restrictive
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

        case 'wallet-phone':
            // Same lenient validation for wallet phone
            const cleanWalletPhone = value.replace(/\D/g, '');
            if (value && (cleanWalletPhone.length < 10 || cleanWalletPhone.length > 11)) {
                isValid = false;
                errorMessage = 'Please enter 10 or 11 digits';
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

    // Handle special case for phone field in container
    let errorContainer = field.parentNode;

    // If field is inside phone-input-container-fixed, use the container's parent
    if (field.parentNode.classList.contains('phone-input-container-fixed')) {
        errorContainer = field.parentNode.parentNode;
        // Also add error styling to the container
        field.parentNode.classList.add('error');
    }

    // Remove existing error message
    const existingError = errorContainer.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;
    errorContainer.appendChild(errorSpan);
}

/**
 * UPDATED: clearFieldError method to handle phone field container
 * REPLACE your existing clearFieldError method with this:
 */
    clearFieldError(field) {
    field.classList.remove('error');

    // Handle special case for phone field container
    let errorContainer = field.parentNode;

    if (field.parentNode.classList.contains('phone-input-container-fixed')) {
        errorContainer = field.parentNode.parentNode;
        // Remove error styling from container
        field.parentNode.classList.remove('error');
    }

    const errorMessage = errorContainer.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
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
        // Skip validation for hidden address fields in pickup mode
        if (!this.isDeliveryOrder) {
            const fieldId = field.id;
            const isAddressField = [
                'customer-country',
                'customer-state',
                'customer-zipcode',
                'customer-address'
            ].includes(fieldId);

            if (isAddressField) {
                return; // Skip validation for this field
            }
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
        // FIRST: Get the next Odoo order ID BEFORE creating the order
console.log('Getting ACTUAL next Odoo order ID that will be used...');
const nextOrderIdResult = await this.getNextOdooOrderId();

if (!nextOrderIdResult || !nextOrderIdResult.success) {
    throw new Error('Failed to get next order ID from Odoo');
}

const nextOrderId = nextOrderIdResult.next_order_id;
console.log('ACTUAL Odoo order ID obtained:', nextOrderId);

// Update our internal order data immediately
this.orderId = nextOrderId;

        // Collect form data
        this.collectOrderData();

        // Validate collected data
        if (!this.orderData.items || this.orderData.items.length === 0) {
            throw new Error('No items in cart. Please add items before checkout.');
        }

        // Update order data with the Odoo order ID we just got
        this.orderData.orderId = nextOrderId;

        // Also update sessionStorage with the Odoo order ID
        try {
            const storedOrder = sessionStorage.getItem('orderMethodSelected');
            if (storedOrder) {
                const orderData = JSON.parse(storedOrder);
                orderData.orderId = nextOrderId;
                orderData.odooOrderId = nextOrderId;
                sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderData));
                console.log('💾 Updated sessionStorage with Odoo order ID:', nextOrderId);
            }
        } catch (e) {
            console.error('Failed to update sessionStorage:', e);
        }

        // Send order to Odoo backend
        console.log('🚀 Submitting order to Odoo with ID:', nextOrderId);
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

    // Save Odoo-generated order ID to sessionStorage
    if (actualResult.order_id) {
        console.log('💾 Saving Odoo order ID to sessionStorage:', actualResult.order_id);

        // Update our order data with Odoo's ID
        this.orderData.orderId = actualResult.order_id;

        // Update sessionStorage with Odoo's order ID
        try {
            const storedOrder = sessionStorage.getItem('orderMethodSelected');
            if (storedOrder) {
                const orderData = JSON.parse(storedOrder);
                orderData.orderId = actualResult.order_id; // Replace with Odoo's ID
                orderData.odooOrderId = actualResult.order_id; // Also store as separate field
                orderData.salesOrderId = actualResult.sales_order_id; // Store sales order ID too
                sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderData));

                console.log('✅ Updated sessionStorage with Odoo order ID:', actualResult.order_id);
            }
        } catch (e) {
            console.error('❌ Failed to update sessionStorage with Odoo order ID:', e);
        }
    }

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
async hideOrderConfirmation(redirectToHome = false) {
    const modal = document.getElementById('order-confirmation-modal');
    if (!modal) return;

    modal.classList.remove('show');
    setTimeout(async () => {
        modal.classList.add('hidden');

        if (redirectToHome) {
            // Clear cart
            if (window.cravelyCartManager) {
                window.cravelyCartManager.clearCartCompletely();
            }

            try {
                // Get next REAL Odoo order ID
                if (window.orderMethodSelector && typeof window.orderMethodSelector.generateNewOrderId === 'function') {
                    const newOrderId = await window.orderMethodSelector.generateNewOrderId();
                    console.log('Close button - New session will use Odoo order ID:', newOrderId);
                }

                sessionStorage.removeItem('checkoutCart');
                setTimeout(() => {
                    window.location.href = '/';
                }, 300);
            } catch (error) {
                console.error('Failed to get next order ID:', error);
                sessionStorage.removeItem('checkoutCart');
                setTimeout(() => {
                    window.location.href = '/';
                }, 300);
            }
        }
    }, 400);

    document.body.style.overflow = '';
}

    /**
 * Get the next order ID from Odoo's sequence
 */

async getNextOdooOrderId() {
    try {
        console.log('Getting ACTUAL next order ID from Odoo sequence...');

        const response = await fetch('/checkout/get-next-order-id', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({})  // Empty JSON body for JSON-RPC
});

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.next_order_id) {
            console.log('Got ACTUAL Odoo order ID:', result.next_order_id);

            // IMPORTANT: Store this real Odoo ID in sessionStorage immediately
            const storedOrder = sessionStorage.getItem('orderMethodSelected');
            if (storedOrder) {
                try {
                    const orderData = JSON.parse(storedOrder);
                    orderData.orderId = result.next_order_id;
                    orderData.odooOrderId = result.next_order_id;
                    sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderData));
                    console.log('Updated sessionStorage with REAL Odoo order ID:', result.next_order_id);
                } catch (e) {
                    console.error('Failed to update sessionStorage:', e);
                }
            }

            return result;
        } else {
            throw new Error(result.error || 'Failed to get next order ID');
        }
    } catch (error) {
        console.error('Error getting next order ID:', error);
        throw error;
    }
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

    async redirectToMenu() {
    this.hideOrderConfirmation();

    // Clear cart completely
    if (window.cravelyCartManager) {
        window.cravelyCartManager.clearCartCompletely();
    }

    try {
        // Get next REAL Odoo order ID for new session
        console.log('Getting next REAL Odoo order ID for new session...');

        if (window.orderMethodSelector && typeof window.orderMethodSelector.generateNewOrderId === 'function') {
            const newOrderId = await window.orderMethodSelector.generateNewOrderId();
            console.log('New session will use Odoo order ID:', newOrderId);
        }

        // Clear checkout storage
        sessionStorage.removeItem('checkoutCart');

        // Redirect to homepage
        setTimeout(() => {
            window.location.href = '/';
        }, 500);

    } catch (error) {
        console.error('Failed to get next order ID:', error);
        // Still redirect even if we can't get the next ID
        sessionStorage.removeItem('checkoutCart');
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    }
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
    // DISABLED: All checkout notifications are now disabled
    // Uncomment the code below if you want to re-enable notifications later

    /*
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
    */

    // Just log to console instead
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
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