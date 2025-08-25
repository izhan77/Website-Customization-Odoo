/* ==========================================================================
   HERO CAROUSEL - CONFIGURATION
   JavaScript configuration for advanced carousel features
   ========================================================================== */

odoo.define('website_customizations.hero_carousel_config', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');

    /**
     * Hero Carousel Configuration Widget
     * Handles advanced carousel functionality and customizations
     */
    publicWidget.registry.HeroCarouselConfig = publicWidget.Widget.extend({
        selector: '#heroCarousel',

        /**
         * Widget initialization
         */
        start: function () {
            this._super.apply(this, arguments);
            this._initCarouselConfig();
            this._bindEvents();
        },

        /**
         * Initialize carousel with custom configuration
         * @private
         */
        _initCarouselConfig: function () {
            // Custom carousel interval (5 seconds)
            if (this.$el.length) {
                var carouselInstance = new bootstrap.Carousel(this.$el[0], {
                    interval: 5000,
                    wrap: true,
                    pause: 'hover',
                    keyboard: true
                });
            }
        },

        /**
         * Bind additional events for enhanced functionality
         * @private
         */
        _bindEvents: function () {
            var self = this;

            // Pause on hover
            this.$el.on('mouseenter', function() {
                self.$el.carousel('pause');
            });

            // Resume on mouse leave
            this.$el.on('mouseleave', function() {
                self.$el.carousel('cycle');
            });

            // Keyboard navigation
            $(document).on('keydown', function(e) {
                if (e.keyCode === 37) { // Left arrow
                    self.$el.carousel('prev');
                } else if (e.keyCode === 39) { // Right arrow
                    self.$el.carousel('next');
                }
            });
        }
    });

    return publicWidget.registry.HeroCarouselConfig;
});