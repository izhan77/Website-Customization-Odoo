 // Debug function to check if script is loading
            console.log('Popup script loading...');
            
            function initializePopup() {
                console.log('Initializing popup...');
                
                const deliveryBtn = document.querySelector('[data-type="delivery"]');
                const pickupBtn = document.querySelector('[data-type="pickup"]');
                const subtitle = document.getElementById('popup-subtitle');
                const locationBtn = document.getElementById('location-btn');
                const locationDetails = document.getElementById('location-details');
                const locationSelect = document.getElementById('location-select');

                // Check if elements exist
                console.log('Elements found:', {
                    deliveryBtn: !!deliveryBtn,
                    pickupBtn: !!pickupBtn,
                    subtitle: !!subtitle,
                    locationBtn: !!locationBtn,
                    locationDetails: !!locationDetails,
                    locationSelect: !!locationSelect
                });

                if (!deliveryBtn || !pickupBtn) {
                    console.error('Toggle buttons not found!');
                    return;
                }

                // Function to attach dropdown event listener
                function attachDropdownListener() {
                    const currentSelect = document.getElementById('location-select');
                    if (currentSelect) {
                        console.log('Attaching dropdown listener to current select element');
                        
                        // Remove any existing listeners first
                        currentSelect.removeEventListener('change', handleDropdownChange);
                        currentSelect.removeEventListener('input', handleDropdownChange);
                        
                        // Add new listeners
                        currentSelect.addEventListener('change', handleDropdownChange);
                        currentSelect.addEventListener('input', handleDropdownChange);
                    }
                }

                // Dropdown change handler function
                function handleDropdownChange(e) {
                    console.log('Dropdown changed to:', e.target.value);
                    console.log('Pickup button active:', pickupBtn.classList.contains('active'));
                    
                    if (pickupBtn.classList.contains('active')) {
                        updatePickupAddress(e.target.value);
                    }
                }

                // Function to update pickup address based on selected branch
                function updatePickupAddress(branchValue) {
                    console.log('Updating address for branch:', branchValue);
                    
                    const addresses = {
                        'tipu-sultan': {
                            name: 'Alarahi Tipu Sultan',
                            address: 'Plot 27/47 Modern housing cooperative Society ltd, Block 7 and 8, Tipu sultan road'
                        },
                        'dha-outlet': {
                            name: 'Alarahi DHA Phase 2',
                            address: 'Shop # 12, Lane 4, Sehar Commercial Area, Phase 2 Extension, DHA, Karachi'
                        }
                    };

                    const selectedBranch = addresses[branchValue];
                    console.log('Selected branch data:', selectedBranch);
                    console.log('Location details element:', locationDetails);
                    
                    if (selectedBranch && locationDetails) {
                        locationDetails.innerHTML = `
                            <p><strong>Location:</strong> ${selectedBranch.address}</p>
                            <button class="directions-btn" onclick="getDirections('${selectedBranch.address.replace(/'/g, "\\'")}')">Get Directions</button>
                        `;
                        console.log('Address updated successfully');
                    } else {
                        console.log('Failed to update address - missing branch data or element');
                    }
                }

                // Function to handle directions
                window.getDirections = function(address) {
                    const encodedAddress = encodeURIComponent(address + ', Karachi, Pakistan');
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                };

                // Toggle functionality
                function toggleOrderType(type) {
                    console.log('Toggling to:', type);
                    
                    // Remove active class from all buttons
                    document.querySelectorAll('.popup-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    if (type === 'delivery') {
                        deliveryBtn.classList.add('active');
                        if (subtitle) subtitle.textContent = 'Please select your location';
                        if (locationBtn) locationBtn.classList.remove('hidden');
                        if (locationDetails) locationDetails.classList.remove('show');
                        
                        // Reset dropdown for delivery
                        if (locationSelect) {
                            locationSelect.innerHTML = `
                                <option value="">Please select your location</option>
                                <option value="dha">DHA Phase 2</option>
                                <option value="gulshan">Gulshan-e-Iqbal</option>
                                <option value="bahadurabad">Bahadurabad</option>
                                <option value="clifton">Clifton</option>
                            `;
                        }
                    } else if (type === 'pickup') {
                        pickupBtn.classList.add('active');
                        if (subtitle) subtitle.textContent = 'Which outlet would you like to pick-up from?';
                        if (locationBtn) locationBtn.classList.add('hidden');
                        if (locationDetails) locationDetails.classList.add('show');
                        
                        // Change dropdown for pickup
                        if (locationSelect) {
                            locationSelect.innerHTML = `
                                <option value="tipu-sultan">Alarahi Tipu Sultan</option>
                                <option value="dha-outlet">Alarahi DHA Phase 2</option>
                            `;
                            
                            // Re-attach event listener after recreating dropdown
                            setTimeout(() => {
                                attachDropdownListener();
                                // Set default value and update address
                                locationSelect.value = 'tipu-sultan';
                                updatePickupAddress('tipu-sultan');
                            }, 50);
                        }
                    }
                }

                // Event listeners for toggle buttons with debug
                deliveryBtn.addEventListener('click', function(e) {
                    console.log('Delivery button clicked');
                    e.preventDefault();
                    toggleOrderType('delivery');
                });
                
                pickupBtn.addEventListener('click', function(e) {
                    console.log('Pickup button clicked');
                    e.preventDefault();
                    toggleOrderType('pickup');
                });

                // Set initial state and address (pickup selected by default)
                setTimeout(() => {
                    console.log('Setting initial state...');
                    toggleOrderType('delivery');
                }, 300);

                // Location button functionality
                if (locationBtn) {
                    locationBtn.addEventListener('click', function() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                alert('Location detected! We will find the nearest outlet.');
                            }, function() {
                                alert('Unable to retrieve your location. Please select manually.');
                            });
                        } else {
                            alert('Geolocation is not supported by this browser.');
                        }
                    });
                }

                // Close popup functionality
                const overlay = document.getElementById('popup-overlay');
                if (overlay) {
                    overlay.addEventListener('click', function(e) {
                        if (e.target === this) {
                            this.style.display = 'none';
                        }
                    });
                }
            }

            // Try multiple initialization methods
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializePopup);
            } else {
                initializePopup();
            }

            // Fallback initialization
            setTimeout(initializePopup, 500);