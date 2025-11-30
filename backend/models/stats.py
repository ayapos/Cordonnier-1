from pydantic import BaseModel

class Stats(BaseModel):
    total_orders: int
    total_revenue: float
    total_commission: float
    pending_orders: int
    completed_orders: int
