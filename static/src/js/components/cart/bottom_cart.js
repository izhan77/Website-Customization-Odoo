odoo.define(
  "website_customizations.bottom_cart",
  ["web.public.widget", "website_customizations.cart_manager"],
  function (require) {
    "use strict";

    // Basic console log
    console.log("Bottom cart module loaded");

    // Get dependencies
    let publicWidget = require("web.public.widget");
    let CartManager = require("website_customizations.cart_manager");

    publicWidget.registry.BottomCart = publicWidget.Widget.extend({
      selector: "#bottom-cart",
      events: {
        "click #view-cart-btn": "_onViewCart",
      },

      /**
       * Initialize the bottom cart
       */
      start: function () {
        this._super.apply(this, arguments);
        this.cartManager = CartManager.getInstance();

        // Register listener for cart changes
        this.cartUpdateHandler = this._onCartUpdate.bind(this);
        this.cartManager.addListener(this.cartUpdateHandler);

        // Initial cart check
        this._updateCartDisplay();
      },

      /**
       * Clean up on destroy
       */
      destroy: function () {
        if (this.cartManager && this.cartUpdateHandler) {
          this.cartManager.removeListener(this.cartUpdateHandler);
        }
        this._super.apply(this, arguments);
      },

      /**
       * Handle cart updates from CartManager
       * @param {Object} cartData - Updated cart data
       */
      _onCartUpdate: function (cartData) {
        this._updateCartDisplay();
      },

      /**
       * Update cart display based on current cart state
       */
      _updateCartDisplay: function () {
        const totalItems = this.cartManager.getTotalItems();
        const totalPrice = this.cartManager.getTotalPrice();

        if (totalItems > 0) {
          // Show cart
          this._showCart();

          // Update item count
          this.$("#cart-item-count").text(totalItems);

          // Update items text
          const itemText = totalItems === 1 ? "1 item" : `${totalItems} items`;
          this.$("#cart-items-text").text(itemText);

          // Update total price
          this.$("#cart-total").text(Math.round(totalPrice));

          // Add animation for value changes
          this._animateValueChange();
        } else {
          // Hide cart if empty
          this._hideCart();
        }
      },

      /**
       * Show the bottom cart with animation
       */
      _showCart: function () {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          this.$el.removeClass("translate-y-full");
          this.$el.addClass("translate-y-0");
        }, 100);
      },

      /**
       * Hide the bottom cart with animation
       */
      _hideCart: function () {
        this.$el.removeClass("translate-y-0");
        this.$el.addClass("translate-y-full");
      },

      /**
       * Animate value changes with a pulse effect
       */
      _animateValueChange: function () {
        const $count = this.$("#cart-item-count").parent();
        const $total = this.$("#cart-total");

        // Add pulse animation class
        $count.addClass("animate-pulse");
        $total.addClass("animate-pulse");

        // Remove animation class after animation completes
        setTimeout(() => {
          $count.removeClass("animate-pulse");
          $total.removeClass("animate-pulse");
        }, 500);
      },

      /**
       * Handle view cart button click
       */
      _onViewCart: function (ev) {
        ev.preventDefault();

        // Get all cart items
        const cartItems = this.cartManager.getCartItems();

        // Here you can redirect to cart page or show cart modal
        // For now, we'll log the cart data
        console.log("Cart Items:", cartItems);
        console.log("Total Price:", this.cartManager.getTotalPrice());

        // Redirect to cart page (adjust URL as needed)
        window.location.href = "/shop/cart";
      },
    });

    return publicWidget.registry.BottomCart;
  }
);
