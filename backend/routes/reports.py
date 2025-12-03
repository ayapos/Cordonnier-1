from fastapi import APIRouter, HTTPException, Depends, Query
from config import db, get_current_user
from datetime import datetime, timezone
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/monthly")
async def get_monthly_report(
    year: int = Query(...),
    month: int = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Generate monthly report for admin or cobbler"""
    try:
        # Validate month
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Invalid month")
        
        # Build date filter
        start_date = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        
        # Build query based on role
        query = {
            "created_at": {
                "$gte": start_date.isoformat(),
                "$lt": end_date.isoformat()
            }
        }
        
        # Filter by cobbler for cobbler role
        if current_user['role'] == 'cobbler':
            query["cobbler_id"] = current_user['user_id']
        elif current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Fetch orders
        orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
        
        # Calculate summary
        total_orders = len(orders)
        total_revenue = sum(order.get('total_amount', 0) for order in orders)
        total_commission = total_revenue * 0.15  # 15% commission
        cobbler_payments = total_revenue * 0.85  # 85% to cobblers
        
        # Prepare order details
        order_details = []
        for order in orders:
            order_details.append({
                "date": order.get('created_at', '')[:10],
                "reference": order.get('reference_number', 'N/A'),
                "amount": order.get('total_amount', 0),
                "commission": order.get('total_amount', 0) * 0.15,
                "status": order.get('status', 'unknown')
            })
        
        summary = {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_commission": total_commission,
            "cobbler_payments": cobbler_payments
        }
        
        # For cobblers, calculate their earnings
        if current_user['role'] == 'cobbler':
            summary["cobbler_earnings"] = cobbler_payments
        
        return {
            "period": f"{year}-{month:02d}",
            "summary": summary,
            "orders": order_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating monthly report: {e}")
        raise HTTPException(status_code=500, detail="Error generating report")


@router.get("/yearly")
async def get_yearly_report(
    year: int = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Generate yearly report for admin or cobbler"""
    try:
        # Build date filter
        start_date = datetime(year, 1, 1, tzinfo=timezone.utc)
        end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        
        # Build query based on role
        query = {
            "created_at": {
                "$gte": start_date.isoformat(),
                "$lt": end_date.isoformat()
            }
        }
        
        # Filter by cobbler for cobbler role
        if current_user['role'] == 'cobbler':
            query["cobbler_id"] = current_user['user_id']
        elif current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Fetch orders
        orders = await db.orders.find(query, {"_id": 0}).to_list(10000)
        
        # Calculate summary
        total_orders = len(orders)
        total_revenue = sum(order.get('total_amount', 0) for order in orders)
        total_commission = total_revenue * 0.15
        cobbler_payments = total_revenue * 0.85
        
        # Prepare order details
        order_details = []
        for order in orders:
            order_details.append({
                "date": order.get('created_at', '')[:10],
                "reference": order.get('reference_number', 'N/A'),
                "amount": order.get('total_amount', 0),
                "commission": order.get('total_amount', 0) * 0.15,
                "status": order.get('status', 'unknown')
            })
        
        # Calculate monthly breakdown
        monthly_breakdown = {}
        for order in orders:
            month = order.get('created_at', '')[:7]  # YYYY-MM
            if month not in monthly_breakdown:
                monthly_breakdown[month] = {
                    "orders": 0,
                    "revenue": 0
                }
            monthly_breakdown[month]["orders"] += 1
            monthly_breakdown[month]["revenue"] += order.get('total_amount', 0)
        
        summary = {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_commission": total_commission,
            "cobbler_payments": cobbler_payments,
            "monthly_breakdown": monthly_breakdown
        }
        
        # For cobblers, calculate their earnings
        if current_user['role'] == 'cobbler':
            summary["cobbler_earnings"] = cobbler_payments
        
        return {
            "period": str(year),
            "summary": summary,
            "orders": order_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating yearly report: {e}")
        raise HTTPException(status_code=500, detail="Error generating report")
