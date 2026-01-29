import { 
  makeContractCall, 
  broadcastTransaction, 
  uintCV 
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

async function buyItem(itemId: number) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) return;

  const txOptions = {
    contractAddress: 'ST1PQ24CH0EKEDT2R3S6A7D9D99N6B0X7FR05624W',
    contractName: 'marketplace',
    functionName: 'buy-item',
    functionArgs: [uintCV(itemId)],
    senderKey: privateKey,
    network: STACKS_TESTNET,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    console.log(`Purchase Broadcasted for Item #${itemId}:`, result);
  } catch (e) {
    console.error('Failed to buy item:', e);
  }
}

buyItem(1);
