from fastapi import APIRouter, HTTPException, Depends
from models import Stats
from config import db, get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("", response_model=Stats)
async def get_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'admin':
        orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    elif current_user['role'] == 'cobbler':
        orders = await db.orders.find({"cobbler_id": current_user['user_id']}, {"_id": 0}).to_list(10000)
    else:
        orders = await db.orders.find({"client_id": current_user['user_id']}, {"_id": 0}).to_list(10000)
    
    total_orders = len(orders)
    total_revenue = sum(order['total_amount'] for order in orders if order['status'] == 'delivered')
    total_commission = sum(order['commission'] for order in orders if order['status'] == 'delivered')
    pending_orders = len([o for o in orders if o['status'] in ['pending', 'accepted', 'in_progress']])
    completed_orders = len([o for o in orders if o['status'] == 'delivered'])
    
    return Stats(
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_commission=total_commission,
        pending_orders=pending_orders,
        completed_orders=completed_orders
    )

@router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    settings = await db.settings.find_one({"type": "app_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        return {
            "delivery_standard_price": 8.0,
            "delivery_express_price": 20.0,
            "delivery_standard_days": 10,
            "delivery_express_hours": 72,
            "platform_commission": 15,
            "currency": "CHF",
            "vat_rate": 7.7,
            "email_notifications_enabled": True,
            "support_email": "contact@shoerepair.com"
        }
    return settings

@router.put("/settings")
async def update_settings(settings_data: dict, current_user: dict = Depends(get_current_user)):
    from datetime import datetime, timezone
    
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    settings_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"type": "app_settings"},
        {"$set": settings_data},
        upsert=True
    )
    
    return {"message": "Settings updated successfully"}
