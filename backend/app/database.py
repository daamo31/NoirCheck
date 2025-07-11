"""
Database Configuration for User Management
"""

from models.database import get_db, init_db

# Re-export for app module
__all__ = ['get_db', 'init_db']
