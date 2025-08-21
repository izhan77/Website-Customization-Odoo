{
    'name': 'Website Customizations',
    'version': '1.0',
    'summary': 'Custom CSS and JS for website animations',
    'category': 'Website',
    'depends': ['web', 'website'],
    'data': [
        'views/assets.xml',
        'views/components/navbar/navbar_base.xml',
        'views/components/navbar/navbar_logo.xml',
        'views/components/navbar/navbar_desktop_links.xml',
        'views/components/navbar/navbar_desktop_button.xml',
        'views/components/navbar/navbar_menu_button.xml',
        'views/components/navbar/navbar_mobile_menu.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # Load Tailwind config first
            'website_customizations/static/src/js/tailwind_config.js',
            # Then load CSS with fonts
            'website_customizations/static/src/css/tailwind_input.css',
            # Then component specific files
            'website_customizations/static/src/css/components/navbar/navbar.css',
            'website_customizations/static/src/js/components/navbar/navbar.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
