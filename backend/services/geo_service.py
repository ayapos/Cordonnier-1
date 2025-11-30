from typing import Optional
import logging
from geopy import distance
from geopy.geocoders import Nominatim
from config.database import db

logger = logging.getLogger(__name__)

def get_coordinates_from_address(address: str) -> Optional[tuple]:
    """Get latitude and longitude from address using Nominatim"""
    try:
        geolocator = Nominatim(user_agent="shoerepair_app")
        location = geolocator.geocode(address, timeout=10)
        if location:
            return (location.latitude, location.longitude)
        return None
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        return None

async def find_nearest_cobbler(client_lat: float, client_lon: float) -> Optional[str]:
    """Find the nearest approved cobbler to the client"""
    try:
        # Get all approved cobblers with coordinates
        cobblers = await db.users.find({
            "role": "cobbler",
            "status": "approved",
            "latitude": {"$exists": True, "$ne": None},
            "longitude": {"$exists": True, "$ne": None}
        }, {"_id": 0}).to_list(1000)
        
        if not cobblers:
            return None
        
        # Calculate distances and find nearest
        nearest_cobbler = None
        min_distance = float('inf')
        
        for cobbler in cobblers:
            cobbler_coords = (cobbler['latitude'], cobbler['longitude'])
            client_coords = (client_lat, client_lon)
            dist = distance.distance(client_coords, cobbler_coords).km
            
            if dist < min_distance:
                min_distance = dist
                nearest_cobbler = cobbler['id']
        
        return nearest_cobbler
    except Exception as e:
        logger.error(f"Error finding nearest cobbler: {e}")
        return None
