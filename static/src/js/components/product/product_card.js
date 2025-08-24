odoo.define(
  "website_customizations.product_card",
  ["web.public.widget", "website_customizations.cart_manager"],
  function (require) {
    "use strict";

    // Basic console log
    console.log("Product card module loaded");

    // Get dependencies
    let publicWidget = require("web.public.widget");
    let CartManager = require("website_customizations.cart_manager");

    publicWidget.registry.ProductCard = publicWidget.Widget.extend({
      selector: ".product-card",
      events: {
        "click .add-btn": "_onAddToCart",
        "click .qty-increase": "_onIncreaseQuantity",
        "click .qty-decrease": "_onDecreaseQuantity",
      },

      /**
       * Initialize the product card
       */
      start: function () {
        this._super.apply(this, arguments);
        this.productId = this.$el.data("product-id");
        this.cartManager = CartManager.getInstance();

        // Check if product is already in cart and update UI
        this._checkCartStatus();
      },

      /**
       * Check if product is in cart and update UI accordingly
       */
      _checkCartStatus: function () {
        const cartItem = this.cartManager.getCartItem(this.productId);
        if (cartItem && cartItem.quantity > 0) {
          this._showQuantityControls(cartItem.quantity);
        }
      },

      /**
       * Handle add to cart button click
       */
      _onAddToCart: function (ev) {
        ev.preventDefault();

        const $card = this.$el;
        const productData = this._getProductData($card);

        // Add item to cart
        this.cartManager.addToCart(productData);

        // Update UI to show quantity controls
        this._showQuantityControls(1);
      },

      /**
       * Handle quantity increase
       */
      _onIncreaseQuantity: function (ev) {
        ev.preventDefault();

        const currentQty = this._getCurrentQuantity();
        const newQty = currentQty + 1;

        // Update cart
        this.cartManager.updateQuantity(this.productId, newQty);

        // Update UI
        this._updateQuantityDisplay(newQty);
      },

      /**
       * Handle quantity decrease or delete
       */
      _onDecreaseQuantity: function (ev) {
        ev.preventDefault();

        const currentQty = this._getCurrentQuantity();

        if (currentQty === 1) {
          // Remove from cart
          this.cartManager.removeFromCart(this.productId);
          // Show add button again
          this._showAddButton();
        } else {
          // Decrease quantity
          const newQty = currentQty - 1;
          this.cartManager.updateQuantity(this.productId, newQty);
          this._updateQuantityDisplay(newQty);
        }
      },

      /**
       * Get product data from card element
       */
      _getProductData: function ($card) {
        const priceText = $card
          .find(".text-lg.font-bold.text-gray-900 span")
          .text();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

        return {
          id: this.productId,
          name: $card.find("h3").text().trim(),
          price: price,
          image: $card.find("img").attr("src"),
          quantity: 1,
        };
      },

      /**
       * Show quantity controls and hide add button
       */
      _showQuantityControls: function (quantity) {
        const $container = this.$(".add-to-cart-container");
        $container.find(".add-btn").addClass("hidden");
        $container.find(".quantity-controls").removeClass("hidden");
        this._updateQuantityDisplay(quantity);
      },

      /**
       * Show add button and hide quantity controls
       */
      _showAddButton: function () {
        const $container = this.$(".add-to-cart-container");
        $container.find(".add-btn").removeClass("hidden");
        $container.find(".quantity-controls").addClass("hidden");
      },

      /**
       * Update quantity display in the controls
       */
      _updateQuantityDisplay: function (quantity) {
        const $controls = this.$(".quantity-controls");
        $controls.find(".qty-input").val(quantity);

        // Toggle between delete and minus icon
        if (quantity === 1) {
          $controls.find(".delete-icon").removeClass("hidden");
          $controls.find(".minus-icon").addClass("hidden");
        } else {
          $controls.find(".delete-icon").addClass("hidden");
          $controls.find(".minus-icon").removeClass("hidden");
        }
      },

      /**
       * Get current quantity from input
       */
      _getCurrentQuantity: function () {
        return parseInt(this.$(".qty-input").val()) || 1;
      },
    });

    return publicWidget.registry.ProductCard;
  }
);
