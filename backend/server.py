from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import configuration
from config import client, ROOT_DIR

# Import all route modules
from routes import (
    auth_router,
    services_router,
    orders_router,
    reviews_router,
    admin_router,
    cobbler_router,
    media_router,
    stats_router,
    payment_router,
    reports_router,
    stripe_connect_router
)

# Create the main app
app = FastAPI()

# Create API router
api_router = APIRouter(prefix="/api")

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(services_router)
api_router.include_router(orders_router)
api_router.include_router(reviews_router)
api_router.include_router(admin_router)
api_router.include_router(cobbler_router)
api_router.include_router(media_router)
api_router.include_router(stats_router)
api_router.include_router(payment_router)
api_router.include_router(reports_router)

# Include main API router
app.include_router(api_router)

# Mount static files for media
try:
    app.mount("/uploads", StaticFiles(directory=str(ROOT_DIR / "uploads")), name="uploads")
except Exception as e:
    logging.warning(f"Could not mount static files: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
