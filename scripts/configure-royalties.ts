import { 
  makeContractCall, 
  broadcastTransaction, 
  uintCV,
  principalCV
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

async function setRoyalty(itemId: number, creator: string, bps: number) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) return;

  const txOptions = {
    contractAddress: 'ST1PQ24CH0EKEDT2R3S6A7D9D99N6B0X7FR05624W',
    contractName: 'marketplace',
    functionName: 'set-royalty',
    functionArgs: [uintCV(itemId), principalCV(creator), uintCV(bps)],
    senderKey: privateKey,
    network: STACKS_TESTNET,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    console.log(`Royalty for Item #${itemId} set to ${bps/100}% Broadcasted:`, result);
  } catch (e) {
    console.error('Failed to set royalty:', e);
  }
}

setRoyalty(1, 'ST1SJ3DTE5DN7X54Y7D5KS9NM2S3S6VY9W2YP2H24', 500); // 5%
