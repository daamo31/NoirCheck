"""
Servicio de Manejo de Archivos

Este módulo maneja la validación, almacenamiento y procesamiento
de archivos subidos a NoirCheck.
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
    """Servicio para manejo de archivos"""

    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)

        # Configuraciones de archivos permitidos
        self.allowed_image_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".tiff",
        }
        self.allowed_video_extensions = {
            ".mp4",
            ".avi",
            ".mov",
            ".mkv",
            ".webm",
            ".m4v",
        }
        self.allowed_document_extensions = {".pdf", ".txt", ".docx", ".doc"}

        self.max_file_size = 100 * 1024 * 1024  # 100 MB
        self.max_image_dimension = 4096  # píxeles

    def validate_file(self, file: UploadFile) -> bool:
        """
        Valida si un archivo cumple con los criterios de NoirCheck

        Args:
            file: Archivo subido de FastAPI

        Returns:
            True si el archivo es válido
        """
        try:
            # Verificar nombre de archivo
            if not file.filename:
                return False

            # Verificar extensión
            file_ext = Path(file.filename).suffix.lower()
            allowed_extensions = (
                self.allowed_image_extensions
                | self.allowed_video_extensions
                | self.allowed_document_extensions
            )

            if file_ext not in allowed_extensions:
                return False

            # Verificar tipo MIME
            if not self._validate_mime_type(file.content_type, file_ext):
                return False

            return True

        except Exception:
            return False


    def is_file_supported_by_upload(self, file) -> bool:
        """
        Alias para validate_file para compatibilidad con main.py
        """
        return self.validate_file(file)

    def _validate_mime_type(self, content_type: Optional[str], file_ext: str) -> bool:
        """Valida que el tipo MIME coincida con la extensión"""
        if not content_type:
            return False

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
        Guarda un archivo en el sistema de archivos

        Args:
            file: Archivo de FastAPI
            file_content: Contenido del archivo en bytes

        Returns:
            Ruta donde se guardó el archivo
        """
        try:
            # Generar nombre único
            file_id = str(uuid.uuid4())
            file_ext = Path(file.filename).suffix.lower()
            safe_filename = f"{file_id}{file_ext}"

            # Crear subdirectorio por fecha
            from datetime import date

            date_dir = self.upload_dir / str(date.today())
            date_dir.mkdir(exist_ok=True)

            file_path = date_dir / safe_filename

            # Guardar archivo
            with open(file_path, "wb") as f:
                f.write(file_content)

            # Procesar archivo según tipo
            await self._process_file(file_path, file_ext)

            return str(file_path)

        except Exception as e:
            raise Exception(f"Error saving file: {str(e)}")

    async def _process_file(self, file_path: Path, file_ext: str):
        """Procesa el archivo según su tipo"""
        try:
            if file_ext in self.allowed_image_extensions:
                await self._process_image(file_path)
            elif file_ext in self.allowed_video_extensions:
                await self._process_video(file_path)
            elif file_ext in self.allowed_document_extensions:
                await self._process_document(file_path)

        except Exception as e:
            # Log del error pero no fallar el guardado
            print(f"Warning: File processing failed for {file_path}: {str(e)}")

    async def _process_image(self, file_path: Path):
        """Procesa y valida imágenes"""
        try:
            with Image.open(file_path) as img:
                # Verificar dimensiones
                if max(img.size) > self.max_image_dimension:
                    # Redimensionar manteniendo aspecto
                    img.thumbnail(
                        (self.max_image_dimension, self.max_image_dimension),
                        Image.Resampling.LANCZOS,
                    )
                    img.save(file_path, optimize=True, quality=95)

                # Extraer y limpiar metadatos EXIF
                img_clean = ImageOps.exif_transpose(img)

                # Guardar versión limpia (sin metadatos personales)
                clean_path = file_path.with_suffix(f".clean{file_path.suffix}")
                img_clean.save(clean_path, optimize=True, quality=95)

        except Exception as e:
            raise Exception(f"Image processing failed: {str(e)}")

    async def _process_video(self, file_path: Path):
        """Procesa y extrae información de videos"""
        try:
            # Usar OpenCV para análisis básico de video
            cap = cv2.VideoCapture(str(file_path))

            if not cap.isOpened():
                raise Exception("Could not open video file")

            # Extraer información básica
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            # Extraer frame representativo (medio del video)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
            ret, frame = cap.read()

            if ret:
                # Guardar thumbnail
                thumbnail_path = file_path.with_suffix(".thumbnail.jpg")
                cv2.imwrite(str(thumbnail_path), frame)

            cap.release()

            # Guardar metadatos de video
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
        """Procesa documentos de texto"""
        try:
            if file_path.suffix.lower() == ".txt":
                # Verificar encoding y contenido de texto
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Crear versión normalizada
                normalized_content = content.strip().replace("\r\n", "\n")

                normalized_path = file_path.with_suffix(".normalized.txt")
                with open(normalized_path, "w", encoding="utf-8") as f:
                    f.write(normalized_content)

        except Exception as e:
            raise Exception(f"Document processing failed: {str(e)}")

    def get_file_info(self, file_path: str) -> Dict[str, Union[str, int, float]]:
        """
        Obtiene información detallada de un archivo

        Args:
            file_path: Ruta al archivo

        Returns:
            Dict con información del archivo
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

            # Información adicional para imágenes
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
        Limpia archivos antiguos del sistema

        Args:
            days_old: Archivos más antiguos que estos días serán eliminados
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

            # Limpiar directorios vacíos
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
        """Obtiene estadísticas de almacenamiento"""
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
