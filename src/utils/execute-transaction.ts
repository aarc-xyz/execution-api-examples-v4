import { ethers } from 'ethers';
import { config } from 'dotenv';

// Load environment variables
config();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL!;

export function getWallet(): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

export async function executeTransaction(
  txData: {
    to: string;
    value: string;
    data: string;
    gasLimit: string;
    chainId: string;
  }
): Promise<string> {
  try {
    const wallet = getWallet();
    const tx = {
      to: txData.to,
      value: txData.value,
      data: txData.data,
      gasLimit: txData.gasLimit,
      chainId: Number(txData.chainId),
    };

    const txResponse = await wallet.sendTransaction(tx);
    return txResponse.hash;
  } catch (error) {
    console.error("Error executing transaction:", error);
    throw error;
  }
} 