# -*- coding: utf-8 -*-
"""
============================== CRAVELY PRODUCT CONTROLLER ==============================
This controller handles fetching products from Odoo backend and serving them to frontend
File Location: /website_customizations/controllers/product_controller.py
"""
import re
from odoo import http, fields
from odoo.http import request
import json
import logging
import base64

# Set up logging for debugging
_logger = logging.getLogger(__name__)


class CravelyProductController(http.Controller):
    """
    Main controller class for handling product operations
    All routes are prefixed with /order-mode/products/ for your specific URL structure
    """

    def _generate_slug(self, name):
        """Convert category name to URL-friendly slug for sections - STANDARDIZED"""
        if not name:
            return 'general-section'

        slug = name.lower()

        # Handle ampersand first
        slug = slug.replace('&', 'and')
        slug = slug.replace('&amp;', 'and')

        # Replace spaces and special chars with hyphens
        slug = re.sub(r'[\s\-_]+', '-', slug)

        # Remove non-alphanumeric chars except hyphens
        slug = re.sub(r'[^a-z0-9\-]', '', slug)

        # Clean up multiple hyphens
        slug = re.sub(r'-+', '-', slug)

        # Remove leading/trailing hyphens
        slug = slug.strip('-')

        return slug + '-section'

    @http.route('/order-mode/products/all', type='http', auth='public', website=True, csrf=False, methods=['GET'])
    def get_all_products(self, **kwargs):
        """
        MAIN ENDPOINT: Get all products formatted for frontend
        """
        try:
            _logger.info("🔍 Fetching all products for Cravely frontend...")

            # Get all published products
            products = request.env['product.template'].sudo().search([
                ('is_published', '=', True),
                ('sale_ok', '=', True),
                ('website_published', '=', True)
            ])

            _logger.info(f"📦 Found {len(products)} published products")

            # Format products for frontend
            formatted_products = []
            categories_data = {}

            for product in products:
                # Get product category information
                category_info = self._get_category_info(product)

                # Get product images
                images = self._get_product_images(product)

                # Get pricing information
                pricing = self._get_product_pricing(product)

                # Format product data for frontend
                product_data = {
                    'id': f'product-{product.id}',
                    'odoo_id': product.id,
                    'name': product.name,
                    'description': product.description_sale or product.description or 'Fresh and delicious food prepared with love',
                    'short_description': self._truncate_description(
                        product.description_sale or product.description or ''),
                    'price': pricing['price'],
                    'original_price': pricing['original_price'],
                    'currency': pricing['currency'],
                    'image': images['main_image'],
                    'image_urls': images['all_images'],
                    'category': category_info['name'],
                    'category_id': category_info['id'],
                    'category_slug': self._generate_slug(category_info['name']),
                    'in_stock': product.qty_available > 0 if hasattr(product, 'qty_available') else True,
                    'stock_quantity': getattr(product, 'qty_available', 999),
                    'is_published': product.is_published,
                    'website_url': f'/shop/product/{product.id}'
                }

                formatted_products.append(product_data)

                # Store category data
                if category_info['name'] not in categories_data:
                    categories_data[category_info['name']] = {
                        'id': category_info['id'],
                        'name': category_info['name'],
                        'slug': self._generate_slug(category_info['name']),
                        'product_count': 0
                    }
                categories_data[category_info['name']]['product_count'] += 1

            # Prepare response data
            response_data = {
                'success': True,
                'products': formatted_products,
                'categories': list(categories_data.values()),
                'total_products': len(formatted_products),
                'message': f'Successfully loaded {len(formatted_products)} products'
            }

            _logger.info(f"✅ Successfully formatted {len(formatted_products)} products")

            # Return JSON response with proper headers
            return request.make_response(
                json.dumps(response_data, ensure_ascii=False, indent=2),
                headers=[
                    ('Content-Type', 'application/json; charset=utf-8'),
                    ('Cache-Control', 'public, max-age=300'),
                    ('Access-Control-Allow-Origin', '*')
                ]
            )

        except Exception as e:
            _logger.error(f"❌ Error fetching products: {str(e)}")
            error_response = {
                'success': False,
                'error': str(e),
                'products': [],
                'categories': [],
                'total_products': 0,
                'message': 'Failed to load products'
            }

            return request.make_response(
                json.dumps(error_response),
                headers=[('Content-Type', 'application/json; charset=utf-8')],
                status=500
            )

    @http.route('/order-mode/products/category/<string:category_slug>', type='http', auth='public', website=True,
                csrf=False, methods=['GET'])
    def get_products_by_category(self, category_slug, **kwargs):
        """
        Get products from a specific category using slug - DYNAMIC VERSION
        """
        try:
            _logger.info(f"🔍 Fetching products from category slug: {category_slug}")

            # ========== DYNAMIC CATEGORY FINDING ==========
            # Remove '-section' suffix to get the base slug
            base_slug = category_slug.replace('-section', '')

            # Find category by matching generated slugs
            all_categories = request.env['product.public.category'].sudo().search([])
            found_category = None

            for category in all_categories:
                # Generate slug for this category using the same method
                category_slug_test = self._generate_slug(category.name).replace('-section', '')

                if category_slug_test == base_slug:
                    found_category = category
                    break

            # If not found in public categories, try internal categories
            if not found_category:
                all_internal_categories = request.env['product.category'].sudo().search([])
                for category in all_internal_categories:
                    category_slug_test = self._generate_slug(category.name).replace('-section', '')
                    if category_slug_test == base_slug:
                        found_category = category
                        break
            # ========== END DYNAMIC FINDING ==========

            if not found_category:
                _logger.warning(f"⚠️ Category with slug '{category_slug}' not found")
                return request.make_response(
                    json.dumps({
                        'success': False,
                        'error': f'Category with slug "{category_slug}" not found',
                        'products': [],
                        'message': f'No category found with slug "{category_slug}"'
                    }),
                    headers=[('Content-Type', 'application/json; charset=utf-8')],
                    status=404
                )

            _logger.info(f"📂 Found category: {found_category.name} (ID: {found_category.id})")

            # Get products from this category
            if hasattr(found_category, 'product_tmpl_ids'):
                # For product.public.category
                products = found_category.product_tmpl_ids.filtered(
                    lambda p: p.is_published and p.sale_ok and p.website_published)
            else:
                # For product.category, search products
                products = request.env['product.template'].sudo().search([
                    ('categ_id', '=', found_category.id),
                    ('is_published', '=', True),
                    ('sale_ok', '=', True),
                    ('website_published', '=', True)
                ])

            _logger.info(f"📦 Found {len(products)} products in category '{found_category.name}'")

            # Format products for frontend
            formatted_products = []

            for product in products:
                # Get product images
                images = self._get_product_images(product)

                # Get pricing information
                pricing = self._get_product_pricing(product)

                # Format product data
                product_data = {
                    'id': f'product-{product.id}',
                    'odoo_id': product.id,
                    'name': product.name,
                    'description': product.description_sale or product.description or 'Fresh and delicious food prepared with love',
                    'short_description': self._truncate_description(
                        product.description_sale or product.description or ''),
                    'price': pricing['price'],
                    'original_price': pricing['original_price'],
                    'currency': pricing['currency'],
                    'image': images['main_image'],
                    'image_urls': images['all_images'],
                    'category': found_category.name,
                    'category_id': found_category.id,
                    'category_slug': self._generate_slug(found_category.name),
                    'in_stock': product.qty_available > 0 if hasattr(product, 'qty_available') else True,
                    'stock_quantity': getattr(product, 'qty_available', 999),
                    'is_published': product.is_published,
                    'website_url': f'/shop/product/{product.id}'
                }

                formatted_products.append(product_data)

            # Prepare response
            response_data = {
                'success': True,
                'category': {
                    'id': found_category.id,
                    'name': found_category.name,
                    'slug': self._generate_slug(found_category.name)
                },
                'products': formatted_products,
                'total_products': len(formatted_products),
                'message': f'Successfully loaded {len(formatted_products)} products from {found_category.name}'
            }

            _logger.info(f"✅ Successfully returned {len(formatted_products)} products from '{found_category.name}'")

            return request.make_response(
                json.dumps(response_data, ensure_ascii=False, indent=2),
                headers=[
                    ('Content-Type', 'application/json; charset=utf-8'),
                    ('Cache-Control', 'public, max-age=300'),
                    ('Access-Control-Allow-Origin', '*')
                ]
            )

        except Exception as e:
            _logger.error(f"❌ Error fetching products from category '{category_slug}': {str(e)}")
            error_response = {
                'success': False,
                'error': str(e),
                'products': [],
                'message': f'Failed to load products from category "{category_slug}"'
            }

            return request.make_response(
                json.dumps(error_response),
                headers=[('Content-Type', 'application/json; charset=utf-8')],
                status=500
            )

    # ... [rest of your methods remain the same]

    def _get_category_info(self, product):
        """Get category information for a product"""
        try:
            # Try to get website/public category first
            if product.public_categ_ids:
                category = product.public_categ_ids[0]
                return {
                    'id': category.id,
                    'name': category.name,
                    'slug': self._generate_slug(category.name)
                }

            # Fall back to internal category
            if product.categ_id:
                category = product.categ_id
                return {
                    'id': category.id,
                    'name': category.name,
                    'slug': self._generate_slug(category.name)
                }

            # Default category
            return {
                'id': 0,
                'name': 'General',
                'slug': 'general-section'
            }

        except Exception as e:
            _logger.warning(f"Error getting category for product {product.id}: {str(e)}")
            return {'id': 0, 'name': 'General', 'slug': 'general-section'}

    def _get_product_images(self, product):
        """Get product images with fallback - uses relative paths"""
        try:
            main_image = '/website_customizations/static/src/images/product_1.jpg'  # Default fallback
            all_images = []

            # Get main product image
            if product.image_1920:
                main_image = f'/web/image/product.template/{product.id}/image_1920'
                all_images.append(main_image)

            # Get additional product images
            if hasattr(product, 'product_template_image_ids'):
                for image_record in product.product_template_image_ids:
                    if image_record.image_1920:
                        img_url = f'/web/image/product.image/{image_record.id}/image_1920'
                        all_images.append(img_url)

            # If no images found, use default
            if not all_images:
                all_images = ['/website_customizations/static/src/images/product_1.jpg']
                main_image = '/website_customizations/static/src/images/product_1.jpg'

            return {
                'main_image': main_image,
                'all_images': all_images
            }

        except Exception as e:
            _logger.warning(f"Error getting images for product {product.id}: {str(e)}")
            return {
                'main_image': '/website_customizations/static/src/images/product_1.jpg',
                'all_images': ['/website_customizations/static/src/images/product_1.jpg']
            }

    def _get_product_pricing(self, product):
        """Get product pricing information"""
        try:
            # Get currency
            currency = request.env.company.currency_id

            # Get base price
            price = product.list_price
            original_price = price

            # Check for discounts/pricelists
            pricelist = request.env['product.pricelist'].sudo().search([
                ('website_id', '=', request.website.id)
            ], limit=1)

            if not pricelist:
                pricelist = request.website.pricelist_id

            if pricelist:
                # Get price from pricelist
                price_info = pricelist._get_product_price_rule(product, 1.0, uom=None)
                if price_info and len(price_info) > 1:
                    discounted_price = price_info[0]  # price
                    if discounted_price < original_price:
                        price = discounted_price

            return {
                'price': round(price, 2),
                'original_price': round(original_price, 2) if original_price != price else round(price, 2),
                'currency': currency.symbol or 'Rs.',
                'currency_code': currency.name or 'PKR'
            }

        except Exception as e:
            _logger.warning(f"Error getting pricing for product {product.id}: {str(e)}")
            return {
                'price': 0.0,
                'original_price': 0.0,
                'currency': 'Rs.',
                'currency_code': 'PKR'
            }

    def _truncate_description(self, description, max_length=80):
        """Truncate product description for card display"""
        if not description:
            return 'Fresh and delicious food prepared with love'

        # Remove HTML tags if any
        import re
        clean_desc = re.sub(r'<[^>]+>', '', description)

        if len(clean_desc) <= max_length:
            return clean_desc

        return clean_desc[:max_length].rsplit(' ', 1)[0] + '...'