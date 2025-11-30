from fastapi import APIRouter, HTTPException, Depends
from models import User, UserCreate, UserLogin
from services import hash_password, verify_password, create_access_token, save_base64_file
from config import db, get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        phone=user_data.phone,
        address=user_data.address
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    # If cobbler, add documents and signature timestamp
    if user_data.role == 'cobbler':
        user_dict['status'] = 'pending'
        
        # Save documents to files
        if user_data.id_recto:
            id_recto_filename = f"{user.id}_id_recto.jpg"
            user_dict['id_recto'] = save_base64_file(user_data.id_recto, id_recto_filename)
        
        if user_data.id_verso:
            id_verso_filename = f"{user.id}_id_verso.jpg"
            user_dict['id_verso'] = save_base64_file(user_data.id_verso, id_verso_filename)
        
        if user_data.che_kbis:
            che_kbis_filename = f"{user.id}_che_kbis.pdf"
            user_dict['che_kbis'] = save_base64_file(user_data.che_kbis, che_kbis_filename)
        
        user_dict['bank_account'] = user_data.bank_account
        user_dict['terms_signed_at'] = datetime.now(timezone.utc).isoformat()
        # Note: In production, get real IP from request.client.host
        user_dict['terms_ip_address'] = '0.0.0.0'  # Placeholder
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token(user.id, user.email, user.role)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@router.post("/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(user['id'], user['email'], user['role'])
    
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me")
async def update_me(user_data: dict, current_user: dict = Depends(get_current_user)):
    """Update current user's profile information"""
    # Only allow updating specific fields
    allowed_fields = ['name', 'phone', 'address']
    update_data = {k: v for k, v in user_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    # Update user
    result = await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return updated user
    updated_user = await db.users.find_one(
        {"id": current_user['user_id']}, 
        {"_id": 0, "password": 0}
    )
    
    return {
        "message": "Profile updated successfully",
        "user": updated_user
    }

@router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "id_recto": 0, "id_verso": 0, "che_kbis": 0, "bank_account": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/location")
async def update_user_location(
    user_id: str,
    address: str,
    current_user: dict = Depends(get_current_user)
):
    from fastapi import Form
    from services import get_coordinates_from_address
    
    # Only allow users to update their own location or admins
    if current_user['user_id'] != user_id and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Geocode the address
    coords = get_coordinates_from_address(address)
    if not coords:
        raise HTTPException(status_code=400, detail="Could not geocode address")
    
    lat, lon = coords
    
    # Update user location
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "address": address,
            "latitude": lat,
            "longitude": lon
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "message": "Location updated successfully",
        "latitude": lat,
        "longitude": lon
    }
