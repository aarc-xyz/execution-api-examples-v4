import { getDepositAddress, scheduleTransaction } from '../utils/api';
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

function generateStablecoinCallData(
    toAddress: string,
    amount: string
): string {
    // Create the contract interface with mint function
    const usdtInterface = new ethers.Interface([
        "function mint(address _destination, uint256 _amount) external"
    ]);

    // Generate the contract payload for minting USDT
    return usdtInterface.encodeFunctionData("mint", [
        toAddress, // destination: user's address
        amount // amount: amount to mint
    ]);
}

async function mintStablecoin(amount: string) {
    try {
        // Generate call data for USDT minting
        const callData = generateStablecoinCallData(
            DESTINATION_WALLET,
            amount
        );

        // Get deposit address
        const depositData = await getDepositAddress({
            destinationChainId: DESTINATION_TOKEN.chainId.toString(),
            destinationTokenAddress: DESTINATION_TOKEN.address,
            toAmount: amount,
            destinationRecipient: USDT_ADDRESS,
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
        console.error("Error in stablecoin minting process:", error);
        throw error;
    }
}

// Example usage
mintStablecoin("1000000"); // Amount in smallest unit (6 decimals for USDT)
