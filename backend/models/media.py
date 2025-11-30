from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

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
