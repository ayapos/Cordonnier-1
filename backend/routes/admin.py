from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from config import db, get_current_user, ROOT_DIR
from services import load_file_as_base64, get_coordinates_from_address
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

class UpdatePartnerRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    workshop_address: Optional[str] = None
    bank_account: Optional[str] = None

@router.get("/partners/pending")
async def get_pending_partners(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get all pending cobbler applications (without loading heavy document previews)
        pending_partners = await db.users.find({
            "role": "cobbler",
            "status": "pending"
        }, {"_id": 0, "password": 0}).to_list(1000)
        
        # Don't load documents automatically for performance
        # Documents will be loaded on-demand via separate endpoint
        
        return pending_partners
    except Exception as e:
        logger.error(f"Error fetching pending partners: {e}")
        raise HTTPException(status_code=500, detail="Error fetching pending partners")

@router.get("/partners/{partner_id}/document/{doc_type}")
async def get_partner_document(
    partner_id: str, 
    doc_type: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find partner
        partner = await db.users.find_one({"id": partner_id, "role": "cobbler"})
        if not partner:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Get document path
        doc_path = partner.get(doc_type)
        if not doc_path:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Load and return document as base64
        doc_data = load_file_as_base64(doc_path)
        if not doc_data:
            raise HTTPException(status_code=404, detail="Document file not found")
        
        return {"document": doc_data, "type": doc_type}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading document: {e}")
        raise HTTPException(status_code=500, detail="Error loading document")

@router.post("/partners/{partner_id}/approve")
async def approve_partner(partner_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find partner
        partner = await db.users.find_one({"id": partner_id, "role": "cobbler"})
        if not partner:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Update status to approved and add coordinates if address exists
        update_data = {
            "status": "approved",
            "approved_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Get coordinates from address
        if partner.get('address'):
            coords = get_coordinates_from_address(partner['address'])
            if coords:
                update_data['latitude'] = coords[0]
                update_data['longitude'] = coords[1]
        
        await db.users.update_one(
            {"id": partner_id},
            {"$set": update_data}
        )
        
        # TODO: Send approval email (mocked for now)
        logger.info(f"Partner {partner_id} approved. Email would be sent to {partner['email']}")
        
        return {"message": "Partner approved successfully", "partner_id": partner_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving partner: {e}")
        raise HTTPException(status_code=500, detail="Error approving partner")

@router.post("/partners/{partner_id}/reject")
async def reject_partner(partner_id: str, reason: str = None, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find partner
        partner = await db.users.find_one({"id": partner_id, "role": "cobbler"})
        if not partner:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Update status to rejected
        await db.users.update_one(
            {"id": partner_id},
            {"$set": {
                "status": "rejected",
                "rejected_at": datetime.now(timezone.utc).isoformat(),
                "rejection_reason": reason
            }}
        )
        
        # TODO: Send rejection email (mocked for now)
        logger.info(f"Partner {partner_id} rejected. Email would be sent to {partner['email']}")
        
        return {"message": "Partner rejected", "partner_id": partner_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting partner: {e}")
        raise HTTPException(status_code=500, detail="Error rejecting partner")


@router.put("/partners/{partner_id}")
async def update_partner(
    partner_id: str, 
    update_data: UpdatePartnerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update partner information (admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find partner
        partner = await db.users.find_one({"id": partner_id, "role": "cobbler"}, {"_id": 0})
        if not partner:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Prepare update
        update_fields = {}
        
        if update_data.name:
            update_fields['name'] = update_data.name
        
        if update_data.phone:
            update_fields['phone'] = update_data.phone
        
        if update_data.address:
            update_fields['address'] = update_data.address
        
        if update_data.bank_account:
            update_fields['bank_account'] = update_data.bank_account
        
        # Handle workshop address - important for geocoding
        if update_data.workshop_address:
            update_fields['workshop_address'] = update_data.workshop_address
            
            # Geocode the new workshop address
            logger.info(f"Geocoding workshop address: {update_data.workshop_address}")
            coords = get_coordinates_from_address(update_data.workshop_address)
            
            if coords:
                update_fields['latitude'] = coords[0]
                update_fields['longitude'] = coords[1]
                logger.info(f"Geocoded to: {coords}")
            else:
                logger.warning(f"Could not geocode address: {update_data.workshop_address}")
                # Still update the address but without coordinates
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update timestamp
        update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Perform update
        result = await db.users.update_one(
            {"id": partner_id},
            {"$set": update_fields}
        )
        
        if result.modified_count == 0:
            logger.warning(f"No changes made to partner {partner_id}")
        
        logger.info(f"Partner {partner_id} updated by admin {current_user['user_id']}")
        
        return {
            "message": "Partner updated successfully",
            "partner_id": partner_id,
            "updated_fields": list(update_fields.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating partner: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating partner: {str(e)}")
