# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class CategoryController(http.Controller):

    @http.route('/get/categories', type='json', auth='public', website=True)
    def get_categories(self):
        """Fetch all website categories for AJAX calls if needed"""
        categories = request.env['product.public.category'].sudo().search([
            ('website_id', 'in', [False, request.website.id])
        ], order='sequence, name')

        category_data = []
        for category in categories:
            category_data.append({
                'id': category.id,
                'name': category.name,
                'slug': self._generate_slug(category.name),
                'sequence': category.sequence,
            })

        return category_data

    def _generate_slug(self, name):
        """Convert category name to URL-friendly slug for sections"""
        import re
        # Convert to lowercase, replace spaces and & with hyphens
        slug = name.lower()
        slug = re.sub(r'[&\s]+', '-', slug)
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        return slug + '-section'