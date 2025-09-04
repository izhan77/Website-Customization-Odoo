import logging
import os
from odoo.http import request
from twilio.rest import Client

_logger = logging.getLogger(__name__)

class SMSService:

    @staticmethod
    def send_sms(phone, message):
        try:
            # Get credentials from Odoo's parameter system
            ICP = request.env['ir.config_parameter'].sudo()
            account_sid = ICP.get_param('twilio_account_sid', '')
            auth_token = ICP.get_param('twilio_auth_token', '')
            twilio_number = ICP.get_param('twilio_phone_number', '')

            if not all([account_sid, auth_token, twilio_number]):
                return {
                    'success': False,
                    'error': 'Twilio not configured'
                }

            client = Client(account_sid, auth_token)
            sms = client.messages.create(
                body=message,
                from_=twilio_number,
                to=phone
            )

            _logger.info(f"✅ SMS sent to {phone}, SID: {sms.sid}")
            return {
                'success': True,
                'sid': sms.sid,
                'status': sms.status
            }

        except Exception as e:
            _logger.error(f"❌ SMS sending failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
