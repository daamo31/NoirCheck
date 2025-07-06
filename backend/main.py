#!/usr/bin/env python3
"""
NoirCheck Backend API
Plataforma de verificación de autenticidad de contenido digital
"""

from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timezone
import uvicorn
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
from services.xion_service import XIONService

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
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc),
        "services": {
            "database": "connected",
            "xion": await xion_service.check_connection(),
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
        file_path = await file_service.save_file(file)

        # Registrar en blockchain (simulado)
        blockchain_tx = await xion_service.register_content_on_chain(
            content_hash=content_hash,
            creator_id=creator_id,
            timestamp=datetime.now(),
            metadata={
                "filename": file.filename,
                "description": description,
                "file_size": len(file_content),
                "content_type": file.content_type,
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
            "content_hash": content_hash,
            "creator_id": creator_id,
            "registered_at": content_record.created_at.isoformat(),
            "blockchain_tx": blockchain_tx["transaction_hash"],
            "file_info": {
                "filename": file.filename,
                "size": len(file_content),
                "type": file.content_type,
            },
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
        blockchain_result = await xion_service.verify_content_on_chain(content_hash)

        # Preparar resultado base
        verification_result = {
            "content_hash": content_hash,
            "authentic": False,
            "confidence_score": 0.0,
            "verification_timestamp": datetime.now(timezone.utc).isoformat(),
            "sources": [],
        }

        # Si encontramos registro local
        if content_record:
            verification_result.update(
                {
                    "authentic": True,
                    "confidence_score": 0.95,
                    "original_creator": content_record.creator_id,
                    "registration_date": content_record.created_at.isoformat(),
                    "description": content_record.description,
                    "blockchain_verified": blockchain_result["verified"],
                    "sources": [
                        {
                            "type": "blockchain",
                            "verified": True,
                            "transaction_hash": content_record.blockchain_tx_hash,
                        }
                    ],
                }
            )

        # Verificación adicional de URL fuente
        if source_url:
            source_verification = await xion_service.verify_source_authenticity(
                source_url
            )
            verification_result.update(
                {
                    "source_url_verified": source_verification["verified"],
                    "source_reputation": source_verification.get(
                        "reputation", "unknown"
                    ),
                }
            )
            verification_result["sources"].append(
                {
                    "type": "web_source",
                    "url": source_url,
                    "verified": source_verification["verified"],
                }
            )

        # Análisis de modificaciones (simulado)
        modification_analysis = await hash_service.analyze_modifications(file_content)
        verification_result.update(
            {
                "modification_detected": modification_analysis["modified"],
                "similarity_score": modification_analysis["similarity"],
            }
        )

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
            blockchain_result = await xion_service.verify_content_on_chain(content_hash)
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
        xion_status = await xion_service.check_connection()

        return {
            "status": "online",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "response_time_ms": 50,  # Simulado para demo
            "services": {
                "api": "operational",
                "database": db_status,
                "blockchain": xion_status,
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
