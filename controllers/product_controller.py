# # -*- coding: utf-8 -*-
# """
# ============================== CRAVELY PRODUCT CONTROLLER ==============================
# This controller handles fetching products from Odoo backend and serving them to frontend
# File Location: /website_customizations/controllers/product_controller.py
#
# NEW URL STRUCTURE:
# Base URL: http://100.110.83.110:8069
# All endpoints now use: /order-mode/products/...
#
# ENDPOINTS:
# - /order-mode/products/all - Get all products
# - /order-mode/products/category/{name} - Get products by category
# - /order-mode/products/search - Search products
# - /order-mode/products/single/{id} - Get single product
# """
#
# from odoo import http, fields
# from odoo.http import request
# import json
# import logging
# import base64
#
# # Set up logging for debugging
# _logger = logging.getLogger(__name__)
#
#
# class CravelyProductController(http.Controller):
#     """
#     Main controller class for handling product operations
#     All routes are prefixed with /order-mode/products/ for your specific URL structure
#     """
#
#     @http.route('/order-mode/products/all', type='http', auth='public', website=True, csrf=False, methods=['GET'])
#     def get_all_products(self, **kwargs):
#         """
#         MAIN ENDPOINT: Get all products formatted for frontend
#
#         URL: http://100.110.83.110:8069/order-mode/products/all
#         Method: GET
#         Returns: JSON with all products organized by category
#         """
#         try:
#             _logger.info("🔍 Fetching all products for Cravely frontend...")
#
#             # Get all published products
#             products = request.env['product.template'].sudo().search([
#                 ('is_published', '=', True),
#                 ('sale_ok', '=', True),
#                 ('website_published', '=', True)
#             ])
#
#             _logger.info(f"📦 Found {len(products)} published products")
#
#             # Format products for frontend
#             formatted_products = []
#             categories_data = {}
#
#             for product in products:
#                 # Get product category information
#                 category_info = self._get_category_info(product)
#
#                 # Get product images
#                 images = self._get_product_images(product)
#
#                 # Get pricing information
#                 pricing = self._get_product_pricing(product)
#
#                 # Format product data for frontend
#                 product_data = {
#                     'id': f'product-{product.id}',
#                     'odoo_id': product.id,
#                     'name': product.name,
#                     'description': product.description_sale or product.description or 'Fresh and delicious food prepared with love',
#                     'short_description': self._truncate_description(
#                         product.description_sale or product.description or ''),
#                     'price': pricing['price'],
#                     'original_price': pricing['original_price'],
#                     'currency': pricing['currency'],
#                     'image': images['main_image'],
#                     'image_urls': images['all_images'],
#                     'category': category_info['name'],
#                     'category_id': category_info['id'],
#                     'category_slug': category_info['slug'],
#                     'in_stock': product.qty_available > 0 if hasattr(product, 'qty_available') else True,
#                     'stock_quantity': getattr(product, 'qty_available', 999),
#                     'is_published': product.is_published,
#                     'website_url': f'/shop/product/{product.id}'
#                 }
#
#                 formatted_products.append(product_data)
#
#                 # Store category data
#                 if category_info['name'] not in categories_data:
#                     categories_data[category_info['name']] = {
#                         'id': category_info['id'],
#                         'name': category_info['name'],
#                         'slug': category_info['slug'],
#                         'product_count': 0
#                     }
#                 categories_data[category_info['name']]['product_count'] += 1
#
#             # Prepare response data
#             response_data = {
#                 'success': True,
#                 'products': formatted_products,
#                 'categories': list(categories_data.values()),
#                 'total_products': len(formatted_products),
#                 'message': f'Successfully loaded {len(formatted_products)} products',
#                 'endpoint_info': {
#                     'base_url': 'http://100.110.83.110:8069',
#                     'endpoint': '/order-mode/products/all'
#                 }
#             }
#
#             _logger.info(f"✅ Successfully formatted {len(formatted_products)} products")
#
#             # Return JSON response with proper headers
#             return request.make_response(
#                 json.dumps(response_data, ensure_ascii=False, indent=2),
#                 headers=[
#                     ('Content-Type', 'application/json; charset=utf-8'),
#                     ('Cache-Control', 'public, max-age=300'),
#                     ('Access-Control-Allow-Origin', '*')  # Allow CORS for your IP
#                 ]
#             )
#
#         except Exception as e:
#             _logger.error(f"❌ Error fetching products: {str(e)}")
#             error_response = {
#                 'success': False,
#                 'error': str(e),
#                 'products': [],
#                 'categories': [],
#                 'total_products': 0,
#                 'message': 'Failed to load products',
#                 'endpoint_info': {
#                     'base_url': 'http://100.110.83.110:8069',
#                     'endpoint': '/order-mode/products/all'
#                 }
#             }
#
#             return request.make_response(
#                 json.dumps(error_response),
#                 headers=[('Content-Type', 'application/json; charset=utf-8')],
#                 status=500
#             )
#
#     @http.route('/order-mode/products/category/<string:category_name>', type='http', auth='public', website=True,
#                 csrf=False, methods=['GET'])
#     def get_products_by_category(self, category_name, **kwargs):
#         """
#         Get products from a specific category (like 'ricebox')
#
#         URL: http://100.110.83.110:8069/order-mode/products/category/ricebox
#         Method: GET
#         Returns: JSON with products from specified category
#         """
#         try:
#             _logger.info(f"🔍 Fetching products from category: {category_name}")
#
#             # Map frontend category names to backend category names
#             category_mapping = {
#                 'ricebox': 'Rice Box',
#                 'rice-box': 'Rice Box',
#                 'fish-chips': 'Fish & Chips',
#                 'fish-and-chips': 'Fish & Chips',
#                 'pasta': 'Pasta',
#                 'turkish-feast': 'Turkish Feast',
#                 'wraps-rolls': 'Wraps & Rolls',
#                 'wraps-and-rolls': 'Wraps & Rolls',
#                 'new-arrivals': 'New Arrivals',
#                 'soups-salads': 'Soups & Salads',
#                 'soups-and-salads': 'Soups & Salads',
#                 'cold-drinks': 'Drinks',
#                 'hot-beverages': 'Hot Beverages',
#                 'desserts': 'Desserts',
#                 'bbq': 'BBQ Specials',
#                 'bbq-specials': 'BBQ Specials',
#                 'fast-food': 'Fast Food'
#             }
#
#             # Get the actual category name from mapping
#             actual_category_name = category_mapping.get(category_name.lower(), category_name.replace('-', ' ').title())
#
#             _logger.info(f"🔍 Mapping '{category_name}' to '{actual_category_name}'")
#
#             # Find the category by name (case insensitive)
#             category = request.env['product.public.category'].sudo().search([
#                 ('name', 'ilike', actual_category_name)
#             ], limit=1)
#
#             if not category:
#                 # Try to find by website category
#                 category = request.env['product.category'].sudo().search([
#                     ('name', 'ilike', actual_category_name)
#                 ], limit=1)
#
#             if not category:
#                 _logger.warning(f"⚠️ Category '{actual_category_name}' not found")
#                 return request.make_response(
#                     json.dumps({
#                         'success': False,
#                         'error': f'Category "{actual_category_name}" not found',
#                         'products': [],
#                         'message': f'No category found with name "{actual_category_name}"',
#                         'endpoint_info': {
#                             'base_url': 'http://100.110.83.110:8069',
#                             'endpoint': f'/order-mode/products/category/{category_name}'
#                         }
#                     }),
#                     headers=[('Content-Type', 'application/json; charset=utf-8')],
#                     status=404
#                 )
#
#             _logger.info(f"📂 Found category: {category.name} (ID: {category.id})")
#
#             # Get products from this category
#             if hasattr(category, 'product_tmpl_ids'):
#                 # For product.public.category
#                 products = category.product_tmpl_ids.filtered(
#                     lambda p: p.is_published and p.sale_ok and p.website_published)
#             else:
#                 # For product.category, search products
#                 products = request.env['product.template'].sudo().search([
#                     ('categ_id', '=', category.id),
#                     ('is_published', '=', True),
#                     ('sale_ok', '=', True),
#                     ('website_published', '=', True)
#                 ])
#
#             _logger.info(f"📦 Found {len(products)} products in category '{category.name}'")
#
#             # Format products for frontend
#             formatted_products = []
#
#             for product in products:
#                 # Get product images
#                 images = self._get_product_images(product)
#
#                 # Get pricing information
#                 pricing = self._get_product_pricing(product)
#
#                 # Format product data
#                 product_data = {
#                     'id': f'product-{product.id}',
#                     'odoo_id': product.id,
#                     'name': product.name,
#                     'description': product.description_sale or product.description or 'Fresh and delicious food prepared with love',
#                     'short_description': self._truncate_description(
#                         product.description_sale or product.description or ''),
#                     'price': pricing['price'],
#                     'original_price': pricing['original_price'],
#                     'currency': pricing['currency'],
#                     'image': images['main_image'],
#                     'image_urls': images['all_images'],
#                     'category': category.name,
#                     'category_id': category.id,
#                     'category_slug': category_name.lower().replace(' ', '-'),
#                     'in_stock': product.qty_available > 0 if hasattr(product, 'qty_available') else True,
#                     'stock_quantity': getattr(product, 'qty_available', 999),
#                     'is_published': product.is_published,
#                     'website_url': f'/shop/product/{product.id}'
#                 }
#
#                 formatted_products.append(product_data)
#
#             # Prepare response
#             response_data = {
#                 'success': True,
#                 'category': {
#                     'id': category.id,
#                     'name': category.name,
#                     'slug': category_name.lower().replace(' ', '-')
#                 },
#                 'products': formatted_products,
#                 'total_products': len(formatted_products),
#                 'message': f'Successfully loaded {len(formatted_products)} products from {category.name}',
#                 'endpoint_info': {
#                     'base_url': 'http://100.110.83.110:8069',
#                     'endpoint': f'/order-mode/products/category/{category_name}'
#                 }
#             }
#
#             _logger.info(f"✅ Successfully returned {len(formatted_products)} products from '{category.name}'")
#
#             return request.make_response(
#                 json.dumps(response_data, ensure_ascii=False, indent=2),
#                 headers=[
#                     ('Content-Type', 'application/json; charset=utf-8'),
#                     ('Cache-Control', 'public, max-age=300'),
#                     ('Access-Control-Allow-Origin', '*')
#                 ]
#             )
#
#         except Exception as e:
#             _logger.error(f"❌ Error fetching products from category '{category_name}': {str(e)}")
#             error_response = {
#                 'success': False,
#                 'error': str(e),
#                 'products': [],
#                 'message': f'Failed to load products from category "{category_name}"',
#                 'endpoint_info': {
#                     'base_url': 'http://100.110.83.110:8069',
#                     'endpoint': f'/order-mode/products/category/{category_name}'
#                 }
#             }
#
#             return request.make_response(
#                 json.dumps(error_response),
#                 headers=[('Content-Type', 'application/json; charset=utf-8')],
#                 status=500
#             )
#
#     @http.route('/order-mode/products/search', type='http', auth='public', website=True, csrf=False, methods=['GET'])
#     def search_products(self, q='', category='', limit=50, **kwargs):
#         """
#         Search products by name, description, or category
#
#         URL: http://100.110.83.110:8069/order-mode/products/search?q=beef&category=ricebox&limit=10
#         Method: GET
#         """
#         try:
#             _logger.info(f"🔍 Searching products with query: '{q}', category: '{category}'")
#
#             # Build search domain
#             domain = [
#                 ('is_published', '=', True),
#                 ('sale_ok', '=', True),
#                 ('website_published', '=', True)
#             ]
#
#             # Add search query if provided
#             if q:
#                 domain.append('|')
#                 domain.append(('name', 'ilike', q))
#                 domain.append(('description_sale', 'ilike', q))
#
#             # Add category filter if provided
#             if category:
#                 cat = request.env['product.public.category'].sudo().search([
#                     ('name', 'ilike', category)
#                 ], limit=1)
#
#                 if cat:
#                     domain.append(('public_categ_ids', 'in', cat.ids))
#                 else:
#                     # Try internal category
#                     internal_cat = request.env['product.category'].sudo().search([
#                         ('name', 'ilike', category)
#                     ], limit=1)
#                     if internal_cat:
#                         domain.append(('categ_id', '=', internal_cat.id))
#
#             # Search products
#             products = request.env['product.template'].sudo().search(
#                 domain,
#                 limit=int(limit),
#                 order='name asc'
#             )
#
#             _logger.info(f"📦 Found {len(products)} products matching search criteria")
#
#             # Format products
#             formatted_products = []
#
#             for product in products:
#                 category_info = self._get_category_info(product)
#                 images = self._get_product_images(product)
#                 pricing = self._get_product_pricing(product)
#
#                 product_data = {
#                     'id': f'product-{product.id}',
#                     'odoo_id': product.id,
#                     'name': product.name,
#                     'description': product.description_sale or product.description or 'Fresh and delicious food prepared with love',
#                     'short_description': self._truncate_description(
#                         product.description_sale or product.description or ''),
#                     'price': pricing['price'],
#                     'original_price': pricing['original_price'],
#                     'currency': pricing['currency'],
#                     'image': images['main_image'],
#                     'category': category_info['name'],
#                     'category_id': category_info['id'],
#                     'in_stock': product.qty_available > 0 if hasattr(product, 'qty_available') else True,
#                     'website_url': f'/shop/product/{product.id}'
#                 }
#
#                 formatted_products.append(product_data)
#
#             response_data = {
#                 'success': True,
#                 'search_query': q,
#                 'category_filter': category,
#                 'products': formatted_products,
#                 'total_results': len(formatted_products),
#                 'message': f'Found {len(formatted_products)} products',
#                 'endpoint_info': {
#                     'base_url': 'http://100.110.83.110:8069',
#                     'endpoint': f'/order-mode/products/search'
#                 }
#             }
#
#             return request.make_response(
#                 json.dumps(response_data, ensure_ascii=False, indent=2),
#                 headers=[
#                     ('Content-Type', 'application/json; charset=utf-8'),
#                     ('Access-Control-Allow-Origin', '*')
#                 ]
#             )
#
#         except Exception as e:
#             _logger.error(f"❌ Error searching products: {str(e)}")
#             return request.make_response(
#                 json.dumps({
#                     'success': False,
#                     'error': str(e),
#                     'products': [],
#                     'message': 'Search failed',
#                     'endpoint_info': {
#                         'base_url': 'http://100.110.83.110:8069',
#                         'endpoint': '/order-mode/products/search'
#                     }
#                 }),
#                 headers=[('Content-Type', 'application/json; charset=utf-8')],
#                 status=500
#             )
#
#     @http.route('/order-mode/products/single/<int:product_id>', type='http', auth='public', website=True, csrf=False,
#                 methods=['GET'])
#     def get_single_product(self, product_id, **kwargs):
#         """
#         Get detailed information for a single product
#
#         URL: http://100.110.83.110:8069/order-mode/products/single/123
#         Method: GET
#         """
#         try:
#             _logger.info(f"🔍 Fetching single product with ID: {product_id}")
#
#             # Get the product
#             product = request.env['product.template'].sudo().browse(product_id)
#
#             if not product.exists() or not product.is_published:
#                 return request.make_response(
#                     json.dumps({
#                         'success': False,
#                         'error': 'Product not found or not published',
#                         'message': f'Product with ID {product_id} not found',
#                         'endpoint_info': {
#                             'base_url': 'http://100.110.83.110:8069',
#                             'endpoint': f'/order-mode/products/single/{product_id}'
#                         }
#                     }),
#                     headers=[('Content-Type', 'application/json; charset=utf-8')],
#                     status=404
#                 )
#
#             # Get detailed product information
#             category_info = self._get_category_info(product)
#             images = self._get_product_images(product)
#             pricing = self._get_product_pricing(product)
#
#             # Get product variants if any
#             variants = []
#             if product.product_variant_ids:
#                 for variant in product.product_variant_ids:
#                     if variant.active:
#                         variants.append({
#                             'id': variant.id,
#                             'name': variant.display_name,
#                             'price': variant.list_price,
#                             'barcode': variant.barcode or '',
#                             'default_code': variant.default_code or ''
#                         })
#
#             product_data = {
#                 'success': True,
#                 'product': {
#                     'id': f'product-{product.id}',
#                     'odoo_id': product.id,
#                     'name': product.name,
#                     'description': product.description_sale or product.description or 'Fresh and delicious food prepared with love',
#                     'description_purchase': product.description_purchase or '',
#                     'price': pricing['price'],
#                     'original_price': pricing['original_price'],
#                     'currency': pricing['currency'],
#                     'image': images['main_image'],
#                     'image_urls': images['all_images'],
#                     'category': category_info['name'],
#                     'category_id': category_info['id'],
#                     'in_stock': product.qty_available > 0 if hasattr(product, 'qty_available') else True,
#                     'stock_quantity': getattr(product, 'qty_available', 999),
#                     'weight': product.weight if hasattr(product, 'weight') else 0,
#                     'variants': variants,
#                     'is_published': product.is_published,
#                     'website_url': f'/shop/product/{product.id}',
#                     'created_date': product.create_date.isoformat() if product.create_date else None,
#                     'updated_date': product.write_date.isoformat() if product.write_date else None
#                 },
#                 'endpoint_info': {
#                     'base_url': 'http://100.110.83.110:8069',
#                     'endpoint': f'/order-mode/products/single/{product_id}'
#                 }
#             }
#
#             _logger.info(f"✅ Successfully retrieved product: {product.name}")
#
#             return request.make_response(
#                 json.dumps(product_data, ensure_ascii=False, indent=2),
#                 headers=[
#                     ('Content-Type', 'application/json; charset=utf-8'),
#                     ('Access-Control-Allow-Origin', '*')
#                 ]
#             )
#
#         except Exception as e:
#             _logger.error(f"❌ Error fetching product {product_id}: {str(e)}")
#             return request.make_response(
#                 json.dumps({
#                     'success': False,
#                     'error': str(e),
#                     'message': f'Failed to load product {product_id}',
#                     'endpoint_info': {
#                         'base_url': 'http://100.110.83.110:8069',
#                         'endpoint': f'/order-mode/products/single/{product_id}'
#                     }
#                 }),
#                 headers=[('Content-Type', 'application/json; charset=utf-8')],
#                 status=500
#             )
#
#     # ========================= HELPER METHODS =========================
#
#     def _get_category_info(self, product):
#         """Get category information for a product"""
#         try:
#             # Try to get website/public category first
#             if product.public_categ_ids:
#                 category = product.public_categ_ids[0]
#                 return {
#                     'id': category.id,
#                     'name': category.name,
#                     'slug': category.name.lower().replace(' ', '-')
#                 }
#
#             # Fall back to internal category
#             if product.categ_id:
#                 category = product.categ_id
#                 return {
#                     'id': category.id,
#                     'name': category.name,
#                     'slug': category.name.lower().replace(' ', '-')
#                 }
#
#             # Default category
#             return {
#                 'id': 0,
#                 'name': 'General',
#                 'slug': 'general'
#             }
#
#         except Exception as e:
#             _logger.warning(f"Error getting category for product {product.id}: {str(e)}")
#             return {'id': 0, 'name': 'General', 'slug': 'general'}
#
#     def _get_product_images(self, product):
#         """Get product images with fallback"""
#         try:
#             base_url = 'http://100.110.83.110:8069'  # Use your specific IP
#
#             main_image = '/website_customizations/static/src/images/product_1.jpg'  # Default fallback
#             all_images = []
#
#             # Get main product image
#             if product.image_1920:
#                 main_image = f'{base_url}/web/image/product.template/{product.id}/image_1920'
#                 all_images.append(main_image)
#
#             # Get additional product images
#             if hasattr(product, 'product_template_image_ids'):
#                 for image_record in product.product_template_image_ids:
#                     if image_record.image_1920:
#                         img_url = f'{base_url}/web/image/product.image/{image_record.id}/image_1920'
#                         all_images.append(img_url)
#
#             # If no images found, use default
#             if not all_images:
#                 all_images = ['/website_customizations/static/src/images/product_1.jpg']
#                 main_image = '/website_customizations/static/src/images/product_1.jpg'
#
#             return {
#                 'main_image': main_image,
#                 'all_images': all_images
#             }
#
#         except Exception as e:
#             _logger.warning(f"Error getting images for product {product.id}: {str(e)}")
#             return {
#                 'main_image': '/website_customizations/static/src/images/product_1.jpg',
#                 'all_images': ['/website_customizations/static/src/images/product_1.jpg']
#             }
#
#     def _get_product_pricing(self, product):
#         """Get product pricing information"""
#         try:
#             # Get currency
#             currency = request.env.company.currency_id
#
#             # Get base price
#             price = product.list_price
#             original_price = price
#
#             # Check for discounts/pricelists
#             pricelist = request.env['product.pricelist'].sudo().search([
#                 ('website_id', '=', request.website.id)
#             ], limit=1)
#
#             if not pricelist:
#                 pricelist = request.website.pricelist_id
#
#             if pricelist:
#                 # Get price from pricelist
#                 price_info = pricelist._get_product_price_rule(product, 1.0, uom=None)
#                 if price_info and len(price_info) > 1:
#                     discounted_price = price_info[0]  # price
#                     if discounted_price < original_price:
#                         price = discounted_price
#
#             return {
#                 'price': round(price, 2),
#                 'original_price': round(original_price, 2) if original_price != price else round(price, 2),
#                 'currency': currency.symbol or 'Rs.',
#                 'currency_code': currency.name or 'PKR'
#             }
#
#         except Exception as e:
#             _logger.warning(f"Error getting pricing for product {product.id}: {str(e)}")
#             return {
#                 'price': 0.0,
#                 'original_price': 0.0,
#                 'currency': 'Rs.',
#                 'currency_code': 'PKR'
#             }
#
#     def _truncate_description(self, description, max_length=80):
#         """Truncate product description for card display"""
#         if not description:
#             return 'Fresh and delicious food prepared with love'
#
#         # Remove HTML tags if any
#         import re
#         clean_desc = re.sub(r'<[^>]+>', '', description)
#
#         if len(clean_desc) <= max_length:
#             return clean_desc
#
#         return clean_desc[:max_length].rsplit(' ', 1)[0] + '...'