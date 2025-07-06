"""
Configuración de base de datos SQLAlchemy
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# URL de base de datos (SQLite para desarrollo)
SQLALCHEMY_DATABASE_URL = "sqlite:///./noircheck.db"

# Crear engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Crear SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear Base class
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obtener sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Inicializar base de datos - crear todas las tablas
    """
    Base.metadata.create_all(bind=engine)


def reset_db() -> None:
    """
    Resetear base de datos - eliminar y recrear todas las tablas
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
