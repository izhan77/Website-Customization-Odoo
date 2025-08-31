{
    'name': 'Website Customizations',
    'version': '1.0',
    'summary': 'Custom CSS and JS for website',
    'category': 'Website',
    'author': 'eaxeesoft',
    'depends': ['web', 'website'],
    'data': [
        # Core Assets
        'views/assets.xml',

        # Navbar Components
        'views/components/navbar/navbar_base.xml',
        'views/components/navbar/navbar_logo.xml',
        'views/components/navbar/navbar_desktop_links.xml',
        'views/components/navbar/navbar_desktop_button.xml',
        'views/components/navbar/navbar_menu_button.xml',
        'views/components/navbar/navbar_mobile_menu.xml',
        'views/components/navbar/navbar_menu_popup.xml',

        # Hero Section Components
        'views/components/hero_section/hero_carousel_main.xml',
        'views/components/hero_section/hero_carousel_slides.xml',
        'views/components/hero_section/hero_carousel_controls.xml',
        'views/components/hero_section/hero_carousel_indicators.xml',

        # Product Cards Components
        'views/components/product_cards/single_product_card.xml',

        # FIXED Product Popup Components - Navbar-Safe
        'views/components/product_popup/cravely_product_popup_modal.xml',

        # Category Strip Components
        'views/components/category_strip/category_strip_complete.xml',

        # Menu Sections Components
        'views/components/menu_sections/menu_sections_complete.xml',

        # Cart Popup Components
        'views/components/cart_popup/cravely_cart_components.xml',

        # Homepage Components
        'views/pages/homepage.xml',

        # Checkout Components
        'views/pages/checkout_page.xml',

        # Footer Components
        'views/components/footer/footer_base.xml',
        'views/components/footer/footer_company.xml',
        'views/components/footer/footer_resources.xml',
        'views/components/footer/footer_social.xml',
        'views/components/footer/footer_bottom.xml',
        'views/components/footer/footer.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # CRITICAL: Load scroll utilities FIRST
            'website_customizations/static/src/js/utils/scroll_utils.js',

            # Core CSS and config
            'website_customizations/static/src/css/tailwind_input.css',
            'website_customizations/static/src/js/tailwind_config.js',

            # Component CSS files
            'website_customizations/static/src/css/components/navbar/navbar.css',
            'website_customizations/static/src/css/components/navbar/mobile_categories.css',
            'website_customizations/static/src/css/components/navbar/menu_popup.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_base.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_indicators.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_controls.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_responsive.css',
            'website_customizations/static/src/css/components/category_strip/category_strip.css',
            'website_customizations/static/src/css/components/product_cards/single_product_card.css',
            'website_customizations/static/src/css/components/product_popup/cravely_product_popup.css',
            'website_customizations/static/src/css/components/cart_popup/cravely_cart.css',
            'website_customizations/static/src/css/components/footer/footer.css',

            # JavaScript files in dependency order
            'website_customizations/static/src/js/components/hero_section/hero_carousel_config.js',
            'website_customizations/static/src/js/components/navbar/menu_popup.js',
            'website_customizations/static/src/js/components/navbar/navbar_mobile.js',

            # IMPORTANT: Category strip loads LAST (depends on scroll utils)
            'website_customizations/static/src/js/components/category_strip/category_strip_main.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
