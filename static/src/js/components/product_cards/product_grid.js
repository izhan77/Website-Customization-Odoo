odoo.define('website_customizations.product_cards', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');

    publicWidget.registry.ProductCard = publicWidget.Widget.extend({
        selector: '.product-card',
        events: {
            'click .add-to-cart-btn': '_onAddToCart',
        },

        start: function () {
            this._setupZIndex();
            return this._super.apply(this, arguments);
        },

        _setupZIndex: function () {
            const $card = this.$el;
            $card.on('mouseenter', function() {
                $(this).css('z-index', '999');
            });
            $card.on('mouseleave', function() {
                setTimeout(() => {
                    $(this).css('z-index', '2');
                }, 1000);
            });
        },

        _onAddToCart: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            const $button = $(ev.currentTarget);
            const $card = $button.closest('.product-card');
            const productId = $card.data('product-id');
            const productName = $card.find('.product-title').text();
            const productPrice = $card.find('.discounted-price').text();

            if ($button.hasClass('processing')) {
                return;
            }

            $button.addClass('processing');
            this._showAddFeedback($button);

            console.log(`Added to cart: ${productName} (ID: ${productId}) - ${productPrice}`);

            // Here you can add actual cart functionality
            // this._addToCartAPI(productId);

            setTimeout(() => {
                $button.removeClass('processing');
            }, 1000);
        },

        _showAddFeedback: function ($button) {
            const originalText = $button.text();
            const originalBg = $button.css('background-color');

            $button.text('ADDING...');
            $button.css('background-color', '#f59e0b');

            setTimeout(() => {
                $button.text('ADDED ✓');
                $button.css('background-color', '#10b981');
            }, 1000);

            setTimeout(() => {
                $button.text(originalText);
                $button.css('background-color', originalBg);
            }, 3000);
        },

        // Optional: Add actual cart integration
        _addToCartAPI: function (productId) {
            // Uncomment and modify this when you want real cart functionality
            /*
            this._rpc({
                route: '/shop/cart/update',
                params: {
                    product_id: productId,
                    add_qty: 1,
                }
            }).then((data) => {
                console.log('Successfully added to cart:', data);
            }).catch((error) => {
                console.error('Error adding to cart:', error);
            });
            */
        },
    });

    publicWidget.registry.ProductGrid = publicWidget.Widget.extend({
        selector: '.product-grid-section',

        start: function () {
            this._initializeGrid();
            this._setupViewMoreButton();
            return this._super.apply(this, arguments);
        },

        _initializeGrid: function () {
            const $cards = this.$('.product-card');

            $cards.each(function (index) {
                const $card = $(this);
                $card.css('opacity', '0');

                setTimeout(() => {
                    $card.animate({
                        opacity: 1
                    }, 600);
                }, index * 100);
            });
        },

        _setupViewMoreButton: function () {
            const $viewMoreBtn = this.$('.view-more-btn');

            $viewMoreBtn.on('click', (ev) => {
                ev.preventDefault();
                this._loadMoreProducts();
            });
        },

        _loadMoreProducts: function () {
            const $button = this.$('.view-more-btn');
            const originalText = $button.text();

            $button.text('Loading...');
            $button.prop('disabled', true);

            // Simulate loading more products
            setTimeout(() => {
                console.log('Loading more products...');
                // Here you would typically make an AJAX call to load more products

                $button.text(originalText);
                $button.prop('disabled', false);
            }, 1500);
        },
    });

    return {
        ProductCard: publicWidget.registry.ProductCard,
        ProductGrid: publicWidget.registry.ProductGrid,
    };
});