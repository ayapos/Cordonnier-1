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
        skip_geocoding = address_data.get('skip_geocoding', False)
        
        if not address:
            raise HTTPException(status_code=400, detail="Address is required")
        
        update_data = {
            "address": address,
            "address_updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Try to get coordinates from address
        if not skip_geocoding:
            coords = get_coordinates_from_address(address)
            if coords:
                update_data["latitude"] = coords[0]
                update_data["longitude"] = coords[1]
                logger.info(f"Address geocoded successfully for user {current_user['user_id']}")
            else:
                logger.warning(f"Could not geocode address for user {current_user['user_id']}, saving without coordinates")
                # Don't fail - save address without coordinates
        
        # Update user address (with or without coordinates)
        result = await db.users.update_one(
            {"id": current_user['user_id']},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Fetch and return complete user data
        updated_user = await db.users.find_one(
            {"id": current_user['user_id']},
            {"_id": 0, "password": 0}
        )
        
        response = {
            "message": "Address updated successfully",
            "user": updated_user,
            "geocoded": "latitude" in update_data and "longitude" in update_data
        }
        
        if not response["geocoded"]:
            response["warning"] = "Address saved but could not be geocoded. You may receive fewer order assignments."
        
        return response
        
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
