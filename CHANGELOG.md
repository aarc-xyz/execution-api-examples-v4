# Changelog - Aarc Execution API v3 to v4 Migration

## Version 4.0.0 - Major Migration Release

### 🚀 New Features

#### 1. **QR Flow Support**
- Added `/v4/get-deposit-address` endpoint for flows without fromAmount
- Added `/v4/schedule-deposit-address-activation` endpoint for QR flow activation
- New `qr-flow-example.ts` demonstrating QR-based transactions

#### 2. **Enhanced API Structure**
- New required parameters: `dappId` and `userId` for all deposit address requests
- Updated contract interaction format with `calldataABI` and `calldataParams`
- Simplified schedule transaction payload structure

#### 3. **Improved Transaction Flow**
- Changed transaction execution order (execute first, then schedule)
- Added transaction hash requirement in schedule transaction
- Enhanced error handling for duplicate requests

### 🔄 Breaking Changes

#### 1. **API Endpoints**
- `/v3/deposit-address` → `/v4/deposit-address/from-amount` (amount-based flows)
- `/v3/deposit-address` → `/v4/get-deposit-address` (QR flows)
- `/v3/schedule-transaction` → `/v4/schedule-transaction` (updated payload)
- `/v3/request-status/{id}` → `/v4/request-status/{id}` (updated format)

#### 2. **Required Parameters**
- **NEW**: `dappId` - Mandatory for all deposit address requests
- **NEW**: `userId` - Mandatory for user identification
- **CHANGED**: `toAmount` → `fromAmount` in amount-based flows
- **REMOVED**: `targetCalldata` → Replaced with `calldataABI` and `calldataParams`

#### 3. **Payload Structures**
- **Schedule Transaction**: New simplified structure with `transactionHash` requirement
- **Contract Interactions**: ABI and parameters now separated
- **Deposit Address**: Constant addresses for given dappId/userId combinations

### 📁 Files Modified

#### Core API Files
- `src/types/index.ts` - Updated all type definitions for v4
- `src/utils/api.ts` - Updated all API functions to use v4 endpoints

#### Example Files
- `src/examples/mint-token.ts` - Migrated to v4 with new parameters and calldata format
- `src/examples/deposit-into-perp.ts` - Updated for v4 API structure
- `src/examples/mint-stablecoin.ts` - Migrated contract interactions to v4 format
- `src/examples/mint-nft.ts` - Updated payload structure for v4

#### New Files
- `src/examples/qr-flow-example.ts` - New example demonstrating QR flow
- `src/test-migration.ts` - Test script to verify v4 migration
- `README.md` - Comprehensive documentation for v4 usage
- `MIGRATION_GUIDE.md` - Step-by-step migration guide
- `CHANGELOG.md` - This changelog

#### Configuration Files
- `package.json` - Added test script for migration verification

### 🔧 Technical Changes

#### 1. **Type Definitions**
```typescript
// NEW: Separate interfaces for amount-based and QR flows
export interface GetDepositAddressFromAmountParams {
  // ... with fromAmount, userId, dappId, calldataABI, calldataParams
}

export interface GetDepositAddressParams {
  // ... for QR flows without fromAmount
}

// UPDATED: Schedule transaction structure
export interface ScheduleTransactionParams {
  amount: string;
  chainId: string;
  requestId: string;
  tokenAddress: string;
  transactionHash: string; // NEW: Required
}

// NEW: Deposit address activation
export interface ScheduleDepositAddressActivationParams {
  depositAddress: string;
  requestId: string;
  chainId: string;
  tokenAddress: string;
}
```

#### 2. **API Functions**
```typescript
// NEW: Separate functions for different flows
export async function getDepositAddressFromAmount(params: GetDepositAddressFromAmountParams)
export async function getDepositAddress(params: GetDepositAddressParams)
export async function scheduleDepositAddressActivation(params: ScheduleDepositAddressActivationParams)
export async function getRequestStatus(requestId: string)

// UPDATED: All endpoints now use /v4/ prefix
```

#### 3. **Contract Interaction Format**
```typescript
// OLD (v3)
const targetCalldata = interface.encodeFunctionData("functionName", [param1, param2]);

// NEW (v4)
const calldataABI = JSON.stringify({ name: "functionName", ... });
const calldataParams = "param1Value,AARC"; // "AARC" as amount placeholder
```

### 🧪 Testing

#### New Test Script
- `npm run test` - Runs migration verification tests
- Tests all v4 API functions and payload structures
- Validates new required parameters and endpoints

#### Example Testing
```bash
# Build and test examples
npm run build
node dist/examples/mint-token.js
node dist/examples/qr-flow-example.js
```

### 📚 Documentation

#### New Documentation
- **README.md**: Comprehensive v4 usage guide with examples
- **MIGRATION_GUIDE.md**: Step-by-step migration instructions
- **CHANGELOG.md**: This detailed changelog

#### Updated Documentation
- All API examples updated for v4
- New QR flow documentation
- Contract interaction examples
- Error handling guidelines

### 🚨 Migration Notes

#### Critical Changes
1. **Transaction Order**: Execute transaction before scheduling in v4
2. **Required Parameters**: Must include `dappId` and `userId` in all requests
3. **Contract Interactions**: Use new ABI/params format instead of `targetCalldata`
4. **QR Flows**: Require deposit address activation step

#### Backward Compatibility
- **NOT BACKWARD COMPATIBLE**: v3 and v4 are incompatible
- **Migration Required**: All existing integrations must be updated
- **Testing Recommended**: Test thoroughly before production deployment

### 🎯 Benefits of v4

1. **Constant Deposit Addresses**: Better UX with consistent addresses
2. **Enhanced Security**: Improved validation and error handling
3. **QR Flow Support**: Flexible flows for variable amounts
4. **Simplified Payloads**: Cleaner API structure
5. **Better Tracking**: Improved request tracking with dappId/userId

### 📞 Support

For migration assistance:
- Review `MIGRATION_GUIDE.md` for step-by-step instructions
- Check `README.md` for comprehensive v4 documentation
- Run `npm run test` to verify your migration
- Contact support at support@aarc.xyz

---

**Migration Status**: ✅ Complete  
**Version**: 4.0.0  
**Release Date**: December 2024  
**Compatibility**: Breaking changes from v3 