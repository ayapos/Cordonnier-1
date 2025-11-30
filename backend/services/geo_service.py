from typing import Optional
import logging
from geopy import distance
from geopy.geocoders import Nominatim
from config.database import db

logger = logging.getLogger(__name__)

def get_coordinates_from_address(address: str, strict: bool = False) -> Optional[tuple]:
    """Get latitude and longitude from address using Nominatim
    
    Args:
        address: The address to geocode
        strict: If False, will try multiple formats and be more lenient
    """
    try:
        geolocator = Nominatim(user_agent="shoerepair_app_v2", timeout=15)
        
        # Try exact address first
        logger.info(f"Geocoding address: {address}")
        location = geolocator.geocode(address, timeout=15, language='fr')
        
        if location:
            logger.info(f"Geocoding successful: {location.latitude}, {location.longitude}")
            return (location.latitude, location.longitude)
        
        # If strict mode, return None immediately
        if strict:
            logger.warning(f"Strict mode: Could not geocode address: {address}")
            return None
        
        # Try with more generic search (country-biased)
        logger.info("Trying with addressdetails...")
        location = geolocator.geocode(address, addressdetails=True, timeout=15)
        
        if location:
            logger.info(f"Geocoding successful with addressdetails: {location.latitude}, {location.longitude}")
            return (location.latitude, location.longitude)
        
        # Try extracting just city and country as fallback
        parts = [p.strip() for p in address.split(',')]
        if len(parts) >= 2:
            # Try with last two parts (usually city, country)
            simplified = ', '.join(parts[-2:])
            logger.info(f"Trying simplified address: {simplified}")
            location = geolocator.geocode(simplified, timeout=15)
            if location:
                logger.info(f"Geocoding successful with simplified address: {location.latitude}, {location.longitude}")
                return (location.latitude, location.longitude)
        
        logger.warning(f"Could not geocode address after all attempts: {address}")
        return None
        
    except Exception as e:
        logger.error(f"Geocoding error for '{address}': {e}")
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
