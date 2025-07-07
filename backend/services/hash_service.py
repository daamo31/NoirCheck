"""
Servicio de Hash y Criptografía

Este módulo maneja todo lo relacionado con el cálculo de hashes,
generación de sellos de autenticidad y comparación de contenido.
"""

import base64
import hashlib
import hmac
import secrets
from typing import Any, Dict, List, Optional, Union

from cryptography.fernet import Fernet


class HashService:
    """Servicio para manejo de hashes y criptografía"""

    def __init__(self):
        # Clave secreta para sellos de autenticidad (en producción usar variable de entorno)
        self.secret_key = b"noircheck_secret_key_2024_production"
        self.fernet_key = Fernet.generate_key()
        self.fernet = Fernet(self.fernet_key)

    def calculate_hash(self, content: Union[bytes, str]) -> str:
        """
        Calcula el hash SHA-256 de un contenido

        Args:
            content: Contenido a hashear (bytes o string)

        Returns:
            Hash hexadecimal del contenido
        """
        if isinstance(content, str):
            content = content.encode("utf-8")

        sha256_hash = hashlib.sha256()
        sha256_hash.update(content)
        return sha256_hash.hexdigest()

    def calculate_file_hash(self, file_content: bytes) -> str:
        """
        Calcula el hash SHA-256 del contenido de un archivo

        Args:
            file_content: Contenido del archivo en bytes

        Returns:
            Hash hexadecimal del contenido
        """
        sha256_hash = hashlib.sha256()
        sha256_hash.update(file_content)
        return sha256_hash.hexdigest()

    def calculate_file_hash_from_path(self, file_path: str, chunk_size: int = 8192) -> str:
        """
        Calcula el hash SHA-256 de un archivo leyéndolo por chunks desde su ruta

        Args:
            file_path: Ruta al archivo
            chunk_size: Tamaño del chunk para lectura

        Returns:
            Hash hexadecimal del archivo
        """
        sha256_hash = hashlib.sha256()

        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(chunk_size), b""):
                    sha256_hash.update(chunk)
            return sha256_hash.hexdigest()
        except FileNotFoundError:
            raise Exception(f"Archivo no encontrado: {file_path}")
        except Exception as e:
            raise Exception(f"Error al calcular hash del archivo: {str(e)}")

    def generate_authenticity_seal(
        self, content_hash: str, creator_id: str, blockchain_tx_id: str
    ) -> Dict[str, Any]:
        """
        Genera un sello de autenticidad criptográfico

        Args:
            content_hash: Hash del contenido
            creator_id: ID del creador
            blockchain_tx_id: ID de transacción blockchain

        Returns:
            Dict con información del sello de autenticidad
        """
        # Crear payload del sello
        seal_data = f"{content_hash}:{creator_id}:{blockchain_tx_id}"

        # Generar HMAC para integridad
        seal_hmac = hmac.new(
            self.secret_key, seal_data.encode("utf-8"), hashlib.sha256
        ).hexdigest()

        # Generar ID único del sello
        seal_id = self.calculate_hash(f"{seal_data}:{seal_hmac}")[:16]

        # Crear sello compacto para QR
        compact_seal = (
            base64.urlsafe_b64encode(f"{seal_id}:{seal_hmac[:16]}".encode())
            .decode()
            .rstrip("=")
        )

        return {
            "seal_id": seal_id,
            "seal_hmac": seal_hmac,
            "compact_seal": compact_seal,
            "qr_data": f"noircheck://verify/{compact_seal}",
            "verification_url": f"https://noircheck.app/verify/{content_hash}",
            "embed_code": f"<!-- NoirCheck Seal: {compact_seal} -->",
        }

    def verify_authenticity_seal(
        self,
        compact_seal: str,
        content_hash: str,
        creator_id: str,
        blockchain_tx_id: str,
    ) -> Dict[str, Any]:
        """
        Verifica un sello de autenticidad

        Args:
            compact_seal: Sello compacto a verificar
            content_hash: Hash del contenido original
            creator_id: ID del creador original
            blockchain_tx_id: ID de transacción blockchain original

        Returns:
            Dict con resultado de verificación
        """
        try:
            # Decodificar sello compacto
            decoded = base64.urlsafe_b64decode(compact_seal + "===").decode()
            seal_id, partial_hmac = decoded.split(":")

            # Recalcular sello original
            original_seal = self.generate_authenticity_seal(
                content_hash, creator_id, blockchain_tx_id
            )

            # Verificar integridad
            is_valid = (
                seal_id == original_seal["seal_id"]
                and partial_hmac == original_seal["seal_hmac"][:16]
            )

            return {
                "valid": is_valid,
                "seal_id": seal_id,
                "content_hash": content_hash if is_valid else None,
                "verification_timestamp": hashlib.sha256(
                    str(secrets.randbits(128)).encode()
                ).hexdigest()[:16],
            }

        except Exception as e:
            return {
                "valid": False,
                "error": f"Seal verification failed: {str(e)}",
            }

    def calculate_similarity(self, hash1: str, hash2: str) -> float:
        """
        Calcula la similitud entre dos hashes (simplificado)

        Args:
            hash1: Primer hash
            hash2: Segundo hash

        Returns:
            Porcentaje de similitud (0-100)
        """
        if hash1 == hash2:
            return 100.0

        # Similitud basada en caracteres comunes (método simplificado)
        # En una implementación real, se usarían técnicas más sofisticadas
        # como perceptual hashing para imágenes

        common_chars = sum(1 for a, b in zip(hash1, hash2) if a == b)
        similarity = (common_chars / len(hash1)) * 100

        return round(similarity, 2)

    def generate_content_fingerprint(self, content: bytes) -> Dict[str, str]:
        """
        Genera múltiples hashes para crear una huella digital del contenido

        Args:
            content: Contenido en bytes

        Returns:
            Dict con diferentes tipos de hash
        """
        fingerprint = {
            "sha256": hashlib.sha256(content).hexdigest(),
            "sha512": hashlib.sha512(content).hexdigest(),
            "md5": hashlib.md5(content).hexdigest(),
            "blake2b": hashlib.blake2b(content).hexdigest(),
        }

        # Hash combinado para mayor seguridad
        combined = f"{fingerprint['sha256']}:{fingerprint['blake2b']}"
        fingerprint["combined"] = hashlib.sha256(combined.encode()).hexdigest()

        return fingerprint

    def encrypt_sensitive_data(self, data: str) -> str:
        """
        Encripta datos sensibles

        Args:
            data: Datos a encriptar

        Returns:
            Datos encriptados en base64
        """
        encrypted = self.fernet.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """
        Desencripta datos sensibles

        Args:
            encrypted_data: Datos encriptados en base64

        Returns:
            Datos desencriptados
        """
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data)
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")

    def validate_hash_format(self, hash_value: str, hash_type: str = "sha256") -> bool:
        """
        Valida el formato de un hash

        Args:
            hash_value: Valor del hash a validar
            hash_type: Tipo de hash (sha256, sha512, md5, etc.)

        Returns:
            True si el formato es válido
        """
        expected_lengths = {
            "sha256": 64,
            "sha512": 128,
            "md5": 32,
            "blake2b": 128,
        }

        expected_length = expected_lengths.get(hash_type.lower())
        if not expected_length:
            return False

        return len(hash_value) == expected_length and all(
            c in "0123456789abcdef" for c in hash_value.lower()
        )

    def analyze_modifications(self, file_content: bytes) -> Dict[str, Any]:
        """
        Analiza posibles modificaciones en el contenido (simulado)

        Args:
            file_content: Contenido del archivo en bytes

        Returns:
            Diccionario con análisis de modificaciones
        """
        # En una implementación real, esto podría usar:
        # - Análisis de entropía
        # - Detección de patrones conocidos de modificación
        # - Comparación con versiones anteriores
        # - Análisis de metadatos

        # Por ahora, simulamos el análisis
        file_size = len(file_content)

        # Simulación simple: archivos muy pequeños o muy grandes tienen más probabilidad de ser modificados
        modification_probability = 0.1  # Base 10%

        if file_size < 100:  # Archivos muy pequeños
            modification_probability += 0.2
        elif file_size > 10 * 1024 * 1024:  # Archivos mayores a 10MB
            modification_probability += 0.3

        # Análisis de entropía básico
        byte_counts = {}
        for byte in file_content[:1000]:  # Analizar primeros 1000 bytes
            byte_counts[byte] = byte_counts.get(byte, 0) + 1

        # Si hay muy pocos bytes únicos, puede ser contenido generado/modificado
        unique_bytes = len(byte_counts)
        if unique_bytes < 10:
            modification_probability += 0.2

        # Simular resultado
        is_modified = modification_probability > 0.5
        similarity_score = 1.0 - modification_probability if not is_modified else modification_probability

        return {
            "modified": is_modified,
            "similarity": min(max(similarity_score, 0.0), 1.0),  # Clamp entre 0 y 1
            "analysis": {
                "file_size": file_size,
                "unique_bytes": unique_bytes,
                "modification_probability": modification_probability,
            },
        }
