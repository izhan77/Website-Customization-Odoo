# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)


class CravelyCategoryController(http.Controller):
    """
    Controller for handling dynamic categories
    """

    @http.route('/order-mode/categories/all', type='http', auth='public', website=True, csrf=False, methods=['GET'])
    def get_all_categories(self, **kwargs):
        """
        Get all categories that have at least one published product in stock
        """
        try:
            _logger.info("🔍 Fetching all categories for Cravely frontend...")

            # Get all published categories
            categories = request.env['product.public.category'].sudo().search([])

            category_list = []
            for category in categories:
                # Get published products in this category that are sale_ok and website_published
                products = category.product_tmpl_ids.filtered(
                    lambda p: p.is_published and p.sale_ok and p.website_published and
                              (p.qty_available > 0 if hasattr(p, 'qty_available') else True)
                )

                if products:
                    category_list.append({
                        'id': category.id,
                        'name': category.name,
                        'slug': category.name.lower().replace(' ', '-'),
                        'product_count': len(products)
                    })

            _logger.info(f"✅ Found {len(category_list)} categories with products")

            return request.make_response(
                json.dumps({
                    'success': True,
                    'categories': category_list
                }, ensure_ascii=False),
                headers=[('Content-Type', 'application/json; charset=utf-8')]
            )

        except Exception as e:
            _logger.error(f"❌ Error fetching categories: {str(e)}")
            return request.make_response(
                json.dumps({
                    'success': False,
                    'error': str(e),
                    'categories': []
                }),
                headers=[('Content-Type', 'application/json; charset=utf-8')],
                status=500
            )