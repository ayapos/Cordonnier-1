import jwt
import uuid
from datetime import datetime, timezone, timedelta
from config.settings import pwd_context
from config.security import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"user_id": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_reference_number() -> str:
    return f"REF-{uuid.uuid4().hex[:8].upper()}"
