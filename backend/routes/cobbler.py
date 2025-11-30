from fastapi import APIRouter, HTTPException, Depends
from models import User
from config import db, get_current_user
from services import get_coordinates_from_address
from typing import List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cobbler", tags=["cobbler"])

@router.put("/address")
async def update_cobbler_address(address_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'cobbler':
        raise HTTPException(status_code=403, detail="Cobbler access required")
    
    try:
        address = address_data.get('address')
        if not address:
            raise HTTPException(status_code=400, detail="Address is required")
        
        # Get coordinates from address
        coords = get_coordinates_from_address(address)
        if not coords:
            raise HTTPException(status_code=400, detail="Could not geocode address. Please verify the address.")
        
        # Update user address and coordinates
        await db.users.update_one(
            {"id": current_user['user_id']},
            {"$set": {
                "address": address,
                "latitude": coords[0],
                "longitude": coords[1],
                "address_updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "message": "Address updated successfully",
            "address": address,
            "latitude": coords[0],
            "longitude": coords[1]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating address: {e}")
        raise HTTPException(status_code=500, detail="Error updating address")

@router.get("/cobblers", response_model=List[User])
async def get_cobblers():
    cobblers = await db.users.find({"role": "cobbler"}, {"_id": 0, "password": 0}).to_list(1000)
    for cobbler in cobblers:
        if isinstance(cobbler['created_at'], str):
            cobbler['created_at'] = datetime.fromisoformat(cobbler['created_at'])
    return cobblers
