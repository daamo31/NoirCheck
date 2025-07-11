"""
Content Data Model

This module defines the SQLAlchemy model for content registered in the
NoirCheck platform. It handles the database schema and operations for
content authentication and verification records.

The Content model stores:
- Content identification (SHA-256 hash)
- Creator information and metadata
- File details and storage location
- Blockchain transaction references
- Verification status and timestamps
"""

from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base


class Content(Base):
    """
    Content model for registered platform content
    
    Represents a piece of content that has been registered on the NoirCheck
    platform for authenticity verification. Each record corresponds to a
    unique piece of content identified by its SHA-256 hash.
    
    Database Schema:
    - Primary key: Auto-incrementing integer ID
    - Unique constraint: content_hash (SHA-256)
    - Indexes: content_hash, creator_id for fast lookups
    - Timestamps: created_at, updated_at with automatic management
    """

    __tablename__ = "content"

    # Primary key and content identification
    id = Column(Integer, primary_key=True, index=True)
    content_hash = Column(String(64), unique=True, index=True, nullable=False, 
                         comment="SHA-256 hash of the content file")
    
    # Creator and ownership information
    creator_id = Column(String(255), index=True, nullable=False,
                       comment="Unique identifier of the content creator")
    
    # Content metadata
    description = Column(Text, nullable=True,
                        comment="User-provided description of the content")
    filename = Column(String(255), nullable=True,
                     comment="Original filename of the uploaded content")
    file_path = Column(String(500), nullable=True,
                      comment="Local storage path of the content file")
    file_size = Column(Integer, nullable=True,
                      comment="File size in bytes")
    content_type = Column(String(100), nullable=True,
                         comment="MIME type of the content file")
    
    # Blockchain integration
    blockchain_tx_hash = Column(String(66), nullable=True,
                               comment="XION blockchain transaction hash")
    
    # Timestamp management
    timestamp = Column(DateTime(timezone=True), server_default=func.now(),
                      comment="Legacy timestamp field for compatibility")
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                       comment="Record creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                       comment="Record last update timestamp")
    
    # Verification status
    is_verified = Column(Boolean, default=True,
                        comment="Content verification status")
    verification_count = Column(Integer, default=0,
                               comment="Number of times content has been verified")

    def __repr__(self):
        """String representation for debugging and logging"""
        return f"<Content(hash={self.content_hash[:8]}..., creator={self.creator_id})>"

    def to_dict(self):
        """
        Convert Content object to dictionary
        
        Converts the SQLAlchemy model instance to a Python dictionary
        for JSON serialization and API responses.
        
        Returns:
            Dictionary containing all content fields with proper type conversion
        """
        return {
            "id": self.id,
            "content_hash": self.content_hash,
            "creator_id": self.creator_id,
            "description": self.description,
            "filename": self.filename,
            "file_size": self.file_size,
            "content_type": self.content_type,
            "blockchain_tx_hash": self.blockchain_tx_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_verified": self.is_verified,
            "verification_count": self.verification_count,
            "file_path": self.file_path
        }
