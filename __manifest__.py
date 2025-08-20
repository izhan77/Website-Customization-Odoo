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
        'views/components/navbar/navbar_mobile_button.xml',
        'views/components/navbar/navbar_mobile_menu.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_customizations/static/src/css/components/navbar/navbar.css',
            'website_customizations/static/src/js/components/navbar/navbar.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
