from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

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
    payment_status: str = 'pending'  # 'pending', 'paid', 'failed', 'refunded'
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
