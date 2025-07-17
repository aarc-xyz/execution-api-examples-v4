// API Response Types
export interface DepositAddressResponse {
  requestId: string;
  status: string;
  depositAddress: string;
  onChainID: string;
  depositTokenName?: string;
  depositTokenSymbol?: string;
  depositTokenAddress: string;
  depositTokenDecimals?: string;
  depositTokenUsdPrice?: number;
  amount: string;
  executionTime: string;
  gasFee: string;
  txData: {
    chainId: string;
    from: string;
    to: string;
    data: string;
    value: string;
    gasLimit: string;
  };
}

export interface ScheduleTransactionResponse {
  transactionId: string;
  status: string;
}

export interface ScheduleDepositAddressActivationResponse {
  status: string;
  message?: string;
}

export interface SupportedToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export interface SupportedChain {
  chainId: number;
  name: string;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
}

export interface TokenBalance {
  chainId: number;
  tokenAddress: string | null;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface BalancesResponse {
  balances: TokenBalance[];
}

// Request Types
export interface GetDepositAddressFromAmountParams {
  destinationChainId: string;
  destinationTokenAddress: string;
  fromAmount: string;
  destinationRecipient: string;
  transferType: 'onramp' | 'cex' | 'wallet';
  userId: string;
  dappId: string;
  routeType?: 'time' | 'fee' | 'value';
  fromChainId?: string;
  fromTokenAddress?: string;
  fromAddress?: string;
  slippage?: string;
  transferOut?: Array<{
    token: string;
    recipient: string;
  }>;
  calldataABI?: string;
  calldataParams?: string;
  gasLimit?: string;
}

export interface GetDepositAddressParams {
  destinationChainId: string;
  destinationTokenAddress: string;
  destinationRecipient: string;
  userId: string;
  dappId: string;
  fromChainId?: string;
  calldataABI?: string;
  calldataParams?: string;
  gasLimit?: string;
}

export interface ScheduleTransactionParams {
  amount: string;
  chainId: string;
  requestId: string;
  tokenAddress: string;
  transactionHash: string;
}

export interface ScheduleDepositAddressActivationParams {
  depositAddress: string;
  requestId: string;
  chainId: string;
  tokenAddress: string;
}

export interface GetSupportedTokensParams {
  chainId?: number;
  symbol?: string;
}

export interface GetBalancesParams {
  walletAddress: string;
} 