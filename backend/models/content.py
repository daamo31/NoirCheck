"""
Modelo de datos para contenido registrado
"""

from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base


class Content(Base):
    """Modelo para contenido registrado en la plataforma"""

    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    content_hash = Column(String(64), unique=True, index=True, nullable=False)
    creator_id = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    content_type = Column(String(100), nullable=True)
    blockchain_tx_hash = Column(String(66), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_verified = Column(Boolean, default=True)
    verification_count = Column(Integer, default=0)

    def __repr__(self):
        return f"<Content(hash={self.content_hash[:8]}..., creator={self.creator_id})>"

    def to_dict(self):
        """Convierte el objeto a diccionario"""
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
        }
