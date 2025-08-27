/**
 * Order Method Location Component with Google Maps Integration
 * File: static/src/js/components/order_method_selector/order_method_location.js
 * Purpose: Handles location selection, current location detection with Google Maps popup
 */

(function() {
    'use strict';

    console.log('📍 OrderMethodLocation: Loading location component...');

    /**
     * Order Method Location Class
     * Manages location selection and geolocation functionality
     */
    class OrderMethodLocation {
        constructor(config = {}) {
            this.config = {
                primaryColor: config.primaryColor || '#7abfba',
                geolocationTimeout: config.geolocationTimeout || 10000,
                animationDuration: config.animationDuration || 300
            };

            this.currentLocation = null;
            this.isDetectingLocation = false;
            this.callbacks = {};
            this.elements = {};
            this.map = null;
            this.marker = null;
            this.userPosition = null;

            // Location data
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

            console.log('📍 OrderMethodLocation: Instance created');
        }

        /**
         * Initialize the location component
         * @param {Object} elements - DOM elements for location functionality
         */
        init(elements) {
            console.log('🔧 OrderMethodLocation: Initializing...');

            this.elements = elements;

            if (!this.validateElements()) {
                console.error('❌ OrderMethodLocation: Invalid elements provided');
                return false;
            }

            this.bindEvents();
            this.setupDropdownStyling();
            this.setupMapsPopup();

            console.log('✅ OrderMethodLocation: Initialization complete');
            return true;
        }

        /**
         * Validate required DOM elements
         */
        validateElements() {
            const required = ['dropdown'];
            const missing = required.filter(key => !this.elements[key]);

            if (missing.length > 0) {
                console.error('❌ OrderMethodLocation: Missing elements:', missing);
                return false;
            }

            return true;
        }

        /**
         * Setup Google Maps popup functionality
         */
        setupMapsPopup() {
            // Create elements if they don't exist
            if (!document.getElementById('maps-popup-overlay')) {
                const mapsPopupHTML = `
                    <div id="maps-popup-overlay" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[10000] hidden">
                        <div id="maps-popup-container" class="bg-white rounded-2xl p-6 w-full max-w-md text-center shadow-xl transform transition-all duration-300 scale-95">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Location Access</h3>
                            <p class="text-sm text-gray-600 mb-6">We need your location to find the nearest restaurant outlet.</p>

                            <div id="maps-container" class="w-full h-48 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                                <span class="text-gray-500">Loading map...</span>
                            </div>

                            <div class="flex gap-3 justify-center">
                                <button id="maps-cancel-btn" class="px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button id="maps-confirm-btn" class="px-4 py-2 rounded-lg text-white font-medium bg-[#7abfba] hover:opacity-90 transition-colors">
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', mapsPopupHTML);
            }

            // Cache maps elements
            this.elements.mapsOverlay = document.getElementById('maps-popup-overlay');
            this.elements.mapsContainer = document.getElementById('maps-popup-container');
            this.elements.mapsCancelBtn = document.getElementById('maps-cancel-btn');
            this.elements.mapsConfirmBtn = document.getElementById('maps-confirm-btn');
            this.elements.mapsElement = document.getElementById('maps-container');

            // Bind maps events
            if (this.elements.mapsCancelBtn) {
                this.elements.mapsCancelBtn.addEventListener('click', () => {
                    this.hideMapsPopup();
                });
            }

            if (this.elements.mapsConfirmBtn) {
                this.elements.mapsConfirmBtn.addEventListener('click', () => {
                    this.confirmLocationSelection();
                });
            }

            // Close on overlay click
            if (this.elements.mapsOverlay) {
                this.elements.mapsOverlay.addEventListener('click', (e) => {
                    if (e.target === this.elements.mapsOverlay) {
                        this.hideMapsPopup();
                    }
                });
            }
        }

        /**
         * Show Google Maps popup
         */
        showMapsPopup() {
    if (!this.elements.mapsOverlay) return;

    this.elements.mapsOverlay.classList.remove('hidden');
    setTimeout(() => {
        this.elements.mapsOverlay.style.opacity = '1';
        this.elements.mapsContainer.style.transform = 'scale(1)';

        // Wait for the popup to show before loading the map
        setTimeout(() => {
            // Load Google Maps if not already loaded
            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                this.loadGoogleMaps();
            } else {
                this.initMap();
            }
        }, 100);
    }, 10);
}

        /**
         * Hide Google Maps popup
         */
        hideMapsPopup() {
            if (!this.elements.mapsOverlay) return;

            this.elements.mapsOverlay.style.opacity = '0';
            this.elements.mapsContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                this.elements.mapsOverlay.classList.add('hidden');
            }, 300);
        }

        /**
         * Load Google Maps API
         */
        loadGoogleMaps() {
    if (window.googleMapsLoading) return;

    window.googleMapsLoading = true;

    const script = document.createElement('script');
    // Using a free demo key - replace with your own key for production
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places';
    script.async = true;
    script.defer = true;

    // Wait for the map to load completely
    script.onload = () => {
        // Give it a little extra time to make sure everything is ready
        setTimeout(() => {
            this.initMap();
        }, 300);
    };

    script.onerror = () => {
        console.error('Failed to load Google Maps');
        this.handleLocationError('Could not load maps. Please check your connection.');
        window.googleMapsLoading = false;
    };

    document.head.appendChild(script);
}

        /**
         * Initialize Google Map
         */
        initMap() {
            // Safety check - make sure Google Maps is really loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('Google Maps not loaded yet');
        this.handleLocationError('Maps are still loading. Please try again in a moment.');
        return;
    }

            if (!this.elements.mapsElement || typeof google === 'undefined') return;

            // Clear loading message
            this.elements.mapsElement.innerHTML = '';

            // Create map
            this.map = new google.maps.Map(this.elements.mapsElement, {
                center: { lat: 24.8607, lng: 67.0011 }, // Default to Karachi
                zoom: 12,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#f5f5f5" }]
                    },
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "gamma": 0.01 }, { "lightness": 20 }]
                    },
                    {
                        "featureType": "all",
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "saturation": -31 }, { "lightness": -33 }, { "weight": 2 }, { "gamma": 0.8 }]
                    },
                    {
                        "featureType": "all",
                        "elementType": "labels.icon",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "administrative",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#c9b2a6" }]
                    },
                    {
                        "featureType": "administrative.land_parcel",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#dcd2be" }]
                    },
                    {
                        "featureType": "administrative.land_parcel",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#ae9e90" }]
                    },
                    {
                        "featureType": "landscape.natural",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#dfd2ae" }]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#dfd2ae" }]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#93817c" }]
                    },
                    {
                        "featureType": 'poi.attraction',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.business',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.government',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.medical',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.park',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.place_of_worship',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.school',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": 'poi.sports_complex',
                        "elementType": 'labels',
                        "stylers": [{ "visibility": 'off' }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#f5f1e6" }]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#fdfcf8" }]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#f8c967" }]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#e9bc62" }]
                    },
                    {
                        "featureType": "road.local",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#806b63" }]
                    },
                    {
                        "featureType": "transit.line",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#dfd2ae" }]
                    },
                    {
                        "featureType": "transit.line",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#8f7d77" }]
                    },
                    {
                        "featureType": "transit.line",
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "color": "#ebe3cd" }]
                    },
                    {
                        "featureType": "transit.station",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#dfd2ae" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry.fill",
                        "stylers": [{ "color": "#b9d3c2" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#92998d" }]
                    }
                ]
            });

            // Add marker
            this.marker = new google.maps.Marker({
                map: this.map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title: 'Your location',
                icon: {
                    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgc3Ryb2tlPSIjN2FiZmJhIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEyIDIuNUMxNi4xMzQzIDIuNSAxOS41IDYuNjk1NDUgMTkuNSAxMS41NzE0QzE5LjUgMTMuODA1NyAxOC40NDY0IDE2LjQyODYgMTYuNTM1NyAxOS4zMzMzQzE1LjE4MDQgMjEuMzYzNiAxMy43NTI0IDIyLjk3NjIgMTIuNzYzOSAyMy43Njk0QzEyLjMzODggMjQuMDc2OSAxMS42NjExIDI0LjA3NjkgMTEuMjM2MSAyMy43Njk0QzEwLjI0NzYgMjIuOTc2MiA4LjgxOTY0IDIxLjM2MzYgNy40NjQzMiAxOS4zMzMzQzUuNTUzNiAxNi40Mjg2IDQuNSA0LjUgNC41IDExLjU3MTRDNC41IDYuNjk1NDUgNy44NjU3NCAyLjUgMTIgMi41WiIgc3Ryb2tlPSIjN2FiZmJhIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 32)
                }
            });

            // Try to get current location
            this.getBrowserLocation();
        }

        /**
         * Get browser location and center map
         */
        getBrowserLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.userPosition = position;
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        // Center map on user's location
                        this.map.setCenter(pos);
                        this.marker.setPosition(pos);

                        // Add info window
                        const infoWindow = new google.maps.InfoWindow({
                            content: '<div class="text-sm font-medium">Your current location</div>'
                        });

                        infoWindow.open(this.map, this.marker);

                        // Add click listener to marker
                        this.marker.addListener('click', () => {
                            infoWindow.open(this.map, this.marker);
                        });
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        this.handleLocationError(this.getLocationErrorMessage(error));
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 300000
                    }
                );
            } else {
                this.handleLocationError('Geolocation is not supported by this browser.');
            }
        }

        /**
         * Confirm location selection from map
         */
        confirmLocationSelection() {
            if (!this.marker || !this.map) return;

            const position = this.marker.getPosition();
            if (!position) return;

            // Find nearest location
            const nearestLocation = this.findNearestLocation({
                latitude: position.lat(),
                longitude: position.lng()
            });

            if (nearestLocation) {
                // Update dropdown selection
                this.elements.dropdown.value = nearestLocation.value;
                this.handleLocationChange(nearestLocation.value);

                this.showLocationSuccess(`Nearest outlet selected: ${nearestLocation.name}`);
            } else {
                this.handleLocationError('No nearby outlets found');
            }

            this.hideMapsPopup();
        }

        /**
         * Bind events to location elements
         */
        bindEvents() {
            console.log('🔗 OrderMethodLocation: Binding events...');

            // Dropdown change event
            this.elements.dropdown.addEventListener('change', (e) => {
                this.handleLocationChange(e.target.value);
            });

            // Current location button (if exists)
            if (this.elements.locationBtn) {
                this.elements.locationBtn.addEventListener('click', () => {
                    this.showMapsPopup();
                });
            }
        }

        /**
         * Setup dropdown styling and behavior
         */
        setupDropdownStyling() {
            if (!this.elements.dropdown) return;

            // Add focus styles
            this.elements.dropdown.addEventListener('focus', () => {
                this.elements.dropdown.style.borderColor = this.config.primaryColor;
                this.elements.dropdown.style.boxShadow = `0 0 0 3px ${this.config.primaryColor}20`;
            });

            this.elements.dropdown.addEventListener('blur', () => {
                this.elements.dropdown.style.borderColor = '#d1d5db';
                this.elements.dropdown.style.boxShadow = 'none';
            });
        }

        /**
         * Update dropdown options based on order type
         * @param {string} orderType - 'delivery' or 'pickup'
         */
        updateOptions(orderType) {
            console.log(`📋 OrderMethodLocation: Updating options for ${orderType}`);

            if (!this.elements.dropdown) return;

            // Clear existing options
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

            // Reset current location
            this.currentLocation = null;

            // For pickup, auto-select first valid option
            if (orderType === 'pickup' && options.length > 0) {
                const firstValid = options.find(opt => !opt.disabled);
                if (firstValid) {
                    setTimeout(() => {
                        this.elements.dropdown.value = firstValid.value;
                        this.handleLocationChange(firstValid.value);
                    }, 100);
                }
            }
        }

        /**
         * Handle location selection change
         * @param {string} locationValue - Selected location value
         */
        handleLocationChange(locationValue) {
            console.log('📍 OrderMethodLocation: Location changed to:', locationValue);

            this.currentLocation = locationValue;

            // Find location data
            const allLocations = [...this.locationData.delivery, ...this.locationData.pickup];
            const selectedLocation = allLocations.find(loc => loc.value === locationValue);

            // Trigger callback
            if (this.callbacks.onChange) {
                this.callbacks.onChange(locationValue, selectedLocation);
            }

            // Dispatch custom event
            this.dispatchLocationEvent(locationValue, selectedLocation);
        }

        /**
         * Detect current location using geolocation
         */
        async detectCurrentLocation() {
            if (this.isDetectingLocation) {
                console.log('⏳ OrderMethodLocation: Location detection already in progress');
                return;
            }

            console.log('🔍 OrderMethodLocation: Starting location detection...');

            if (!navigator.geolocation) {
                this.handleLocationError('Geolocation is not supported by this browser');
                return;
            }

            this.isDetectingLocation = true;
            this.setLocationButtonLoading(true);

            try {
                const position = await this.getCurrentPosition();
                console.log('✅ OrderMethodLocation: Location detected:', position.coords);

                // Find nearest location
                const nearestLocation = this.findNearestLocation(position.coords);

                if (nearestLocation) {
                    // Update dropdown selection
                    this.elements.dropdown.value = nearestLocation.value;
                    this.handleLocationChange(nearestLocation.value);

                    this.showLocationSuccess(`Nearest outlet selected: ${nearestLocation.name}`);
                } else {
                    this.handleLocationError('No nearby outlets found');
                }

            } catch (error) {
                console.error('❌ OrderMethodLocation: Location detection failed:', error);
                this.handleLocationError(this.getLocationErrorMessage(error));
            } finally {
                this.isDetectingLocation = false;
                this.setLocationButtonLoading(false);
            }
        }

        this.errorShown = false;

        /**
         * Get current position as Promise
         */
        getCurrentPosition() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: this.config.geolocationTimeout,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            });
        }

        /**
         * Find nearest pickup location based on coordinates
         * @param {Object} userCoords - User's coordinates {latitude, longitude}
         * @returns {Object|null} Nearest location data
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

            console.log(`📍 OrderMethodLocation: Nearest location is ${nearest?.name} (${minDistance.toFixed(2)}km away)`);
            return nearest;
        }

        /**
         * Calculate distance between two coordinates using Haversine formula
         * @param {number} lat1 - Latitude 1
         * @param {number} lon1 - Longitude 1
         * @param {number} lat2 - Latitude 2
         * @param {number} lon2 - Longitude 2
         * @returns {number} Distance in kilometers
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

        /**
         * Convert degrees to radians
         */
        degToRad(deg) {
            return deg * (Math.PI/180);
        }

        /**
         * Set loading state for location button
         * @param {boolean} isLoading - Whether button is loading
         */
        setLocationButtonLoading(isLoading) {
            if (!this.elements.locationBtn) return;

            const button = this.elements.locationBtn;

            if (isLoading) {
                button.disabled = true;
                button.innerHTML = `
                    <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Detecting...
                `;
            } else {
                button.disabled = false;
                button.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Use Current Location
                `;
            }
        }

        /**
         * Handle location detection success
         * @param {string} message - Success message
         */
        showLocationSuccess(message) {
            if (this.callbacks.onSuccess) {
                this.callbacks.onSuccess(message);
            }

            console.log('✅ OrderMethodLocation:', message);
        }

        /**
         * Handle location detection error
         * @param {string} message - Error message
         */
        handleLocationError(message) {
    // Don't show too many error popups
    if (!this.errorShown) {
        this.errorShown = true;

        // Show a friendly message that doesn't use alert()
        this.showFriendlyError(message);

        setTimeout(() => {
            this.errorShown = false;
        }, 3000);
    }

    if (this.callbacks.onError) {
        this.callbacks.onError(message);
    }

    console.error('❌ OrderMethodLocation:', message);
}

        /**
         * Get user-friendly error message from geolocation error
         * @param {GeolocationPositionError} error - Geolocation error
         * @returns {string} User-friendly error message
         */
        getLocationErrorMessage(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            return 'Please allow location access in your browser settings or select your area manually.';
        case error.POSITION_UNAVAILABLE:
            return 'We can\'t detect your location. Please select your area manually.';
        case error.TIMEOUT:
            return 'Finding your location took too long. Please select your area manually.';
        default:
            return 'We can\'t access your location right now. Please select your area manually.';
    }
}

        /**
         * Dispatch custom location event
         */
        dispatchLocationEvent(locationValue, locationData) {
            const event = new CustomEvent('orderLocationChange', {
                detail: {
                    value: locationValue,
                    data: locationData,
                    timestamp: Date.now()
                },
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(event);
            console.log('📡 OrderMethodLocation: Event dispatched:', event.detail);
        }

        /**
         * Register callback for location changes
         * @param {Function} callback - Function to call on location change
         */
        onChange(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onChange = callback;
                console.log('📞 OrderMethodLocation: Change callback registered');
            }
        }

        /**
         * Register callback for location success
         * @param {Function} callback - Function to call on location success
         */
        onSuccess(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onSuccess = callback;
                console.log('📞 OrderMethodLocation: Success callback registered');
            }
        }

        /**
         * Register callback for location error
         * @param {Function} callback - Function to call on location error
         */
        onError(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onError = callback;
                console.log('📞 OrderMethodLocation: Error callback registered');
            }
        }

        /**
         * Get current selected location
         * @returns {string|null} Current location value
         */
        getCurrentLocation() {
            return this.currentLocation;
        }

        /**
         * Get location data by value
         * @param {string} locationValue - Location value to find
         * @returns {Object|null} Location data
         */
        getLocationData(locationValue) {
            const allLocations = [...this.locationData.delivery, ...this.locationData.pickup];
            return allLocations.find(loc => loc.value === locationValue) || null;
        }

        /**
         * Show/hide current location button
         * @param {boolean} show - Whether to show the button
         */
        toggleLocationButton(show) {
            if (!this.elements.locationBtn) return;

            if (show) {
                this.elements.locationBtn.classList.remove('hidden');
            } else {
                this.elements.locationBtn.classList.add('hidden');
            }
        }

        /**
         * Reset location selection
         */
        reset() {
            this.currentLocation = null;

            if (this.elements.dropdown) {
                this.elements.dropdown.selectedIndex = 0;
            }

            console.log('🔄 OrderMethodLocation: Reset');
        }

        /**
         * Destroy the location component
         */
        destroy() {
            console.log('🗑️ OrderMethodLocation: Destroying...');

            this.callbacks = {};
            this.elements = {};
            this.currentLocation = null;

            console.log('✅ OrderMethodLocation: Destroyed');
        }

        showFriendlyError(message) {
    // Remove any existing error message
    this.removeExistingErrors();

    // Create a friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'location-error-message';
    errorDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #ffebee; color: #c62828;
                    padding: 12px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    z-index: 10001; display: flex; align-items: center; max-width: 300px;">
            <span style="margin-right: 8px;">⚠️</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

        removeExistingErrors() {
    const existingErrors = document.querySelectorAll('.location-error-message');
    existingErrors.forEach(error => error.remove());
}

    }

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.OrderMethodLocation = OrderMethodLocation;
    }

    console.log('✅ OrderMethodLocation: Component loaded');

})();