from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

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
