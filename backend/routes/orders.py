from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile
from models import Order, OrderCreate
from config import db, get_current_user
from services import generate_reference_number, get_coordinates_from_address, find_nearest_cobbler, hash_password
from typing import List, Optional
from datetime import datetime, timezone
import base64
import json
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/guest")
async def create_guest_order(
    delivery_option: str = Form(...),
    delivery_address: str = Form(...),
    guest_name: str = Form(...),
    guest_email: str = Form(...),
    guest_phone: str = Form(...),
    service_items: str = Form(...),  # JSON string of cart items
    notes: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    create_account: bool = Form(False),
    password: Optional[str] = Form(None)
):
    """Create order as guest with multiple services"""
    
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

@router.post("/bulk")
async def create_bulk_order(
    service_items: str = Form(...),  # JSON string of cart items
    delivery_option: str = Form(...),
    delivery_address: str = Form(...),
    notes: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user)
):
    """Create order with multiple services for authenticated users"""
    
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

@router.post("")
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

@router.post("/{order_id}/payment")
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

@router.post("/{order_id}/confirm")
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

@router.get("", response_model=List[Order])
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

@router.get("/{order_id}", response_model=Order)
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

@router.patch("/{order_id}/status")
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

@router.post("/{order_id}/accept")
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
