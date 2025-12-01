from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from models import Media
from config import db, get_current_user, ROOT_DIR
from typing import Optional
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/media", tags=["media"])

@router.post("/admin/upload")
async def upload_media(
    file: UploadFile = File(...),
    category: str = Form(...),
    title: Optional[str] = Form(None),
    position: Optional[str] = Form(None),  # Changed to str, will convert to int
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only image files are allowed (JPEG, PNG, WEBP)")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Convert position to int if provided
        position_int = None
        if position:
            try:
                position_int = int(position)
            except (ValueError, TypeError):
                position_int = None
        
        # Check if an image already exists at this position and category
        if position_int is not None and category:
            logger.info(f"Checking for existing media: category={category}, position={position_int}")
            existing_media = await db.media.find_one({
                "category": category,
                "position": position_int
            })
            logger.info(f"Existing media found: {existing_media is not None}")
            
            if existing_media:
                logger.info(f"Replacing media ID: {existing_media['id']}")
                # Delete the old file
                old_file_path = ROOT_DIR / 'uploads' / 'media' / existing_media['filename']
                if old_file_path.exists():
                    old_file_path.unlink()
                    logger.info(f"Deleted old file: {old_file_path}")
                # Delete old record from DB
                await db.media.delete_one({"id": existing_media['id']})
                logger.info(f"Replaced existing media at position {position_int} in category {category}")
        
        # Save file to media folder
        media_dir = ROOT_DIR / 'uploads' / 'media'
        media_dir.mkdir(exist_ok=True, parents=True)
        file_path = media_dir / unique_filename
        
        # Read and save file
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        # Create media record in database
        media = Media(
            filename=unique_filename,
            original_name=file.filename,
            url=f"/api/media/{unique_filename}",  # Use API endpoint instead of static
            category=category,
            title=title,
            position=position_int,  # Use converted int
            uploaded_by=current_user['user_id']
        )
        
        media_dict = media.model_dump()
        media_dict['created_at'] = media_dict['created_at'].isoformat()
        
        await db.media.insert_one(media_dict)
        
        return {
            "message": "Media uploaded successfully",
            "media": {
                "id": media.id,
                "filename": media.filename,
                "url": media.url,
                "category": media.category
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading media: {e}")
        raise HTTPException(status_code=500, detail="Error uploading media")

@router.get("/admin")
async def list_media(
    category: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        query = {}
        if category:
            query['category'] = category
        
        # Limit results and sort by created_at descending (most recent first)
        media_list = await db.media.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
        return media_list
    except Exception as e:
        logger.error(f"Error listing media: {e}")
        raise HTTPException(status_code=500, detail="Error listing media")

@router.put("/admin/{media_id}")
async def update_media(
    media_id: str,
    title: Optional[str] = None,
    position: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find media
        media = await db.media.find_one({"id": media_id})
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        # Update fields
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if position is not None:
            update_data['position'] = position
        
        if update_data:
            await db.media.update_one(
                {"id": media_id},
                {"$set": update_data}
            )
        
        return {"message": "Media updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating media: {e}")
        raise HTTPException(status_code=500, detail="Error updating media")

@router.get("/carousel")
async def get_carousel_images():
    """Public endpoint to get carousel images"""
    try:
        # Get carousel images sorted by position
        images = await db.media.find(
            {"category": "carousel"},
            {"_id": 0}
        ).sort("position", 1).to_list(10)
        return images
    except Exception as e:
        logger.error(f"Error getting carousel images: {e}")
        return []

@router.get("/{filename}")
async def serve_media(filename: str):
    """Serve media files via API endpoint"""
    try:
        file_path = ROOT_DIR / 'uploads' / 'media' / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Media not found")
        return FileResponse(file_path)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving media: {e}")
        raise HTTPException(status_code=500, detail="Error serving media")

@router.delete("/admin/media/{media_id}")
async def delete_media(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find media
        media = await db.media.find_one({"id": media_id})
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        # Delete file from disk
        file_path = ROOT_DIR / 'uploads' / 'media' / media['filename']
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database
        await db.media.delete_one({"id": media_id})
        
        return {"message": "Media deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting media: {e}")
        raise HTTPException(status_code=500, detail="Error deleting media")
