# Aarc Execution API v3 to v4 Migration Guide

This guide provides a comprehensive overview of migrating from Aarc Execution API v3 to v4, including all the necessary changes, new features, and updated code examples.

## 🚨 Breaking Changes

### 1. Required New Parameters

**v3 (Old)**
```typescript
const depositData = await getDepositAddress({
  destinationChainId: "137",
  destinationTokenAddress: "0x...",
  toAmount: "1000000",
  destinationRecipient: "0x...",
  transferType: 'wallet',
  targetCalldata: callData,
});
```

**v4 (New)**
```typescript
const depositData = await getDepositAddressFromAmount({
  destinationChainId: "137",
  destinationTokenAddress: "0x...",
  fromAmount: "1000000", // Changed from toAmount
  destinationRecipient: "0x...",
  transferType: 'wallet',
  userId: "0xUserAddress", // NEW: Required
  dappId: "your-dapp-id", // NEW: Required
  calldataABI: abiString, // NEW: Instead of targetCalldata
  calldataParams: "param1,AARC", // NEW: Instead of targetCalldata
});
```

### 2. Updated Endpoints

| v3 Endpoint | v4 Endpoint | Changes |
|-------------|-------------|---------|
| `/v3/deposit-address` | `/v4/deposit-address/from-amount` | New endpoint for amount-based flows |
| `/v3/deposit-address` | `/v4/get-deposit-address` | New endpoint for QR flows |
| `/v3/schedule-transaction` | `/v4/schedule-transaction` | Updated payload structure |
| `/v3/request-status/{id}` | `/v4/request-status/{id}` | Updated response format |

### 3. New Endpoints in v4

- `/v4/schedule-deposit-address-activation` - For QR flow activation
- `/v4/get-deposit-address` - For flows without fromAmount

## 🔄 Step-by-Step Migration

### Step 1: Update API Utilities

**Before (v3):**
```typescript
// src/utils/api.ts
export async function getDepositAddress(params: GetDepositAddressParams) {
  const response = await axiosInstance.get('/v3/deposit-address', { params });
  return response.data;
}

export async function scheduleTransaction(params: ScheduleTransactionParams) {
  const response = await axiosInstance.post('/v3/schedule-transaction', params);
  return response.data;
}
```

**After (v4):**
```typescript
// src/utils/api.ts
export async function getDepositAddressFromAmount(params: GetDepositAddressFromAmountParams) {
  const response = await axiosInstance.get('/v4/deposit-address/from-amount', { params });
  return response.data;
}

export async function getDepositAddress(params: GetDepositAddressParams) {
  const response = await axiosInstance.get('/v4/get-deposit-address', { params });
  return response.data;
}

export async function scheduleTransaction(params: ScheduleTransactionParams) {
  const response = await axiosInstance.post('/v4/schedule-transaction', params);
  return response.data;
}

export async function scheduleDepositAddressActivation(params: ScheduleDepositAddressActivationParams) {
  const response = await axiosInstance.post('/v4/schedule-deposit-address-activation', params);
  return response.data;
}
```

### Step 2: Update Type Definitions

**Before (v3):**
```typescript
export interface GetDepositAddressParams {
  destinationChainId: string;
  destinationTokenAddress: string;
  toAmount: string;
  destinationRecipient: string;
  transferType: 'onramp' | 'cex' | 'wallet';
  targetCalldata?: string;
}

export interface ScheduleTransactionParams {
  requestId: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: string;
}
```

**After (v4):**
```typescript
export interface GetDepositAddressFromAmountParams {
  destinationChainId: string;
  destinationTokenAddress: string;
  fromAmount: string; // Changed from toAmount
  destinationRecipient: string;
  transferType: 'onramp' | 'cex' | 'wallet';
  userId: string; // NEW: Required
  dappId: string; // NEW: Required
  calldataABI?: string; // NEW: Instead of targetCalldata
  calldataParams?: string; // NEW: Instead of targetCalldata
}

export interface ScheduleTransactionParams {
  amount: string;
  chainId: string;
  requestId: string;
  tokenAddress: string;
  transactionHash: string; // NEW: Required
}
```

### Step 3: Update Contract Interactions

**Before (v3):**
```typescript
function generateMintCallData(token: string, toAddress: string, amount: string): string {
  const interface = new ethers.Interface([
    "function mint(address token, address to, uint256 amount) external",
  ]);
  return interface.encodeFunctionData("mint", [token, toAddress, amount]);
}

// Usage
const callData = generateMintCallData(token, toAddress, amount);
const depositData = await getDepositAddress({
  // ... other params
  targetCalldata: callData,
});
```

**After (v4):**
```typescript
function generateMintCallDataABI(): string {
  return JSON.stringify({
    name: "mint",
    type: "function",
    inputs: [
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "external"
  });
}

function generateMintCallDataParams(token: string, toAddress: string): string {
  return `${token},${toAddress},AARC`; // Use "AARC" as placeholder for amount
}

// Usage
const calldataABI = generateMintCallDataABI();
const calldataParams = generateMintCallDataParams(token, toAddress);
const depositData = await getDepositAddressFromAmount({
  // ... other params
  userId: USER_ID,
  dappId: DAPP_ID,
  calldataABI: calldataABI,
  calldataParams: calldataParams,
});
```

### Step 4: Update Transaction Flow

**Before (v3):**
```typescript
// 1. Get deposit address
const depositData = await getDepositAddress(params);

// 2. Schedule transaction
const scheduledTx = await scheduleTransaction({
  requestId: depositData.requestId,
  fromAddress: walletAddress,
  toAddress: depositData.depositAddress,
  token: tokenAddress,
  amount: amount,
});

// 3. Execute transaction
const txHash = await executeTransaction(depositData.txData);
```

**After (v4):**
```typescript
// 1. Get deposit address
const depositData = await getDepositAddressFromAmount(params);

// 2. Execute transaction FIRST
const txHash = await executeTransaction(depositData.txData);

// 3. Schedule transaction with new payload
const scheduledTx = await scheduleTransaction({
  amount: amount,
  chainId: chainId,
  requestId: depositData.requestId,
  tokenAddress: tokenAddress,
  transactionHash: txHash, // NEW: Include transaction hash
});
```

### Step 5: Add QR Flow Support (Optional)

**New QR Flow (v4):**
```typescript
// 1. Get deposit address without fromAmount
const depositData = await getDepositAddress({
  destinationChainId: chainId,
  destinationTokenAddress: tokenAddress,
  destinationRecipient: recipient,
  userId: USER_ID,
  dappId: DAPP_ID,
});

// 2. Activate deposit address (required for QR flow)
await scheduleDepositAddressActivation({
  depositAddress: depositData.depositAddress,
  requestId: depositData.requestId,
  chainId: chainId,
  tokenAddress: tokenAddress,
});

// 3. Execute and schedule as usual
const txHash = await executeTransaction(depositData.txData);
await scheduleTransaction({
  amount: "0", // Amount determined by user's deposit
  chainId: chainId,
  requestId: depositData.requestId,
  tokenAddress: tokenAddress,
  transactionHash: txHash,
});
```

## 🔧 Configuration Updates

### Environment Variables
No changes required to environment variables, but ensure you have:
```env
API_KEY=your_aarc_api_key
PRIVATE_KEY=your_wallet_private_key
RPC_URL=your_rpc_url
```

### Application Configuration
Add these constants to your application:
```typescript
const DAPP_ID = "your-dapp-id"; // Replace with your actual dapp ID
const USER_ID = userWalletAddress; // Typically user's EOA address
```

## 🧪 Testing Migration

### 1. Test Amount-based Flows
```bash
# Build and test mint token example
npm run build
node dist/examples/mint-token.js
```

### 2. Test QR Flows
```bash
# Test QR flow example
node dist/examples/qr-flow-example.js
```

### 3. Verify Contract Interactions
- Test with different contract functions
- Verify ABI and params are correctly formatted
- Check that "AARC" placeholder works correctly

## 🚨 Common Migration Issues

### Issue 1: Missing Required Parameters
**Error:** `Missing required parameter: userId`
**Solution:** Add `userId` and `dappId` to all deposit address requests.

### Issue 2: Incorrect Calldata Format
**Error:** `Invalid calldata format`
**Solution:** Replace `targetCalldata` with `calldataABI` and `calldataParams`.

### Issue 3: Wrong Transaction Order
**Error:** `Transaction not found`
**Solution:** Execute transaction before scheduling it in v4.

### Issue 4: Missing Activation for QR Flow
**Error:** `Deposit address not activated`
**Solution:** Call `scheduleDepositAddressActivation` for QR flows.

## 📊 Migration Checklist

- [ ] Update all API endpoints from `/v3/` to `/v4/`
- [ ] Add `dappId` and `userId` parameters to all requests
- [ ] Replace `targetCalldata` with `calldataABI` and `calldataParams`
- [ ] Update schedule transaction payload structure
- [ ] Change transaction execution order (execute first, then schedule)
- [ ] Add deposit address activation for QR flows
- [ ] Update error handling for new response formats
- [ ] Test both amount-based and QR flows
- [ ] Verify contract interactions work correctly
- [ ] Update documentation and examples

## 🎯 Benefits of v4

1. **Constant Deposit Addresses**: Better user experience with consistent addresses
2. **Enhanced Security**: Improved transaction validation and error handling
3. **QR Flow Support**: Flexible flows for variable amounts
4. **Simplified Payloads**: Cleaner API structure
5. **Better Tracking**: Improved request tracking with dappId/userId

## 📞 Support

If you encounter issues during migration:
1. Check the [API Documentation](https://docs.aarc.xyz)
2. Review the [v4 Examples](../README.md)
3. Join our [Discord Community](https://discord.gg/aarc)
4. Contact support at support@aarc.xyz 