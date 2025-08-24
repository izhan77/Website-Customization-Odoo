odoo.define("website_customizations.cart_manager", ['web.core'], function (require) {
  "use strict";

  // Get web.core
  const core = require("web.core");
  const _t = core._t;

  /**
   * CartManager - Singleton class to manage cart state
   * Handles all cart operations and maintains consistency across components
   */
  const CartManager = (function () {
    let instance = null;

    function CartManagerClass() {
      // Cart items storage
      this.cartItems = {};
      this.listeners = [];

      // Initialize from session storage if available
      this._loadCartFromStorage();
    }

    CartManagerClass.prototype = {
      /**
       * Add item to cart
       * @param {Object} productData - Product information
       */
      addToCart: function (productData) {
        if (this.cartItems[productData.id]) {
          // Item exists, increase quantity
          this.cartItems[productData.id].quantity += 1;
        } else {
          // New item
          this.cartItems[productData.id] = {
            ...productData,
            quantity: 1,
          };
        }

        this._saveCartToStorage();
        this._notifyListeners();
      },

      /**
       * Remove item from cart
       * @param {String} productId - Product ID to remove
       */
      removeFromCart: function (productId) {
        delete this.cartItems[productId];
        this._saveCartToStorage();
        this._notifyListeners();
      },

      /**
       * Update item quantity
       * @param {String} productId - Product ID
       * @param {Number} quantity - New quantity
       */
      updateQuantity: function (productId, quantity) {
        if (this.cartItems[productId]) {
          if (quantity <= 0) {
            this.removeFromCart(productId);
          } else {
            this.cartItems[productId].quantity = quantity;
            this._saveCartToStorage();
            this._notifyListeners();
          }
        }
      },

      /**
       * Get specific cart item
       * @param {String} productId - Product ID
       * @returns {Object|null} Cart item or null
       */
      getCartItem: function (productId) {
        return this.cartItems[productId] || null;
      },

      /**
       * Get all cart items
       * @returns {Object} All cart items
       */
      getCartItems: function () {
        return this.cartItems;
      },

      /**
       * Get total number of items in cart
       * @returns {Number} Total item count
       */
      getTotalItems: function () {
        return Object.values(this.cartItems).reduce((total, item) => {
          return total + item.quantity;
        }, 0);
      },

      /**
       * Get cart total price
       * @returns {Number} Total price
       */
      getTotalPrice: function () {
        return Object.values(this.cartItems).reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);
      },

      /**
       * Clear entire cart
       */
      clearCart: function () {
        this.cartItems = {};
        this._saveCartToStorage();
        this._notifyListeners();
      },

      /**
       * Register a listener for cart changes
       * @param {Function} callback - Callback function
       */
      addListener: function (callback) {
        this.listeners.push(callback);
      },

      /**
       * Remove a listener
       * @param {Function} callback - Callback to remove
       */
      removeListener: function (callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      },

      /**
       * Notify all listeners about cart changes
       * @private
       */
      _notifyListeners: function () {
        const cartData = {
          items: this.cartItems,
          totalItems: this.getTotalItems(),
          totalPrice: this.getTotalPrice(),
        };

        this.listeners.forEach((callback) => {
          callback(cartData);
        });
      },

      /**
       * Save cart to session storage
       * @private
       */
      _saveCartToStorage: function () {
        try {
          // Using sessionStorage for temporary storage
          // In production, you might want to sync with backend
          sessionStorage.setItem(
            "restaurant_cart",
            JSON.stringify(this.cartItems)
          );
        } catch (e) {
          console.error("Failed to save cart:", e);
        }
      },

      /**
       * Load cart from session storage
       * @private
       */
      _loadCartFromStorage: function () {
        try {
          const storedCart = sessionStorage.getItem("restaurant_cart");
          if (storedCart) {
            this.cartItems = JSON.parse(storedCart);
          }
        } catch (e) {
          console.error("Failed to load cart:", e);
          this.cartItems = {};
        }
      },
    };

    return {
      /**
       * Get singleton instance
       * @returns {CartManagerClass} Cart manager instance
       */
      getInstance: function () {
        if (!instance) {
          instance = new CartManagerClass();
        }
        return instance;
      },
    };
  })();

  return CartManager;
});
