import { getDepositAddressFromAmount, scheduleTransaction } from '../utils/api';
import { executeTransaction, getWallet } from '../utils/execute-transaction';
import { ethers } from 'ethers';
import { config } from 'dotenv';

// Load environment variables
config();

const MINTING_CONTRACT_ADDRESS = "0xb5d19615088272Db49d12F317BF9481b2C236854";
const DESTINATION_WALLET = getWallet().address;
const DESTINATION_TOKEN = {
    decimals: 18, // ETH decimals
    chainId: 42161, // Arbitrum chain ID
    address: "0x0000000000000000000000000000000000000000", // ETH on Arbitrum
};

// v4 required parameters
const DAPP_ID = "your-dapp-id"; // Replace with your actual dapp ID
const USER_ID = DESTINATION_WALLET; // Using wallet address as userId

function generateNFTCallDataABI(): string {
    // Return the function ABI as a JSON string
    return JSON.stringify({
        name: "mintTo",
        type: "function",
        inputs: [
            { name: "recipient", type: "address" },
            { name: "quantity", type: "uint256" }
        ],
        outputs: [],
        stateMutability: "payable"
    });
}

function generateNFTCallDataParams(
    toAddress: string
): string {
    // Parameters as comma-separated string, using "AARC" as placeholder for amount
    return `${toAddress},AARC`;
}

async function mintNFT(amount: string) {
    try {
        // Generate call data for NFT minting using v4 format
        const calldataABI = generateNFTCallDataABI();
        const calldataParams = generateNFTCallDataParams(
            DESTINATION_WALLET
        );

        // Get deposit address using v4 API
        const depositData = await getDepositAddressFromAmount({
            destinationChainId: DESTINATION_TOKEN.chainId.toString(),
            destinationTokenAddress: DESTINATION_TOKEN.address,
            fromAmount: amount,
            destinationRecipient: MINTING_CONTRACT_ADDRESS,
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
        console.error("Error in NFT minting process:", error);
        throw error;
    }
}

// Example usage
mintNFT("1");