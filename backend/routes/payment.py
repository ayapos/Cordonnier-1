from fastapi import APIRouter, HTTPException, Depends, Request
from models import PaymentTransaction
from config import db, get_current_user
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest
)
from datetime import datetime, timezone
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

# Get Stripe API key from environment
STRIPE_API_KEY = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_emergent')


from pydantic import BaseModel

class CreateCheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    checkout_request: CreateCheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for an order with automatic split payment"""
    import stripe
    stripe.api_key = STRIPE_API_KEY
    
    order_id = checkout_request.order_id
    origin_url = checkout_request.origin_url
    try:
        # Fetch order from database
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Verify user owns this order
        if order.get('client_id') != current_user.get('user_id'):
            raise HTTPException(status_code=403, detail="Not authorized to pay for this order")
        
        # Check if payment already exists and is paid
        existing_payment = await db.payment_transactions.find_one({
            "order_id": order_id,
            "payment_status": "paid"
        }, {"_id": 0})
        
        if existing_payment:
            raise HTTPException(status_code=400, detail="Order already paid")
        
        # Get amount from order (server-side, not from frontend)
        amount = float(order['total_amount'])
        currency = order.get('currency', 'chf').lower()
        
        # Convert amount to cents (Stripe requires cents)
        amount_cents = int(amount * 100)
        
        # Calculate commission (15% for platform)
        commission_cents = int(amount_cents * 0.15)
        
        # Build success and cancel URLs
        success_url = f"{origin_url}/order-confirmation/{order_id}?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/checkout"
        
        # Get cobbler's Stripe account ID
        cobbler_id = order.get('assigned_cobbler_id') or order.get('cobbler_id')
        if not cobbler_id:
            raise HTTPException(
                status_code=400, 
                detail="Order not assigned to a cobbler yet"
            )
        
        cobbler = await db.users.find_one({"id": cobbler_id}, {"_id": 0})
        if not cobbler:
            raise HTTPException(status_code=404, detail="Cobbler not found")
        
        stripe_account_id = cobbler.get('stripe_account_id')
        if not stripe_account_id:
            raise HTTPException(
                status_code=400, 
                detail="Cobbler has not completed Stripe Connect onboarding yet"
            )
        
        # Create Stripe Checkout Session with automatic split payment
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': currency,
                    'unit_amount': amount_cents,
                    'product_data': {
                        'name': f"Repair Service - {order.get('reference_number')}",
                        'description': order.get('service_name', 'Shoe Repair Service'),
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            payment_intent_data={
                'application_fee_amount': commission_cents,  # 15% commission to platform
                'transfer_data': {
                    'destination': stripe_account_id,  # 85% goes to cobbler
                },
            },
            metadata={
                "order_id": order_id,
                "user_id": current_user.get('user_id'),
                "cobbler_id": cobbler_id,
                "source": "shoerepair_marketplace",
                "commission_amount": str(commission_cents / 100),
                "cobbler_amount": str((amount_cents - commission_cents) / 100)
            }
        )
        
        # Create payment transaction record
        payment = PaymentTransaction(
            order_id=order_id,
            session_id=session.id,
            amount=amount,
            currency=currency,
            payment_status="pending",
            status="initiated",
            user_id=current_user.get('user_id'),
            metadata={
                "order_reference": order.get('reference_number'),
                "stripe_session_id": session.id,
                "cobbler_id": cobbler_id,
                "stripe_account_id": stripe_account_id,
                "commission_amount": commission_cents / 100,
                "cobbler_amount": (amount_cents - commission_cents) / 100
            }
        )
        
        payment_dict = payment.model_dump()
        payment_dict['created_at'] = payment_dict['created_at'].isoformat()
        payment_dict['updated_at'] = payment_dict['updated_at'].isoformat()
        
        await db.payment_transactions.insert_one(payment_dict)
        
        logger.info(f"Checkout session created with split payment: {session.id} for order {order_id}, cobbler {cobbler_id}, commission {commission_cents/100} CHF")
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
        
    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating checkout session: {str(e)}")


@router.get("/checkout-status/{session_id}")
async def get_checkout_status(
    session_id: str,
    request: Request
):
    """Get the status of a Stripe checkout session"""
    try:
        # Initialize Stripe Checkout
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Get checkout status from Stripe
        checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Find payment transaction
        payment = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment transaction not found")
        
        # Update payment status based on Stripe response
        new_payment_status = checkout_status.payment_status
        new_status = "completed" if new_payment_status == "paid" else "pending"
        
        if checkout_status.status == "expired":
            new_status = "cancelled"
            new_payment_status = "expired"
        
        # Update only if status has changed and not already processed
        if payment['payment_status'] != new_payment_status:
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": new_payment_status,
                        "status": new_status,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # If payment is successful, update order status
            if new_payment_status == "paid":
                await db.orders.update_one(
                    {"id": payment['order_id']},
                    {"$set": {"payment_status": "paid"}}
                )
                logger.info(f"Payment completed for order {payment['order_id']}")
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount": checkout_status.amount_total,
            "currency": checkout_status.currency,
            "order_id": payment['order_id']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting checkout status: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting checkout status: {str(e)}")


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        # Get raw request body
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Initialize Stripe Checkout
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        logger.info(f"Webhook event: {webhook_response.event_type} - {webhook_response.event_id}")
        
        # Update payment transaction based on webhook event
        if webhook_response.session_id:
            payment = await db.payment_transactions.find_one(
                {"session_id": webhook_response.session_id},
                {"_id": 0}
            )
            
            if payment:
                new_payment_status = webhook_response.payment_status
                new_status = "completed" if new_payment_status == "paid" else payment['status']
                
                # Only update if not already processed
                if payment['payment_status'] != new_payment_status:
                    await db.payment_transactions.update_one(
                        {"session_id": webhook_response.session_id},
                        {
                            "$set": {
                                "payment_status": new_payment_status,
                                "status": new_status,
                                "updated_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    )
                    
                    # Update order status
                    if new_payment_status == "paid":
                        await db.orders.update_one(
                            {"id": payment['order_id']},
                            {"$set": {"payment_status": "paid"}}
                        )
                        logger.info(f"Webhook: Payment completed for order {payment['order_id']}")
        
        return {"status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Error handling webhook: {str(e)}")
