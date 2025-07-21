"""
User Service
Business logic for user management and activity tracking
"""

import uuid
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User, UserActivity
from app.database import get_db

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    async def register_user(self, address: str, username: Optional[str] = None, email: Optional[str] = None) -> User:
        """Register a new user with their XION wallet address"""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.address == address).first()
        if existing_user:
            raise ValueError(f"User with address {address} already exists")
        
        # Generate unique user ID
        user_id = str(uuid.uuid4())
        
        # Create new user
        user = User(
            id=user_id,
            address=address,
            username=username,
            email=email,
            registered_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            total_registrations=0,
            total_verifications=0,
            is_active=True
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    async def get_user_by_address(self, address: str) -> Optional[User]:
        """Get user by their XION wallet address"""
        return self.db.query(User).filter(User.address == address).first()
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by their ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user information"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Update allowed fields
        allowed_fields = ['username', 'email']
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(user, field):
                setattr(user, field, value)
        
        user.last_activity = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    async def record_activity(self, user_id: str, activity_type: str, filename: str, 
                            file_hash: Optional[str] = None, status: str = 'completed',
                            metadata: Optional[Dict[str, Any]] = None) -> UserActivity:
        """Record user activity (registration or verification)"""
        activity_id = str(uuid.uuid4())
        
        activity = UserActivity(
            id=activity_id,
            user_id=user_id,
            type=activity_type,
            filename=filename,
            hash=file_hash,
            status=status,
            timestamp=datetime.utcnow(),
            extra_data=json.dumps(metadata) if metadata else None
        )
        
        self.db.add(activity)
        
        # Update user counters
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            if activity_type == 'registration':
                user.total_registrations += 1
            elif activity_type == 'verification':
                user.total_verifications += 1
            user.last_activity = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(activity)
        
        return activity
    
    async def get_user_activities(self, user_id: str, limit: int = 20) -> List[UserActivity]:
        """Get user's recent activities"""
        return (self.db.query(UserActivity)
                .filter(UserActivity.user_id == user_id)
                .order_by(desc(UserActivity.timestamp))
                .limit(limit)
                .all())
    
    async def get_user_stats(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive user statistics"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Get recent activity
        recent_activities = await self.get_user_activities(user_id, 10)
        
        # Calculate additional stats
        registrations_this_month = (self.db.query(UserActivity)
                                  .filter(UserActivity.user_id == user_id)
                                  .filter(UserActivity.type == 'registration')
                                  .filter(UserActivity.timestamp >= datetime.utcnow().replace(day=1))
                                  .count())
        
        verifications_this_month = (self.db.query(UserActivity)
                                  .filter(UserActivity.user_id == user_id)
                                  .filter(UserActivity.type == 'verification')
                                  .filter(UserActivity.timestamp >= datetime.utcnow().replace(day=1))
                                  .count())
        
        return {
            "totalRegistrations": user.total_registrations,
            "totalVerifications": user.total_verifications,
            "registrationsThisMonth": registrations_this_month,
            "verificationsThisMonth": verifications_this_month,
            "joinDate": user.registered_at.isoformat() if user.registered_at else None,
            "lastActivity": user.last_activity.isoformat() if user.last_activity else None,
            "recentActivity": [activity.to_dict() for activity in recent_activities]
        }
    
    async def get_user_registrations(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all content registrations by user"""
        # This would typically join with a content table
        # For now, return activities of type 'registration'
        activities = (self.db.query(UserActivity)
                     .filter(UserActivity.user_id == user_id)
                     .filter(UserActivity.type == 'registration')
                     .order_by(desc(UserActivity.timestamp))
                     .all())
        
        return [activity.to_dict() for activity in activities]
    
    async def update_last_activity(self, user_id: str):
        """Update user's last activity timestamp"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_activity = datetime.utcnow()
            self.db.commit()
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user and all their activities"""
        try:
            # Delete user activities first (foreign key constraint)
            self.db.query(UserActivity).filter(UserActivity.user_id == user_id).delete()
            
            # Delete user
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            self.db.delete(user)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise e
    
    async def get_all_users(self) -> List[User]:
        """Get all users (for testing purposes)"""
        return self.db.query(User).order_by(desc(User.registered_at)).all()
    
    async def clear_all_users(self) -> bool:
        """Clear all users and their activities (for development/testing only)"""
        try:
            # Delete all user activities first (foreign key constraint)
            self.db.query(UserActivity).delete()
            
            # Delete all users
            self.db.query(User).delete()
            
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise e

def get_user_service(db: Session = None) -> UserService:
    """Get user service instance"""
    if db is None:
        db = next(get_db())
    return UserService(db)
