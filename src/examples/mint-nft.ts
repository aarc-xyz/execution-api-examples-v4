import { getDepositAddress, scheduleTransaction } from '../utils/api';
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

function generateNFTCallData(
    toAddress: string,
    amount: string
): string {
    // Create the contract interface with mintTo function
    const simpleNFTInterface = new ethers.Interface([
        "function mintTo(address recipient, uint256 quantity) external payable"
    ]);

    // Generate the contract payload for minting to the user's address
    return simpleNFTInterface.encodeFunctionData("mintTo", [
        toAddress, // recipient: user's address
        amount // quantity: mint 1 NFT
    ]);
}

async function mintNFT(amount: string) {
    try {
        // Generate call data for NFT minting
        const callData = generateNFTCallData(
            DESTINATION_WALLET,
            amount
        );

        // Get deposit address
        const depositData = await getDepositAddress({
            destinationChainId: DESTINATION_TOKEN.chainId.toString(),
            destinationTokenAddress: DESTINATION_TOKEN.address,
            toAmount: amount,
            destinationRecipient: MINTING_CONTRACT_ADDRESS,
            transferType: 'wallet',
            targetCalldata: callData,
        });

        console.log("Deposit address received:", depositData.depositAddress);

        // Schedule the transaction
        const scheduledTx = await scheduleTransaction({
            requestId: depositData.requestId,
            fromAddress: DESTINATION_WALLET,
            toAddress: depositData.depositAddress,
            token: DESTINATION_TOKEN.address,
            amount: amount,
        });

        console.log("Transaction scheduled:", scheduledTx);

        // Execute the transaction
        const txHash = await executeTransaction(depositData.txData);
        console.log("Transaction executed with hash:", txHash);

        return txHash;
    } catch (error) {
        console.error("Error in NFT minting process:", error);
        throw error;
    }
}

// Example usage
mintNFT("1");