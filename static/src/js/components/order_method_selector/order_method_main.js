/**
 * Enhanced Order Method Main Controller - Updated for Location Integration
 * File: static/src/js/components/order_method_selector/order_method_main.js
 * Purpose: Main controller with proper location component integration
 */

(function() {
    'use strict';

    console.log('🚀 Order Method Selector: Loading enhanced main controller...');

    // Check if we're on backend/admin pages and exit early
    function isBackendPage() {
        const path = window.location.pathname;
        const isBackend = path.includes('/web') ||
                         path.includes('/login') ||
                         path.includes('/admin') ||
                         path.includes('/database') ||
                         document.body.classList.contains('o_backend');

        if (isBackend) {
            console.log('🚫 Order Method Selector: Backend page detected, skipping initialization');
            return true;
        }
        return false;
    }

    if (isBackendPage()) {
        return;
    }

    // Enhanced Order Method Selector Class
    class OrderMethodSelector {
        constructor() {
            this.currentOrderType = 'delivery';
            this.selectedLocation = null;
            this.isInitialized = false;

            // Component instances
            this.locationComponent = null;

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
                },
                autoShow: window.location.pathname === '/' || window.location.pathname === '/home',
                url: {
                    updateEnabled: true,
                    paramName: 'order_type',
                    deliveryValue: 'delivery',
                    pickupValue: 'pickup'
                }
            };

            console.log('📱 OrderMethodSelector: Enhanced instance created');
        }

        /**
         * Initialize the order method selector with location integration
         */
        init() {
            if (this.isInitialized) {
                console.log('⚠️ OrderMethodSelector: Already initialized');
                return;
            }

            if (isBackendPage()) {
                console.log('🚫 OrderMethodSelector: Backend detected in init, aborting');
                return;
            }

            console.log('🔧 OrderMethodSelector: Initializing enhanced version...');

            // Cache DOM elements
            this.cacheElements();

            if (!this.validateElements()) {
                console.error('❌ OrderMethodSelector: Required elements not found');
                return;
            }

            // Initialize URL handling
            this.initializeUrlHandling();

            // Initialize components
            this.initializeToggleButtons();
            this.initializeLocationComponent(); // NEW: Initialize location component
            this.initializeSubmitButton();
            this.initializePopupControls();

            // Set initial state
            this.setInitialState();

            this.isInitialized = true;
            console.log('✅ OrderMethodSelector: Enhanced initialization complete');
        }

        /**
         * Initialize the location component
         */
        initializeLocationComponent() {
            console.log('📍 OrderMethodSelector: Initializing location component...');

            // Check if OrderMethodLocation is available
            if (typeof window.OrderMethodLocation === 'undefined') {
                console.error('❌ OrderMethodLocation component not found');
                return;
            }

            // Create location component instance
            this.locationComponent = new window.OrderMethodLocation({
                primaryColor: this.config.colors.primary,
                geolocationTimeout: 10000,
                animationDuration: this.config.animations.duration
            });

            // Initialize with elements
            const locationElements = {
                dropdown: this.elements.dropdown,
                locationBtn: this.elements.locationBtn
            };

            if (!this.locationComponent.init(locationElements)) {
                console.error('❌ Failed to initialize location component');
                return;
            }

            // Register callbacks
            this.setupLocationCallbacks();

            console.log('✅ Location component initialized successfully');
        }

        /**
         * Setup location component callbacks
         */
        setupLocationCallbacks() {
            if (!this.locationComponent) return;

            // Handle location changes
            this.locationComponent.onChange((locationValue, locationData) => {
                console.log('📍 Location changed via component:', locationValue, locationData);
                this.handleLocationChange(locationValue, locationData);
            });

            // Handle location success
            this.locationComponent.onSuccess((message) => {
                console.log('✅ Location success:', message);
                this.showMessage(message, 'success');
            });

            // Handle location errors
            this.locationComponent.onError((error) => {
                console.log('❌ Location error:', error);
                this.showMessage(error, 'error');
            });

            // Listen for custom location events
            document.addEventListener('orderLocationChange', (e) => {
                console.log('📡 Received location change event:', e.detail);
                this.selectedLocation = e.detail.value;
                
                // Update location details if it's pickup mode
                if (this.currentOrderType === 'pickup' && e.detail.data) {
                    this.updateLocationDetailsFromData(e.detail.data);
                }
            });
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

            console.log('📦 OrderMethodSelector: Elements cached');
        }

        /**
         * Validate that required elements exist
         */
        validateElements() {
            const required = ['overlay', 'deliveryBtn', 'pickupBtn', 'dropdown', 'submitBtn'];
            const missing = required.filter(key => !this.elements[key]);

            if (missing.length > 0) {
                console.log('❌ Missing required elements:', missing);
                return false;
            }

            return true;
        }

        /**
         * Initialize URL handling
         */
        initializeUrlHandling() {
            console.log('🔗 OrderMethodSelector: Initializing URL handling...');

            window.addEventListener('popstate', (event) => {
                console.log('🔙 OrderMethodSelector: Popstate event detected');
                this.handleUrlChange();
            });

            this.handleUrlChange();
        }

        /**
         * Handle URL changes
         */
        handleUrlChange() {
            if (!this.config.url.updateEnabled) return;

            const urlParams = new URLSearchParams(window.location.search);
            const urlOrderType = urlParams.get(this.config.url.paramName);

            console.log('🔍 OrderMethodSelector: URL order type:', urlOrderType);

            if (urlOrderType && (urlOrderType === 'delivery' || urlOrderType === 'pickup')) {
                this.switchOrderType(urlOrderType, false);
            }
        }

        /**
         * Update URL with current order type
         */
        updateUrl(orderType) {
            if (!this.config.url.updateEnabled) {
                console.log('🚫 OrderMethodSelector: URL updates disabled');
                return;
            }

            try {
                const url = new URL(window.location);
                url.searchParams.set(this.config.url.paramName, orderType);
                
                window.history.pushState(
                    { orderType: orderType }, 
                    '', 
                    url.toString()
                );

                console.log('🔗 OrderMethodSelector: URL updated to:', url.toString());
            } catch (error) {
                console.error('❌ OrderMethodSelector: Failed to update URL:', error);
            }
        }

        /**
         * Initialize toggle buttons functionality
         */
        initializeToggleButtons() {
            console.log('🔘 OrderMethodSelector: Initializing toggle buttons...');

            this.elements.deliveryBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚚 Delivery button clicked');
                this.switchOrderType('delivery');
            });

            this.elements.pickupBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🏪 Pickup button clicked');
                this.switchOrderType('pickup');
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
         * Initialize popup controls
         */
        initializePopupControls() {
            this.elements.overlay?.addEventListener('click', (e) => {
                if (e.target === this.elements.overlay) {
                    this.closePopup();
                }
            });

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

            const urlParams = new URLSearchParams(window.location.search);
            const urlOrderType = urlParams.get(this.config.url.paramName);
            
            let initialType = 'delivery';
            let shouldUpdateUrl = true;

            if (urlOrderType && (urlOrderType === 'delivery' || urlOrderType === 'pickup')) {
                initialType = urlOrderType;
                shouldUpdateUrl = false;
                console.log('🔗 OrderMethodSelector: Using order type from URL:', initialType);
            } else {
                console.log('🔗 OrderMethodSelector: No URL parameter found, will set default delivery in URL');
            }

            this.switchOrderType(initialType, shouldUpdateUrl);

            if (this.config.autoShow && !sessionStorage.getItem('orderMethodSelected')) {
                setTimeout(() => {
                    this.showPopup();
                }, 1000);
            }
        }

        /**
         * Switch between delivery and pickup modes
         */
        switchOrderType(type, updateUrl = true) {
            console.log(`🔄 OrderMethodSelector: Switching to ${type}${updateUrl ? ' (with URL update)' : ' (without URL update)'}`);

            this.currentOrderType = type;

            if (updateUrl) {
                this.updateUrl(type);
            }

            this.updateToggleButtons(type);

            if (type === 'delivery') {
                this.setupDeliveryMode();
            } else {
                this.setupPickupMode();
            }

            this.dispatchOrderTypeChangeEvent(type);
        }

        /**
         * Dispatch custom event when order type changes
         */
        dispatchOrderTypeChangeEvent(orderType) {
            const event = new CustomEvent('orderTypeChanged', {
                detail: {
                    orderType: orderType,
                    timestamp: Date.now(),
                    source: 'orderMethodSelector'
                },
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(event);
            console.log('📡 OrderMethodSelector: Order type change event dispatched:', event.detail);
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

            if (this.elements.subtitle) {
                this.elements.subtitle.textContent = 'Please select your delivery location';
            }

            if (this.elements.locationBtn) {
                this.elements.locationBtn.style.display = 'inline-flex';
            }

            if (this.elements.locationDetails) {
                this.elements.locationDetails.classList.add('hidden');
            }

            // Update location component options
            if (this.locationComponent) {
                this.locationComponent.updateOptions('delivery');
            }
        }

        /**
         * Setup pickup mode UI
         */
        setupPickupMode() {
            console.log('🏪 OrderMethodSelector: Setting up pickup mode');

            if (this.elements.subtitle) {
                this.elements.subtitle.textContent = 'Which outlet would you like to pick-up from?';
            }

            if (this.elements.locationBtn) {
                this.elements.locationBtn.style.display = 'inline-flex'; // Keep visible for auto-selection
            }

            if (this.elements.locationDetails) {
                this.elements.locationDetails.classList.remove('hidden');
            }

            // Update location component options
            if (this.locationComponent) {
                this.locationComponent.updateOptions('pickup');
            }
        }

        /**
         * Enhanced location change handler that works with location component
         */
        handleLocationChange(value, locationData = null) {
            console.log('📍 OrderMethodSelector: Location changed to:', value, locationData);

            this.selectedLocation = value;

            // If we have location data (from pickup mode), update details
            if (this.currentOrderType === 'pickup' && locationData) {
                this.updateLocationDetailsFromData(locationData);
            } else if (this.currentOrderType === 'pickup' && value) {
                // Fallback to old method if no location data provided
                this.updateLocationDetails(value);
            }
        }

        /**
         * Update location details using location component data
         */
        updateLocationDetailsFromData(locationData) {
            if (!locationData || !this.elements.locationInfo) return;

            console.log('🏢 OrderMethodSelector: Updating location details with data:', locationData);

            this.elements.locationInfo.innerHTML = `
                <h4 class="font-medium text-gray-800 mb-2">${locationData.name}</h4>
                <p class="text-sm text-gray-600 mb-3">${locationData.address}</p>
                <button class="directions-btn bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors" onclick="orderMethodSelector.getDirections('${locationData.address}')">
                    Get Directions
                </button>
            `;
        }

        /**
         * Fallback method for updating location details (legacy support)
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

            if (!this.selectedLocation) {
                this.showMessage('Please select a location first.', 'error');
                return;
            }

            const orderData = {
                type: this.currentOrderType,
                location: this.selectedLocation,
                timestamp: new Date().toISOString()
            };

            sessionStorage.setItem('orderMethodSelected', JSON.stringify(orderData));
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

        /**
         * Manual trigger for popup
         */
        triggerPopup() {
            this.showPopup();
        }

        /**
         * Get current URL parameters
         */
        getCurrentUrlParams() {
            return new URLSearchParams(window.location.search);
        }

        /**
         * Get order type from URL
         */
        getOrderTypeFromUrl() {
            const params = this.getCurrentUrlParams();
            return params.get(this.config.url.paramName);
        }
    }

    // Global instance
    window.orderMethodSelector = null;

    /**
     * Initialize the enhanced order method selector
     */
    function initializeOrderMethodSelector() {
        if (isBackendPage()) {
            console.log('🚫 OrderMethodSelector: Backend page, skipping initialization');
            return;
        }

        console.log('🎬 OrderMethodSelector: Starting enhanced initialization...');

        if (window.orderMethodSelector) {
            console.log('⚠️ OrderMethodSelector: Already exists, reinitializing...');
        }

        window.orderMethodSelector = new OrderMethodSelector();
        window.orderMethodSelector.init();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOrderMethodSelector);
    } else {
        initializeOrderMethodSelector();
    }

    // Fallback initialization
    setTimeout(() => {
        if (!isBackendPage() && !window.orderMethodSelector?.isInitialized) {
            initializeOrderMethodSelector();
        }
    }, 1000);

    console.log('📜 OrderMethodSelector: Enhanced main script loaded');

})();