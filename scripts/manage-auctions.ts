import { 
  makeContractCall, 
  broadcastTransaction, 
  uintCV 
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

async function manageAuction(type: 'start' | 'bid', itemId: number, amount: number, duration?: number) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) return;

  const functionName = type === 'start' ? 'start-auction' : 'place-bid';
  const functionArgs = type === 'start' 
    ? [uintCV(itemId), uintCV(amount), uintCV(duration || 144)] 
    : [uintCV(itemId), uintCV(amount)];

  const txOptions = {
    contractAddress: 'ST1PQ24CH0EKEDT2R3S6A7D9D99N6B0X7FR05624W',
    contractName: 'marketplace',
    functionName,
    functionArgs,
    senderKey: privateKey,
    network: STACKS_TESTNET,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    console.log(`Auction action (${type}) for Item #${itemId} Broadcasted:`, result);
  } catch (e) {
    console.error(`Failed to ${type} auction:`, e);
  }
}

// Example: Start auction for item 2, start price 5 STX, duration 1 day (approx 144 blocks)
manageAuction('start', 2, 5000000, 144);
