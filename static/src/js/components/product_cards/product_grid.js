// File: website_customizations/static/src/js/components/product_cards/product_grid.js

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Product Grid Functionality
    class ProductGrid {
        constructor() {
            this.productCards = document.querySelectorAll('.product-card');
            this.addButtons = document.querySelectorAll('.add-button');

            this.init();
        }

        init() {
            this.setupCardAnimations();
            this.setupAddButtonEvents();
            this.setupImageLazyLoading();
            this.setupScrollAnimations();
        }

        setupCardAnimations() {
            // Add entrance animations to cards
            this.productCards.forEach((card, index) => {
                // Initial state
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';

                // Animate in with delay
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150); // Stagger animation
            });
        }

        setupAddButtonEvents() {
            this.addButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAddToCart(button);
                });

                // Add ripple effect
                button.addEventListener('click', (e) => {
                    this.createRippleEffect(e, button);
                });
            });
        }

        handleAddToCart(button) {
            // Prevent multiple clicks
            if (button.classList.contains('loading')) {
                return;
            }

            // Add loading state
            button.classList.add('loading');
            button.disabled = true;

            // Get product data
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('.product-title')?.textContent;
            const productPrice = productCard.querySelector('.price-current')?.textContent;

            // Simulate add to cart API call
            setTimeout(() => {
                this.showAddToCartSuccess(button, productName);
            }, 1500);

            // You can replace this with actual API call:
            // this.addToCartAPI(productData).then(() => {
            //     this.showAddToCartSuccess(button, productName);
            // }).catch(() => {
            //     this.showAddToCartError(button);
            // });
        }

        showAddToCartSuccess(button, productName) {
            button.classList.remove('loading');
            button.disabled = false;

            // Temporarily change button text
            const originalText = button.textContent;
            button.textContent = 'ADDED!';
            button.style.background = '#10b981'; // Success green

            // Add success animation
            button.style.transform = 'scale(1.1)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#7abfba';
                button.style.transform = 'scale(1)';
            }, 2000);

            // Show toast notification (optional)
            this.showToast(`${productName} added to cart!`, 'success');
        }

        showAddToCartError(button) {
            button.classList.remove('loading');
            button.disabled = false;

            // Show error state
            const originalText = button.textContent;
            button.textContent = 'ERROR';
            button.style.background = '#ef4444'; // Error red

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#7abfba';
            }, 2000);

            this.showToast('Error adding to cart. Please try again.', 'error');
        }

        createRippleEffect(event, button) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            // Add ripple styles
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';

            // Add CSS animation keyframes if not exists
            if (!document.querySelector('#ripple-keyframes')) {
                const style = document.createElement('style');
                style.id = 'ripple-keyframes';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        setupImageLazyLoading() {
            // Lazy load product images
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        setupScrollAnimations() {
            // Animate cards on scroll
            const scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                    }
                });
            }, { threshold: 0.1 });

            this.productCards.forEach(card => {
                scrollObserver.observe(card);
            });
        }

        showToast(message, type = 'success') {
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;
            toast.textContent = message;

            // Toast styles
            toast.style.position = 'fixed';
            toast.style.top = '20px';
            toast.style.right = '20px';
            toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
            toast.style.color = 'white';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = '9999';
            toast.style.transform = 'translateX(400px)';
            toast.style.transition = 'transform 0.3s ease';

            document.body.appendChild(toast);

            // Animate in
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);

            // Auto remove
            setTimeout(() => {
                toast.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }
    }

    // Initialize Product Grid
    new ProductGrid();

    // Add CSS animations if not exists
    if (!document.querySelector('#product-animations')) {
        const style = document.createElement('style');
        style.id = 'product-animations';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .lazy {
                opacity: 0;
                transition: opacity 0.3s;
            }
        `;
        document.head.appendChild(style);
    }
});