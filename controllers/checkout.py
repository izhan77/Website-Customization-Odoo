from odoo import http
from odoo.http import request

class CustomCheckout(http.Controller):

    @http.route(['/custom/checkout'], type='http', auth="public", website=True)
    def custom_checkout(self, **kwargs):
        # Optionally: fetch cart/order info
        order = request.website.sale_get_order()
        
        return request.render("website_customizations.checkout_main", {
            'order': order,
        })
