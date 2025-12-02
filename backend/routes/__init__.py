from .auth import router as auth_router
from .services import router as services_router
from .orders import router as orders_router
from .reviews import router as reviews_router
from .admin import router as admin_router
from .cobbler import router as cobbler_router
from .media import router as media_router
from .stats import router as stats_router
from .payment import router as payment_router

__all__ = [
    "auth_router",
    "services_router",
    "orders_router",
    "reviews_router",
    "admin_router",
    "cobbler_router",
    "media_router",
    "stats_router",
    "payment_router",
]
