from odoo import http
from odoo.http import request
import json
import logging
from datetime import datetime
import traceback

_logger = logging.getLogger(__name__)


class CheckoutController(http.Controller):

    @http.route('/checkout', type='http', auth='public', website=True, methods=['GET', 'POST'])
    def checkout_page(self, **kwargs):
        """
        Render the checkout page
        """
        try:
            _logger.info("Checkout page accessed")

            context = {
                'page_title': 'Checkout - Complete Your Order'
            }
            return request.render('website_customizations.checkout_page', context)

        except Exception as e:
            _logger.error(f"Error rendering checkout page: {str(e)}")
            return request.render('website.404', {})

    @http.route('/checkout/process-order', type='json', auth='public', csrf=False, methods=['POST'])
    def process_order(self, **kwargs):
        """
        Process the order submission and create a sales order in Odoo
        FIXED for Odoo 18 - using request.params instead of request.jsonrequest
        """
        try:
            # FIXED: In Odoo 18, JSON data is accessed differently
            # Try multiple methods to get the order data
            order_data = None

            # Method 1: Try request.params (most common in Odoo 18)
            if hasattr(request, 'params') and request.params:
                order_data = request.params
                _logger.info("📥 Got order data from request.params")

            # Method 2: Try kwargs (passed parameters)
            elif kwargs:
                order_data = kwargs
                _logger.info("📥 Got order data from kwargs")

            # Method 3: Try getting from request body directly
            elif hasattr(request, 'httprequest') and request.httprequest.data:
                try:
                    order_data = json.loads(request.httprequest.data.decode('utf-8'))
                    _logger.info("📥 Got order data from request body")
                except:
                    pass

            # Method 4: Last resort - try jsonrequest if it exists
            elif hasattr(request, 'jsonrequest'):
                order_data = request.jsonrequest
                _logger.info("📥 Got order data from jsonrequest")

            if not order_data:
                _logger.error("❌ No order data received in request")
                return {
                    'success': False,
                    'error': 'No order data received'
                }

            _logger.info(f"📥 Received order data: {json.dumps(order_data, indent=2)}")

            # Validate required fields
            required_fields = [
                'customerName', 'customerPhone', 'customerEmail',
                'customerAddress', 'paymentMethod', 'grandTotal', 'items'
            ]

            missing_fields = []
            for field in required_fields:
                if not order_data.get(field):
                    missing_fields.append(field)

            if missing_fields:
                error_msg = f'Missing required fields: {", ".join(missing_fields)}'
                _logger.error(f"❌ Validation failed: {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }

            # Check if items array has data
            items = order_data.get('items', [])
            if not items or len(items) == 0:
                return {
                    'success': False,
                    'error': 'No items in cart'
                }

            _logger.info(f"✅ Validation passed. Processing {len(items)} items")

            # Step 1: Create or get customer
            _logger.info("🔄 Step 1: Creating/getting customer...")
            partner = self._create_or_get_partner(order_data)
            if not partner:
                return {
                    'success': False,
                    'error': 'Failed to create customer record'
                }
            _logger.info(f"✅ Customer created/found: {partner.name} (ID: {partner.id})")

            # Step 2: Create sales order
            _logger.info("🔄 Step 2: Creating sales order...")
            sales_order = self._create_sales_order(order_data, partner)
            if not sales_order:
                return {
                    'success': False,
                    'error': 'Failed to create sales order'
                }
            _logger.info(f"✅ Sales order created: {sales_order.name} (ID: {sales_order.id})")

            # Step 3: Create order lines
            _logger.info("🔄 Step 3: Creating order lines...")
            lines_created = self._create_order_lines(sales_order, items)
            _logger.info(f"✅ Created {lines_created} order lines")

            # Step 4: Add delivery charges
            if order_data.get('deliveryFee', 0) > 0:
                _logger.info("🔄 Step 4: Adding delivery charges...")
                self._add_delivery_line(sales_order, order_data.get('deliveryFee'))
                _logger.info("✅ Delivery charges added")

            # Final step: Recalculate totals (Odoo 18 compatible)
            _logger.info("🔄 Final step: Recalculating order totals...")
            try:
                # Try different methods for recalculating totals in Odoo 18
                if hasattr(sales_order, '_compute_tax_totals'):
                    sales_order._compute_tax_totals()
                elif hasattr(sales_order, '_compute_amounts'):
                    sales_order._compute_amounts()
                elif hasattr(sales_order, '_amount_all'):
                    sales_order._amount_all()
                else:
                    # Force recomputation by invalidating cache
                    sales_order.invalidate_recordset(['amount_total', 'amount_untaxed', 'amount_tax'])
                    # Trigger recomputation by accessing the field
                    _ = sales_order.amount_total
                _logger.info(f"✅ Totals recalculated: {sales_order.amount_total}")
            except Exception as compute_error:
                _logger.warning(f"⚠️ Could not recalculate totals, but order created: {str(compute_error)}")
                # Order is still valid, just totals might not be perfect

            _logger.info(f"🎉 ORDER SUCCESSFULLY CREATED!")
            _logger.info(f"   Order Name: {sales_order.name}")
            _logger.info(f"   Order ID: {sales_order.id}")
            _logger.info(f"   Customer: {partner.name}")
            _logger.info(f"   Total: {sales_order.amount_total}")

            # Return success response
            return {
                'success': True,
                'order_id': sales_order.name,
                'sales_order_id': sales_order.id,
                'message': 'Order placed successfully!',
                'estimated_delivery': '35-45 minutes',
                'customer_id': partner.id,
                'order_total': sales_order.amount_total
            }

        except Exception as e:
            # Log the full error traceback
            error_details = traceback.format_exc()
            _logger.error(f"❌ CRITICAL ERROR in process_order:")
            _logger.error(f"   Error Type: {type(e).__name__}")
            _logger.error(f"   Error Message: {str(e)}")
            _logger.error(f"   Full Traceback: {error_details}")

            return {
                'success': False,
                'error': f'Server error: {str(e)}',
                'error_type': type(e).__name__
            }

    def _create_or_get_partner(self, order_data):
        """
        Create or get existing customer (res.partner)
        """
        try:
            _logger.info("🔍 Searching for existing partner...")
            Partner = request.env['res.partner'].sudo()

            # Check if customer already exists by email
            email = order_data.get('customerEmail')
            existing_partner = Partner.search([('email', '=', email)], limit=1)

            if existing_partner:
                _logger.info(f"📋 Found existing partner: {existing_partner.name}")
                # Update existing partner with latest info
                existing_partner.write({
                    'name': order_data.get('customerName'),
                    'phone': order_data.get('customerPhone'),
                    'street': order_data.get('customerAddress'),
                    'zip': order_data.get('customerZipcode'),
                })
                return existing_partner

            # Create new partner
            _logger.info("👤 Creating new partner...")
            partner_vals = {
                'name': order_data.get('customerName'),
                'email': order_data.get('customerEmail'),
                'phone': order_data.get('customerPhone'),
                'street': order_data.get('customerAddress'),
                'zip': order_data.get('customerZipcode'),
                'is_company': False,
                'customer_rank': 1,  # Mark as customer
            }

            # Only add country/state if they exist in the system
            country_name = order_data.get('customerCountry')
            state_name = order_data.get('customerState')

            if country_name:
                country_id = self._get_country_id(country_name)
                if country_id:
                    partner_vals['country_id'] = country_id

            if state_name:
                state_id = self._get_state_id(state_name)
                if state_id:
                    partner_vals['state_id'] = state_id

            _logger.info(f"Creating partner with values: {partner_vals}")
            partner = Partner.create(partner_vals)
            _logger.info(f"✅ Created new partner: {partner.name} (ID: {partner.id})")
            return partner

        except Exception as e:
            _logger.error(f"❌ Error creating/getting partner: {str(e)}")
            _logger.error(f"Partner data: {order_data}")
            raise e

    def _create_sales_order(self, order_data, partner):
        """
        Create sales order with order lines
        """
        try:
            _logger.info("📝 Creating sales order...")
            SaleOrder = request.env['sale.order'].sudo()

            # Prepare sales order values
            order_vals = {
                'partner_id': partner.id,
                'partner_invoice_id': partner.id,
                'partner_shipping_id': partner.id,
                'date_order': datetime.now(),
                'state': 'draft',
                'note': f"Payment Method: {order_data.get('paymentMethod', 'Cash on Delivery')}\n"
                        f"Order Time: {order_data.get('orderTime', '')}\n"
                        f"Special Instructions: Custom checkout order",
            }

            _logger.info(f"Creating sales order with values: {order_vals}")

            # Create the sales order
            sales_order = SaleOrder.create(order_vals)
            _logger.info(f"✅ Sales order created: {sales_order.name} (ID: {sales_order.id})")

            return sales_order

        except Exception as e:
            _logger.error(f"❌ Error creating sales order: {str(e)}")
            raise e

    def _create_order_lines(self, sales_order, items):
        """
        Create sales order lines for each product
        """
        try:
            _logger.info(f"📋 Creating order lines for {len(items)} items...")
            SaleOrderLine = request.env['sale.order.line'].sudo()
            Product = request.env['product.product'].sudo()
            lines_created = 0

            for i, item in enumerate(items):
                _logger.info(f"🔄 Processing item {i + 1}: {item.get('name')}")

                # Try to find existing product by name
                product_name = item.get('name', '').strip()
                if not product_name:
                    _logger.warning(f"⚠️ Skipping item with empty name: {item}")
                    continue

                product = Product.search([('name', 'ilike', product_name)], limit=1)

                if not product:
                    _logger.info(f"📦 Product '{product_name}' not found, creating new product...")
                    product = self._create_product(item)
                else:
                    _logger.info(f"📦 Found existing product: {product.name}")

                if product:
                    line_vals = {
                        'order_id': sales_order.id,
                        'product_id': product.id,
                        'name': product_name,
                        'product_uom_qty': float(item.get('quantity', 1)),
                        'price_unit': float(item.get('price', 0)),
                        'product_uom': product.uom_id.id,
                    }

                    _logger.info(f"Creating order line: {line_vals}")
                    order_line = SaleOrderLine.create(line_vals)
                    lines_created += 1
                    _logger.info(
                        f"✅ Order line created for: {product_name} - Qty: {item.get('quantity')} - Price: {item.get('price')}")
                else:
                    _logger.error(f"❌ Could not create product for: {product_name}")

            _logger.info(f"✅ Successfully created {lines_created} order lines")
            return lines_created

        except Exception as e:
            _logger.error(f"❌ Error creating order lines: {str(e)}")
            raise e

    def _create_product(self, item_data):
        """
        Create a new product if it doesn't exist
        """
        try:
            _logger.info(f"🆕 Creating new product: {item_data.get('name')}")
            Product = request.env['product.product'].sudo()
            ProductTemplate = request.env['product.template'].sudo()

            # Get default category (fallback to first available category)
            default_category_id = 1
            try:
                Category = request.env['product.category'].sudo()
                categories = Category.search([], limit=1)
                if categories:
                    default_category_id = categories[0].id
            except:
                pass

            # Create product template first
            template_vals = {
                'name': item_data.get('name', 'Unknown Product'),
                'type': 'consu',  # Consumable product (food items)
                'categ_id': default_category_id,
                'list_price': float(item_data.get('price', 0)),
                'standard_price': float(item_data.get('price', 0)) * 0.6,  # Assume 60% cost
                'sale_ok': True,
                'purchase_ok': False,
                'description': f"Food item: {item_data.get('name', 'Unknown')}",
            }

            _logger.info(f"Creating product template with values: {template_vals}")
            template = ProductTemplate.create(template_vals)
            product = template.product_variant_ids[0] if template.product_variant_ids else None

            if product:
                _logger.info(f"✅ Created new product: {item_data.get('name')} (ID: {product.id})")
            else:
                _logger.error(f"❌ Failed to get product variant for template: {template.id}")

            return product

        except Exception as e:
            _logger.error(f"❌ Error creating product: {str(e)}")
            _logger.error(f"Product data: {item_data}")
            return None

    def _add_delivery_line(self, sales_order, delivery_fee):
        """
        Add delivery charges as a separate line
        """
        try:
            _logger.info(f"🚚 Adding delivery charges: {delivery_fee}")
            SaleOrderLine = request.env['sale.order.line'].sudo()

            # Create delivery service product or use existing one
            delivery_product = self._get_or_create_delivery_product()

            if delivery_product:
                line_vals = {
                    'order_id': sales_order.id,
                    'product_id': delivery_product.id,
                    'name': 'Delivery Charges',
                    'product_uom_qty': 1,
                    'price_unit': float(delivery_fee),
                    'product_uom': delivery_product.uom_id.id,
                }

                SaleOrderLine.create(line_vals)
                _logger.info(f"✅ Delivery charges added: Rs. {delivery_fee}")
            else:
                _logger.error("❌ Could not create delivery product")

        except Exception as e:
            _logger.error(f"❌ Error adding delivery line: {str(e)}")

    def _get_or_create_delivery_product(self):
        """
        Get or create delivery service product
        """
        try:
            Product = request.env['product.product'].sudo()

            # Look for existing delivery product
            delivery_product = Product.search([('name', '=', 'Delivery Service')], limit=1)

            if delivery_product:
                return delivery_product

            # Create delivery service product
            ProductTemplate = request.env['product.template'].sudo()

            # Get default category
            default_category_id = 1
            try:
                Category = request.env['product.category'].sudo()
                categories = Category.search([], limit=1)
                if categories:
                    default_category_id = categories[0].id
            except:
                pass

            template_vals = {
                'name': 'Delivery Service',
                'type': 'service',
                'categ_id': default_category_id,
                'list_price': 0,  # Price will be set per order
                'sale_ok': True,
                'purchase_ok': False,
                'description': 'Delivery service charges',
            }

            template = ProductTemplate.create(template_vals)
            delivery_product = template.product_variant_ids[0] if template.product_variant_ids else None

            if delivery_product:
                _logger.info(f"✅ Created delivery service product (ID: {delivery_product.id})")

            return delivery_product

        except Exception as e:
            _logger.error(f"❌ Error getting/creating delivery product: {str(e)}")
            return None

    def _get_country_id(self, country_name):
        """
        Get country ID from name
        """
        if not country_name:
            return None

        try:
            Country = request.env['res.country'].sudo()
            country = Country.search([('name', 'ilike', country_name)], limit=1)
            if country:
                _logger.info(f"Found country: {country.name} (ID: {country.id})")
                return country.id
            else:
                _logger.warning(f"Country not found: {country_name}")
                return None
        except Exception as e:
            _logger.error(f"Error finding country '{country_name}': {str(e)}")
            return None

    def _get_state_id(self, state_name):
        """
        Get state ID from name
        """
        if not state_name:
            return None

        try:
            State = request.env['res.country.state'].sudo()
            state = State.search([('name', 'ilike', state_name)], limit=1)
            if state:
                _logger.info(f"Found state: {state.name} (ID: {state.id})")
                return state.id
            else:
                _logger.warning(f"State not found: {state_name}")
                return None
        except Exception as e:
            _logger.error(f"Error finding state '{state_name}': {str(e)}")
            return None

    @http.route('/checkout/test', type='json', auth='public', csrf=False, methods=['POST'])
    def test_connection(self, **kwargs):
        """
        Simple test endpoint to verify connection
        """
        try:
            _logger.info("🧪 Test endpoint called")

            # Test basic Odoo access
            Partner = request.env['res.partner'].sudo()
            partners_count = Partner.search_count([])

            Sale = request.env['sale.order'].sudo()
            orders_count = Sale.search_count([])

            return {
                'success': True,
                'message': 'Connection successful',
                'partners_count': partners_count,
                'orders_count': orders_count,
                'odoo_version': request.env.cr.dbname
            }

        except Exception as e:
            _logger.error(f"Test connection failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }