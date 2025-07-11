"""
User Model
Database model for user management with XION integration
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean
from datetime import datetime
from models.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    address = Column(String, unique=True, index=True, nullable=False)  # XION wallet address
    username = Column(String, nullable=True)
    email = Column(String, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    total_registrations = Column(Integer, default=0)
    total_verifications = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "address": self.address,
            "username": self.username,
            "email": self.email,
            "registeredAt": self.registered_at.isoformat() if self.registered_at else None,
            "lastActivity": self.last_activity.isoformat() if self.last_activity else None,
            "totalRegistrations": self.total_registrations,
            "totalVerifications": self.total_verifications,
            "isActive": self.is_active
        }

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)  # 'registration' or 'verification'
    filename = Column(String, nullable=False)
    hash = Column(String, nullable=True)
    status = Column(String, default='completed')  # 'completed', 'pending', 'failed'
    timestamp = Column(DateTime, default=datetime.utcnow)
    extra_data = Column(String, nullable=True)  # JSON string for additional data
    
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "type": self.type,
            "filename": self.filename,
            "hash": self.hash,
            "status": self.status,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "metadata": self.extra_data
        }
