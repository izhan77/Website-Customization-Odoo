{
    'name': 'Website Customizations',
    'version': '1.0',
    'summary': 'Custom CSS and JS for website animations',
    'category': 'Website',
    'depends': ['web', 'website'],
    'data': [
          'views/assets.xml',
    'views/components/footer/footer.xml',
    'views/components/footer/footer_base.xml',
    'views/components/footer/footer_company.xml',
    'views/components/footer/footer_resources.xml',
    'views/components/footer/footer_social.xml',
    'views/components/footer/footer_bottom.xml',
    ],
    'assets': {
        'website.assets_frontend': [
            'https://cdn.tailwindcss.com',
            # Load Tailwind config first
            'website_customizations/static/src/js/tailwind_config.js',
            # Then load CSS with fonts
            'website_customizations/static/src/css/tailwind_input.css',
            # Then component specific files
         
        #  footer
          'website_customizations/static/src/css/components/footer/footer.css',
        'website_customizations/static/src/js/components/footer/footer.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}