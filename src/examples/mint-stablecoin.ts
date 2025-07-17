import { getDepositAddressFromAmount, scheduleTransaction } from '../utils/api';
import { executeTransaction, getWallet } from '../utils/execute-transaction';
import { ethers } from 'ethers';
import { config } from 'dotenv';

// Load environment variables
config();

const USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const DESTINATION_WALLET = getWallet().address;
const DESTINATION_TOKEN = {
    decimals: 6, // USDT decimals
    chainId: 42161, // Arbitrum chain ID
    address: USDT_ADDRESS,
};

// v4 required parameters
const DAPP_ID = "your-dapp-id"; // Replace with your actual dapp ID
const USER_ID = DESTINATION_WALLET; // Using wallet address as userId

function generateStablecoinCallDataABI(): string {
    // Return the function ABI as a JSON string
    return JSON.stringify({
        name: "mint",
        type: "function",
        inputs: [
            { name: "_destination", type: "address" },
            { name: "_amount", type: "uint256" }
        ],
        outputs: [],
        stateMutability: "external"
    });
}

function generateStablecoinCallDataParams(
    toAddress: string
): string {
    // Parameters as comma-separated string, using "AARC" as placeholder for amount
    return `${toAddress},AARC`;
}

async function mintStablecoin(amount: string) {
    try {
        // Generate call data for USDT minting using v4 format
        const calldataABI = generateStablecoinCallDataABI();
        const calldataParams = generateStablecoinCallDataParams(
            DESTINATION_WALLET
        );

        // Get deposit address using v4 API
        const depositData = await getDepositAddressFromAmount({
            destinationChainId: DESTINATION_TOKEN.chainId.toString(),
            destinationTokenAddress: DESTINATION_TOKEN.address,
            fromAmount: amount,
            destinationRecipient: USDT_ADDRESS,
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
        console.error("Error in stablecoin minting process:", error);
        throw error;
    }
}

// Example usage
mintStablecoin("1000000"); // Amount in smallest unit (6 decimals for USDT)
