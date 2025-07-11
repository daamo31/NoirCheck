"""
SQLAlchemy Database Configuration

This module configures the database connection and session management
for the NoirCheck application. It provides the database engine, session
factory, and utility functions for database initialization and management.

Features:
- SQLite database for development (easy setup, no external dependencies)
- Connection pooling and session management
- Database initialization and reset utilities
- FastAPI dependency injection support
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# Database URL (SQLite for development environment)
SQLALCHEMY_DATABASE_URL = "sqlite:///./noircheck.db"

# Create database engine
# check_same_thread=False allows SQLite to work with FastAPI's threading model
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal class for database sessions
# autocommit=False: Transactions must be explicitly committed
# autoflush=False: Changes aren't automatically flushed to database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for SQLAlchemy models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database dependency for FastAPI endpoints
    
    This function provides a database session to FastAPI endpoints through
    dependency injection. It ensures proper session lifecycle management
    with automatic cleanup.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        @app.get("/content/{content_id}")
        def get_content(content_id: int, db: Session = Depends(get_db)):
            return db.query(Content).filter(Content.id == content_id).first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database - create all tables
    
    Creates all database tables defined in SQLAlchemy models.
    This function should be called when setting up the application
    for the first time or when adding new models.
    
    Note:
        This function is idempotent - it won't recreate existing tables
        but will create any missing tables.
    """
    Base.metadata.create_all(bind=engine)


def reset_db() -> None:
    """
    Reset database - drop and recreate all tables
    
    Completely resets the database by dropping all existing tables
    and recreating them. This is useful for development and testing
    but should NEVER be used in production.
    
    Warning:
        This operation is destructive and will delete all data!
        Use with extreme caution.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
