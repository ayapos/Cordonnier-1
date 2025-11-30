from fastapi import HTTPException
import base64
import logging
from config.settings import ROOT_DIR

logger = logging.getLogger(__name__)

def save_base64_file(base64_string: str, filename: str) -> str:
    """Save base64 encoded file to uploads folder and return the file path"""
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = ROOT_DIR / 'uploads'
        uploads_dir.mkdir(exist_ok=True)
        
        # Remove data URI prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',', 1)[1]
        
        # Decode and save file
        file_data = base64.b64decode(base64_string)
        file_path = uploads_dir / filename
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return str(file_path)
    except Exception as e:
        logger.error(f"Error saving file {filename}: {e}")
        raise HTTPException(status_code=500, detail="Error saving file")

def load_file_as_base64(file_path: str) -> str:
    """Load file from uploads folder and return as base64"""
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
        return base64.b64encode(file_data).decode('utf-8')
    except Exception as e:
        logger.error(f"Error loading file {file_path}: {e}")
        return None
