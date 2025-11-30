from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from geopy import distance
from geopy.geocoders import Nominatim
import stripe
import base64
from io import BytesIO
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_51QwQp5D7UUhz3svR8J0Q3GhAaCvAz7jI0Gy5j6DPOEMdQdFZOd7P7W1KWZqWJQP2jKdLfXb0H4JKlKAWYSuqCL3C00CIZ8tHgR')

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create API router
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # 'client', 'cobbler', 'admin'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    phone: Optional[str] = None
    address: Optional[str] = None
    # Cordonnier specific fields
    status: Optional[str] = None  # 'pending', 'approved', 'rejected' (for cobblers)
    id_recto: Optional[str] = None  # Base64 image
    id_verso: Optional[str] = None  # Base64 image
    che_kbis: Optional[str] = None  # Base64 document
    bank_account: Optional[str] = None  # JSON with bank details
    stripe_account_id: Optional[str] = None  # Stripe Connect account ID
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    terms_signed_at: Optional[datetime] = None  # Partner CGU signature timestamp
    terms_ip_address: Optional[str] = None  # IP address at signature

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    # Documents for cobbler registration
    id_recto: Optional[str] = None
    id_verso: Optional[str] = None
    che_kbis: Optional[str] = None
    bank_account: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # French
    name_en: Optional[str] = None
    name_de: Optional[str] = None
    name_it: Optional[str] = None
    description: str  # French
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    description_it: Optional[str] = None
    price: float
    estimated_days: int
    category: str
    gender: str  # 'homme', 'femme', 'mixte'
    image_url: Optional[str] = None  # URL de l'image du service
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceCreate(BaseModel):
    name: str  # French by default
    name_en: Optional[str] = None
    name_de: Optional[str] = None
    name_it: Optional[str] = None
    description: str  # French by default
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    description_it: Optional[str] = None
    price: float
    estimated_days: int
    category: str
    gender: str
    image_url: Optional[str] = None

class OrderItem(BaseModel):
    service_id: str
    service_name: str
    service_price: float
    quantity: int = 1

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reference_number: str
    client_id: Optional[str] = None  # Optional for guest orders
    client_name: Optional[str] = None  # For guest orders
    client_email: Optional[str] = None  # For guest orders
    client_phone: Optional[str] = None  # For guest orders
    cobbler_id: Optional[str] = None
    # Support both single service (legacy) and multiple services
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    service_price: Optional[float] = None
    items: List[OrderItem] = []  # For multi-service orders
    delivery_option: str  # 'standard' or 'express'
    delivery_address: Optional[str] = None
    delivery_price: float
    commission: float  # 15% of service price
    total_amount: float
    status: str  # 'pending', 'accepted', 'in_progress', 'shipped', 'delivered', 'cancelled'
    shoe_images: List[str] = []
    notes: Optional[str] = None
    payment_intent_id: Optional[str] = None
    is_guest: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    service_id: str
    delivery_option: str
    notes: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    client_id: str
    cobbler_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    order_id: str
    rating: int
    comment: Optional[str] = None

class Stats(BaseModel):
    total_orders: int
    total_revenue: float
    total_commission: float
    pending_orders: int
    completed_orders: int

class Media(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_name: str
    url: str
    category: str  # 'carousel', 'services', 'gallery', 'other'
    title: Optional[str] = None  # Title/description to identify the image
    position: Optional[int] = None  # Order position (1, 2, 3... for carousel, etc.)
    uploaded_by: str  # admin user id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"user_id": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def generate_reference_number() -> str:
    return f"REF-{uuid.uuid4().hex[:8].upper()}"

# File storage helpers
def save_base64_file(base64_string: str, filename: str) -> str:
    """Save base64 encoded file to uploads folder and return the file path"""
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = ROOT_DIR / 'uploads'
        uploads_dir.mkdir(exist_ok=True)
        
        # Remove data URI prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',', 1)[1]
        
        # Decode and save file
        file_data = base64.b64decode(base64_string)
        file_path = uploads_dir / filename
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return str(file_path)
    except Exception as e:
        logger.error(f"Error saving file {filename}: {e}")
        raise HTTPException(status_code=500, detail="Error saving file")

def load_file_as_base64(file_path: str) -> str:
    """Load file from uploads folder and return as base64"""
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
        return base64.b64encode(file_data).decode('utf-8')
    except Exception as e:
        logger.error(f"Error loading file {file_path}: {e}")
        return None

# Geocoding helper
def get_coordinates_from_address(address: str) -> Optional[tuple]:
    """Get latitude and longitude from address using Nominatim"""
    try:
        geolocator = Nominatim(user_agent="shoerepair_app")
        location = geolocator.geocode(address, timeout=10)
        if location:
            return (location.latitude, location.longitude)
        return None
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        return None

async def find_nearest_cobbler(client_lat: float, client_lon: float) -> Optional[str]:
    """Find the nearest approved cobbler to the client"""
    try:
        # Get all approved cobblers with coordinates
        cobblers = await db.users.find({
            "role": "cobbler",
            "status": "approved",
            "latitude": {"$exists": True, "$ne": None},
            "longitude": {"$exists": True, "$ne": None}
        }, {"_id": 0}).to_list(1000)
        
        if not cobblers:
            return None
        
        # Calculate distances and find nearest
        nearest_cobbler = None
        min_distance = float('inf')
        
        for cobbler in cobblers:
            cobbler_coords = (cobbler['latitude'], cobbler['longitude'])
            client_coords = (client_lat, client_lon)
            dist = distance.distance(client_coords, cobbler_coords).km
            
            if dist < min_distance:
                min_distance = dist
                nearest_cobbler = cobbler['id']
        
        return nearest_cobbler
    except Exception as e:
        logger.error(f"Error finding nearest cobbler: {e}")
        return None

# Auth Routes
@api_router.post("/auth/register")
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

@api_router.post("/auth/login")
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

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0, "id_recto": 0, "id_verso": 0, "che_kbis": 0, "bank_account": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}/location")
async def update_user_location(
    user_id: str,
    address: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user's location coordinates from address"""
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

# Service Routes
@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create services")
    
    service_obj = Service(**service.model_dump())
    service_dict = service_obj.model_dump()
    service_dict['created_at'] = service_dict['created_at'].isoformat()
    
    await db.services.insert_one(service_dict)
    return service_obj

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if isinstance(service['created_at'], str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    return service

# Order Routes
@api_router.post("/orders/guest")
async def create_guest_order(
    delivery_option: str = Form(...),
    delivery_address: str = Form(...),
    guest_name: str = Form(...),
    guest_email: str = Form(...),
    guest_phone: str = Form(...),
    service_items: str = Form(...),  # JSON string of cart items
    notes: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    create_account: bool = Form(False),
    password: Optional[str] = Form(None)
):
    """Create order as guest with multiple services"""
    import json
    
    # Process images (optional)
    images = images if images else []
    image_data_list = []
    for image in images:
        contents = await image.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_data_list.append(f"data:image/jpeg;base64,{image_base64}")
    
    # Parse service items
    try:
        cart_items = json.loads(service_items)
    except:
        raise HTTPException(status_code=400, detail="Format de panier invalide")
    
    if not cart_items or len(cart_items) == 0:
        raise HTTPException(status_code=400, detail="Le panier est vide")
    
    # Fetch service details and build order items
    order_items = []
    services_total = 0
    commission_total = 0
    
    for cart_item in cart_items:
        service = await db.services.find_one({"id": cart_item['id']})
        if not service:
            raise HTTPException(status_code=404, detail=f"Service {cart_item['id']} introuvable")
        
        quantity = cart_item.get('quantity', 1)
        item_total = service['price'] * quantity
        item_commission = item_total * 0.15
        
        order_items.append({
            "service_id": service['id'],
            "service_name": service['name'],
            "service_price": service['price'],
            "quantity": quantity
        })
        
        services_total += item_total
        commission_total += item_commission
    
    # Geocode address and find nearest cobbler
    cobbler_id = None
    client_coords = get_coordinates_from_address(delivery_address)
    if client_coords:
        client_lat, client_lon = client_coords
        cobbler_id = await find_nearest_cobbler(client_lat, client_lon)
        logger.info(f"Auto-assigned guest order to cobbler {cobbler_id}")
    
    # Calculate prices
    delivery_price = 15.0 if delivery_option == 'express' else 5.0
    total_amount = services_total + delivery_price
    
    # Create order
    order_status = 'accepted' if cobbler_id else 'pending'
    
    order = Order(
        reference_number=generate_reference_number(),
        client_name=guest_name,
        client_email=guest_email,
        client_phone=guest_phone,
        cobbler_id=cobbler_id,
        delivery_option=delivery_option,
        delivery_address=delivery_address,
        delivery_price=delivery_price,
        commission=commission_total,
        total_amount=total_amount,
        status=order_status,
        shoe_images=image_data_list,
        notes=notes,
        is_guest=True,
        items=order_items
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    order_dict['updated_at'] = order_dict['updated_at'].isoformat()
    
    await db.orders.insert_one(order_dict)
    
    # If create_account is True, create user account
    if create_account and password:
        try:
            existing_user = await db.users.find_one({"email": guest_email})
            if not existing_user:
                new_user = {
                    "id": str(uuid.uuid4()),
                    "email": guest_email,
                    "name": guest_name,
                    "phone": guest_phone,
                    "address": delivery_address,
                    "role": "client",
                    "password": hash_password(password),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(new_user)
                # Update order with client_id
                await db.orders.update_one(
                    {"id": order.id},
                    {"$set": {"client_id": new_user["id"], "is_guest": False}}
                )
                logger.info(f"Created account for guest {guest_email}")
        except Exception as e:
            logger.error(f"Error creating account: {e}")
    
    return {
        "order_id": order.id,
        "reference_number": order.reference_number,
        "total_amount": total_amount,
        "cobbler_assigned": cobbler_id is not None,
        "account_created": create_account and password is not None
    }

@api_router.post("/orders/bulk")
async def create_bulk_order(
    service_items: str = Form(...),  # JSON string of cart items
    delivery_option: str = Form(...),
    delivery_address: str = Form(...),
    notes: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Create order with multiple services for authenticated users"""
    import json
    
    # Process images (optional)
    images = images if images else []
    image_data_list = []
    for image in images:
        contents = await image.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_data_list.append(f"data:image/jpeg;base64,{image_base64}")
    
    # Parse service items
    try:
        cart_items = json.loads(service_items)
    except:
        raise HTTPException(status_code=400, detail="Format de panier invalide")
    
    if not cart_items or len(cart_items) == 0:
        raise HTTPException(status_code=400, detail="Le panier est vide")
    
    # Fetch service details and build order items
    order_items = []
    services_total = 0
    commission_total = 0
    
    for cart_item in cart_items:
        service = await db.services.find_one({"id": cart_item['id']})
        if not service:
            raise HTTPException(status_code=404, detail=f"Service {cart_item['id']} introuvable")
        
        quantity = cart_item.get('quantity', 1)
        item_total = service['price'] * quantity
        item_commission = item_total * 0.15
        
        order_items.append({
            "service_id": service['id'],
            "service_name": service['name'],
            "service_price": service['price'],
            "quantity": quantity
        })
        
        services_total += item_total
        commission_total += item_commission
    
    # Geocode address and find nearest cobbler
    cobbler_id = None
    client_coords = get_coordinates_from_address(delivery_address)
    if client_coords:
        client_lat, client_lon = client_coords
        cobbler_id = await find_nearest_cobbler(client_lat, client_lon)
        logger.info(f"Auto-assigned order to cobbler {cobbler_id}")
    
    # Calculate prices
    delivery_price = 15.0 if delivery_option == 'express' else 5.0
    total_amount = services_total + delivery_price
    
    # Create order
    order_status = 'accepted' if cobbler_id else 'pending'
    
    order = Order(
        reference_number=generate_reference_number(),
        client_id=current_user['user_id'],
        cobbler_id=cobbler_id,
        delivery_option=delivery_option,
        delivery_address=delivery_address,
        delivery_price=delivery_price,
        commission=commission_total,
        total_amount=total_amount,
        status=order_status,
        shoe_images=image_data_list,
        notes=notes,
        is_guest=False,
        items=order_items
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    order_dict['updated_at'] = order_dict['updated_at'].isoformat()
    
    await db.orders.insert_one(order_dict)
    
    return {
        "order_id": order.id,
        "reference_number": order.reference_number,
        "total_amount": total_amount,
        "cobbler_assigned": cobbler_id is not None
    }

@api_router.post("/orders")
async def create_order(
    service_id: str = Form(...),
    delivery_option: str = Form(...),
    delivery_address: str = Form(...),
    notes: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Get service
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Calculate prices
    service_price = service['price']
    delivery_price = 15.0 if delivery_option == 'express' else 5.0
    commission = service_price * 0.15
    total_amount = service_price + delivery_price
    
    # Process images
    image_data_list = []
    for image in images:
        contents = await image.read()
        # Convert to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_data_list.append(f"data:image/jpeg;base64,{image_base64}")
    
    # Geocode client address and find nearest cobbler
    cobbler_id = None
    client_coords = get_coordinates_from_address(delivery_address)
    
    if client_coords:
        client_lat, client_lon = client_coords
        cobbler_id = await find_nearest_cobbler(client_lat, client_lon)
        logger.info(f"Auto-assigned order to cobbler {cobbler_id} based on location")
    else:
        logger.warning(f"Could not geocode address: {delivery_address}")
    
    # Create order with auto-assigned cobbler
    order_status = 'accepted' if cobbler_id else 'pending'
    
    order = Order(
        reference_number=generate_reference_number(),
        client_id=current_user['user_id'],
        cobbler_id=cobbler_id,
        service_id=service_id,
        service_name=service['name'],
        service_price=service_price,
        delivery_option=delivery_option,
        delivery_price=delivery_price,
        commission=commission,
        total_amount=total_amount,
        status=order_status,
        shoe_images=image_data_list,
        notes=notes
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    order_dict['updated_at'] = order_dict['updated_at'].isoformat()
    
    await db.orders.insert_one(order_dict)
    
    return {
        "order_id": order.id,
        "reference_number": order.reference_number,
        "total_amount": total_amount,
        "cobbler_assigned": cobbler_id is not None,
        "cobbler_id": cobbler_id
    }

@api_router.post("/orders/{order_id}/payment")
async def create_payment_intent(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['client_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # DEMO MODE: Simulate Stripe payment intent
    # Generate a fake client secret for demo purposes
    fake_client_secret = f"pi_demo_{order_id}_secret_{uuid.uuid4().hex[:16]}"
    fake_payment_intent_id = f"pi_demo_{uuid.uuid4().hex[:24]}"
    
    # Update order with fake payment intent
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"payment_intent_id": fake_payment_intent_id}}
    )
    
    return {"client_secret": fake_client_secret, "demo_mode": True}

@api_router.post("/orders/{order_id}/confirm")
async def confirm_payment(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['client_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update order status
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": "accepted",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Payment confirmed", "reference_number": order['reference_number']}

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user['role'] == 'client':
        query['client_id'] = current_user['user_id']
    elif current_user['role'] == 'cobbler':
        query['cobbler_id'] = current_user['user_id']
    
    # Limit to 100 most recent orders and sort by created_at descending for performance
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check authorization
    if current_user['role'] != 'admin':
        if current_user['role'] == 'client' and order['client_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Not authorized")
        elif current_user['role'] == 'cobbler' and order.get('cobbler_id') != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order['updated_at'], str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return order

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check authorization
    if current_user['role'] not in ['admin', 'cobbler']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Order status updated"}

@api_router.post("/orders/{order_id}/accept")
async def accept_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'cobbler':
        raise HTTPException(status_code=403, detail="Only cobblers can accept orders")
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['status'] != 'accepted':
        raise HTTPException(status_code=400, detail="Order is not available")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "cobbler_id": current_user['user_id'],
            "status": "in_progress",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Order accepted"}

# Review Routes
@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    # Get order
    order = await db.orders.find_one({"id": review.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['client_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if order['status'] != 'delivered':
        raise HTTPException(status_code=400, detail="Can only review delivered orders")
    
    # Check if already reviewed
    existing_review = await db.reviews.find_one({"order_id": review.order_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Order already reviewed")
    
    review_obj = Review(
        order_id=review.order_id,
        client_id=current_user['user_id'],
        cobbler_id=order['cobbler_id'],
        rating=review.rating,
        comment=review.comment
    )
    
    review_dict = review_obj.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    
    await db.reviews.insert_one(review_dict)
    return review_obj

@api_router.get("/reviews/cobbler/{cobbler_id}", response_model=List[Review])
async def get_cobbler_reviews(cobbler_id: str):
    reviews = await db.reviews.find({"cobbler_id": cobbler_id}, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review['created_at'], str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

# Admin Routes - Partner Management
@api_router.get("/admin/partners/pending")
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

@api_router.get("/admin/partners/{partner_id}/document/{doc_type}")
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

@api_router.post("/admin/partners/{partner_id}/approve")
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

@api_router.post("/admin/partners/{partner_id}/reject")
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

# Admin Routes - Media Management
@api_router.post("/admin/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    category: str = Form(...),
    title: Optional[str] = Form(None),
    position: Optional[int] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only image files are allowed (JPEG, PNG, WEBP)")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Save file to media folder
        media_dir = ROOT_DIR / 'uploads' / 'media'
        media_dir.mkdir(exist_ok=True, parents=True)
        file_path = media_dir / unique_filename
        
        # Read and save file
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        # Create media record in database
        media = Media(
            filename=unique_filename,
            original_name=file.filename,
            url=f"/uploads/media/{unique_filename}",
            category=category,
            title=title,
            position=position,
            uploaded_by=current_user['user_id']
        )
        
        media_dict = media.model_dump()
        media_dict['created_at'] = media_dict['created_at'].isoformat()
        
        await db.media.insert_one(media_dict)
        
        return {
            "message": "Media uploaded successfully",
            "media": {
                "id": media.id,
                "filename": media.filename,
                "url": media.url,
                "category": media.category
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading media: {e}")
        raise HTTPException(status_code=500, detail="Error uploading media")

@api_router.get("/admin/media")
async def list_media(
    category: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        query = {}
        if category:
            query['category'] = category
        
        # Limit results and sort by created_at descending (most recent first)
        media_list = await db.media.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
        return media_list
    except Exception as e:
        logger.error(f"Error listing media: {e}")
        raise HTTPException(status_code=500, detail="Error listing media")

@api_router.put("/admin/media/{media_id}")
async def update_media(
    media_id: str,
    title: Optional[str] = None,
    position: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find media
        media = await db.media.find_one({"id": media_id})
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        # Update fields
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if position is not None:
            update_data['position'] = position
        
        if update_data:
            await db.media.update_one(
                {"id": media_id},
                {"$set": update_data}
            )
        
        return {"message": "Media updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating media: {e}")
        raise HTTPException(status_code=500, detail="Error updating media")

@api_router.get("/media/{filename}")
async def serve_media(filename: str):
    """Serve media files via API endpoint"""
    try:
        from fastapi.responses import FileResponse
        file_path = ROOT_DIR / 'uploads' / 'media' / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Media not found")
        return FileResponse(file_path)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving media: {e}")
        raise HTTPException(status_code=500, detail="Error serving media")

@api_router.delete("/admin/media/{media_id}")
async def delete_media(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find media
        media = await db.media.find_one({"id": media_id})
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        # Delete file from disk
        file_path = ROOT_DIR / 'uploads' / 'media' / media['filename']
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database
        await db.media.delete_one({"id": media_id})
        
        return {"message": "Media deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting media: {e}")
        raise HTTPException(status_code=500, detail="Error deleting media")

# Cobbler Routes - Address Management
@api_router.put("/cobbler/address")
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

# Stats Routes
@api_router.get("/stats", response_model=Stats)
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

# Cobbler Routes
@api_router.get("/cobblers", response_model=List[User])
async def get_cobblers():
    cobblers = await db.users.find({"role": "cobbler"}, {"_id": 0, "password": 0}).to_list(1000)
    for cobbler in cobblers:
        if isinstance(cobbler['created_at'], str):
            cobbler['created_at'] = datetime.fromisoformat(cobbler['created_at'])
    return cobblers

# Settings Routes
@api_router.get("/settings")
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

@api_router.put("/settings")
async def update_settings(settings_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    settings_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"type": "app_settings"},
        {"$set": settings_data},
        upsert=True
    )
    
    return {"message": "Settings updated successfully"}

@api_router.put("/services/{service_id}")
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

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.services.delete_one({"id": service_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service deleted successfully"}

# Include router
app.include_router(api_router)

# Mount static files for media
try:
    app.mount("/uploads", StaticFiles(directory=str(ROOT_DIR / "uploads")), name="uploads")
except Exception as e:
    logger.warning(f"Could not mount static files: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()