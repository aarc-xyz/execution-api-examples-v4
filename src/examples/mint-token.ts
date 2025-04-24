import { getDepositAddress, scheduleTransaction } from '../utils/api';
import { executeTransaction } from '../utils/execute-transaction';
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

function generateMintCallData(
  token: string,
  toAddress: string,
  amount: string
): string {
  const simpleERC20TokenInterface = new ethers.Interface([
    "function mint(address token, address to, uint256 amount) external",
  ]);

  return simpleERC20TokenInterface.encodeFunctionData("mint", [
    token,
    toAddress,
    amount,
  ]);
}

async function mintTokens(amount: string) {
  try {
    // Generate call data for minting
    const callData = generateMintCallData(
      DESTINATION_TOKEN.address,
      DESTINATION_WALLET,
      amount
    );

    // Get deposit address
    const depositData = await getDepositAddress({
      destinationChainId: DESTINATION_TOKEN.chainId.toString(),
      destinationTokenAddress: DESTINATION_TOKEN.address,
      toAmount: amount,
      destinationRecipient: DESTINATION_WALLET,
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
    console.error("Error in minting process:", error);
    throw error;
  }
}

// Example usage
mintTokens("1000000"); // Amount in smallest unit (considering 6 decimals) 