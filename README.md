# Aarc Execution API v4 Examples

This repository contains examples for integrating with the Aarc Execution API v4. The examples demonstrate how to use the new v4 endpoints and features for cross-chain token transfers and contract interactions.

## 🚀 Key Changes in v4

### Major Updates from v3 to v4

1. **New Required Parameters**
   - `dappId`: Mandatory parameter for all deposit address requests
   - `userId`: Mandatory parameter for user identification (typically user's EOA address)

2. **Updated Endpoints**
   - `/v4/deposit-address/from-amount` - For amount-based flows
   - `/v4/get-deposit-address` - For QR flows (without fromAmount)
   - `/v4/schedule-transaction` - Updated payload structure
   - `/v4/request-status/{requestId}` - New status endpoint

3. **New QR Flow Support**
   - `/v4/schedule-deposit-address-activation` - For activating deposit addresses in QR flows

4. **Updated Payload Structures**
   - Contract interactions now use `calldataABI` and `calldataParams` instead of `targetCalldata`
   - Schedule transaction payload simplified with new structure

## 📋 Prerequisites

1. **Environment Setup**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```env
   API_KEY=your_aarc_api_key
   PRIVATE_KEY=your_wallet_private_key
   RPC_URL=your_rpc_url
   ```

3. **Configuration**
   - Replace `"your-dapp-id"` in examples with your actual dapp ID
   - Update wallet addresses and contract addresses as needed

## 🔧 Examples

### 1. Mint Token Example (`src/examples/mint-token.ts`)

Demonstrates minting tokens using v4 API with contract interactions.

```typescript
// Key v4 changes:
const DAPP_ID = "your-dapp-id";
const USER_ID = DESTINATION_WALLET;

// New calldata format
const calldataABI = generateMintCallDataABI();
const calldataParams = generateMintCallDataParams(token, toAddress);

// Updated API call
const depositData = await getDepositAddressFromAmount({
  // ... other params
  userId: USER_ID,
  dappId: DAPP_ID,
  calldataABI: calldataABI,
  calldataParams: calldataParams,
});
```

### 2. Deposit into Perp Example (`src/examples/deposit-into-perp.ts`)

Shows how to deposit into perpetual trading protocols using v4 API.

### 3. Mint Stablecoin Example (`src/examples/mint-stablecoin.ts`)

Demonstrates stablecoin minting with v4 contract interaction format.

### 4. Mint NFT Example (`src/examples/mint-nft.ts`)

Shows NFT minting using the new v4 payload structure.

### 5. QR Flow Example (`src/examples/qr-flow-example.ts`)

**NEW**: Demonstrates the QR flow without fromAmount, including deposit address activation.

```typescript
// Step 1: Get deposit address without fromAmount
const depositData = await getDepositAddress({
  destinationChainId: chainId,
  destinationTokenAddress: tokenAddress,
  destinationRecipient: recipient,
  userId: USER_ID,
  dappId: DAPP_ID,
});

// Step 2: Activate deposit address
await scheduleDepositAddressActivation({
  depositAddress: depositData.depositAddress,
  requestId: depositData.requestId,
  chainId: chainId,
  tokenAddress: tokenAddress,
});
```

## 🔄 API Flow Comparison

### v3 Flow
1. Get deposit address with `targetCalldata`
2. Schedule transaction with old payload
3. Execute transaction

### v4 Flow
1. Get deposit address with `calldataABI` and `calldataParams`
2. Execute transaction first
3. Schedule transaction with new payload structure

## 📡 API Endpoints

### Amount-based Flow
```bash
curl -X GET "https://bridge-swap.aarc.xyz/v4/deposit-address/from-amount" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -G \
  -d "transferType=wallet" \
  -d "userId=0xUserAddress" \
  -d "dappId=your-dapp-id" \
  -d "destinationChainId=137" \
  -d "destinationTokenAddress=0xTokenAddress" \
  -d "fromAmount=10000000" \
  -d "destinationRecipient=0xRecipient" \
  -d "fromChainId=1" \
  -d "fromTokenAddress=0xTokenAddress" \
  -d "fromAddress=0xUserAddress"
```

### QR Flow (without fromAmount)
```bash
curl -X GET "https://bridge-swap.aarc.xyz/v4/get-deposit-address" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -G \
  -d "destinationChainId=8453" \
  -d "destinationTokenAddress=0xTokenAddress" \
  -d "destinationRecipient=0xRecipientAddress" \
  -d "userId=0xUserAddress" \
  -d "dappId=your-dapp-id" \
  -d "fromChainId=42161"
```

### Schedule Transaction (v4)
```bash
curl -X POST "https://bridge-swap.aarc.xyz/v4/schedule-transaction" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100000",
    "chainId": "8453",
    "requestId": "request-id-from-deposit-response",
    "tokenAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    "transactionHash": "0xUserTransactionHash"
  }'
```

### Deposit Address Activation (QR Flow)
```bash
curl -X POST "https://bridge-swap.aarc.xyz/v4/schedule-deposit-address-activation" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "depositAddress": "0x...",
    "requestId": "request-id",
    "chainId": "8453",
    "tokenAddress": "0xTokenAddress"
  }'
```

## 🔧 Contract Interactions

### v3 Format
```typescript
const targetCalldata = interface.encodeFunctionData("functionName", [param1, param2]);
```

### v4 Format
```typescript
const calldataABI = JSON.stringify({
  name: "functionName",
  type: "function",
  inputs: [
    { name: "param1", type: "address" },
    { name: "param2", type: "uint256" }
  ],
  outputs: [],
  stateMutability: "external"
});

const calldataParams = "param1Value,AARC"; // Use "AARC" as placeholder for amount
```

## 🚨 Important Notes

1. **Constant Deposit Addresses**: In v4, deposit addresses are constant for given `dappId`/`userId` combinations
2. **Transaction Order**: Execute transaction first, then schedule it
3. **Amount Placeholder**: Use "AARC" as placeholder for amount in `calldataParams`
4. **QR Flow**: Requires deposit address activation step
5. **Error Handling**: Enhanced error handling for duplicate requests

## 🧪 Testing

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Run examples**:
   ```bash
   # Amount-based flow
   node dist/examples/mint-token.js
   
   # QR flow
   node dist/examples/qr-flow-example.js
   ```

3. **Test both flows**:
   - Amount-based flows with `fromAmount`
   - QR flows without `fromAmount`
   - Contract interactions with new ABI/params structure

## 📚 Additional Resources

- [Aarc API Documentation](https://docs.aarc.xyz)
- [v4 Migration Guide](https://docs.aarc.xyz/migration/v3-to-v4)
- [Contract Interaction Examples](https://docs.aarc.xyz/examples/contract-interactions)

## 🤝 Support

For questions or issues:
- Check the [API Documentation](https://docs.aarc.xyz)
- Join our [Discord Community](https://discord.gg/aarc)
- Contact support at support@aarc.xyz 