import { getDepositAddressFromAmount, scheduleTransaction } from '../utils/api';
import { executeTransaction, getWallet } from '../utils/execute-transaction';
import { ethers } from 'ethers';
import { config } from 'dotenv';

// Load environment variables
config();

const APEX_OMNI_ADDRESS = '0x3169844a120C0f517B4eB4A750c08d8518C8466a';
const USDC = {
    symbol: 'USDC',
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
};

const DESTINATION_WALLET = getWallet().address;
const DESTINATION_TOKEN = {
    decimals: USDC.decimals,
    chainId: 42161, // Arbitrum chain ID
    address: USDC.address,
};

// v4 required parameters
const DAPP_ID = "your-dapp-id"; // Replace with your actual dapp ID
const USER_ID = DESTINATION_WALLET; // Using wallet address as userId

function generateDepositCallDataABI(): string {
    // Return the function ABI as a JSON string
    return JSON.stringify({
        name: "depositERC20",
        type: "function",
        inputs: [
            { name: "_token", type: "address" },
            { name: "_amount", type: "uint104" },
            { name: "_zkLinkAddress", type: "bytes32" },
            { name: "_subAccountId", type: "uint8" },
            { name: "_mapping", type: "bool" }
        ],
        outputs: [],
        stateMutability: "external"
    });
}

function generateDepositCallDataParams(
    tokenAddress: string,
    userAddress: string
): string {
    // Format the zkLink address (pad with zeros and remove 0x prefix)
    const zkLinkAddress = `0x000000000000000000000000${userAddress.slice(2)}`;
    
    // Parameters as comma-separated string, using "AARC" as placeholder for amount
    return `${tokenAddress},AARC,${zkLinkAddress},0,false`;
}

async function depositIntoPerp(amount: string) {
    try {
        // Generate call data for depositing into Apex Omni using v4 format
        const calldataABI = generateDepositCallDataABI();
        const calldataParams = generateDepositCallDataParams(
            USDC.address,
            DESTINATION_WALLET
        );

        // Get deposit address using v4 API
        const depositData = await getDepositAddressFromAmount({
            destinationChainId: DESTINATION_TOKEN.chainId.toString(),
            destinationTokenAddress: DESTINATION_TOKEN.address,
            fromAmount: amount,
            destinationRecipient: APEX_OMNI_ADDRESS,
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
        console.error("Error in deposit process:", error);
        throw error;
    }
}

// Example usage
depositIntoPerp("1000000"); // Amount in smallest unit (6 decimals for USDC)
