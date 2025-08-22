{
    'name': 'Website Customizations',
    'version': '1.0',
    'summary': 'Custom CSS and JS for website ',
    'category': 'Website',
    'depends': ['web', 'website'],
    'data': [
        'views/assets.xml',

        # Navbar Components
        'views/components/navbar/navbar_base.xml',
        'views/components/navbar/navbar_logo.xml',
        'views/components/navbar/navbar_desktop_links.xml',
        'views/components/navbar/navbar_desktop_button.xml',
        'views/components/navbar/navbar_menu_button.xml',
        'views/components/navbar/navbar_mobile_menu.xml',

        # Category Strip Components - ADD THESE LINES
        'views/components/category_strip/category_strip_base.xml',
        'views/components/category_strip/category_strip_container.xml',
        'views/components/category_strip/category_strip_items.xml',
        'views/components/category_strip/menu_sections.xml',

        # Order Method Selector Components
        # 'views/components/order_method_selector/order_method_selector_base.xml',
        # 'views/components/order_method_selector/order_method_toggle.xml',
        # 'views/components/order_method_selector/order_method_location.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # Tailwind CSS + JS
            'website_customizations/static/src/js/tailwind_config.js',
            'website_customizations/static/src/css/tailwind_input.css',

            # Navbar CSS + JS
            'website_customizations/static/src/css/components/navbar/navbar.css',
            'website_customizations/static/src/js/components/navbar/navbar.js',

            # Category Strip CSS + JS - ADD THESE LINES
            'website_customizations/static/src/css/components/category_strip/category_strip.css',
            'website_customizations/static/src/js/components/category_strip/category_strip_scroll.js',
            'website_customizations/static/src/js/components/category_strip/category_strip_main.js',

            # Order Method Selector CSS + JS (load in order)
            # 'website_customizations/static/src/css/components/order_method_selector/order_method_animations.css',
            # 'website_customizations/static/src/js/components/order_method_selector/order_method_toggle.js',
            # 'website_customizations/static/src/js/components/order_method_selector/order_method_location.js',
            # 'website_customizations/static/src/js/components/order_method_selector/order_method_main.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}