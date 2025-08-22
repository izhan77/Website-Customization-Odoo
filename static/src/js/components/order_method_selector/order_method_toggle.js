/**
 * Order Method Toggle Component
 * File: static/src/js/components/order_method_selector/order_method_toggle.js
 * Purpose: Handles the delivery/pickup toggle functionality
 */

(function() {
    'use strict';

    console.log('🔘 OrderMethodToggle: Loading toggle component...');

    /**
     * Order Method Toggle Class
     * Handles switching between delivery and pickup modes
     */
    class OrderMethodToggle {
        constructor(config = {}) {
            this.config = {
                activeColor: config.activeColor || '#7abfba',
                inactiveColor: config.inactiveColor || 'transparent',
                activeTextColor: config.activeTextColor || '#ffffff',
                inactiveTextColor: config.inactiveTextColor || '#666666',
                animationDuration: config.animationDuration || 300
            };

            this.currentType = 'delivery';
            this.callbacks = {};
            this.elements = {};

            console.log('🔘 OrderMethodToggle: Instance created with config:', this.config);
        }

        /**
         * Initialize the toggle component
         * @param {Object} elements - DOM elements for delivery and pickup buttons
         */
        init(elements) {
            console.log('🔧 OrderMethodToggle: Initializing...');

            this.elements = elements;

            if (!this.validateElements()) {
                console.error('❌ OrderMethodToggle: Invalid elements provided');
                return false;
            }

            this.bindEvents();
            this.setInitialState();

            console.log('✅ OrderMethodToggle: Initialization complete');
            return true;
        }

        /**
         * Validate required DOM elements
         */
        validateElements() {
            const required = ['deliveryBtn', 'pickupBtn'];
            const missing = required.filter(key => !this.elements[key]);

            if (missing.length > 0) {
                console.error('❌ OrderMethodToggle: Missing elements:', missing);
                return false;
            }

            return true;
        }

        /**
         * Bind click events to toggle buttons
         */
        bindEvents() {
            console.log('🔗 OrderMethodToggle: Binding events...');

            // Delivery button
            this.elements.deliveryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚚 Delivery toggle clicked');
                this.switchTo('delivery');
            });

            // Pickup button
            this.elements.pickupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🏪 Pickup toggle clicked');
                this.switchTo('pickup');
            });

            // Add hover effects
            this.addHoverEffects();
        }

        /**
         * Add hover effects to buttons
         */
        addHoverEffects() {
            [this.elements.deliveryBtn, this.elements.pickupBtn].forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    if (!btn.classList.contains('active')) {
                        btn.style.backgroundColor = 'rgba(122, 191, 186, 0.1)';
                    }
                });

                btn.addEventListener('mouseleave', () => {
                    if (!btn.classList.contains('active')) {
                        btn.style.backgroundColor = this.config.inactiveColor;
                    }
                });
            });
        }

        /**
         * Set initial state (delivery selected)
         */
        setInitialState() {
            console.log('🎯 OrderMethodToggle: Setting initial state...');
            this.switchTo('delivery', false); // false = don't trigger callback
        }

        /**
         * Switch to specific order type
         * @param {string} type - 'delivery' or 'pickup'
         * @param {boolean} triggerCallback - Whether to trigger change callback
         */
        switchTo(type, triggerCallback = true) {
            if (type === this.currentType) {
                console.log(`🔘 OrderMethodToggle: Already on ${type}, skipping`);
                return;
            }

            console.log(`🔄 OrderMethodToggle: Switching from ${this.currentType} to ${type}`);

            const previousType = this.currentType;
            this.currentType = type;

            // Update visual states
            this.updateButtonStates();

            // Trigger callback if specified
            if (triggerCallback && this.callbacks.onChange) {
                this.callbacks.onChange(type, previousType);
            }

            // Trigger custom event
            this.dispatchToggleEvent(type, previousType);
        }

        /**
         * Update visual states of buttons
         */
        updateButtonStates() {
            console.log(`🎨 OrderMethodToggle: Updating button states for ${this.currentType}`);

            // Update delivery button
            this.updateButtonState(
                this.elements.deliveryBtn,
                this.currentType === 'delivery'
            );

            // Update pickup button
            this.updateButtonState(
                this.elements.pickupBtn,
                this.currentType === 'pickup'
            );
        }

        /**
         * Update individual button state
         * @param {HTMLElement} button - Button element
         * @param {boolean} isActive - Whether button is active
         */
        updateButtonState(button, isActive) {
            if (!button) return;

            // Remove/add active class
            if (isActive) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }

            // Update styles with smooth transition
            button.style.transition = `all ${this.config.animationDuration}ms ease`;

            if (isActive) {
                button.style.backgroundColor = this.config.activeColor;
                button.style.color = this.config.activeTextColor;
                button.style.transform = 'scale(1.02)';
            } else {
                button.style.backgroundColor = this.config.inactiveColor;
                button.style.color = this.config.inactiveTextColor;
                button.style.transform = 'scale(1)';
            }

            // Reset transform after animation
            setTimeout(() => {
                if (isActive) {
                    button.style.transform = 'scale(1)';
                }
            }, this.config.animationDuration);
        }

        /**
         * Dispatch custom toggle event
         */
        dispatchToggleEvent(newType, previousType) {
            const event = new CustomEvent('orderMethodToggle', {
                detail: {
                    newType,
                    previousType,
                    timestamp: Date.now()
                },
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(event);
            console.log('📡 OrderMethodToggle: Event dispatched:', event.detail);
        }

        /**
         * Register callback for toggle changes
         * @param {Function} callback - Function to call on toggle change
         */
        onChange(callback) {
            if (typeof callback === 'function') {
                this.callbacks.onChange = callback;
                console.log('📞 OrderMethodToggle: Change callback registered');
            } else {
                console.warn('⚠️ OrderMethodToggle: Invalid callback provided');
            }
        }

        /**
         * Get current order type
         * @returns {string} Current order type
         */
        getCurrentType() {
            return this.currentType;
        }

        /**
         * Check if specific type is active
         * @param {string} type - Type to check
         * @returns {boolean} Whether type is active
         */
        isActive(type) {
            return this.currentType === type;
        }

        /**
         * Enable/disable the toggle
         * @param {boolean} enabled - Whether to enable the toggle
         */
        setEnabled(enabled) {
            const buttons = [this.elements.deliveryBtn, this.elements.pickupBtn];

            buttons.forEach(btn => {
                if (btn) {
                    btn.disabled = !enabled;
                    btn.style.opacity = enabled ? '1' : '0.5';
                    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
                }
            });

            console.log(`🔘 OrderMethodToggle: ${enabled ? 'Enabled' : 'Disabled'}`);
        }

        /**
         * Destroy the toggle (remove event listeners)
         */
        destroy() {
            console.log('🗑️ OrderMethodToggle: Destroying...');

            // Remove event listeners would go here if we stored references
            // For now, just clear callbacks
            this.callbacks = {};
            this.elements = {};

            console.log('✅ OrderMethodToggle: Destroyed');
        }
    }

    // Export to global scope for use by main controller
    if (typeof window !== 'undefined') {
        window.OrderMethodToggle = OrderMethodToggle;
    }

    console.log('✅ OrderMethodToggle: Component loaded');

})();