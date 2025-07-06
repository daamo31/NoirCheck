import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import hashlib
import os
from datetime import datetime
from typing import Optional, List
import json
from PIL import Image
import io

from models.database import get_db, init_db
from models.content import ContentModel
from services.xion_service import XIONService
from services.hash_service import HashService
from services.file_service import FileService

# Configuración de la aplicación
app = FastAPI(
    title="NoirCheck API",
    description="Backend API para verificación de autenticidad de contenido digital",
    version="1.0.0"
)

# Configuración CORS para permitir conexiones desde Flutter
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración específica para aplicaciones móviles
@app.middleware("http")
async def mobile_optimization_middleware(request, call_next):
    """Middleware para optimizar respuestas para aplicaciones móviles"""
    response = await call_next(request)
    
    # Agregar headers para optimización móvil
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    # Headers para aplicaciones móviles
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    return response

# Servicios
xion_service = XIONService()
hash_service = HashService()
file_service = FileService()

@app.on_event("startup")
async def startup_event():
    """Inicializa la base de datos al arrancar la aplicación"""
    init_db()

@app.get("/")
async def root():
    """Endpoint raíz de la API"""
    return {
        "message": "NoirCheck API - Plataforma de Verificación de Contenido Digital",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud del servicio"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "xion": await xion_service.check_connection(),
            "file_storage": "available"
        }
    }

@app.post("/api/v1/content/register")
async def register_content(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    creator_identity_token: Optional[str] = None,
    db=Depends(get_db)
):
    """
    Registra contenido original y lo autentica en la blockchain
    
    Args:
        file: Archivo de contenido (imagen, video, texto)
        description: Descripción opcional del contenido
        creator_identity_token: Token de identidad verificado por XION zkTLS
    """
    try:
        # Validar el archivo
        if not file_service.validate_file(file):
            raise HTTPException(status_code=400, detail="Tipo de archivo no soportado")
        
        # Leer el contenido del archivo
        file_content = await file.read()
        
        # Calcular hash del contenido
        content_hash = hash_service.calculate_hash(file_content)
        
        # Verificar si el contenido ya existe
        existing_content = db.query(ContentModel).filter(ContentModel.content_hash == content_hash).first()
        if existing_content:
            return JSONResponse(
                status_code=409,
                content={
                    "error": "Content already registered",
                    "existing_registration": {
                        "hash": content_hash,
                        "registered_at": existing_content.created_at.isoformat(),
                        "creator_id": existing_content.creator_id
                    }
                }
            )
        
        # Verificar identidad del creador con XION zkTLS
        identity_verification = await xion_service.verify_creator_identity(creator_identity_token)
        
        if not identity_verification["verified"]:
            raise HTTPException(
                status_code=401, 
                detail="Creator identity could not be verified"
            )
        
        creator_id = identity_verification["creator_id"]
        
        # Guardar archivo temporalmente
        file_path = await file_service.save_file(file, file_content)
        
        # Registrar en blockchain via XION
        blockchain_result = await xion_service.register_content_on_chain(
            content_hash=content_hash,
            creator_id=creator_id,
            timestamp=datetime.utcnow(),
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
                "description": description,
                "file_size": len(file_content)
            }
        )
        
        # Guardar en base de datos local
        content_record = ContentModel(
            content_hash=content_hash,
            creator_id=creator_id,
            filename=file.filename,
            content_type=file.content_type,
            description=description,
            file_size=len(file_content),
            file_path=file_path,
            blockchain_tx_id=blockchain_result["transaction_id"],
            verification_url=blockchain_result["verification_url"]
        )
        
        db.add(content_record)
        db.commit()
        db.refresh(content_record)
        
        # Generar sello de autenticidad
        authenticity_seal = hash_service.generate_authenticity_seal(
            content_hash, 
            creator_id, 
            blockchain_result["transaction_id"]
        )
        
        return {
            "success": True,
            "content_hash": content_hash,
            "creator_id": creator_id,
            "registered_at": content_record.created_at.isoformat(),
            "blockchain_transaction": blockchain_result["transaction_id"],
            "verification_url": blockchain_result["verification_url"],
            "authenticity_seal": authenticity_seal,
            "qr_code": f"https://noircheck.app/verify/{content_hash}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.post("/api/v1/content/verify")
async def verify_content(
    file: UploadFile = File(...),
    source_url: Optional[str] = None,
    db=Depends(get_db)
):
    """
    Verifica la autenticidad de contenido subido por un consumidor
    
    Args:
        file: Archivo a verificar
        source_url: URL donde se encontró el contenido (opcional)
    """
    try:
        # Leer y procesar el archivo
        file_content = await file.read()
        content_hash = hash_service.calculate_hash(file_content)
        
        # Buscar en base de datos local
        original_content = db.query(ContentModel).filter(ContentModel.content_hash == content_hash).first()
        
        # Verificar en blockchain via XION
        blockchain_verification = await xion_service.verify_content_on_chain(content_hash)
        
        # Verificar fuente si se proporciona URL
        source_verification = None
        if source_url:
            source_verification = await xion_service.verify_source_authenticity(source_url)
        
        # Determinar el estado de verificación
        verification_result = {
            "content_hash": content_hash,
            "verification_timestamp": datetime.utcnow().isoformat(),
            "source_url": source_url
        }
        
        if original_content and blockchain_verification["found"]:
            # Contenido auténtico y original
            verification_result.update({
                "status": "authentic_original",
                "confidence": 100,
                "original_creator": {
                    "id": original_content.creator_id,
                    "verified_identity": blockchain_verification["creator_verified"]
                },
                "registration_date": original_content.created_at.isoformat(),
                "blockchain_proof": blockchain_verification["transaction_id"],
                "description": original_content.description,
                "modifications_detected": False
            })
        
        elif blockchain_verification["found"] and not original_content:
            # Contenido registrado pero con posibles modificaciones
            verification_result.update({
                "status": "authentic_modified",
                "confidence": 75,
                "original_creator": {
                    "id": blockchain_verification["creator_id"],
                    "verified_identity": blockchain_verification["creator_verified"]
                },
                "registration_date": blockchain_verification["registration_date"],
                "blockchain_proof": blockchain_verification["transaction_id"],
                "modifications_detected": True,
                "similarity_score": hash_service.calculate_similarity(
                    content_hash, 
                    blockchain_verification["original_hash"]
                )
            })
        
        else:
            # Contenido no verificado
            verification_result.update({
                "status": "unverified",
                "confidence": 0,
                "blockchain_proof": None,
                "modifications_detected": "unknown",
                "warning": "No se encontró registro de este contenido en la blockchain"
            })
        
        # Agregar información de la fuente si está disponible
        if source_verification:
            verification_result["source_verification"] = source_verification
        
        return verification_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en verificación: {str(e)}")

@app.post("/api/v1/mobile/verify")
async def mobile_verify_content(
    file: UploadFile = File(...),
    source_url: Optional[str] = None,
    db=Depends(get_db)
):
    """
    Versión optimizada del endpoint de verificación para aplicaciones móviles
    Respuestas más rápidas y ligeras para dispositivos móviles
    """
    try:
        # Validación rápida de archivo para móviles
        if file.size and file.size > 50 * 1024 * 1024:  # 50MB máximo
            raise HTTPException(status_code=413, detail="Archivo demasiado grande para móviles")
        
        # Leer y procesar el archivo
        file_content = await file.read()
        content_hash = hash_service.calculate_hash(file_content)
        
        # Búsqueda optimizada en base de datos local
        original_content = db.query(ContentModel).filter(
            ContentModel.content_hash == content_hash
        ).first()
        
        # Verificación rápida en blockchain
        blockchain_verification = await xion_service.verify_content_on_chain(content_hash)
        
        # Respuesta optimizada para móviles
        mobile_result = {
            "hash": content_hash,
            "timestamp": datetime.now().isoformat(),
            "verified": False,
            "confidence": 0,
            "status": "unverified"
        }
        
        if original_content and blockchain_verification["found"]:
            mobile_result.update({
                "verified": True,
                "confidence": 100,
                "status": "authentic",
                "creator": original_content.creator_id,
                "registered": original_content.created_at.isoformat(),
                "blockchain_proof": blockchain_verification["transaction_id"]
            })
        elif blockchain_verification["found"]:
            mobile_result.update({
                "verified": True,
                "confidence": 75,
                "status": "modified",
                "creator": blockchain_verification["creator_id"],
                "registered": blockchain_verification["registration_date"],
                "blockchain_proof": blockchain_verification["transaction_id"]
            })
        
        return mobile_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en verificación móvil: {str(e)}")

@app.get("/api/v1/content/{content_hash}")
async def get_content_info(content_hash: str, db=Depends(get_db)):
    """Obtiene información detallada de un contenido por su hash"""
    try:
        content = db.query(ContentModel).filter(ContentModel.content_hash == content_hash).first()
        
        if not content:
            # Buscar en blockchain
            blockchain_info = await xion_service.get_content_info(content_hash)
            if not blockchain_info["found"]:
                raise HTTPException(status_code=404, detail="Contenido no encontrado")
            return blockchain_info
        
        return {
            "content_hash": content.content_hash,
            "creator_id": content.creator_id,
            "filename": content.filename,
            "content_type": content.content_type,
            "description": content.description,
            "registered_at": content.created_at.isoformat(),
            "blockchain_tx_id": content.blockchain_tx_id,
            "verification_url": content.verification_url,
            "file_size": content.file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener información: {str(e)}")

@app.get("/api/v1/creator/{creator_id}/content")
async def get_creator_content(creator_id: str, db=Depends(get_db)):
    """Obtiene todo el contenido registrado por un creador"""
    try:
        content_list = db.query(ContentModel).filter(ContentModel.creator_id == creator_id).all()
        
        return {
            "creator_id": creator_id,
            "total_content": len(content_list),
            "content": [
                {
                    "content_hash": content.content_hash,
                    "filename": content.filename,
                    "description": content.description,
                    "registered_at": content.created_at.isoformat(),
                    "verification_url": content.verification_url
                }
                for content in content_list
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener contenido del creador: {str(e)}")

@app.get("/api/v1/mobile/config")
async def get_mobile_config():
    """Configuración específica para aplicaciones móviles"""
    return {
        "api_version": "1.0.0",
        "supported_file_types": [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/mov", "video/avi",
            "application/pdf", "text/plain"
        ],
        "max_file_size_mb": 50,
        "verification_timeout_seconds": 30,
        "features": {
            "camera_upload": True,
            "gallery_upload": True,
            "qr_scanning": True,
            "bulk_verification": False,
            "offline_mode": False
        },
        "endpoints": {
            "register": "/api/v1/content/register",
            "verify": "/api/v1/content/verify",
            "content_info": "/api/v1/content/{hash}",
            "creator_content": "/api/v1/creator/{id}/content"
        }
    }

@app.get("/api/v1/mobile/status")
async def get_mobile_status():
    """Estado del servicio optimizado para móviles"""
    try:
        # Verificación rápida de servicios
        xion_status = await xion_service.check_connection()
        
        return {
            "status": "online",
            "timestamp": datetime.utcnow().isoformat(),
            "response_time_ms": 50,  # Simulado para demo
            "services": {
                "api": "operational",
                "database": "operational", 
                "blockchain": "operational" if xion_status == "connected" else "degraded",
                "file_storage": "operational"
            },
            "maintenance_mode": False
        }
    except Exception as e:
        return {
            "status": "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
            "services": {
                "api": "operational",
                "database": "unknown",
                "blockchain": "unknown", 
                "file_storage": "unknown"
            },
            "maintenance_mode": False
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
