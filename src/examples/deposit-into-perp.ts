import { getDepositAddress, scheduleTransaction } from '../utils/api';
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

function generateDepositCallData(
    tokenAddress: string,
    amount: string,
    userAddress: string
): string {
    // Create the contract interface with depositERC20 function
    const apexOmniInterface = new ethers.Interface([
        "function depositERC20(address _token, uint104 _amount, bytes32 _zkLinkAddress, uint8 _subAccountId, bool _mapping) external"
    ]);

    // Format the zkLink address (pad with zeros and remove 0x prefix)
    const zkLinkAddress = `0x000000000000000000000000${userAddress.slice(2)}`;

    // Generate the contract payload for depositing into Apex Omni
    return apexOmniInterface.encodeFunctionData("depositERC20", [
        tokenAddress,
        amount,
        zkLinkAddress,
        0, // subAccountId
        false
    ]);
}

async function depositIntoPerp(amount: string) {
    try {
        // Generate call data for depositing into Apex Omni
        const callData = generateDepositCallData(
            USDC.address,
            amount,
            DESTINATION_WALLET
        );

        // Get deposit address
        const depositData = await getDepositAddress({
            destinationChainId: DESTINATION_TOKEN.chainId.toString(),
            destinationTokenAddress: DESTINATION_TOKEN.address,
            toAmount: amount,
            destinationRecipient: APEX_OMNI_ADDRESS,
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
        console.error("Error in deposit process:", error);
        throw error;
    }
}

// Example usage
depositIntoPerp("1000000"); // Amount in smallest unit (6 decimals for USDC)
