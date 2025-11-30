from fastapi import APIRouter, HTTPException, Depends
from models import Service, ServiceCreate
from config import db, get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/services", tags=["services"])

@router.post("", response_model=Service)
async def create_service(service: ServiceCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create services")
    
    service_obj = Service(**service.model_dump())
    service_dict = service_obj.model_dump()
    service_dict['created_at'] = service_dict['created_at'].isoformat()
    
    await db.services.insert_one(service_dict)
    return service_obj

@router.get("", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

@router.get("/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if isinstance(service['created_at'], str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    return service

@router.put("/{service_id}")
async def update_service(service_id: str, service_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.services.update_one(
        {"id": service_id},
        {"$set": service_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service updated successfully"}

@router.delete("/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.services.delete_one({"id": service_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service deleted successfully"}
