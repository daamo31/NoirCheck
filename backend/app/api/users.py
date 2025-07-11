"""
User API Endpoints
FastAPI routes for user management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

# Pydantic models for request/response
class UserRegistrationRequest(BaseModel):
    address: str
    username: Optional[str] = None
    email: Optional[str] = None

class UserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    address: str
    username: Optional[str]
    email: Optional[str]
    registeredAt: str
    lastActivity: str
    totalRegistrations: int
    totalVerifications: int
    isActive: bool

class UserActivityResponse(BaseModel):
    id: str
    userId: str
    type: str
    filename: str
    hash: Optional[str]
    status: str
    timestamp: str
    metadata: Optional[str]

class UserStatsResponse(BaseModel):
    totalRegistrations: int
    totalVerifications: int
    registrationsThisMonth: int
    verificationsThisMonth: int
    joinDate: str
    lastActivity: str
    recentActivity: List[UserActivityResponse]

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegistrationRequest,
    db: Session = Depends(get_db)
):
    """Register a new user with XION wallet address"""
    try:
        user_service = UserService(db)
        user = await user_service.register_user(
            address=user_data.address,
            username=user_data.username,
            email=user_data.email
        )
        return UserResponse(**user.to_dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering user: {str(e)}"
        )

@router.get("/{address}", response_model=UserResponse)
async def get_user(
    address: str,
    db: Session = Depends(get_db)
):
    """Get user by wallet address"""
    try:
        user_service = UserService(db)
        user = await user_service.get_user_by_address(address)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user.to_dict())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update user information"""
    try:
        user_service = UserService(db)
        
        # Convert to dict, excluding None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        user = await user_service.update_user(user_id, update_dict)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user.to_dict())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

@router.get("/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user statistics and analytics"""
    try:
        user_service = UserService(db)
        stats = await user_service.get_user_stats(user_id)
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserStatsResponse(**stats)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user stats: {str(e)}"
        )

@router.get("/{user_id}/activity", response_model=List[UserActivityResponse])
async def get_user_activity(
    user_id: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get user's activity history"""
    try:
        user_service = UserService(db)
        activities = await user_service.get_user_activities(user_id, limit)
        
        return [UserActivityResponse(**activity.to_dict()) for activity in activities]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user activity: {str(e)}"
        )

@router.get("/{user_id}/registrations")
async def get_user_registrations(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get all content registrations by user"""
    try:
        user_service = UserService(db)
        registrations = await user_service.get_user_registrations(user_id)
        
        return registrations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user registrations: {str(e)}"
        )

@router.post("/{user_id}/activity")
async def record_user_activity(
    user_id: str,
    activity_type: str,
    filename: str,
    file_hash: Optional[str] = None,
    status: str = "completed",
    db: Session = Depends(get_db)
):
    """Record user activity (used internally by other services)"""
    try:
        user_service = UserService(db)
        activity = await user_service.record_activity(
            user_id=user_id,
            activity_type=activity_type,
            filename=filename,
            file_hash=file_hash,
            status=status
        )
        
        return UserActivityResponse(**activity.to_dict())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recording activity: {str(e)}"
        )
