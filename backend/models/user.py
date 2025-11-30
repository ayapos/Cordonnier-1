from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

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
