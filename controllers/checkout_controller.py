from odoo import http
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)


class CheckoutController(http.Controller):

    @http.route('/checkout', type='http', auth='public', website=True, methods=['GET', 'POST'])
    def checkout_page(self, **kwargs):
        """
        Render the checkout page
        """
        try:
            _logger.info("Checkout page accessed")

            # You can add any pre-processing logic here
            # For example, checking if cart has items, user authentication, etc.

            # Get cart data from session if available
            cart_data = request.session.get('cart_data', {})
            _logger.info(f"Cart data in session: {cart_data}")

            # Prepare context data for the template
            context = {
                'cart_data': cart_data,
                'page_title': 'Checkout - Complete Your Order'
            }

            # Render the main checkout template
            return request.render('website_customizations.checkout_page', context)

        except Exception as e:
            _logger.error(f"Error rendering checkout page: {str(e)}")
            # Instead of redirecting, show a proper error page or return a 404
            return request.render('website.404', {})

    @http.route('/checkout/process-order', type='json', auth='public', csrf=False, methods=['POST'])
    def process_order(self, **kwargs):
        """
        Process the order submission
        """
        try:
            # Get order data from the request
            order_data = request.jsonrequest
            _logger.info(f"Processing order: {order_data}")

            # Validate required fields
            required_fields = [
                'customerName', 'customerPhone', 'customerEmail',
                'customerAddress', 'paymentMethod', 'grandTotal'
            ]

            for field in required_fields:
                if not order_data.get(field):
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }

            # Generate order ID
            order_id = self._generate_order_id()

            # Create order record (you can customize this based on your needs)
            order_vals = {
                'name': order_id,
                'customer_name': order_data.get('customerName'),
                'customer_phone': order_data.get('customerPhone'),
                'customer_email': order_data.get('customerEmail'),
                'customer_address': order_data.get('customerAddress'),
                'customer_country': order_data.get('customerCountry', ''),
                'customer_state': order_data.get('customerState', ''),
                'customer_zipcode': order_data.get('customerZipcode', ''),
                'payment_method': order_data.get('paymentMethod'),
                'subtotal': order_data.get('subtotal', 0),
                'tax_amount': order_data.get('tax', 0),
                'delivery_fee': order_data.get('deliveryFee', 0),
                'total_amount': order_data.get('grandTotal', 0),
                'order_items': json.dumps(order_data.get('items', [])),
                'order_date': order_data.get('orderDate', ''),
                'order_time': order_data.get('orderTime', ''),
                'state': 'draft'
            }

            # If you have a custom model for orders, create the record here
            # order = request.env['your.order.model'].sudo().create(order_vals)

            # For now, we'll just log the order and return success
            _logger.info(f"Order processed successfully: {order_id}")
            _logger.info(f"Order details: {json.dumps(order_vals, indent=2)}")

            # Clear cart session data
            if 'cart_data' in request.session:
                del request.session['cart_data']

            # Return success response
            return {
                'success': True,
                'order_id': order_id,
                'message': 'Order placed successfully!',
                'estimated_delivery': '35-45 minutes'
            }

        except Exception as e:
            _logger.error(f"Error processing order: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to process order. Please try again.'
            }

    @http.route('/checkout/update-cart', type='json', auth='public', csrf=False, methods=['POST'])
    def update_cart(self, **kwargs):
        """
        Update cart data in session
        """
        try:
            cart_data = request.jsonrequest
            request.session['cart_data'] = cart_data
            _logger.info(f"Cart data updated in session: {cart_data}")

            return {
                'success': True,
                'message': 'Cart updated successfully'
            }

        except Exception as e:
            _logger.error(f"Error updating cart: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to update cart'
            }

    @http.route('/checkout/validate-payment', type='json', auth='public', csrf=False, methods=['POST'])
    def validate_payment(self, **kwargs):
        """
        Validate payment details (for online payments)
        """
        try:
            payment_data = request.jsonrequest

            # Basic validation for payment data
            if payment_data.get('paymentMethod') == 'online':
                required_fields = ['cardNumber', 'cardExpiry', 'cardCvv', 'cardName']

                for field in required_fields:
                    if not payment_data.get(field):
                        return {
                            'success': False,
                            'error': f'Missing card information: {field}'
                        }

                # Here you would integrate with your payment gateway
                # For now, we'll just simulate validation
                card_number = payment_data.get('cardNumber', '').replace(' ', '')

                # Basic card number validation (Luhn algorithm can be added)
                if len(card_number) < 13 or len(card_number) > 19:
                    return {
                        'success': False,
                        'error': 'Invalid card number'
                    }

                # Simulate payment processing delay
                import time
                time.sleep(1)

                # Return success (in real implementation, this would be the payment gateway response)
                return {
                    'success': True,
                    'message': 'Payment validated successfully',
                    'transaction_id': f'TXN_{self._generate_transaction_id()}'
                }

            # For cash payments, always return success
            return {
                'success': True,
                'message': 'Cash on delivery selected'
            }

        except Exception as e:
            _logger.error(f"Error validating payment: {str(e)}")
            return {
                'success': False,
                'error': 'Payment validation failed'
            }

    def _generate_order_id(self):
        """
        Generate a unique order ID
        """
        import time
        import random

        timestamp = str(int(time.time()))[-6:]
        random_num = str(random.randint(100, 999))
        return f"#{timestamp}{random_num}"

    def _generate_transaction_id(self):
        """
        Generate a unique transaction ID
        """
        import time
        import random

        timestamp = str(int(time.time()))
        random_num = str(random.randint(1000, 9999))
        return f"{timestamp}{random_num}"