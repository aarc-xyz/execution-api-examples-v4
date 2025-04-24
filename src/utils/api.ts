import axios from 'axios';
import { config } from 'dotenv';
import {
  DepositAddressResponse,
  ScheduleTransactionResponse,
  SupportedToken,
  SupportedChain,
  BalancesResponse,
  GetDepositAddressParams,
  ScheduleTransactionParams,
  GetSupportedTokensParams,
  GetBalancesParams
} from '../types';

// Load environment variables
config();

const API_KEY = process.env.API_KEY!;
const BASE_URL = 'https://bridge-swap.aarc.xyz';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
});

export async function getDepositAddress(params: GetDepositAddressParams): Promise<DepositAddressResponse> {
  try {
    const response = await axiosInstance.get('/v3/deposit-address', {
      params
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get deposit address');
    }
    throw error;
  }
}

export async function scheduleTransaction(params: ScheduleTransactionParams): Promise<ScheduleTransactionResponse> {
  try {
    const response = await axiosInstance.post('/v3/schedule-transaction', params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to schedule transaction');
    }
    throw error;
  }
}

export async function getSupportedTokens(params?: GetSupportedTokensParams): Promise<SupportedToken[]> {
  try {
    const response = await axiosInstance.get('/v3/supported-tokens', {
      params
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get supported tokens');
    }
    throw error;
  }
}

export async function getSupportedChains(): Promise<SupportedChain[]> {
  try {
    const response = await axiosInstance.get('/v3/supported-chains');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get supported chains');
    }
    throw error;
  }
}

export async function getBalances(params: GetBalancesParams): Promise<BalancesResponse> {
  try {
    const response = await axiosInstance.get(`/bridge-swap/balances/${params.walletAddress}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get balances');
    }
    throw error;
  }
} 