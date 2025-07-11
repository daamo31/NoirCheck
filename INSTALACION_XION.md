# 🔗 REAL XION INSTALLATION GUIDE

## 📋 **CURRENT STATUS**
- ❌ **XION NOT INSTALLED** - Simulation only
- ✅ **Project prepared** for real integration
- 🔄 **Easy migration** from simulation

## 🚀 **XION SDK INSTALLATION**

### **1. Install XION SDK**
```bash
# Navegar al backend
cd /Users/daniel/Desktop/NoirsCheck/backend

# Activar entorno virtual
source ../venv/bin/activate

# Instalar XION SDK
pip install xion-sdk

# O desde GitHub (más actualizado)
pip install git+https://github.com/xion-global/xion-python-sdk.git
```

### **2. Additional Dependencies**
```bash
# Add to requirements.txt
echo "xion-sdk>=1.0.0" >> requirements.txt
echo "cosmpy>=0.7.0" >> requirements.txt
echo "bech32>=1.2.0" >> requirements.txt
```

### **3. Environment Variables**
```bash
# Create .env file in backend/
cat > .env << 'EOF'
# XION Configuration
XION_RPC_URL=https://rpc.xion.network
XION_API_KEY=your_actual_api_key_here
XION_NETWORK=mainnet
XION_WALLET_MNEMONIC=your_wallet_mnemonic_here
XION_CONTRACT_ADDRESS=your_contract_address_here

# zkTLS Configuration
ZKTLS_ENDPOINT=https://zktls.xion.network
ZKTLS_API_KEY=your_zktls_api_key_here
EOF
```

## 🔧 **REAL INTEGRATION CODE**

### **Replace Simulated XIONService:**

```python
import os
from xion_sdk import XionClient, XionWallet
from xion_sdk.zkTLS import ZkTLSProver
from typing import Dict, Any, Optional
from datetime import datetime

class XIONService:
    """Servicio REAL para XION zkTLS y blockchain"""
    
    def __init__(self):
        self.rpc_url = os.getenv("XION_RPC_URL")
        self.api_key = os.getenv("XION_API_KEY") 
        self.network = os.getenv("XION_NETWORK", "testnet")
        self.wallet_mnemonic = os.getenv("XION_WALLET_MNEMONIC")
        
        # Inicializar cliente XION
        self.client = XionClient(
            rpc_url=self.rpc_url,
            api_key=self.api_key
        )
        
        # Inicializar wallet
        self.wallet = XionWallet.from_mnemonic(self.wallet_mnemonic)
        
        # Inicializar zkTLS
        self.zktls_prover = ZkTLSProver(
            endpoint=os.getenv("ZKTLS_ENDPOINT"),
            api_key=os.getenv("ZKTLS_API_KEY")
        )
    
    async def check_connection(self) -> str:
        """REAL connection verification with XION"""
        try:
            status = await self.client.get_node_status()
            return "connected" if status.get("syncing") is False else "syncing"
        except Exception as e:
            print(f"XION connection error: {e}")
            return "disconnected"
    
    async def register_content_on_chain(
        self, 
        content_hash: str, 
        creator_id: str,
        timestamp: datetime,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """REAL registration on XION blockchain"""
        try:
            # Create registration transaction
            tx_data = {
                "content_hash": content_hash,
                "creator": creator_id,
                "timestamp": timestamp.isoformat(),
                "metadata": metadata
            }
            
            # Send transaction
            tx_result = await self.client.send_transaction(
                wallet=self.wallet,
                contract_address=os.getenv("XION_CONTRACT_ADDRESS"),
                method="register_content",
                data=tx_data
            )
            
            return {
                "success": True,
                "transaction_hash": tx_result.hash,
                "block_height": tx_result.height,
                "gas_used": tx_result.gas_used
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def verify_content_on_chain(self, content_hash: str) -> Dict[str, Any]:
        """REAL blockchain verification"""
        try:
            # Consultar blockchain
            result = await self.client.query_contract(
                contract_address=os.getenv("XION_CONTRACT_ADDRESS"),
                method="get_content",
                params={"hash": content_hash}
            )
            
            return {
                "verified": result is not None,
                "content_data": result,
                "transaction_hash": result.get("tx_hash") if result else None,
                "timestamp": result.get("timestamp") if result else None
            }
            
        except Exception as e:
            return {
                "verified": False,
                "error": str(e)
            }
    
    async def verify_with_zktls(self, url: str, content_hash: str) -> Dict[str, Any]:
        """Verificación REAL con zkTLS"""
        try:
            # Generar proof zkTLS
            proof = await self.zktls_prover.generate_proof(
                url=url,
                content_hash=content_hash
            )
            
            # Verificar proof
            is_valid = await self.zktls_prover.verify_proof(proof)
            
            return {
                "verified": is_valid,
                "proof": proof,
                "url": url,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "verified": False,
                "error": str(e)
            }
```

## 🔐 **CONFIGURACIÓN DE WALLET**

### **Crear Wallet XION:**
```python
# Script para generar wallet
from xion_sdk import XionWallet

# Generar nueva wallet
wallet = XionWallet.generate()
print(f"Mnemonic: {wallet.mnemonic}")
print(f"Address: {wallet.address}")

# O importar wallet existente
wallet = XionWallet.from_mnemonic("your twelve word mnemonic phrase here")
```

## 🌐 **ENDPOINTS DE XION**

### **Mainnet:**
- RPC: `https://rpc.xion.network`
- API: `https://api.xion.network`
- Explorer: `https://explorer.xion.network`

### **Testnet:**
- RPC: `https://rpc-testnet.xion.network`
- API: `https://api-testnet.xion.network`
- Explorer: `https://explorer-testnet.xion.network`

## 📝 **PASOS PARA MIGRAR**

### **1. Backup del código actual**
```bash
cp backend/services/xion_service.py backend/services/xion_service_simulado.py
```

### **2. Instalar SDK**
```bash
pip install xion-sdk cosmpy bech32
```

### **3. Configurar variables de entorno**
```bash
# Editar .env con tus credenciales reales
nano backend/.env
```

### **4. Reemplazar código simulado**
- Usar el código real proporcionado arriba
- Mantener la misma interfaz para compatibilidad

### **5. Probar conexión**
```bash
cd backend
python -c "
from services.xion_service import XIONService
import asyncio

async def test():
    xion = XIONService()
    status = await xion.check_connection()
    print(f'XION Status: {status}')

asyncio.run(test())
"
```

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **Costos:**
- 💰 Transacciones en mainnet tienen costo
- 🆓 Testnet es gratuito para desarrollo
- 📊 Estimar gas fees antes de producción

### **Seguridad:**
- 🔐 **NUNCA** commitear mnemonic en Git
- 🔑 Usar variables de entorno para credenciales
- 🛡️ Validar todas las entradas

### **Performance:**
- ⚡ zkTLS puede tardar varios segundos
- 🔄 Implementar timeouts y reintentos
- 📈 Considerar cache para consultas frecuentes

## 🎯 **¿QUIERES QUE INSTALE XION REAL AHORA?**

**Opciones:**
1. **🚀 Instalar ahora** - Migración completa a XION real
2. **📝 Solo documentar** - Mantener simulación por ahora
3. **🔀 Modo híbrido** - XION real + fallback a simulación

**¿Cuál prefieres?**
