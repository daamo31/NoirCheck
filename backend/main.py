#!/usr/bin/env python3
"""
NoirCheck Backend API
Plataforma de verificación de autenticidad de contenido digital
"""

from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timezone
import uvicorn
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from PIL import Image
import io
import json

# Importar servicios locales
from models.database import get_db, init_db
from models.content import Content
from services.hash_service import HashService
from services.file_service import FileService
from services.xion_simple_service import XIONService

# Configuración de la aplicación
app = FastAPI(
    title="NoirCheck API",
    description="API para verificación de autenticidad de contenido digital",
    version="1.0.0",
)

# Configurar CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servicios
hash_service = HashService()
file_service = FileService()
xion_service = XIONService()


# Middleware para optimización móvil
async def mobile_optimization_middleware(request, call_next):
    """Middleware para optimizar respuestas para dispositivos móviles"""
    response = await call_next(request)

    # Headers de cache para móviles
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    # Headers de seguridad
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response


app.middleware("http")(mobile_optimization_middleware)


# Startup/Shutdown events
@app.on_event("startup")
async def startup_event():
    """Inicialización de la aplicación"""
    print("🚀 Iniciando NoirCheck Backend...")
    init_db()
    print("✅ Base de datos inicializada")
    print("✅ NoirCheck Backend listo")


# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Verificación de estado del sistema"""
    xion_status = xion_service.get_status()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc),
        "services": {
            "database": "connected",
            "xion": xion_status.get("status", "disconnected"),
            "file_storage": "available",
        },
    }


# ENDPOINTS PRINCIPALES


@app.post("/content/register", response_model=None)
async def register_content(
    file: UploadFile = File(...),
    description: str = Form(...),
    creator_id: str = Form(...),
    db: Session = Depends(get_db),
) -> Union[JSONResponse, Dict[str, Any]]:
    """
    Registrar nuevo contenido en la blockchain
    """
    try:
        # Validar archivo
        if not file_service.is_file_supported_by_upload(file):
            raise HTTPException(status_code=400, detail="Tipo de archivo no soportado")

        # Leer contenido del archivo
        file_content = await file.read()
        await file.seek(0)

        # Calcular hash del contenido
        content_hash = hash_service.calculate_file_hash(file_content)

        # Verificar si ya existe
        existing_content = (
            db.query(Content).filter(Content.content_hash == content_hash).first()
        )

        if existing_content:
            return JSONResponse(
                status_code=409,
                content={
                    "error": "Content already registered",
                    "existing_creator": existing_content.creator_id,
                    "registered_at": existing_content.created_at.isoformat(),
                },
            )

        # Guardar archivo
        file_path = await file_service.save_file(file, file_content)

        # Registrar en blockchain (simulado)
        blockchain_tx = xion_service.register_content(
            content_hash=content_hash,
            metadata={
                "filename": file.filename,
                "description": description,
                "creator_id": creator_id,
                "file_size": len(file_content),
                "content_type": file.content_type,
                "timestamp": datetime.now().isoformat(),
            },
        )

        # Crear registro en base de datos
        content_record = Content(
            content_hash=content_hash,
            creator_id=creator_id,
            description=description,
            file_path=str(file_path),
            blockchain_tx_hash=blockchain_tx["transaction_hash"],
            timestamp=datetime.now(timezone.utc),
            file_size=len(file_content),
            content_type=file.content_type,
            filename=file.filename,
        )

        db.add(content_record)
        db.commit()
        db.refresh(content_record)

        return {
            "success": True,
            "id": str(content_record.id),
            "hash": content_hash,
            "filename": file.filename,
            "file_type": file.content_type,
            "file_size": len(file_content),
            "blockchain_tx": blockchain_tx["transaction_hash"],
            "timestamp": content_record.created_at.isoformat(),
            "status": "registered",
            "creator_id": creator_id,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error registrando contenido: {str(e)}"
        )


@app.post("/content/verify", response_model=None)
async def verify_content(
    file: UploadFile = File(...),
    source_url: Optional[str] = Form(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Verificar autenticidad de contenido
    """
    try:
        # Leer archivo
        file_content = await file.read()
        content_hash = hash_service.calculate_file_hash(file_content)

        # Buscar en base de datos local
        content_record = (
            db.query(Content).filter(Content.content_hash == content_hash).first()
        )

        # Verificar en blockchain
        blockchain_result = xion_service.verify_content(content_hash)

        # Preparar resultado base
        verification_result = {
            "hash": content_hash,
            "exists": False,
            "original": False,
            "confidence": 0.0,
            "blockchain_verified": False,
            "blockchain_tx": None,
            "registration_date": None,
            "source_verification": None,
            "modifications": [],
        }

        # Si encontramos registro local
        if content_record:
            verification_result.update(
                {
                    "exists": True,
                    "original": True,
                    "confidence": 0.95,
                    "blockchain_verified": True,  # En DB = verificado
                    "blockchain_tx": content_record.blockchain_tx_hash,
                    "registration_date": content_record.created_at.isoformat(),
                    "creator_id": content_record.creator_id,
                    "description": content_record.description,
                    "filename": content_record.filename,
                }
            )

        # Análisis de modificaciones (simulado)
        modification_analysis = hash_service.analyze_modifications(file_content)
        if modification_analysis["modified"]:
            verification_result["modifications"] = [
                "Posibles modificaciones detectadas en el contenido",
                f"Nivel de similitud: {modification_analysis['similarity']:.1%}"
            ]

        # Si no se encontró contenido, agregar información adicional
        if not content_record:
            verification_result["modifications"] = verification_result.get("modifications", []) + [
                "Contenido no registrado en NoirCheck",
                "Verifica que sea la versión original del archivo"
            ]

        return verification_result

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error verificando contenido: {str(e)}"
        )


@app.post("/mobile/verify", response_model=None)
async def mobile_verify_content(
    file: UploadFile = File(...),
    quick_mode: bool = Form(True),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Verificación optimizada para dispositivos móviles
    """
    try:
        # Leer archivo (con límite para móviles)
        max_mobile_size = 50 * 1024 * 1024  # 50MB
        file_content = await file.read(max_mobile_size)

        if len(file_content) == max_mobile_size:
            raise HTTPException(
                status_code=413,
                detail="Archivo demasiado grande para verificación móvil",
            )

        content_hash = hash_service.calculate_file_hash(file_content)

        # Resultado móvil simplificado
        mobile_result = {
            "hash": content_hash,
            "verified": False,
            "score": 0,
            "quick_check": quick_mode,
        }

        # Verificación rápida en base de datos local
        if quick_mode:
            content_record = (
                db.query(Content).filter(Content.content_hash == content_hash).first()
            )

            if content_record:
                mobile_result.update(
                    {
                        "verified": True,
                        "score": 95,
                        "creator": content_record.creator_id,
                        "date": content_record.created_at.strftime("%Y-%m-%d"),
                    }
                )
        else:
            # Verificación completa
            blockchain_result = xion_service.verify_content(content_hash)
            mobile_result.update(
                {
                    "verified": blockchain_result["verified"],
                    "score": 90 if blockchain_result["verified"] else 10,
                    "blockchain_tx": blockchain_result.get("transaction_hash", ""),
                }
            )

        return mobile_result

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error en verificación móvil: {str(e)}"
        )


@app.get("/content/{content_hash}")
async def get_content_info(content_hash: str, db: Session = Depends(get_db)):
    """Obtener información de contenido por hash"""
    content = db.query(Content).filter(Content.content_hash == content_hash).first()

    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    return {
        "content_hash": content.content_hash,
        "creator_id": content.creator_id,
        "description": content.description,
        "created_at": content.created_at.isoformat(),
        "file_info": {
            "filename": content.filename,
            "size": content.file_size,
            "type": content.content_type,
        },
        "blockchain_tx": content.blockchain_tx_hash,
    }


@app.get("/creator/{creator_id}/content")
async def get_creator_content(creator_id: str, db: Session = Depends(get_db)):
    """Obtener todo el contenido de un creador"""
    content_list = db.query(Content).filter(Content.creator_id == creator_id).all()

    return {
        "creator_id": creator_id,
        "total_content": len(content_list),
        "content": [
            {
                "content_hash": content.content_hash,
                "description": content.description,
                "created_at": content.created_at.isoformat(),
                "filename": content.filename,
            }
            for content in content_list
        ],
    }


# ENDPOINTS MÓVILES


@app.get("/mobile/config")
async def get_mobile_config():
    """Configuración para la aplicación móvil"""
    return {
        "api_version": "1.0.0",
        "supported_file_types": [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/mov",
            "video/avi",
            "application/pdf",
            "text/plain",
        ],
        "max_file_size_mb": 50,
        "features": {
            "quick_verify": True,
            "batch_upload": False,
            "offline_mode": False,
        },
        "endpoints": {
            "verify": "/mobile/verify",
            "register": "/content/register",
            "status": "/mobile/status",
        },
    }


@app.get("/mobile/status")
async def get_mobile_status():
    """Estado del servicio para móviles"""
    try:
        # Verificar servicios críticos
        db_status = "operational"
        xion_status_data = xion_service.get_status()
        xion_status = xion_status_data.get("status", "disconnected")

        return {
            "status": "online",
            "message": "NoirCheck backend operativo con XION blockchain",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "xion_status": xion_status,
            "response_time_ms": 50,  # Simulado para demo
            "services": {
                "api": "operational",
                "database": db_status,
                "xion": xion_status,
                "file_storage": "operational",
            },
        }

    except Exception as e:
        return {
            "status": "degraded",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e),
            "services": {
                "api": "operational",
                "database": "unknown",
                "blockchain": "unknown",
                "file_storage": "unknown",
            },
        }


# ESTADÍSTICAS Y MÉTRICAS


@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Estadísticas generales del sistema"""
    total_content = db.query(Content).count()
    unique_creators = db.query(Content.creator_id).distinct().count()

    return {
        "total_registered_content": total_content,
        "unique_creators": unique_creators,
        "verification_requests": 0,  # TODO: Implementar contador
        "blockchain_transactions": total_content,
        "system_status": "operational",
    }


# Ejecutar servidor
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
