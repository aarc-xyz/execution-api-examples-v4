import { getDepositAddress, scheduleDepositAddressActivation, scheduleTransaction } from '../utils/api';
import { executeTransaction, getWallet } from '../utils/execute-transaction';
import { config } from 'dotenv';

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

async function qrFlowExample() {
  try {
    console.log("Starting QR Flow Example (without fromAmount)...");

    // Step 1: Get deposit address without fromAmount (QR flow)
    const depositData = await getDepositAddress({
      destinationChainId: DESTINATION_TOKEN.chainId.toString(),
      destinationTokenAddress: DESTINATION_TOKEN.address,
      destinationRecipient: DESTINATION_WALLET,
      userId: USER_ID,
      dappId: DAPP_ID,
      fromChainId: "1", // Optional: specify source chain
    });

    console.log("Deposit address received:", depositData.depositAddress);
    console.log("Request ID:", depositData.requestId);

    // Step 2: Schedule deposit address activation (required for QR flow)
    const activationResponse = await scheduleDepositAddressActivation({
      depositAddress: depositData.depositAddress,
      requestId: depositData.requestId,
      chainId: DESTINATION_TOKEN.chainId.toString(),
      tokenAddress: DESTINATION_TOKEN.address,
    });

    console.log("Deposit address activation scheduled:", activationResponse);

    // Step 3: Execute the transaction
    const txHash = await executeTransaction(depositData.txData);
    console.log("Transaction executed with hash:", txHash);

    // Step 4: Schedule the transaction using v4 format
    // Note: In QR flow, the amount will be determined by what the user sends
    const scheduledTx = await scheduleTransaction({
      amount: "0", // Amount will be determined by user's deposit
      chainId: DESTINATION_TOKEN.chainId.toString(),
      requestId: depositData.requestId,
      tokenAddress: DESTINATION_TOKEN.address,
      transactionHash: txHash,
    });

    console.log("Transaction scheduled:", scheduledTx);

    console.log("QR Flow completed successfully!");
    console.log("User can now send any amount to:", depositData.depositAddress);

    return {
      depositAddress: depositData.depositAddress,
      requestId: depositData.requestId,
      transactionHash: txHash,
    };
  } catch (error) {
    console.error("Error in QR flow:", error);
    throw error;
  }
}

// Example usage
qrFlowExample(); 