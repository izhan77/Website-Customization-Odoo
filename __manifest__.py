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

        # Hero Section Components - NEWLY ADDED
        'views/components/hero_section/hero_carousel_main.xml',
        'views/components/hero_section/hero_carousel_slides.xml',
        'views/components/hero_section/hero_carousel_controls.xml',
        'views/components/hero_section/hero_carousel_indicators.xml',

        # Product Cards Components
        'views/components/product_cards/product_grid.xml',
        'views/components/product_cards/single_product_card.xml',

        # Category Strip Components - NEWLY RESTRUCTURED
        'views/components/category_strip/category_strip_complete.xml',

        # Menu Sections Components - NEW ADDITION
        'views/components/menu_sections/menu_sections_complete.xml',

        # Homepage Components
        'views/pages/homepage.xml',

    ],
    'assets': {
        'web.assets_frontend': [
            # Core Assets
            'website_customizations/static/src/js/tailwind_config.js',
            'website_customizations/static/src/css/tailwind_input.css',

            # Navbar CSS + JS
            'website_customizations/static/src/css/components/navbar/navbar.css',
            'website_customizations/static/src/css/components/navbar/mobile_categories.css',
            'website_customizations/static/src/js/components/navbar/navbar.js',
            'website_customizations/static/src/css/components/navbar/menu_popup.css',
            'website_customizations/static/src/js/components/navbar/menu_popup.js',

            # Hero Section CSS + JS - NEWLY ADDED MODULAR COMPONENTS
            'website_customizations/static/src/css/components/hero_section/hero_carousel_base.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_indicators.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_controls.css',
            'website_customizations/static/src/css/components/hero_section/hero_carousel_responsive.css',
            'website_customizations/static/src/js/components/hero_section/hero_carousel_config.js',

            # Category Strip CSS + JS - NEWLY RESTRUCTURED MODULAR COMPONENTS
            'website_customizations/static/src/css/components/category_strip/category_strip.css',
            'website_customizations/static/src/js/components/category_strip/category_strip_main.js',

            # Product Cards CSS + JS
            'website_customizations/static/src/css/components/product_cards/product_grid.css',
            'website_customizations/static/src/js/components/product_cards/product_grid.js',

            # Menu Sections CSS - NEW ADDITION
            'website_customizations/static/src/css/components/menu_sections/menu_sections.css',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
