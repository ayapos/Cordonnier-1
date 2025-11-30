from pathlib import Path
from passlib.context import CryptContext
import stripe as stripe_lib
import os
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stripe configuration
stripe_lib.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_51QwQp5D7UUhz3svR8J0Q3GhAaCvAz7jI0Gy5j6DPOEMdQdFZOd7P7W1KWZqWJQP2jKdLfXb0H4JKlKAWYSuqCL3C00CIZ8tHgR')
stripe = stripe_lib
