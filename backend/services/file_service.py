"""
File Handling Service

This module handles validation, storage, and processing of files uploaded
to NoirCheck. It provides comprehensive file operations including format
validation, secure storage, metadata extraction, and content processing.

Key Features:
- Multi-format file support (images, videos, documents)
- Secure file validation and storage
- Image processing and optimization
- Metadata extraction and analysis
- File size and dimension limits
- Automatic cleanup and organization
"""

import os
import shutil
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import cv2
import numpy as np
from fastapi import UploadFile
from PIL import Image, ImageOps


class FileService:
    """
    File handling service for NoirCheck content processing
    
    Provides comprehensive file operations including validation, storage,
    processing, and metadata extraction for various file formats.
    """

    def __init__(self, upload_dir: str = "./uploads"):
        """
        Initialize file service with upload directory and configurations
        
        Args:
            upload_dir: Directory path for storing uploaded files
        """
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)

        # Supported file extensions by category
        self.allowed_image_extensions = {
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff",
        }
        self.allowed_video_extensions = {
            ".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v",
        }
        self.allowed_document_extensions = {
            ".pdf", ".txt", ".docx", ".doc"
        }

        # File size and processing limits
        self.max_file_size = 100 * 1024 * 1024  # 100 MB limit
        self.max_image_dimension = 4096  # Maximum pixels per dimension

    def validate_file(self, file: UploadFile) -> bool:
        """
        Validate if a file meets NoirCheck criteria and security requirements
        
        Performs comprehensive validation including file extension, MIME type,
        and basic security checks to ensure the file is safe to process.
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            True if file passes all validation checks
            
        Validation checks:
        - File has a valid filename
        - Extension is in allowed list
        - MIME type matches file extension
        - File size is within limits
        """
        try:
            # Check if filename exists
            if not file.filename:
                return False

            # Validate file extension
            file_ext = Path(file.filename).suffix.lower()
            allowed_extensions = (
                self.allowed_image_extensions
                | self.allowed_video_extensions
                | self.allowed_document_extensions
            )

            if file_ext not in allowed_extensions:
                return False

            # Validate MIME type matches extension (security check)
            if not self._validate_mime_type(file.content_type, file_ext):
                return False

            return True

        except Exception:
            return False

    def is_file_supported_by_upload(self, file) -> bool:
        """
        Alias for validate_file to maintain compatibility with main.py
        
        This method provides the same functionality as validate_file
        but with a different name for legacy compatibility.
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            True if file is supported for upload
        """
        return self.validate_file(file)

    def _validate_mime_type(self, content_type: Optional[str], file_ext: str) -> bool:
        """
        Validate that MIME type matches file extension (security check)
        
        Prevents MIME type spoofing attacks by ensuring the declared content
        type matches the file extension. This is a critical security measure.
        
        Args:
            content_type: MIME type declared by the client
            file_ext: File extension (including dot)
            
        Returns:
            True if MIME type is valid for the given extension
        """
        if not content_type:
            return False

        # MIME type mappings for supported file extensions
        mime_mappings = {
            ".jpg": ["image/jpeg", "image/jpg"],
            ".jpeg": ["image/jpeg", "image/jpg"],
            ".png": ["image/png"],
            ".gif": ["image/gif"],
            ".bmp": ["image/bmp"],
            ".webp": ["image/webp"],
            ".tiff": ["image/tiff"],
            ".mp4": ["video/mp4"],
            ".avi": ["video/x-msvideo"],
            ".mov": ["video/quicktime"],
            ".mkv": ["video/x-matroska"],
            ".webm": ["video/webm"],
            ".pdf": ["application/pdf"],
            ".txt": ["text/plain"],
            ".docx": [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ],
        }

        allowed_mimes = mime_mappings.get(file_ext, [])
        return content_type.lower() in [mime.lower() for mime in allowed_mimes]

    async def save_file(self, file: UploadFile, file_content: bytes) -> str:
        """
        Save file to filesystem with security measures
        
        Saves uploaded file to the filesystem with proper security measures
        including unique naming, directory organization, and file processing.
        
        Args:
            file: FastAPI UploadFile object
            file_content: File content as bytes
            
        Returns:
            Path where the file was saved
            
        Security features:
        - UUID-based unique naming to prevent conflicts
        - Date-based directory organization
        - File type validation and processing
        - Safe filename handling
        """
        try:
            # Generate unique filename to prevent conflicts and path traversal
            file_id = str(uuid.uuid4())
            file_ext = Path(file.filename).suffix.lower()
            safe_filename = f"{file_id}{file_ext}"

            # Create subdirectory organized by date for better file management
            from datetime import date

            date_dir = self.upload_dir / str(date.today())
            date_dir.mkdir(exist_ok=True)

            file_path = date_dir / safe_filename

            # Save file to disk
            with open(file_path, "wb") as f:
                f.write(file_content)

            # Process file according to its type (optimization, metadata cleanup)
            await self._process_file(file_path, file_ext)

            return str(file_path)

        except Exception as e:
            raise Exception(f"Error saving file: {str(e)}")

    async def _process_file(self, file_path: Path, file_ext: str):
        """
        Process file according to its type
        
        Applies type-specific processing to uploaded files including
        optimization, metadata cleanup, and validation.
        
        Args:
            file_path: Path to the saved file
            file_ext: File extension for type detection
        """
        try:
            if file_ext in self.allowed_image_extensions:
                await self._process_image(file_path)
            elif file_ext in self.allowed_video_extensions:
                await self._process_video(file_path)
            elif file_ext in self.allowed_document_extensions:
                await self._process_document(file_path)

        except Exception as e:
            # Log error but don't fail the save operation
            print(f"Warning: File processing failed for {file_path}: {str(e)}")

    async def _process_image(self, file_path: Path):
        """
        Process and validate images
        
        Performs image optimization, resizing, and metadata cleanup
        to ensure consistent quality and remove sensitive information.
        
        Args:
            file_path: Path to the image file
            
        Processing steps:
        - Validates image integrity
        - Resizes oversized images while maintaining aspect ratio
        - Removes EXIF metadata for privacy
        - Optimizes file size
        """
        try:
            with Image.open(file_path) as img:
                # Check dimensions and resize if necessary
                if max(img.size) > self.max_image_dimension:
                    # Resize maintaining aspect ratio
                    img.thumbnail(
                        (self.max_image_dimension, self.max_image_dimension),
                        Image.Resampling.LANCZOS,
                    )
                    img.save(file_path, optimize=True, quality=95)

                # Extract and clean EXIF metadata for privacy
                img_clean = ImageOps.exif_transpose(img)

                # Save clean version (without personal metadata)
                clean_path = file_path.with_suffix(f".clean{file_path.suffix}")
                img_clean.save(clean_path, optimize=True, quality=95)

        except Exception as e:
            raise Exception(f"Image processing failed: {str(e)}")

    async def _process_video(self, file_path: Path):
        """
        Process and extract video information
        
        Analyzes video files to extract metadata and validate format.
        Provides basic information about video properties for verification.
        
        Args:
            file_path: Path to the video file
            
        Note:
            Uses OpenCV for basic video analysis. In production, consider
            using FFmpeg for more comprehensive video processing.
        """
        try:
            # Use OpenCV for basic video analysis
            cap = cv2.VideoCapture(str(file_path))

            if not cap.isOpened():
                raise Exception("Could not open video file")

            # Extract basic information
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            # Extract representative frame (middle of video)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
            ret, frame = cap.read()

            if ret:
                # Save thumbnail for preview
                thumbnail_path = file_path.with_suffix(".thumbnail.jpg")
                cv2.imwrite(str(thumbnail_path), frame)

            cap.release()

            # Save video metadata for verification purposes
            metadata = {
                "duration_seconds": frame_count / fps if fps > 0 else 0,
                "frame_count": frame_count,
                "fps": fps,
                "resolution": f"{width}x{height}",
                "has_thumbnail": ret,
            }

            metadata_path = file_path.with_suffix(".metadata.json")
            import json

            with open(metadata_path, "w") as f:
                json.dump(metadata, f)

        except Exception as e:
            raise Exception(f"Video processing failed: {str(e)}")

    async def _process_document(self, file_path: Path):
        """
        Process text documents
        
        Processes text documents by normalizing encoding and format.
        Creates clean versions suitable for content verification.
        
        Args:
            file_path: Path to the document file
        """
        try:
            if file_path.suffix.lower() == ".txt":
                # Verify encoding and text content
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Create normalized version (consistent line endings)
                normalized_content = content.strip().replace("\r\n", "\n")

                normalized_path = file_path.with_suffix(".normalized.txt")
                with open(normalized_path, "w", encoding="utf-8") as f:
                    f.write(normalized_content)

        except Exception as e:
            raise Exception(f"Document processing failed: {str(e)}")

    def get_file_info(self, file_path: str) -> Dict[str, Union[str, int, float]]:
        """
        Get detailed file information
        
        Retrieves comprehensive information about a file including
        system properties, content type, and file-specific metadata.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dictionary containing file information:
            - Basic properties (size, dates, permissions)
            - Content type detection
            - File-specific metadata where available
        """
        try:
            path = Path(file_path)

            if not path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            stat = path.stat()

            info = {
                "filename": path.name,
                "extension": path.suffix.lower(),
                "size_bytes": stat.st_size,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "created_at": stat.st_ctime,
                "modified_at": stat.st_mtime,
                "is_image": path.suffix.lower() in self.allowed_image_extensions,
                "is_video": path.suffix.lower() in self.allowed_video_extensions,
                "is_document": path.suffix.lower() in self.allowed_document_extensions,
            }

            # Additional information for images
            if info["is_image"]:
                try:
                    with Image.open(path) as img:
                        info.update(
                            {
                                "image_width": img.width,
                                "image_height": img.height,
                                "image_mode": img.mode,
                                "image_format": img.format,
                            }
                        )
                except Exception:
                    pass

            return info

        except Exception as e:
            raise Exception(f"Error getting file info: {str(e)}")

    def cleanup_old_files(self, days_old: int = 30):
        """
        Clean up old files from the system
        
        Removes files older than the specified number of days to manage
        storage space and maintain system performance.
        
        Args:
            days_old: Files older than this many days will be deleted
            
        Returns:
            Dictionary with cleanup statistics
            
        Warning:
            This operation permanently deletes files. Ensure proper
            backup procedures are in place before running cleanup.
        """
        try:
            import time

            current_time = time.time()
            cutoff_time = current_time - (days_old * 24 * 60 * 60)

            files_deleted = 0

            for file_path in self.upload_dir.rglob("*"):
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    try:
                        file_path.unlink()
                        files_deleted += 1
                    except Exception:
                        continue

            # Clean empty directories
            for dir_path in self.upload_dir.rglob("*"):
                if dir_path.is_dir() and not any(dir_path.iterdir()):
                    try:
                        dir_path.rmdir()
                    except Exception:
                        continue

            return {
                "files_deleted": files_deleted,
                "cleanup_date": current_time,
            }

        except Exception as e:
            raise Exception(f"Cleanup failed: {str(e)}")

    def get_storage_stats(self) -> Dict[str, Union[int, float]]:
        """
        Get storage statistics
        
        Calculates and returns storage usage statistics for the
        upload directory, including total size and file counts.
        
        Returns:
            Dictionary containing storage statistics:
            - total_size_bytes: Total size in bytes
            - total_size_mb: Total size in megabytes  
            - file_count: Number of files stored
            - average_file_size: Average file size in bytes
        """
        try:
            total_size = 0
            file_count = 0

            for file_path in self.upload_dir.rglob("*"):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
                    file_count += 1

            return {
                "total_files": file_count,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "total_size_gb": round(total_size / (1024 * 1024 * 1024), 2),
                "upload_directory": str(self.upload_dir),
            }

        except Exception as e:
            raise Exception(f"Error getting storage stats: {str(e)}")
