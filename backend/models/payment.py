from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, timezone
from uuid import uuid4

class PaymentTransaction(BaseModel):
    """Model for payment transactions"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    order_id: str = Field(..., description="Order ID linked to this payment")
    session_id: Optional[str] = Field(None, description="Stripe checkout session ID")
    amount: float = Field(..., description="Payment amount")
    currency: str = Field(default="chf", description="Payment currency")
    payment_status: str = Field(default="pending", description="Payment status: pending, paid, failed, expired")
    status: str = Field(default="initiated", description="Transaction status: initiated, completed, cancelled")
    user_id: Optional[str] = Field(None, description="User ID if authenticated")
    guest_email: Optional[str] = Field(None, description="Guest email if not authenticated")
    metadata: Optional[Dict[str, str]] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_schema_extra = {
            "example": {
                "id": "pay_123",
                "order_id": "order_456",
                "session_id": "cs_test_123",
                "amount": 127.0,
                "currency": "chf",
                "payment_status": "pending",
                "status": "initiated",
                "user_id": "user_789",
                "metadata": {"source": "web"}
            }
        }
