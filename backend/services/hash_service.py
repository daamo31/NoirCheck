"""
Hash and Cryptography Service

This module handles everything related to hash calculation, authenticity 
seal generation, and content comparison for the NoirCheck platform.

Key Features:
- SHA-256 hash calculation for content fingerprinting
- HMAC-based authenticity seals for verification
- Fernet encryption for sensitive data
- Content modification analysis and similarity detection
- Secure random token generation for unique identifiers

Security Standards:
- Uses SHA-256 for cryptographic hashing (FIPS 140-2 approved)
- HMAC for message authentication codes
- Fernet (AES 128 in CBC mode) for symmetric encryption
- Cryptographically secure random number generation
"""

import base64
import hashlib
import hmac
import secrets
from typing import Any, Dict, List, Optional, Union

from cryptography.fernet import Fernet


class HashService:
    """
    Hash and cryptography service for content authenticity verification
    
    This service provides cryptographic operations necessary for content
    verification, including hashing, signing, and encryption capabilities.
    """

    def __init__(self):
        """
        Initialize the hash service with cryptographic keys
        
        Sets up secret keys for HMAC authentication and Fernet encryption.
        In production, these keys should be loaded from environment variables.
        """
        # Secret key for authenticity seals (use environment variable in production)
        self.secret_key = b"noircheck_secret_key_2024_production"
        
        # Generate Fernet key for symmetric encryption
        self.fernet_key = Fernet.generate_key()
        self.fernet = Fernet(self.fernet_key)

    def calculate_hash(self, content: Union[bytes, str]) -> str:
        """
        Calculate SHA-256 hash of content
        
        Computes a cryptographic hash of the provided content using SHA-256
        algorithm, which provides a unique fingerprint for the content.
        
        Args:
            content: Content to hash (bytes or string)
            
        Returns:
            Hexadecimal representation of the SHA-256 hash
            
        Example:
            >>> service = HashService()
            >>> service.calculate_hash("Hello World")
            'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
        """
        if isinstance(content, str):
            content = content.encode("utf-8")

        sha256_hash = hashlib.sha256()
        sha256_hash.update(content)
        return sha256_hash.hexdigest()

    def calculate_file_hash(self, file_content: bytes) -> str:
        """
        Calculate SHA-256 hash of file content
        
        Specialized method for hashing file content, optimized for binary data.
        This is the primary method used for content registration and verification.
        
        Args:
            file_content: File content as bytes
            
        Returns:
            Hexadecimal representation of the SHA-256 hash of the file
            
        Usage:
            This method is called during content registration and verification
            to create a unique fingerprint for uploaded files.
        """
        sha256_hash = hashlib.sha256()
        sha256_hash.update(file_content)
        return sha256_hash.hexdigest()

    def calculate_file_hash_from_path(self, file_path: str, chunk_size: int = 8192) -> str:
        """
        Calculate SHA-256 hash of a file by reading it in chunks from disk
        
        Memory-efficient method for hashing large files by reading them
        in chunks rather than loading the entire file into memory.
        
        Args:
            file_path: Path to the file on disk
            chunk_size: Size of chunks to read at a time (default: 8KB)

        Returns:
            Hexadecimal hash of the file content
            
        Raises:
            Exception: If file is not found or cannot be read
            
        Usage:
            Useful for hashing large files without loading them entirely into memory.
            Preferred method for processing uploaded files in production.
        """
        sha256_hash = hashlib.sha256()

        try:
            with open(file_path, "rb") as f:
                # Read file in chunks to handle large files efficiently
                for chunk in iter(lambda: f.read(chunk_size), b""):
                    sha256_hash.update(chunk)
            return sha256_hash.hexdigest()
        except FileNotFoundError:
            raise Exception(f"File not found: {file_path}")
        except Exception as e:
            raise Exception(f"Error calculating file hash: {str(e)}")

    def generate_authenticity_seal(
        self, content_hash: str, creator_id: str, blockchain_tx_id: str
    ) -> Dict[str, Any]:
        """
        Generate cryptographic authenticity seal
        
        Creates a tamper-proof authenticity seal that can be used to verify
        the integrity and origin of content. The seal includes HMAC signature
        and can be embedded in QR codes for easy verification.
        
        Args:
            content_hash: SHA-256 hash of the content
            creator_id: Unique identifier of the content creator
            blockchain_tx_id: Blockchain transaction ID for the registration
            
        Returns:
            Dictionary containing seal information:
            - seal_id: Unique identifier for the seal
            - hmac_signature: HMAC signature for integrity verification
            - compact_seal: Shortened version suitable for QR codes
            - verification_url: URL for online seal verification
            
        Example:
            >>> seal = service.generate_authenticity_seal(
            ...     "abc123...", "creator_001", "tx_456789"
            ... )
            >>> print(seal['seal_id'])
            'a1b2c3d4e5f6g7h8'
        """
        # Create seal payload with all relevant information
        seal_data = f"{content_hash}:{creator_id}:{blockchain_tx_id}"

        # Generate HMAC signature for integrity verification
        # Uses SHA-256 as the hash function for the HMAC
        seal_hmac = hmac.new(
            self.secret_key, seal_data.encode("utf-8"), hashlib.sha256
        ).hexdigest()

        # Generate unique seal ID (first 16 characters of hash)
        seal_id = self.calculate_hash(f"{seal_data}:{seal_hmac}")[:16]

        # Create compact seal for QR code embedding (space-efficient format)
        compact_seal = (
            base64.urlsafe_b64encode(f"{seal_id}:{seal_hmac[:16]}".encode())
            .decode()
            .rstrip("=")  # Remove padding for cleaner QR codes
        )

        return {
            "seal_id": seal_id,
            "seal_hmac": seal_hmac,
            "compact_seal": compact_seal,
            "qr_data": f"noircheck://verify/{compact_seal}",
            "verification_url": f"https://noircheck.app/verify/{content_hash}",
            "embed_code": f"<!-- NoirCheck Seal: {compact_seal} -->",
            "creation_timestamp": base64.urlsafe_b64encode(
                str(int(hashlib.sha256(seal_data.encode()).hexdigest()[:8], 16)).encode()
            ).decode().rstrip("=")
        }

    def verify_authenticity_seal(
        self,
        compact_seal: str,
        content_hash: str,
        creator_id: str,
        blockchain_tx_id: str,
    ) -> Dict[str, Any]:
        """
        Verify authenticity seal integrity and authenticity
        
        Validates a given authenticity seal against the provided content
        information to determine if the seal is valid and hasn't been tampered with.
        
        Args:
            compact_seal: Compact seal to verify (from QR code or embed)
            content_hash: Expected SHA-256 hash of the content
            creator_id: Expected creator ID
            blockchain_tx_id: Expected blockchain transaction ID
            
        Returns:
            Dictionary containing verification results:
            - valid: Boolean indicating if seal is valid
            - seal_verified: Boolean indicating HMAC verification status
            - message: Human-readable verification result
            - confidence_score: Numeric confidence (0-100)
            
        Example:
            >>> result = service.verify_authenticity_seal(
            ...     compact_seal, content_hash, creator_id, tx_id
            ... )
            >>> print(f"Valid: {result['valid']}, Score: {result['confidence_score']}")
            Valid: True, Score: 95
        """
        try:
            # Recreate the original seal data for comparison
            # Decode the compact seal to extract seal ID and partial HMAC
            decoded = base64.urlsafe_b64decode(compact_seal + "===").decode()
            seal_id, partial_hmac = decoded.split(":")

            # Regenerate the original seal using provided parameters
            original_seal = self.generate_authenticity_seal(
                content_hash, creator_id, blockchain_tx_id
            )

            # Verify seal integrity by comparing IDs and HMAC signatures
            is_valid = (
                seal_id == original_seal["seal_id"]
                and partial_hmac == original_seal["seal_hmac"][:16]
            )

            return {
                "valid": is_valid,
                "seal_verified": is_valid,
                "message": "Authenticity seal verified successfully" if is_valid else "Authenticity seal verification failed",
                "confidence_score": 95 if is_valid else 0,
                "seal_id": seal_id,
                "content_hash": content_hash if is_valid else None,
                "original_creator": creator_id if is_valid else None,
                "verification_timestamp": hashlib.sha256(
                    str(secrets.randbits(128)).encode()
                ).hexdigest()[:16],
            }

        except Exception as e:
            return {
                "valid": False,
                "seal_verified": False,
                "error": f"Seal verification failed: {str(e)}",
                "confidence_score": 0,
                "message": "Error occurred during seal verification"
            }

    def calculate_similarity(self, hash1: str, hash2: str) -> float:
        """
        Calculate similarity between two hashes (simplified implementation)
        
        Computes a basic similarity score between two hash strings.
        This is a simplified implementation; production systems would use
        more sophisticated techniques like perceptual hashing for images.
        
        Args:
            hash1: First hash string to compare
            hash2: Second hash string to compare
            
        Returns:
            Similarity percentage (0-100), where 100 is identical            Note:
            For content verification, exact hash matches (100% similarity)
            indicate identical content. Lower similarity may indicate
            content modifications or different content entirely.
        """
        if hash1 == hash2:
            return 100.0

        # Calculate similarity based on common characters (simplified method)
        # In a real implementation, more sophisticated techniques would be used
        # such as perceptual hashing for images or fuzzy hashing for documents
        common_chars = sum(1 for a, b in zip(hash1, hash2) if a == b)
        similarity = (common_chars / len(hash1)) * 100

        return round(similarity, 2)

    def generate_content_fingerprint(self, content: bytes) -> Dict[str, str]:
        """
        Generate multiple hashes to create a comprehensive content fingerprint
        
        Creates a multi-hash fingerprint using different algorithms to provide
        enhanced security and verification capabilities. Each algorithm has
        different strengths and resistance to various attack vectors.
        
        Args:
            content: Content as bytes to fingerprint
            
        Returns:
            Dictionary containing multiple hash types:
            - sha256: Primary hash (most commonly used)
            - sha512: Extended hash for higher security
            - md5: Legacy hash (for compatibility)
            - blake2b: Modern fast hash algorithm
            - combined: Composite hash for enhanced security
            
        Security Note:
            SHA-256 is the primary hash used for blockchain registration.
            MD5 is included only for legacy compatibility and should not
            be used for security-critical operations.
        """
        fingerprint = {
            "sha256": hashlib.sha256(content).hexdigest(),      # Primary hash
            "sha512": hashlib.sha512(content).hexdigest(),      # Extended security
            "md5": hashlib.md5(content).hexdigest(),            # Legacy compatibility
            "blake2b": hashlib.blake2b(content).hexdigest(),    # Modern fast hash
        }

        # Generate combined hash for enhanced security
        # Combines SHA-256 and BLAKE2b for additional protection
        combined = f"{fingerprint['sha256']}:{fingerprint['blake2b']}"
        fingerprint["combined"] = hashlib.sha256(combined.encode()).hexdigest()

        return fingerprint

    def encrypt_sensitive_data(self, data: str) -> str:
        """
        Encrypt sensitive data using Fernet symmetric encryption
        
        Provides secure encryption for sensitive data that needs to be stored
        or transmitted securely. Uses AES 128 in CBC mode with HMAC for integrity.
        
        Args:
            data: String data to encrypt
            
        Returns:
            Base64-encoded encrypted data
            
        Security Note:
            The encrypted data includes an HMAC for integrity verification.
            Fernet automatically handles IV generation and key management.
        """
        encrypted = self.fernet.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """
        Decrypt sensitive data encrypted with encrypt_sensitive_data
        
        Decrypts data that was previously encrypted using the same service instance.
        Automatically verifies integrity using the embedded HMAC.
        
        Args:
            encrypted_data: Base64-encoded encrypted data
            
        Returns:
            Original decrypted string data
            
        Raises:
            Exception: If decryption fails due to invalid data or wrong key
        """
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data)
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")

    def validate_hash_format(self, hash_value: str, hash_type: str = "sha256") -> bool:
        """
        Validate hash format and length
        
        Checks if a hash string has the correct format and length for the
        specified hash algorithm. Useful for input validation.
        
        Args:
            hash_value: Hash string to validate
            hash_type: Hash algorithm type (sha256, sha512, md5, blake2b)
            
        Returns:
            True if hash format is valid for the specified type
            
        Supported hash types:
            - sha256: 64 hexadecimal characters
            - sha512: 128 hexadecimal characters  
            - md5: 32 hexadecimal characters
            - blake2b: 128 hexadecimal characters
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

        # Check length and ensure all characters are valid hexadecimal
        return len(hash_value) == expected_length and all(
            c in "0123456789abcdef" for c in hash_value.lower()
        )

    def analyze_modifications(self, file_content: bytes) -> Dict[str, Any]:
        """
        Analyze potential content modifications (simulated implementation)
        
        Performs basic analysis to detect potential modifications in content.
        This is a simplified implementation for demonstration purposes.
        
        In a production system, this would include:
        - Entropy analysis for detecting compression/encryption
        - Known modification pattern detection
        - Metadata analysis for digital fingerprints
        - Comparison with known original versions
        - Advanced forensic techniques
        
        Args:
            file_content: File content as bytes to analyze
            
        Returns:
            Dictionary with modification analysis results:
            - modified: Boolean indicating if modifications detected
            - similarity: Confidence score (0-1) for content authenticity
            - analysis: Detailed analysis metrics
            
        Note:
            This is a simulation for development purposes. Production
            implementations would use sophisticated forensic techniques.
        """
        # SIMULATION: Analyze potential modifications for demo purposes
        file_size = len(file_content)

        # Start with base modification probability (10% chance)
        modification_probability = 0.1

        # HEURISTIC 1: Size-based analysis
        # Very small files are more likely to be modified (test data)
        if file_size < 100:  # Very small files
            modification_probability += 0.2
        # Very large files might have compression artifacts
        elif file_size > 10 * 1024 * 1024:  # Files larger than 10MB
            modification_probability += 0.3

        # HEURISTIC 2: Basic entropy analysis (simplified)
        # Calculate byte frequency distribution to detect patterns
        byte_counts = {}
        sample_size = min(1000, len(file_content))  # Analyze first 1000 bytes
        for byte in file_content[:sample_size]:
            byte_counts[byte] = byte_counts.get(byte, 0) + 1

        # Low byte diversity might indicate generated/modified content
        unique_bytes = len(byte_counts)
        if unique_bytes < 10:
            modification_probability += 0.2

        # Determine final result
        is_modified = modification_probability > 0.5
        similarity_score = 1.0 - modification_probability if not is_modified else modification_probability

        return {
            "modified": is_modified,
            "similarity": min(max(similarity_score, 0.0), 1.0),  # Clamp between 0 and 1
            "confidence_level": int((1.0 - modification_probability) * 100),
            "analysis": {
                "file_size": file_size,
                "unique_bytes": unique_bytes,
                "modification_probability": modification_probability,
            },
        }
