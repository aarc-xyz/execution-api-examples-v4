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
export interface GetDepositAddressParams {
  destinationChainId: string;
  destinationTokenAddress: string;
  toAmount: string;
  destinationRecipient: string;
  transferType: 'onramp' | 'cex' | 'wallet';
  routeType?: 'time' | 'fee' | 'value';
  fromChainId?: string;
  fromTokenAddress?: string;
  fromAddress?: string;
  slippage?: string;
  transferOut?: Array<{
    token: string;
    recipient: string;
  }>;
  targetCalldata?: string;
  gasLimit?: string;
}

export interface ScheduleTransactionParams {
  requestId: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: string;
  scheduleTime?: string;
}

export interface GetSupportedTokensParams {
  chainId?: number;
  symbol?: string;
}

export interface GetBalancesParams {
  walletAddress: string;
} 