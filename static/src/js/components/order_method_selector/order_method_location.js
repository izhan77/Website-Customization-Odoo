/**
 * Order Method Location Component with FREE OpenStreetMap
 * File: static/src/js/components/order_method_selector/order_method_location_free.js
 * Purpose: Handles location selection with OpenStreetMap (completely free!)
 */

(function() {
    'use strict';

    console.log('📍 OrderMethodLocation (FREE): Loading location component...');

    class OrderMethodLocation {
        constructor(config = {}) {
            this.config = {
                primaryColor: config.primaryColor || '#7abfba',
                geolocationTimeout: config.geolocationTimeout || 10000,
                animationDuration: config.animationDuration || 300,
                // FREE OpenStreetMap configuration
                mapTileUrl: config.mapTileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                mapAttribution: config.mapAttribution || '© OpenStreetMap contributors',
                // Alternative free tile servers:
                // mapTileUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', // Topographic
                // mapTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', // ESRI
            };

            this.currentLocation = null;
            this.isDetectingLocation = false;
            this.callbacks = {};
            this.elements = {};
            this.map = null;
            this.marker = null;
            this.userPosition = null;
            this.errorShown = false;
            this.leafletLoaded = false;
            this.isInitialized = false; // NEW: track initialization state
            this.leafletInitializing = false;

            // Location data - same as before
            this.locationData = {
                delivery: [
                    { value: '', text: 'Select your delivery area', disabled: true },
                    { value: 'dha', text: 'DHA Phase 2' },
                    { value: 'gulshan', text: 'Gulshan-e-Iqbal' },
                    { value: 'bahadurabad', text: 'Bahadurabad' },
                    { value: 'clifton', text: 'Clifton' },
                    { value: 'saddar', text: 'Saddar' },
                    { value: 'nazimabad', text: 'Nazimabad' },
                    { value: 'north-karachi', text: 'North Karachi' }
                ],
                pickup: [
                    {
                        value: 'tipu-sultan',
                        text: 'Alarahi Tipu Sultan',
                        name: 'Alarahi Tipu Sultan',
                        address: 'Plot 27/47 Modern Housing Cooperative Society Ltd, Block 7 and 8, Tipu Sultan Road, Karachi',
                        coordinates: { lat: 24.8607, lng: 67.0011 }
                    },
                    {
                        value: 'dha-outlet',
                        text: 'Alarahi DHA Phase 2',
                        name: 'Alarahi DHA Phase 2',
                        address: 'Shop # 12, Lane 4, Sehar Commercial Area, Phase 2 Extension, DHA, Karachi',
                        coordinates: { lat: 24.8015, lng: 67.0784 }
                    }
                ]
            };

            console.log('📍 OrderMethodLocation (FREE): Instance created');
        }

        /**
         * Initialize the location component
         * elements: { dropdown: HTMLElement, locationBtn?: HTMLElement }
         */
        init(elements = {}) {
            console.log('🔧 OrderMethodLocation (FREE): Initializing...');

            // Ensure elements object exists
            if (!elements || typeof elements !== 'object') {
                console.error('❌ OrderMethodLocation: init requires an elements object with at least { dropdown }');
                return false;
            }

            this.elements = Object.assign({}, elements);

            if (!this.validateElements()) {
                console.error('❌ OrderMethodLocation: Invalid elements provided - initialization aborted');
                this.isInitialized = false;
                return false;
            }

            try {
                this.bindEvents();
                this.setupDropdownStyling();
                this.setupMapsPopup();
                // Check geolocation support but don't abort initialization; only show warnings
                this.checkGeolocationSupport();

                this.isInitialized = true;
                console.log('✅ OrderMethodLocation (FREE): Initialization complete');
                return true;
            } catch (err) {
                console.error('❌ OrderMethodLocation: Initialization exception', err);
                this.isInitialized = false;
                return false;
            }
        }

        /**
         * Validate required DOM elements
         */
        validateElements() {
            const required = ['dropdown'];
            const missing = required.filter(key => !this.elements[key]);

            if (missing.length > 0) {
                console.error('❌ OrderMethodLocation: Missing elements:', missing);
                this.showFriendlyError(`Developer error: missing UI elements: ${missing.join(', ')}`);
                return false;
            }

            // Ensure dropdown is actually a select/input element
            const dd = this.elements.dropdown;
            if (!(dd instanceof HTMLElement)) {
                console.error('❌ OrderMethodLocation: dropdown is not a valid HTMLElement');
                this.showFriendlyError('Developer error: dropdown element is invalid.');
                return false;
            }

            return true;
        }

        /**
         * Check if geolocation is supported
         * NOTE: this no longer aborts initialization — it only warns and shows friendly messages.
         */
        checkGeolocationSupport() {
            if (!navigator.geolocation) {
                console.warn('❌ Geolocation not supported by this browser');
                this.showFriendlyError('Your browser does not support geolocation. You can select location manually.');
                return;
            }

            const isLocalhost = window.location.hostname === 'localhost' ||
                                window.location.hostname === '127.0.0.1' ||
                                window.location.hostname === '::1';

            const isHTTPS = window.location.protocol === 'https:';

            if (!isLocalhost && !isHTTPS) {
                console.warn('⚠️ Geolocation requires HTTPS except on localhost');
                // show a non-blocking message
                this.showFriendlyError('Location detection works better with HTTPS. Some features may be limited.');
                // do not return false — allow UI features to work (map can still load)
            } else {
                console.log('✅ Geolocation support check passed or allowed (localhost/HTTPS).');
            }
        }

        /**
         * Setup maps popup
         */
        setupMapsPopup() {
            // Avoid duplicate insertion
            if (!document.getElementById('maps-popup-overlay')) {
                const mapsPopupHTML = `
                    <div id="maps-popup-overlay" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[10000] hidden" aria-hidden="true" role="dialog" aria-modal="true">
                        <div id="maps-popup-container" class="bg-white rounded-2xl p-6 w-full max-w-md text-center shadow-xl transform transition-all duration-300 scale-95">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">📍 Select Your Location</h3>
                            <p class="text-sm text-gray-600 mb-6">Click on the map to select your location, or drag the marker to adjust.</p>

                            <div id="maps-container" class="w-full h-48 bg-gray-100 rounded-lg mb-6 relative overflow-hidden border-2 border-gray-200">
                                <div id="maps-loading" class="absolute inset-0 flex items-center justify-center">
                                    <div class="text-center">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                        <span class="text-gray-500 text-sm">Loading FREE map...</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex gap-3 justify-center">
                                <button id="maps-cancel-btn" class="px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button id="maps-confirm-btn" class="px-4 py-2 rounded-lg text-white font-medium bg-[#7abfba] hover:opacity-90 transition-colors">
                                    Confirm Location
                                </button>
                                <button id="detect-location-btn" class="px-4 py-2 rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 transition-colors">
                                    📍 Auto-Detect
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', mapsPopupHTML);
            }

            // Cache elements (if they exist now)
            this.elements.mapsOverlay = document.getElementById('maps-popup-overlay');
            this.elements.mapsContainer = document.getElementById('maps-popup-container');
            this.elements.mapsCancelBtn = document.getElementById('maps-cancel-btn');
            this.elements.mapsConfirmBtn = document.getElementById('maps-confirm-btn');
            this.elements.detectLocationBtn = document.getElementById('detect-location-btn');
            this.elements.mapsElement = document.getElementById('maps-container');
            this.elements.mapsLoading = document.getElementById('maps-loading');

            // Bind events safely
            if (this.elements.mapsCancelBtn) {
                this.elements.mapsCancelBtn.addEventListener('click', () => this.hideMapsPopup());
            }
            if (this.elements.mapsConfirmBtn) {
                this.elements.mapsConfirmBtn.addEventListener('click', () => this.confirmLocationSelection());
            }
            if (this.elements.detectLocationBtn) {
                this.elements.detectLocationBtn.addEventListener('click', () => this.detectCurrentLocationInMap());
            }

            // Close on overlay click (only if overlay exists)
            if (this.elements.mapsOverlay) {
                this.elements.mapsOverlay.addEventListener('click', (e) => {
                    if (e.target === this.elements.mapsOverlay) {
                        this.hideMapsPopup();
                    }
                });
            }
        }

        /**
         * Show maps popup
         */
        showMapsPopup() {
            if (!this.elements.mapsOverlay || !this.elements.mapsElement) {
                console.error('❌ OrderMethodLocation: maps popup elements not available');
                this.showFriendlyError('Map UI is not available. Make sure the component is initialized properly.');
                return;
            }

            // Show overlay
            this.elements.mapsOverlay.classList.remove('hidden');
            // small delay to allow CSS transitions
            setTimeout(() => {
                try {
                    this.elements.mapsOverlay.style.opacity = '1';
                    if (this.elements.mapsContainer) {
                        this.elements.mapsContainer.style.transform = 'scale(1)';
                    }
                } catch (e) { /* ignore style set errors */ }

                // Load Leaflet and initialize map (if necessary)
                if (this.leafletLoaded && window.L) {
                    // if map was removed earlier, re-init
                    if (!this.map) {
                        this.initLeafletMap();
                    }
                } else {
                    // show loading message and start loading leaflet
                    if (this.elements.mapsLoading) {
                        this.elements.mapsLoading.style.display = 'flex';
                    }
                    this.loadLeafletMap();
                }
            }, 10);
        }

        /**
         * Hide maps popup
         */
        hideMapsPopup() {
            if (!this.elements.mapsOverlay) return;

            try {
                this.elements.mapsOverlay.style.opacity = '0';
                if (this.elements.mapsContainer) {
                    this.elements.mapsContainer.style.transform = 'scale(0.95)';
                }
            } catch (e) { /* ignore style set errors */ }

            setTimeout(() => {
                if (this.elements.mapsOverlay) {
                    this.elements.mapsOverlay.classList.add('hidden');
                }
                // hide loading indicator if any
                if (this.elements.mapsLoading) {
                    this.elements.mapsLoading.style.display = '';
                }
            }, 300);
        }

        /**
         * Load Leaflet map library and initialize
         */
        loadLeafletMap() {
            if (this.leafletLoaded && window.L) {
                this.initLeafletMap();
                return;
            }

            // If another load is in progress, just wait
            if (window.leafletLoading || this.leafletInitializing) {
                // nothing to do; init will be called by the onload handler already attached
                return;
            }

            window.leafletLoading = true;
            this.leafletInitializing = true;

            // Load Leaflet CSS
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                link.crossOrigin = '';
                document.head.appendChild(link);
            }

            // Load Leaflet JS
            if (!window.L) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.defer = true;
                script.onload = () => {
                    console.log('✅ Leaflet loaded successfully');
                    this.leafletLoaded = true;
                    window.leafletLoading = false;
                    this.leafletInitializing = false;

                    // init map after a brief pause to ensure CSS loaded
                    setTimeout(() => {
                        this.initLeafletMap();
                    }, 100);
                };
                script.onerror = () => {
                    console.error('❌ Failed to load Leaflet');
                    window.leafletLoading = false;
                    this.leafletInitializing = false;
                    this.handleLocationError('Could not load map. Please check your internet connection or try again later.');
                };
                document.head.appendChild(script);
            } else {
                // already loaded in global scope
                this.leafletLoaded = true;
                window.leafletLoading = false;
                this.leafletInitializing = false;
                setTimeout(() => this.initLeafletMap(), 100);
            }
        }

        /**
         * Initialize Leaflet map
         */
        initLeafletMap() {
            if (!window.L) {
                console.error('❌ Leaflet not loaded');
                this.handleLocationError('Map library not loaded.');
                return;
            }

            // Guard: if mapsElement missing, abort
            if (!this.elements.mapsElement) {
                console.error('❌ maps container element not found');
                this.handleLocationError('Map container not found.');
                return;
            }

            // Clear loading message or previous content
            try {
                this.elements.mapsElement.innerHTML = '';
                if (this.elements.mapsLoading) {
                    this.elements.mapsLoading.style.display = 'none';
                }
            } catch (e) { /* ignore */ }

            try {
                // If a previous map exists, remove it cleanly
                if (this.map) {
                    try {
                        this.map.off();
                        this.map.remove();
                    } catch (e) { /* ignore remove errors */ }
                    this.map = null;
                    this.marker = null;
                }

                // Create map
                this.map = L.map(this.elements.mapsElement, {
                    center: [24.8607, 67.0011], // Karachi default center
                    zoom: 12,
                    zoomControl: true,
                    attributionControl: true
                });

                // Add tile layer (FREE OpenStreetMap)
                L.tileLayer(this.config.mapTileUrl, {
                    attribution: this.config.mapAttribution,
                    maxZoom: 18,
                    subdomains: ['a', 'b', 'c']
                }).addTo(this.map);

                // Create custom marker icon
                const customIcon = L.divIcon({
                    className: 'custom-location-marker',
                    html: `
                        <div style="
                            width: 30px; 
                            height: 30px; 
                            background: ${this.config.primaryColor}; 
                            border: 3px solid white; 
                            border-radius: 50%; 
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            position: relative;
                        ">
                            <div style="
                                position: absolute;
                                bottom: -8px;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0;
                                height: 0;
                                border-left: 6px solid transparent;
                                border-right: 6px solid transparent;
                                border-top: 8px solid ${this.config.primaryColor};
                            "></div>
                        </div>
                    `,
                    iconSize: [30, 38],
                    iconAnchor: [15, 38]
                });

                // Add draggable marker
                this.marker = L.marker([24.8607, 67.0011], {
                    icon: customIcon,
                    draggable: true
                }).addTo(this.map);

                // Add click event to map
                this.map.on('click', (e) => {
                    if (this.marker) {
                        this.marker.setLatLng(e.latlng);
                        this.showLocationSuccess('Location updated! Click "Confirm Location" when ready.');
                    }
                });

                // Add marker drag event
                if (this.marker) {
                    this.marker.on('dragend', () => {
                        this.showLocationSuccess('Location updated! Click "Confirm Location" when ready.');
                    });

                    // Add popup to marker
                    this.marker.bindPopup(`
                        <div style="text-align: center; padding: 5px;">
                            <strong>📍 Your Location</strong><br>
                            <small>Drag marker or click map to adjust</small>
                        </div>
                    `).openPopup();
                }

                // Try to detect user location (non-blocking)
                this.detectCurrentLocationInMap();

                console.log('✅ Leaflet map initialized successfully');

            } catch (error) {
                console.error('❌ Error initializing Leaflet map:', error);
                this.handleLocationError('Failed to initialize map. Please try again.');
            }
        }

        /**
         * Detect current location and update map
         */
        detectCurrentLocationInMap() {
            if (!navigator.geolocation) {
                this.showFriendlyError('Your browser does not support location detection.');
                return;
            }

            // Ensure map is ready; if not, try to initialize
            if (!this.map) {
                // If leaflet not loaded, trigger loading and retry after load
                if (!this.leafletLoaded) {
                    this.loadLeafletMap();
                    // Give user a hint
                    this.showFriendlyMessage('Loading map — will try auto-detect when ready.', 'info');
                    return;
                } else {
                    // Leaflet loaded but map missing — initialize
                    this.initLeafletMap();
                }
            }

            // Update button state safely
            const btn = this.elements.detectLocationBtn;
            const originalText = (btn && btn.innerHTML) ? btn.innerHTML : '📍 Auto-Detect';
            if (btn) {
                btn.innerHTML = '🔍 Detecting...';
                btn.disabled = true;
            }

            // Mark that detection is in progress
            this.isDetectingLocation = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.isDetectingLocation = false;

                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    console.log('✅ Location detected:', { lat, lng });

                    // Update map and marker only if map exists
                    if (this.map) {
                        try {
                            this.map.setView([lat, lng], 15);
                        } catch (e) { /* ignore map setView errors */ }
                    }

                    if (this.marker) {
                        try {
                            this.marker.setLatLng([lat, lng]);
                            this.marker.bindPopup(`
                                <div style="text-align: center; padding: 5px;">
                                    <strong>📍 Your Current Location</strong><br>
                                    <small>Accuracy: ~${Math.round(position.coords.accuracy)}m</small>
                                </div>
                            `).openPopup();
                        } catch (e) { /* ignore marker errors */ }
                    }

                    this.showLocationSuccess('Current location detected successfully!');

                    // Restore button state
                    if (btn) {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                },
                (error) => {
                    this.isDetectingLocation = false;
                    console.error('❌ Geolocation error:', error);
                    this.handleLocationError(this.getLocationErrorMessage(error));

                    // Restore button state
                    if (btn) {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: this.config.geolocationTimeout,
                    maximumAge: 300000
                }
            );
        }

        /**
         * Confirm location selection
         */
        confirmLocationSelection() {
            if (!this.marker) {
                this.handleLocationError('Marker is not available. Please select your location on the map.');
                return;
            }

            const latlng = this.marker.getLatLng();
            console.log('📍 Confirming location:', latlng);

            // Find nearest location
            const nearestLocation = this.findNearestLocation({
                latitude: latlng.lat,
                longitude: latlng.lng
            });

            if (nearestLocation) {
                // set dropdown value safely
                try {
                    this.elements.dropdown.value = nearestLocation.value;
                } catch (e) { /* ignore set value errors */ }

                this.handleLocationChange(nearestLocation.value);
                this.showLocationSuccess(`📍 Nearest outlet selected: ${nearestLocation.name}`);
            } else {
                this.handleLocationError('No nearby outlets found for your location.');
            }

            this.hideMapsPopup();
        }

        /**
         * Bind events
         */
        bindEvents() {
            console.log('🔗 OrderMethodLocation: Binding events...');

            // Dropdown change
            if (this.elements.dropdown) {
                this.elements.dropdown.addEventListener('change', (e) => {
                    this.handleLocationChange(e.target.value);
                });
            }

            // Optional location button to open map
            if (this.elements.locationBtn) {
                this.elements.locationBtn.addEventListener('click', () => {
                    // show map popup (this will load leaflet if needed)
                    this.showMapsPopup();
                });
            }
        }

        /**
         * Setup dropdown styling
         */
        setupDropdownStyling() {
            if (!this.elements.dropdown) return;

            this.elements.dropdown.addEventListener('focus', () => {
                try {
                    this.elements.dropdown.style.borderColor = this.config.primaryColor;
                    this.elements.dropdown.style.boxShadow = `0 0 0 3px ${this.config.primaryColor}20`;
                } catch (e) { /* ignore style errors */ }
            });

            this.elements.dropdown.addEventListener('blur', () => {
                try {
                    this.elements.dropdown.style.borderColor = '#d1d5db';
                    this.elements.dropdown.style.boxShadow = 'none';
                } catch (e) { /* ignore style errors */ }
            });
        }

        /**
         * Update dropdown options
         */
        updateOptions(orderType) {
            console.log(`📋 OrderMethodLocation: Updating options for ${orderType}`);

            if (!this.elements.dropdown) return;

            this.elements.dropdown.innerHTML = '';

            const options = this.locationData[orderType] || [];

            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;

                if (option.disabled) {
                    optionElement.disabled = true;
                    optionElement.selected = true;
                }

                this.elements.dropdown.appendChild(optionElement);
            });

            this.currentLocation = null;

            if (orderType === 'pickup' && options.length > 0) {
                const firstValid = options.find(opt => !opt.disabled);
                if (firstValid) {
                    setTimeout(() => {
                        try {
                            this.elements.dropdown.value = firstValid.value;
                            this.handleLocationChange(firstValid.value);
                        } catch (e) { /* ignore set value errors */ }
                    }, 100);
                }
            }
        }

        /**
         * Handle location change
         */
        handleLocationChange(locationValue) {
            console.log('📍 OrderMethodLocation: Location changed to:', locationValue);

            this.currentLocation = locationValue;
            const allLocations = [...this.locationData.delivery, ...this.locationData.pickup];
            const selectedLocation = allLocations.find(loc => loc.value === locationValue);

            if (this.callbacks.onChange) {
                try {
                    this.callbacks.onChange(locationValue, selectedLocation);
                } catch (e) {
                    console.error('Callback onChange error:', e);
                }
            }

            this.dispatchLocationEvent(locationValue, selectedLocation);
        }

        /**
         * Find nearest location
         */
        findNearestLocation(userCoords) {
            const pickupLocations = this.locationData.pickup.filter(loc => loc.coordinates);

            if (pickupLocations.length === 0) return null;

            let nearest = null;
            let minDistance = Infinity;

            pickupLocations.forEach(location => {
                const distance = this.calculateDistance(
                    userCoords.latitude,
                    userCoords.longitude,
                    location.coordinates.lat,
                    location.coordinates.lng
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = location;
                }
            });

            if (nearest) {
                console.log(`📍 Nearest location: ${nearest.name} (${minDistance.toFixed(2)}km away)`);
            } else {
                console.log('📍 No nearest pickup found');
            }
            return nearest;
        }

        /**
         * Calculate distance using Haversine formula
         */
        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in km
            const dLat = this.degToRad(lat2 - lat1);
            const dLon = this.degToRad(lon2 - lon1);

            const a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        degToRad(deg) {
            return deg * (Math.PI/180);
        }

        /**
         * Error handling and messaging
         */
        getLocationErrorMessage(error) {
            // Defensive access in case non-standard object was passed
            const code = error && error.code;
            switch(code) {
                case error.PERMISSION_DENIED:
                    return 'Please allow location access. Click the location icon in your browser address bar and select "Allow".';
                case error.POSITION_UNAVAILABLE:
                    return 'Unable to determine your location. Please select your area manually or try again.';
                case error.TIMEOUT:
                    return 'Location detection timed out. Please select your area manually.';
                default:
                    // If error has message, include it
                    const msg = (error && error.message) ? ` (${error.message})` : '';
                    return 'Location detection failed. Please select your area manually.' + msg;
            }
        }

        showLocationSuccess(message) {
            if (this.callbacks.onSuccess) {
                try {
                    this.callbacks.onSuccess(message);
                } catch (e) {
                    console.error('onSuccess callback error:', e);
                }
            }
            this.showFriendlyMessage(message, 'success');
            console.log('✅ OrderMethodLocation:', message);
        }

        handleLocationError(message) {
            // Debounce repeated error displays
            if (!this.errorShown) {
                this.errorShown = true;
                this.showFriendlyError(message);
                setTimeout(() => {
                    this.errorShown = false;
                }, 5000);
            }

            if (this.callbacks.onError) {
                try {
                    this.callbacks.onError(message);
                } catch (e) {
                    console.error('onError callback error:', e);
                }
            }
            console.error('❌ OrderMethodLocation:', message);
        }

        showFriendlyError(message) {
            this.removeExistingMessages();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'location-message location-error';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '20px';
            errorDiv.style.right = '20px';
            errorDiv.style.zIndex = '10001';
            errorDiv.style.maxWidth = '350px';
            errorDiv.style.animation = 'slideInRight 0.3s ease-out';
            errorDiv.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
                    color: #c62828; padding: 16px 20px; border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    display: flex; align-items: flex-start; gap: 12px;
                    border-left: 4px solid #f44336; backdrop-filter: blur(10px);
                ">
                    <span style="font-size: 18px; line-height: 1;">⚠️</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">Location Error</div>
                        <div style="font-size: 14px; line-height: 1.4;">${message}</div>
                    </div>
                    <button class="location-close-btn" aria-label="Close" style="
                        background: none; border: none; color: #c62828; cursor: pointer; font-size: 18px; padding: 0;
                    ">×</button>
                </div>
            `;
            document.body.appendChild(errorDiv);

            // attach close behaviour
            const closeBtn = errorDiv.querySelector('.location-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (errorDiv.parentNode) errorDiv.remove();
                });
            }

            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (errorDiv.parentNode) errorDiv.remove();
                    }, 300);
                }
            }, 8000);
        }

        showFriendlyMessage(message, type = 'success') {
            this.removeExistingMessages();

            const colors = {
                success: { bg: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', color: '#2e7d32', border: '#4caf50', icon: '✅' },
                info: { bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', color: '#1565c0', border: '#2196f3', icon: 'ℹ️' }
            };

            const style = colors[type] || colors.success;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'location-message';
            messageDiv.setAttribute('role', 'status');
            messageDiv.style.position = 'fixed';
            messageDiv.style.top = '20px';
            messageDiv.style.right = '20px';
            messageDiv.style.zIndex = '10001';
            messageDiv.style.maxWidth = '350px';
            messageDiv.style.animation = 'slideInRight 0.3s ease-out';
            messageDiv.innerHTML = `
                <div style="
                    background: ${style.bg}; color: ${style.color};
                    padding: 16px 20px; border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    display: flex; align-items: center; gap: 12px;
                    border-left: 4px solid ${style.border}; backdrop-filter: blur(10px);
                ">
                    <span style="font-size: 18px; line-height: 1;">${style.icon}</span>
                    <div style="font-weight: 500;">${message}</div>
                    <button class="location-close-btn" aria-label="Close" style="
                        margin-left: auto; background: none; border: none; 
                        color: ${style.color}; cursor: pointer; font-size: 18px; padding: 0;
                    ">×</button>
                </div>
            `;
            document.body.appendChild(messageDiv);

            const closeBtn = messageDiv.querySelector('.location-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (messageDiv.parentNode) messageDiv.remove();
                });
            }

            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (messageDiv.parentNode) messageDiv.remove();
                    }, 300);
                }
            }, 5000);
        }

        removeExistingMessages() {
            document.querySelectorAll('.location-message').forEach(msg => msg.remove());
        }

        /**
         * Event dispatching and callbacks
         */
        dispatchLocationEvent(locationValue, locationData) {
            const event = new CustomEvent('orderLocationChange', {
                detail: { value: locationValue, data: locationData, timestamp: Date.now() },
                bubbles: true, cancelable: true
            });
            document.dispatchEvent(event);
            console.log('📡 OrderMethodLocation: Event dispatched:', event.detail);
        }

        onChange(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onChange = callback;
            }
        }

        onSuccess(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onSuccess = callback;
            }
        }

        onError(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onError = callback;
            }
        }

        getCurrentLocation() {
            return this.currentLocation;
        }

        getLocationData(locationValue) {
            const allLocations = [...this.locationData.delivery, ...this.locationData.pickup];
            return allLocations.find(loc => loc.value === locationValue) || null;
        }

        reset() {
            this.currentLocation = null;
            if (this.elements.dropdown) {
                try {
                    this.elements.dropdown.selectedIndex = 0;
                } catch (e) { /* ignore */ }
            }
        }

        destroy() {
            this.callbacks = {};
            // remove event listeners where possible
            try {
                if (this.elements.dropdown) {
                    this.elements.dropdown.removeEventListener('change', this.handleLocationChange);
                }
            } catch (e) { /* ignore */ }

            this.elements = {};
            this.currentLocation = null;
            if (this.map) {
                try {
                    this.map.off();
                    this.map.remove();
                } catch (e) { /* ignore */ }
                this.map = null;
            }
            this.marker = null;
            this.isInitialized = false;
            console.log('🗑️ OrderMethodLocation: destroyed');
        }
    }

    // Add CSS animations
    if (!document.getElementById('location-animations')) {
        const style = document.createElement('style');
        style.id = 'location-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
            .custom-location-marker {
                background: none !important;
                border: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.OrderMethodLocation = OrderMethodLocation;
    }

    console.log('✅ OrderMethodLocation (FREE): Component loaded with OpenStreetMap');

})();
