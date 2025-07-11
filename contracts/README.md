# NoirCheck Content Registry Smart Contract

This directory contains the smart contract code for NoirCheck's content registry system, based on XION's User Map pattern.

## Contract Overview

The **Content Registry Contract** is a CosmWasm smart contract that stores content authenticity records on the XION blockchain. It's designed specifically for NoirCheck's content verification needs.

### Features

- **Content Hash Storage**: Stores SHA-256 hashes of registered content
- **Creator Tracking**: Links content to creator's XION address
- **Metadata Support**: Stores filename, description, and file information
- **Verification Analytics**: Tracks verification counts and timestamps
- **Gasless Transactions**: Works with Treasury contract for fee grants

## Contract Structure

```rust
// Simplified structure - full implementation needed
pub struct ContentRecord {
    pub content_hash: String,
    pub creator_address: Addr,
    pub timestamp: Timestamp,
    pub metadata: ContentMetadata,
    pub verification_count: u64,
    pub last_verified: Option<Timestamp>,
}

pub struct ContentMetadata {
    pub filename: Option<String>,
    pub description: Option<String>,
    pub file_size: Option<u64>,
    pub content_type: Option<String>,
    pub noircheck_version: String,
}
```

## Messages

### Execute Messages
- `RegisterContent`: Register new content with hash and metadata
- `UpdateMetadata`: Update content metadata (creator only)
- `IncrementVerification`: Track verification attempts

### Query Messages
- `GetContent`: Retrieve content record by hash
- `GetCreatorContent`: Get all content for a creator
- `GetVerificationStats`: Get verification statistics

## Deployment

For development, use XION Quick Launch to deploy:

1. Go to https://quickstart.dev.testnet.burnt.com
2. Select "Custom Contract" template
3. Deploy Content Registry + Treasury contracts
4. Configure NoirCheck frontend with contract addresses

## Development

```bash
# For custom contract development (advanced)
git clone https://github.com/burnt-labs/contracts
cd contracts/contracts/user_map
# Adapt for NoirCheck content registry needs
```

## Integration

The contract integrates with NoirCheck via:
- `XIONContractService` (frontend/src/services/xionContract.ts)
- `useXIONContract` hook (frontend/src/hooks/useXIONContract.ts)
- Treasury contract for gasless transactions

## Security

- Only content creators can update their metadata
- Content hashes are immutable once registered
- All transactions are recorded on XION blockchain
- Supports XION's Meta Account authentication
