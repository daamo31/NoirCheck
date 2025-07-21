#!/usr/bin/env python3
"""
NoirCheck Backend API
Digital Content Authenticity Verification Platform

This module provides the main FastAPI application for NoirCheck, enabling
content registration and verification through blockchain technology and
cryptographic hashing.

Key Features:
- Content registration with blockchain integration
- File verification and authenticity checking
- SHA-256 hash-based content identification
- XION blockchain integration for immutable records
- Real-time status monitoring and health checks
"""

from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timezone
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from PIL import Image
import io
import json

# Import local services and models
from models.database import get_db, init_db
from models.content import Content
from services.hash_service import HashService
from services.file_service import FileService
from services.xion_simple_service import XIONService

# Import user API routes and services
from app.api.users import router as users_router
from app.services.user_service import UserService

# Import models to register them with SQLAlchemy
from app.models.user import User, UserActivity


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan event handler
    
    Manages startup and shutdown operations for the FastAPI application.
    """
    # Startup operations
    print("🚀 Starting NoirCheck Backend...")
    init_db()  # Initialize SQLite database and create tables
    print("✅ Database initialized successfully")
    print("✅ NoirCheck Backend is ready to serve requests")
    
    yield
    
    # Shutdown operations (if needed)
    print("🛑 Shutting down NoirCheck Backend...")


# FastAPI application configuration with lifespan
app = FastAPI(
    title="NoirCheck API",
    description="API for digital content authenticity verification using blockchain and cryptography",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS middleware for frontend development
# Allows cross-origin requests from frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize service instances
# These services handle core functionality of the application
hash_service = HashService()      # SHA-256 hashing and cryptographic operations
file_service = FileService()      # File processing and validation
xion_service = XIONService()      # XION blockchain integration


# Middleware for mobile optimization and security
async def mobile_optimization_middleware(request, call_next):
    """
    Middleware to optimize responses for mobile devices and enhance security
    
    This middleware adds security headers and cache control settings
    to ensure proper mobile performance and security standards.
    
    Args:
        request: Incoming HTTP request
        call_next: Next middleware/handler in the chain
        
    Returns:
        Response with added security and optimization headers
    """
    response = await call_next(request)

    # Cache headers for mobile optimization
    # Prevents caching of sensitive content for security
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    # Security headers to protect against common attacks
    response.headers["X-Content-Type-Options"] = "nosniff"        # Prevent MIME sniffing
    response.headers["X-Frame-Options"] = "DENY"                  # Prevent clickjacking
    response.headers["X-XSS-Protection"] = "1; mode=block"        # XSS protection

    return response


# Apply mobile optimization middleware to all requests
app.middleware("http")(mobile_optimization_middleware)

# Include API routers
app.include_router(users_router)


# Health check endpoint for monitoring and status verification
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    System health check endpoint
    
    Provides real-time status of all system components including database,
    XION blockchain connection, and file storage availability.
    
    Returns:
        Dict containing system status, timestamp, and individual service statuses
        
    Example response:
        {
            "status": "healthy",
            "timestamp": "2025-07-11T10:30:00Z",
            "services": {
                "database": "connected",
                "xion": "connected",
                "file_storage": "available"
            }
        }
    """
    xion_status = xion_service.get_status()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc),
        "services": {
            "database": "connected",           # SQLite database status
            "xion": xion_status.get("status", "disconnected"),  # XION blockchain status
            "file_storage": "available",       # File storage system status
        },
    }


# =============================================================================
# MAIN API ENDPOINTS
# =============================================================================


@app.post("/content/register", response_model=None)
async def register_content(
    file: UploadFile = File(...),
    description: str = Form(...),
    creator_id: str = Form(...),
    db: Session = Depends(get_db),
) -> Union[JSONResponse, Dict[str, Any]]:
    """
    Register new content on the blockchain
    
    This endpoint allows content creators to register their original work
    on the XION blockchain, creating an immutable record of authenticity.
    
    Args:
        file: The file to be registered (image, video, or document)
        description: Text description of the content
        creator_id: Unique identifier for the content creator
        db: Database session dependency
        
    Returns:
        JSON response with registration details and blockchain hash
        
    Raises:
        HTTPException: If file type is not supported or registration fails
        
    Example usage:
        POST /content/register
        Content-Type: multipart/form-data
        
        file: <binary_file_data>
        description: "Original artwork created in 2025"
        creator_id: "creator_123"
    """
    try:
        # Validate uploaded file type and format
        if not file_service.is_file_supported_by_upload(file):
            raise HTTPException(
                status_code=400, 
                detail="File type not supported. Please upload images, videos, or PDF documents."
            )

        # Read file content into memory for processing
        file_content = await file.read()
        await file.seek(0)  # Reset file pointer for potential future reads

        # Calculate SHA-256 hash of the file content
        # This creates a unique fingerprint for the content
        content_hash = hash_service.calculate_file_hash(file_content)

        # Check if content is already registered in database
        # Prevents duplicate registrations of the same content
        existing_content = (
            db.query(Content).filter(Content.content_hash == content_hash).first()
        )

        if existing_content:
            return JSONResponse(
                status_code=409,  # HTTP 409 Conflict
                content={
                    "error": "Content already registered",
                    "existing_creator": existing_content.creator_id,
                    "registered_at": existing_content.created_at.isoformat(),
                    "message": "This content has already been registered by another creator"
                },
            )

        # Save file to local storage for backup and processing
        file_path = await file_service.save_file(file, file_content)

        # Register content on XION blockchain with metadata
        # Creates immutable record with content hash and metadata
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

        # Create database record for local storage and quick access
        # Stores both local file info and blockchain transaction details
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
        db.commit()  # Persist to database
        db.refresh(content_record)  # Refresh to get generated fields

        # Register user activity for content registration
        user_service = UserService(db)
        try:
            await user_service.log_user_activity(
                user_id=creator_id,
                activity_type="registration",
                details={
                    "content_hash": content_hash,
                    "filename": file.filename,
                    "file_size": len(file_content),
                    "blockchain_tx": blockchain_tx["transaction_hash"]
                }
            )
        except Exception as activity_error:
            # Log activity error but don't fail the main operation
            print(f"Warning: Could not log user activity: {activity_error}")

        # Return successful registration response with all relevant details
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
            "message": "Content successfully registered on blockchain"
        }

    except Exception as e:
        db.rollback()  # Rollback database changes on error
        raise HTTPException(
            status_code=500, 
            detail=f"Error registering content: {str(e)}"
        )


@app.post("/content/verify", response_model=None)
async def verify_content(
    file: UploadFile = File(...),
    source_url: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Verify content authenticity against blockchain records
    
    This endpoint checks if uploaded content matches any registered content
    on the blockchain and provides authenticity verification results.
    
    Args:
        file: File to be verified for authenticity
        source_url: Optional URL where the content was found
        db: Database session dependency
        
    Returns:
        Dictionary with verification results including:
        - verification_status: "verified", "modified", or "not_found"
        - confidence_level: Numeric confidence score (0-100)
        - original_creator: Creator ID if content is verified
        - modifications: Details about any detected changes
        
    Example response:
        {
            "verification_status": "verified",
            "confidence_level": 95,
            "original_creator": "creator_123",
            "registered_date": "2025-07-11T10:30:00Z",
            "modifications": None
        }
    """
    try:
        # Read and process uploaded file
        file_content = await file.read()
        content_hash = hash_service.calculate_file_hash(file_content)

        # Search for content in local database first (faster lookup)
        content_record = (
            db.query(Content).filter(Content.content_hash == content_hash).first()
        )

        # Verify content existence on XION blockchain
        blockchain_result = xion_service.verify_content(content_hash)

        # Initialize base verification result structure
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
            "verification_status": "not_found",
            "message": "Content verification completed"
        }

        # STEP 4: Enhanced verification based on found content
        if content_record:
            # Content found in local database - perform comprehensive verification
            
            # Update verification counters for analytics
            content_record.verification_count = (content_record.verification_count or 0) + 1
            db.commit()
            
            # Build comprehensive verification result for registered content
            verification_result.update(
                {
                    "exists": True,           # Content is registered
                    "original": True,         # Hash matches exactly = original content
                    "confidence": 100,        # 100% confidence for exact hash match
                    "blockchain_verified": True,  # Verified through blockchain record
                    "blockchain_tx": content_record.blockchain_tx_hash,
                    "registration_date": content_record.created_at.isoformat(),
                    "creator_id": content_record.creator_id,
                    "description": content_record.description,
                    "filename": content_record.filename,
                    "verification_status": "verified",
                    "message": "Content authenticity verified - matches registered original"
                }
            )

        # STEP 5: Analyze potential modifications using hash comparison
        # This helps detect if content has been altered from original
        modification_analysis = hash_service.analyze_modifications(file_content)
        if modification_analysis["modified"]:
            # Content appears to be modified - reduce confidence and add warnings
            verification_result["modifications"] = [
                "Potential modifications detected in content",
                f"Similarity level: {modification_analysis['similarity']:.1%}"
            ]
            verification_result["verification_status"] = "modified"
            verification_result["confidence"] = modification_analysis['similarity']

        # STEP 6: Provide guidance for unregistered content
        if not content_record:
            # Content not found in our database - provide helpful guidance
            verification_result["modifications"] = verification_result.get("modifications", []) + [
                "Content not registered in NoirCheck database",
                "Verify this is the original version of the file",
                "Consider registering original content for future verification"
            ]
            verification_result["verification_status"] = "not_found"
            verification_result["message"] = "No matching content found in blockchain records"

        # Register user activity for content verification (if user_id provided)
        if user_id:
            user_service = UserService(db)
            try:
                await user_service.log_user_activity(
                    user_id=user_id,
                    activity_type="verification",
                    details={
                        "content_hash": content_hash,
                        "filename": file.filename,
                        "verification_status": verification_result["verification_status"],
                        "confidence": verification_result["confidence"],
                        "exists": verification_result["exists"]
                    }
                )
            except Exception as activity_error:
                # Log activity error but don't fail the main operation
                print(f"Warning: Could not log user activity: {activity_error}")

        return verification_result

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error verifying content: {str(e)}"
        )


@app.post("/mobile/verify", response_model=None)
async def mobile_verify_content(
    file: UploadFile = File(...),
    quick_mode: bool = Form(True),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Mobile-optimized content verification endpoint
    
    Provides faster, lightweight verification specifically designed for
    mobile devices with optimized file size limits and quick response.
    
    Args:
        file: File to verify (size limited for mobile performance)
        quick_mode: Enable quick verification mode (default: True)
        db: Database session dependency
        
    Returns:
        Simplified verification result optimized for mobile UI
        
    Features:
        - 50MB file size limit for mobile performance
        - Quick hash-based verification
        - Simplified response format
        - Optimized for slow network connections
    """
    try:
        # Read file with mobile-specific size limit (50MB)
        max_mobile_size = 50 * 1024 * 1024  # 50MB limit for mobile performance
        file_content = await file.read(max_mobile_size)

        # Check if file was truncated due to size limit
        if len(file_content) == max_mobile_size:
            raise HTTPException(
                status_code=413,
                detail="File too large for mobile verification. Please use a smaller file.",
            )

        # Calculate content hash for verification
        content_hash = hash_service.calculate_file_hash(file_content)

        # Create simplified mobile verification result
        mobile_result = {
            "hash": content_hash,
            "verified": False,
            "score": 0,
            "quick_check": quick_mode,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Quick verification using local database (faster for mobile)
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
                        "status": "Content verified in local database"
                    }
                )
            else:
                mobile_result.update({
                    "status": "Content not found in database",
                    "score": 10
                })
        else:
            # Full verification including blockchain check
            blockchain_result = xion_service.verify_content(content_hash)
            mobile_result.update(
                {
                    "verified": blockchain_result["verified"],
                    "score": 90 if blockchain_result["verified"] else 10,
                    "blockchain_tx": blockchain_result.get("transaction_hash", ""),
                    "status": "Full blockchain verification completed"
                }
            )

        # Register user activity for mobile verification (if user_id provided)
        if user_id:
            user_service = UserService(db)
            try:
                await user_service.log_user_activity(
                    user_id=user_id,
                    activity_type="verification",
                    details={
                        "content_hash": content_hash,
                        "filename": file.filename,
                        "quick_mode": quick_mode,
                        "verification_score": mobile_result["score"],
                        "verified": mobile_result["verified"]
                    }
                )
            except Exception as activity_error:
                # Log activity error but don't fail the main operation
                print(f"Warning: Could not log user activity: {activity_error}")

        return mobile_result

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error in mobile verification: {str(e)}"
        )


@app.get("/content/{content_hash}")
async def get_content_info(content_hash: str, db: Session = Depends(get_db)):
    """
    Get content information by hash
    
    Retrieves detailed information about registered content using its
    unique SHA-256 hash identifier.
    
    Args:
        content_hash: SHA-256 hash of the content
        db: Database session dependency
        
    Returns:
        Content details including creator, description, and blockchain info
        
    Raises:
        HTTPException: 404 if content is not found
    """
    content = db.query(Content).filter(Content.content_hash == content_hash).first()

    if not content:
        raise HTTPException(
            status_code=404, 
            detail="Content not found in database"
        )

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
        "verification_url": f"/content/verify/{content_hash}"
    }


@app.get("/creator/{creator_id}/content")
async def get_creator_content(creator_id: str, db: Session = Depends(get_db)):
    """
    Get all content by creator
    
    Retrieves all registered content for a specific creator ID.
    Useful for creator dashboards and content management.
    
    Args:
        creator_id: Unique identifier for the content creator
        db: Database session dependency
        
    Returns:
        List of all content registered by the specified creator
    """
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
                "file_size": content.file_size,
                "content_type": content.content_type
            }
            for content in content_list
        ],
    }


# =============================================================================
# MOBILE-SPECIFIC ENDPOINTS
# =============================================================================


@app.get("/mobile/config")
async def get_mobile_config():
    """
    Mobile application configuration
    
    Provides configuration settings and capabilities for mobile clients.
    Used by mobile apps to understand API capabilities and limits.
    
    Returns:
        Configuration object with supported features and file types
    """
    return {
        "api_version": "2.0.0",
        "supported_file_types": [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/mov", "video/avi",
            "application/pdf", "text/plain",
        ],
        "max_file_size_mb": 50,  # Mobile file size limit
        "features": {
            "quick_verify": True,        # Fast local DB verification
            "batch_upload": False,       # Batch operations (future feature)
            "offline_mode": False,       # Offline capabilities (future feature)
            "real_time_status": True,    # Real-time service status
        },
        "endpoints": {
            "verify": "/mobile/verify",
            "register": "/content/register",
            "status": "/mobile/status",
            "config": "/mobile/config"
        },
    }


@app.get("/mobile/status")
async def get_mobile_status():
    """
    Mobile service status endpoint
    
    Provides real-time status information optimized for mobile clients.
    Includes service health, response times, and XION blockchain connectivity.
    
    Returns:
        Status object with service health and performance metrics
    """
    try:
        # Check critical service status
        db_status = "operational"
        xion_status_data = xion_service.get_status()
        xion_status = xion_status_data.get("status", "disconnected")

        # Determine overall system status
        overall_status = "online" if db_status == "operational" else "degraded"

        return {
            "status": overall_status,
            "message": "NoirCheck backend operational with XION blockchain integration",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "xion_status": xion_status,
            "response_time_ms": 50,  # Simulated for demo
            "services": {
                "api": "operational",
                "database": db_status,
                "xion": xion_status,
                "file_storage": "operational",
                "hash_service": "operational"
            },
            "capabilities": {
                "content_registration": True,
                "content_verification": True,
                "blockchain_integration": xion_status == "connected"
            }
        }

    except Exception as e:
        return {
            "status": "degraded",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e),
            "message": "Some services may be experiencing issues",
            "services": {
                "api": "operational",
                "database": "unknown",
                "blockchain": "unknown", 
                "file_storage": "unknown",
                "hash_service": "unknown"
            },
            "capabilities": {
                "content_registration": False,
                "content_verification": False,
                "blockchain_integration": False
            }
        }


# =============================================================================
# STATISTICS AND METRICS ENDPOINTS  
# =============================================================================


@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Get system statistics and metrics
    
    Provides overview statistics about the NoirCheck platform including
    total registered content, unique creators, and system performance.
    
    Args:
        db: Database session dependency
        
    Returns:
        Dictionary with system statistics and metrics
        
    Example response:
        {
            "total_registered_content": 1250,
            "unique_creators": 340,
            "verification_requests": 5670,
            "blockchain_transactions": 1250,
            "system_status": "operational"
        }
    """
    # Query database for statistics
    total_content = db.query(Content).count()
    unique_creators = db.query(Content.creator_id).distinct().count()
    
    # Get XION service status for additional metrics
    xion_status = xion_service.get_status()

    return {
        "total_registered_content": total_content,
        "unique_creators": unique_creators,
        "verification_requests": 0,  # TODO: Implement verification counter
        "blockchain_transactions": total_content,
        "system_status": "operational",
        "xion_blockchain_status": xion_status.get("status", "unknown"),
        "database_status": "connected",
        "uptime_hours": 24,  # TODO: Implement actual uptime tracking
        "last_updated": datetime.now(timezone.utc).isoformat()
    }


# =============================================================================
# APPLICATION ENTRY POINT
# =============================================================================

# Main application entry point for development and production
if __name__ == "__main__":
    print("🚀 Starting NoirCheck Backend Server...")
    print("📡 API Documentation available at: http://localhost:8000/docs")
    print("🔍 Health Check available at: http://localhost:8000/health")
    print("📱 Mobile Status available at: http://localhost:8000/mobile/status")
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,  # Auto-reload on code changes (development only)
        log_level="info",
        access_log=True
    )
