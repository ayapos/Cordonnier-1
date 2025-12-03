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
