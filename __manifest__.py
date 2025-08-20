{
    'name': 'Website Customizations',
    'version': '1.0',
    'summary': 'Custom CSS and JS for website animations',
    'category': 'Website',
    'depends': ['web', 'website'],
    'data': [
        'views/assets.xml',
        'views/navbar_inherit.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # Load order matters - variables first, then base, then components
            # 'website_customizations/static/src/css/custom/base.css',
            # 'website_customizations/static/src/css/components/navbar/navbar.css',
            # 'website_customizations/static/src/css/components/navbar/navbar_logo.css',
            # 'website_customizations/static/src/css/components/navbar/navbar_links.css',
            # 'website_customizations/static/src/css/components/navbar/navbar_buttons.css',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
