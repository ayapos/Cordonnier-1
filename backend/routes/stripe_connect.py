from fastapi import APIRouter, HTTPException, Depends
from config import db, get_current_user
import stripe
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stripe/connect", tags=["stripe-connect"])

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

@router.post("/account")
async def create_connected_account(current_user: dict = Depends(get_current_user)):
    """
    Create a Stripe Express connected account for a cobbler
    """
    try:
        # Only cobblers can create connected accounts
        if current_user['role'] != 'cobbler':
            raise HTTPException(status_code=403, detail="Only cobblers can create connected accounts")
        
        # Check if user already has a connected account
        user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get('stripe_account_id'):
            return {
                "account_id": user['stripe_account_id'],
                "message": "Connected account already exists"
            }
        
        # Create Stripe Express account
        account = stripe.Account.create(
            type='express',
            country='CH',  # Switzerland
            email=user['email'],
            capabilities={
                'card_payments': {'requested': True},
                'transfers': {'requested': True},
            },
            business_type='individual',
        )
        
        # Save account ID to database
        await db.users.update_one(
            {"id": current_user['user_id']},
            {"$set": {"stripe_account_id": account.id}}
        )
        
        logger.info(f"Created Stripe Connect account {account.id} for user {current_user['user_id']}")
        
        return {
            "account_id": account.id,
            "message": "Connected account created successfully"
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating account: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating connected account: {e}")
        raise HTTPException(status_code=500, detail="Failed to create connected account")


@router.post("/onboard")
async def create_onboarding_link(current_user: dict = Depends(get_current_user)):
    """
    Generate Stripe onboarding link for cobbler to complete their account setup
    """
    try:
        # Only cobblers can access onboarding
        if current_user['role'] != 'cobbler':
            raise HTTPException(status_code=403, detail="Only cobblers can access onboarding")
        
        # Get user's connected account ID
        user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        account_id = user.get('stripe_account_id')
        if not account_id:
            raise HTTPException(
                status_code=400, 
                detail="No connected account found. Please create one first."
            )
        
        # Get frontend URL from environment
        frontend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000').replace('/api', '')
        
        # Create account link for onboarding
        account_link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=f"{frontend_url}/dashboard?stripe_refresh=true",
            return_url=f"{frontend_url}/dashboard?stripe_complete=true",
            type='account_onboarding',
        )
        
        logger.info(f"Created onboarding link for account {account_id}")
        
        return {
            "url": account_link.url,
            "account_id": account_id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating onboarding link: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating onboarding link: {e}")
        raise HTTPException(status_code=500, detail="Failed to create onboarding link")


@router.get("/status")
async def get_account_status(current_user: dict = Depends(get_current_user)):
    """
    Get the status of the cobbler's Stripe connected account
    """
    try:
        # Only cobblers can check their account status
        if current_user['role'] != 'cobbler':
            raise HTTPException(status_code=403, detail="Only cobblers can check account status")
        
        # Get user's connected account ID
        user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        account_id = user.get('stripe_account_id')
        if not account_id:
            return {
                "has_account": False,
                "charges_enabled": False,
                "payouts_enabled": False,
                "details_submitted": False,
                "requirements": {
                    "currently_due": ["create_account"],
                    "eventually_due": [],
                    "past_due": []
                }
            }
        
        # Retrieve account from Stripe
        account = stripe.Account.retrieve(account_id)
        
        return {
            "has_account": True,
            "account_id": account_id,
            "charges_enabled": account.charges_enabled,
            "payouts_enabled": account.payouts_enabled,
            "details_submitted": account.details_submitted,
            "requirements": {
                "currently_due": account.requirements.get('currently_due', []),
                "eventually_due": account.requirements.get('eventually_due', []),
                "past_due": account.requirements.get('past_due', [])
            }
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error retrieving account: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error retrieving account status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve account status")
