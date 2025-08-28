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

        # Category Strip Components
        'views/components/category_strip/category_strip_complete.xml',

        # Menu Sections Components
        'views/components/menu_sections/menu_sections_complete.xml',

        # Cart Popup Components
        'views/components/cart_popup/cart_popup_components.xml',

        # Homepage Components
        'views/pages/homepage.xml',

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
            # Core Assets
            'website_customizations/static/src/js/tailwind_config.js',
            'website_customizations/static/src/css/tailwind_input.css',

            # CLEAN Navbar CSS + JS (REMOVED PROBLEMATIC FILES)
            'website_customizations/static/src/css/components/navbar/navbar.css',
            'website_customizations/static/src/js/components/navbar/navbar.js',

            # Mobile Categories CSS
            'website_customizations/static/src/css/components/navbar/mobile_categories.css',

            # Menu popup
            'website_customizations/static/src/css/components/navbar/menu_popup.css',
            'website_customizations/static/src/js/components/navbar/menu_popup.js',

            # Hero Section CSS + JS
            'website_customizations/static/src/css/components/hero_section/hero_carousel_base.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_indicators.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_controls.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_responsive.css',

            # Category Strip CSS + JS
            'website_customizations/static/src/css/components/category_strip/category_strip.css',
            'website_customizations/static/src/js/components/category_strip/category_strip_main.js',

            # Product Cards CSS + JS
            'website_customizations/static/src/css/components/product_cards/single_product_card.css',

            # CLEAN Cart CSS + JS (REMOVED PROBLEMATIC FILES)
            'website_customizations/static/src/css/components/cart_popup/cart_popup.css',
            'website_customizations/static/src/js/components/cart_popup/cart_popup.js',

            # Footer CSS
            'website_customizations/static/src/css/components/footer/footer.css',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}