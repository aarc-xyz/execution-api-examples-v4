import { getDepositAddressFromAmount, scheduleTransaction } from '../utils/api';
import { executeTransaction, getWallet } from '../utils/execute-transaction';
import { config } from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
config();

const DESTINATION_WALLET = "0x45c0470ef627a30efe30c06b13d883669b8fd3a8";
const DESTINATION_TOKEN = {
  decimals: 6,
  chainId: 8453,
  address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
};

// v4 required parameters
const DAPP_ID = "your-dapp-id"; // Replace with your actual dapp ID
const USER_ID = DESTINATION_WALLET; // Using wallet address as userId

function generateMintCallDataABI(): string {
  // Return the function ABI as a JSON string
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

function generateMintCallDataParams(
  token: string,
  toAddress: string
): string {
  // Parameters as comma-separated string, using "AARC" as placeholder for amount
  return `${token},${toAddress},AARC`;
}

async function mintTokens(amount: string) {
  try {
    // Generate call data for minting using v4 format
    const calldataABI = generateMintCallDataABI();
    const calldataParams = generateMintCallDataParams(
      DESTINATION_TOKEN.address,
      DESTINATION_WALLET
    );

    // Get deposit address using v4 API
    const depositData = await getDepositAddressFromAmount({
      destinationChainId: DESTINATION_TOKEN.chainId.toString(),
      destinationTokenAddress: DESTINATION_TOKEN.address,
      fromAmount: amount,
      destinationRecipient: DESTINATION_WALLET,
      transferType: 'wallet',
      userId: USER_ID,
      dappId: DAPP_ID,
      calldataABI: calldataABI,
      calldataParams: calldataParams,
    });

    console.log("Deposit address received:", depositData.depositAddress);
    console.log("Request ID:", depositData.requestId);

    // Execute the transaction first
    const txHash = await executeTransaction(depositData.txData);
    console.log("Transaction executed with hash:", txHash);

    // Schedule the transaction using v4 format
    const scheduledTx = await scheduleTransaction({
      amount: amount,
      chainId: DESTINATION_TOKEN.chainId.toString(),
      requestId: depositData.requestId,
      tokenAddress: DESTINATION_TOKEN.address,
      transactionHash: txHash,
    });

    console.log("Transaction scheduled:", scheduledTx);

    return txHash;
  } catch (error) {
    console.error("Error in minting process:", error);
    throw error;
  }
}

// Example usage
mintTokens("1000000"); // Amount in smallest unit (considering 6 decimals) 