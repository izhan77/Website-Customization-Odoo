/**
 * Kababjees Checkout JavaScript
 * Handles all checkout page interactions and validations
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Payment Method Selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardForm = document.querySelector('.card-payment-form');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => {
                opt.classList.remove('active');
                const optDiv = opt.querySelector('div');
                const optIcon = opt.querySelector('.payment-icon');
                
                optDiv.classList.remove('border-primary', 'bg-primary/10');
                optDiv.classList.add('border-gray-200');
                optIcon.classList.remove('bg-primary', 'text-white');
                optIcon.classList.add('bg-gray-100', 'text-gray-600');
            });

            // Add active class to selected option
            this.classList.add('active');
            const selectedDiv = this.querySelector('div');
            const selectedIcon = this.querySelector('.payment-icon');
            
            selectedDiv.classList.add('border-primary', 'bg-primary/10');
            selectedDiv.classList.remove('border-gray-200');
            selectedIcon.classList.add('bg-primary', 'text-white');
            selectedIcon.classList.remove('bg-gray-100', 'text-gray-600');

            // Show/hide card form based on selection
            if (this.dataset.method === 'card') {
                cardForm.classList.remove('hidden');
            } else {
                cardForm.classList.add('hidden');
            }
        });
    });

    // CVV Toggle Functionality
    const cvvToggle = document.querySelector('.cvv-toggle');
    const cvvInput = document.getElementById('cvv');
    
    if (cvvToggle && cvvInput) {
        cvvToggle.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (cvvInput.type === 'password') {
                cvvInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                cvvInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Card Number Formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Expiry Date Formatting
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // Phone Number Formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
        });
    }

    // Promo Code Application
    const applyPromoBtn = document.querySelector('.apply-promo');
    const promoCodeInput = document.getElementById('promoCode');
    const promoSuccess = document.querySelector('.promo-success');
    const promoError = document.querySelector('.promo-error');
    const discountLine = document.querySelector('.discount-line');
    
    if (applyPromoBtn && promoCodeInput) {
        applyPromoBtn.addEventListener('click', function() {
            const promoCode = promoCodeInput.value.trim();
            
            if (promoCode) {
                // Hide previous messages
                if (promoSuccess) promoSuccess.classList.add('hidden');
                if (promoError) promoError.classList.add('hidden');
                
                // Simulate promo code validation (replace with actual API call)
                validatePromoCode(promoCode).then(result => {
                    if (result.valid) {
                        // Show success message
                        if (promoSuccess) {
                            promoSuccess.classList.remove('hidden');
                            document.querySelector('.promo-message').classList.remove('hidden');
                        }
                        
                        // Show discount line and update totals
                        if (discountLine) {
                            discountLine.classList.remove('hidden');
                            updateOrderTotals(result.discount);
                        }
                        
                        promoCodeInput.disabled = true;
                        applyPromoBtn.textContent = 'Applied';
                        applyPromoBtn.disabled = true;
                        applyPromoBtn.classList.add('bg-green-600');
                    } else {
                        // Show error message
                        if (promoError) {
                            promoError.classList.remove('hidden');
                            document.querySelector('.promo-message').classList.remove('hidden');
                        }
                    }
                }).catch(error => {
                    console.error('Promo code validation failed:', error);
                    if (promoError) {
                        promoError.classList.remove('hidden');
                        document.querySelector('.promo-message').classList.remove('hidden');
                    }
                });
            }
        });
    }

    // Form Validation
    function validateForm() {
        const requiredFields = ['firstName', 'lastName', 'phone', 'address'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('border-red-500', 'ring-red-500');
                isValid = false;
            } else if (field) {
                field.classList.remove('border-red-500', 'ring-red-500');
            }
        });

        // If card payment is selected, validate card fields
        if (cardForm && !cardForm.classList.contains('hidden')) {
            const cardFields = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
            cardFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    field.classList.add('border-red-500', 'ring-red-500');
                    isValid = false;
                } else if (field) {
                    field.classList.remove('border-red-500', 'ring-red-500');
                }
            });
        }

        return isValid;
    }

    // Place Order Button
    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            if (validateForm()) {
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
                this.disabled = true;
                
                // Simulate order processing (replace with actual API call)
                processOrder().then(result => {
                    if (result.success) {
                        // Show success message or redirect
                        alert('Order placed successfully! Order ID: ' + result.orderId);
                        // window.location.href = '/order-confirmation/' + result.orderId;
                    } else {
                        alert('Failed to place order. Please try again.');
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }
                }).catch(error => {
                    console.error('Order processing failed:', error);
                    alert('Failed to place order. Please try again.');
                    this.innerHTML = originalText;
                    this.disabled = false;
                });
            } else {
                alert('Please fill in all required fields.');
                
                // Scroll to first error field
                const firstError = document.querySelector('.border-red-500');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    }

    // Back to Menu Button
    const backToMenuBtn = document.querySelector('.back-to-menu');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', function() {
            // Navigate back to menu
            window.history.back();
            // Or use: window.location.href = '/menu';
        });
    }

    // Cancel and Return Button
    const cancelReturnBtn = document.querySelector('.cancel-return-btn');
    if (cancelReturnBtn) {
        cancelReturnBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel your order?')) {
                // Navigate back to menu
                window.location.href = '/menu';
            }
        });
    }

    // Add More Items Button
    const addMoreItemsBtn = document.querySelector('.add-more-items');
    if (addMoreItemsBtn) {
        addMoreItemsBtn.addEventListener('click', function() {
            // Navigate back to menu to add more items
            window.location.href = '/menu';
        });
    }

    // Input Focus Effects
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.remove('border-red-500', 'ring-red-500');
        });
    });
});

// Helper Functions

/**
 * Validate promo code (mock function - replace with actual API call)
 * @param {string} code - Promo code to validate
 * @returns {Promise} - Promise resolving to validation result
 */
function validatePromoCode(code) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            // Mock validation logic
            const validCodes = {
                'SAVE10': { valid: true, discount: 10, type: 'percentage' },
                'FLAT50': { valid: true, discount: 50, type: 'flat' },
                'WELCOME': { valid: true, discount: 15, type: 'percentage' }
            };
            
            const result = validCodes[code.toUpperCase()] || { valid: false };
            resolve(result);
        }, 1000);
    });
}

/**
 * Process order (mock function - replace with actual API call)
 * @returns {Promise} - Promise resolving to order result
 */
function processOrder() {
    return new Promise((resolve) => {
        // Simulate order processing delay
        setTimeout(() => {
            // Mock successful order
            resolve({
                success: true,
                orderId: 'ORD-' + Date.now(),
                estimatedDelivery: '45-60 minutes'
            });
        }, 2000);
    });
}

/**
 * Update order totals after discount application
 * @param {number} discount - Discount amount or percentage
 */
function updateOrderTotals(discount) {
    const subtotalElement = document.querySelector('.subtotal-amount');
    const discountAmountElement = document.querySelector('.discount-amount');
    const grandTotalElement = document.querySelector('.grand-total-amount');
    
    if (subtotalElement && discountAmountElement && grandTotalElement) {
        const subtotal = parseFloat(subtotalElement.textContent.replace('Rs. ', '').replace(',', ''));
        const deliveryFee = 150;
        const taxRate = 0.15;
        
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = subtotal * (discount.discount / 100);
        } else {
            discountAmount = discount.discount;
        }
        
        const discountedSubtotal = subtotal - discountAmount;
        const tax = discountedSubtotal * taxRate;
        const grandTotal = discountedSubtotal + deliveryFee + tax;
        
        // Update display
        discountAmountElement.textContent = `- Rs. ${discountAmount.toLocaleString()}`;
        grandTotalElement.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }
}

/**
 * Update checkout steps progress
 * @param {number} step - Current step (1, 2, or 3)
 */
function updateCheckoutSteps(step) {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((stepElement, index) => {
        const stepIcon = stepElement.querySelector('.step-icon');
        const stepLabel = stepElement.querySelector('.step-label');
        
        if (index < step) {
            // Completed step
            stepElement.classList.add('active');
            stepIcon.classList.remove('bg-gray-200', 'text-gray-400');
            stepIcon.classList.add('bg-green-600', 'text-white');
            stepLabel.classList.remove('text-gray-600');
            stepLabel.classList.add('text-gray-800');
        } else if (index === step - 1) {
            // Current step
            stepElement.classList.add('active');
            stepIcon.classList.remove('bg-gray-200', 'text-gray-400');
            stepIcon.classList.add('bg-primary', 'text-white');
            stepLabel.classList.remove('text-gray-600');
            stepLabel.classList.add('text-gray-800');
        } else {
            // Future step
            stepElement.classList.remove('active');
            stepIcon.classList.add('bg-gray-200', 'text-gray-400');
            stepIcon.classList.remove('bg-primary', 'bg-green-600', 'text-white');
            stepLabel.classList.add('text-gray-600');
            stepLabel.classList.remove('text-gray-800');
        }
    });
}