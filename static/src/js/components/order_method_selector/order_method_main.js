/**
 * Order Method Selector Main Controller
 * File: static/src/js/components/order_method_selector/order_method_main.js
 * Purpose: Main controller that coordinates all order method selector components
 */

(function() {
    'use strict';

    // Debug logging
    console.log('🚀 Order Method Selector: Loading main controller...');

    // Main Order Method Selector Class
    class OrderMethodSelector {
        constructor() {
            this.currentOrderType = 'delivery';
            this.selectedLocation = null;
            this.isInitialized = false;

            // DOM Elements
            this.elements = {};

            // Configuration
            this.config = {
                colors: {
                    primary: '#7abfba',
                    secondary: '#ffffff',
                    text: '#666666',
                    active: '#ffffff'
                },
                animations: {
                    duration: 300
                }
            };

            console.log('📱 OrderMethodSelector: Instance created');
        }

        /**
         * Initialize the order method selector
         */
        init() {
            if (this.isInitialized) {
                console.log('⚠️ OrderMethodSelector: Already initialized');
                return;
            }

            console.log('🔧 OrderMethodSelector: Initializing...');

            // Cache DOM elements
            this.cacheElements();

            // Check if required elements exist
            if (!this.validateElements()) {
                console.error('❌ OrderMethodSelector: Required elements not found');
                return;
            }

            // Initialize components
            this.initializeToggleButtons();
            this.initializeLocationSelector();
            this.initializeSubmitButton();
            this.initializePopupControls();

            // Set initial state
            this.setInitialState();

            this.isInitialized = true;
            console.log('✅ OrderMethodSelector: Initialization complete');
        }

        /**
         * Cache DOM elements for better performance
         */
        cacheElements() {
            this.elements = {
                overlay: document.getElementById('order-popup-overlay'),
                container: document.getElementById('order-popup-container'),
                deliveryBtn: document.getElementById('delivery-btn'),
                pickupBtn: document.getElementById('pickup-btn'),
                subtitle: document.getElementById('order-subtitle'),
                locationBtn: document.getElementById('current-location-btn'),
                dropdown: document.getElementById('location-dropdown'),
                locationDetails: document.getElementById('location-details'),
                locationInfo: document.getElementById('location-info'),
                submitBtn: document.getElementById('order-submit-btn')
            };

            console.log('📦 OrderMethodSelector: Elements cached', this.elements);
        }

        /**
         * Validate that required elements exist
         */
        validateElements() {
            const required = ['overlay', 'deliveryBtn', 'pickupBtn', 'dropdown', 'submitBtn'];
            const missing = required.filter(key => !this.elements[key]);

            if (missing.length > 0) {
                console.error('❌ Missing required elements:', missing);
                return false;
            }

            return true;
        }

        /**
         * Initialize toggle buttons functionality
         */
        initializeToggleButtons() {
            console.log('🔘 OrderMethodSelector: Initializing toggle buttons...');

            // Delivery button event
            this.elements.deliveryBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚚 Delivery button clicked');
                this.switchOrderType('delivery');
            });

            // Pickup button event
            this.elements.pickupBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🏪 Pickup button clicked');
                this.switchOrderType('pickup');
            });
        }

        /**
         * Initialize location selector functionality
         */
        initializeLocationSelector() {
            console.log('📍 OrderMethodSelector: Initializing location selector...');

            // Current location button
            this.elements.locationBtn?.addEventListener('click', () => {
                this.handleCurrentLocation();
            });

            // Dropdown change event
            this.elements.dropdown?.addEventListener('change', (e) => {
                this.handleLocationChange(e.target.value);
            });
        }

        /**
         * Initialize submit button
         */
        initializeSubmitButton() {
            this.elements.submitBtn?.addEventListener('click', () => {
                this.handleSubmit();
            });
        }

        /**
         * Initialize popup controls (close functionality)
         */
        initializePopupControls() {
            // Close on overlay click
            this.elements.overlay?.addEventListener('click', (e) => {
                if (e.target === this.elements.overlay) {
                    this.closePopup();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closePopup();
                }
            });
        }

        /**
         * Set initial state of the popup
         */
        setInitialState() {
            console.log('🎯 OrderMethodSelector: Setting initial state...');

            // Start with delivery selected
            this.switchOrderType('delivery');

            // Show popup with animation
            this.showPopup();
        }

        /**
         * Switch between delivery and pickup modes
         */
        switchOrderType(type) {
            console.log(`🔄 OrderMethodSelector: Switching to ${type}`);

            this.currentOrderType = type;

            // Update button states
            this.updateToggleButtons(type);

            // Update content based on type
            if (type === 'delivery') {
                this.setupDeliveryMode();
            } else {
                this.setupPickupMode();
            }
        }

        /**
         * Update toggle button visual states
         */
        updateToggleButtons(activeType) {
            const buttons = [this.elements.deliveryBtn, this.elements.pickupBtn];

            buttons.forEach(btn => {
                if (!btn) return;

                const isActive = btn.dataset.type === activeType;

                if (isActive) {
                    btn.style.backgroundColor = this.config.colors.primary;
                    btn.style.color = this.config.colors.active;
                    btn.classList.add('active');
                } else {
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = this.config.colors.text;
                    btn.classList.remove('active');
                }
            });
        }

        /**
         * Setup delivery mode UI
         */
        setupDeliveryMode() {
            console.log('🚚 OrderMethodSelector: Setting up delivery mode');

            // Update subtitle
            if (this.elements.subtitle) {
                this.elements.subtitle.textContent = 'Please select your delivery location';
            }

            // Show current location button
            if (this.elements.locationBtn) {
                this.elements.locationBtn.classList.remove('hidden');
            }

            // Hide location details
            if (this.elements.locationDetails) {
                this.elements.locationDetails.classList.add('hidden');
            }

            // Update dropdown options for delivery
            this.updateDropdownOptions('delivery');
        }

        /**
         * Setup pickup mode UI
         */
        setupPickupMode() {
            console.log('🏪 OrderMethodSelector: Setting up pickup mode');

            // Update subtitle
            if (this.elements.subtitle) {
                this.elements.subtitle.textContent = 'Which outlet would you like to pick-up from?';
            }

            // Hide current location button
            if (this.elements.locationBtn) {
                this.elements.locationBtn.classList.add('hidden');
            }

            // Show location details
            if (this.elements.locationDetails) {
                this.elements.locationDetails.classList.remove('hidden');
            }

            // Update dropdown options for pickup
            this.updateDropdownOptions('pickup');
        }

        /**
         * Update dropdown options based on order type
         */
        updateDropdownOptions(type) {
            if (!this.elements.dropdown) return;

            console.log(`📋 OrderMethodSelector: Updating dropdown for ${type}`);

            // Clear existing options
            this.elements.dropdown.innerHTML = '';

            if (type === 'delivery') {
                const deliveryOptions = [
                    { value: '', text: 'Select your delivery area', disabled: true, selected: true },
                    { value: 'dha', text: 'DHA Phase 2' },
                    { value: 'gulshan', text: 'Gulshan-e-Iqbal' },
                    { value: 'bahadurabad', text: 'Bahadurabad' },
                    { value: 'clifton', text: 'Clifton' },
                    { value: 'saddar', text: 'Saddar' }
                ];

                this.populateDropdown(deliveryOptions);

            } else {
                const pickupOptions = [
                    { value: 'tipu-sultan', text: 'Alarahi Tipu Sultan', selected: true },
                    { value: 'dha-outlet', text: 'Alarahi DHA Phase 2' }
                ];

                this.populateDropdown(pickupOptions);

                // Auto-select first pickup location and show details
                setTimeout(() => {
                    this.handleLocationChange('tipu-sultan');
                }, 100);
            }
        }

        /**
         * Populate dropdown with options
         */
        populateDropdown(options) {
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;

                if (option.disabled) optionElement.disabled = true;
                if (option.selected) optionElement.selected = true;

                this.elements.dropdown.appendChild(optionElement);
            });
        }

        /**
         * Handle current location button click
         */
        handleCurrentLocation() {
            console.log('📍 OrderMethodSelector: Getting current location...');

            if (navigator.geolocation) {
                // Show loading state
                const originalText = this.elements.locationBtn.innerHTML;
                this.elements.locationBtn.innerHTML = `
                    <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Detecting...
                `;

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('✅ Location detected:', position.coords);
                        // Restore button
                        this.elements.locationBtn.innerHTML = originalText;
                        // Simulate finding nearest outlet
                        this.showLocationSuccess();
                    },
                    (error) => {
                        console.error('❌ Location error:', error);
                        // Restore button
                        this.elements.locationBtn.innerHTML = originalText;
                        this.showLocationError();
                    }
                );
            } else {
                this.showLocationError('Geolocation not supported');
            }
        }

        /**
         * Show location detection success
         */
        showLocationSuccess() {
            // Auto-select nearest location (DHA for demo)
            this.elements.dropdown.value = 'dha';
            this.selectedLocation = 'dha';

            // Show success message
            this.showMessage('Location detected! Nearest outlet selected.', 'success');
        }

        /**
         * Show location detection error
         */
        showLocationError(message = 'Unable to detect location. Please select manually.') {
            this.showMessage(message, 'error');
        }

        /**
         * Handle dropdown location change
         */
        handleLocationChange(value) {
            console.log('📍 OrderMethodSelector: Location changed to:', value);

            this.selectedLocation = value;

            if (this.currentOrderType === 'pickup' && value) {
                this.updateLocationDetails(value);
            }
        }

        /**
         * Update location details for pickup
         */
        updateLocationDetails(locationId) {
            const locations = {
                'tipu-sultan': {
                    name: 'Alarahi Tipu Sultan',
                    address: 'Plot 27/47 Modern Housing Cooperative Society Ltd, Block 7 and 8, Tipu Sultan Road, Karachi'
                },
                'dha-outlet': {
                    name: 'Alarahi DHA Phase 2',
                    address: 'Shop # 12, Lane 4, Sehar Commercial Area, Phase 2 Extension, DHA, Karachi'
                }
            };

            const location = locations[locationId];
            if (!location || !this.elements.locationInfo) return;

            console.log('🏢 OrderMethodSelector: Updating location details for:', location.name);

            this.elements.locationInfo.innerHTML = `
                <h4 class="font-medium text-gray-800 mb-2">${location.name}</h4>
                <p class="text-sm text-gray-600 mb-3">${location.address}</p>
                <button class="directions-btn bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors" onclick="orderMethodSelector.getDirections('${location.address}')">
                    Get Directions
                </button>
            `;
        }

        /**
         * Get directions to location
         */
        getDirections(address) {
            const encodedAddress = encodeURIComponent(address + ', Karachi, Pakistan');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

            console.log('🗺️ OrderMethodSelector: Opening directions to:', address);
            window.open(mapsUrl, '_blank');
        }

        /**
         * Handle form submission
         */
        handleSubmit() {
            console.log('✅ OrderMethodSelector: Submitting order method');
            console.log('Order Type:', this.currentOrderType);
            console.log('Selected Location:', this.selectedLocation);

            // Validate selection
            if (!this.selectedLocation) {
                this.showMessage('Please select a location first.', 'error');
                return;
            }

            // Store selection in session (could also use localStorage if needed)
            const orderData = {
                type: this.currentOrderType,
                location: this.selectedLocation,
                timestamp: new Date().toISOString()
            };

            // For now, just log and close popup
            console.log('📝 Order data:', orderData);

            // Close popup with success message
            this.showMessage('Order type selected successfully!', 'success');

            setTimeout(() => {
                this.closePopup();
            }, 1500);
        }

        /**
         * Show popup with animation
         */
        showPopup() {
            if (!this.elements.overlay) return;

            this.elements.overlay.style.display = 'flex';

            // Animate in
            setTimeout(() => {
                this.elements.overlay.style.opacity = '1';
                if (this.elements.container) {
                    this.elements.container.style.transform = 'scale(1)';
                }
            }, 10);
        }

        /**
         * Close popup with animation
         */
        closePopup() {
            if (!this.elements.overlay) return;

            console.log('🚪 OrderMethodSelector: Closing popup');

            // Animate out
            this.elements.overlay.style.opacity = '0';
            if (this.elements.container) {
                this.elements.container.style.transform = 'scale(0.95)';
            }

            setTimeout(() => {
                this.elements.overlay.style.display = 'none';
            }, 300);
        }

        /**
         * Show success/error messages
         */
        showMessage(text, type = 'info') {
            // Simple toast-like message (could be enhanced)
            const existingMessage = document.querySelector('.order-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            const message = document.createElement('div');
            message.className = `order-message fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-[10000] transition-all duration-300 ${
                type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`;
            message.textContent = text;

            document.body.appendChild(message);

            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => message.remove(), 300);
            }, 3000);
        }
    }

    // Global instance
    window.orderMethodSelector = null;

    /**
     * Initialize the order method selector
     */
    function initializeOrderMethodSelector() {
        console.log('🎬 OrderMethodSelector: Starting initialization...');

        if (window.orderMethodSelector) {
            console.log('⚠️ OrderMethodSelector: Already exists, reinitializing...');
        }

        window.orderMethodSelector = new OrderMethodSelector();
        window.orderMethodSelector.init();
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOrderMethodSelector);
    } else {
        initializeOrderMethodSelector();
    }

    // Fallback initialization
    setTimeout(initializeOrderMethodSelector, 500);

    console.log('📜 OrderMethodSelector: Main script loaded');

})();