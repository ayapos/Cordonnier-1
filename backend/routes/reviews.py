from fastapi import APIRouter, HTTPException, Depends
from models import Review, ReviewCreate
from config import db, get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("", response_model=Review)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    # Get order
    order = await db.orders.find_one({"id": review.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['client_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if order['status'] != 'delivered':
        raise HTTPException(status_code=400, detail="Can only review delivered orders")
    
    # Check if already reviewed
    existing_review = await db.reviews.find_one({"order_id": review.order_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Order already reviewed")
    
    review_obj = Review(
        order_id=review.order_id,
        client_id=current_user['user_id'],
        cobbler_id=order['cobbler_id'],
        rating=review.rating,
        comment=review.comment
    )
    
    review_dict = review_obj.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    
    await db.reviews.insert_one(review_dict)
    return review_obj

@router.get("/cobbler/{cobbler_id}", response_model=List[Review])
async def get_cobbler_reviews(cobbler_id: str):
    reviews = await db.reviews.find({"cobbler_id": cobbler_id}, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review['created_at'], str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews
