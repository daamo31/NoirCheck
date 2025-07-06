from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean
from sqlalchemy.sql import func
from .database import Base

class ContentModel(Base):
    """Modelo para almacenar información de contenido registrado"""
    
    __tablename__ = "content"
    
    id = Column(Integer, primary_key=True, index=True)
    content_hash = Column(String(64), unique=True, index=True, nullable=False)
    creator_id = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=True)
    blockchain_tx_id = Column(String(255), nullable=False)
    verification_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Content(hash={self.content_hash}, creator={self.creator_id})>"
