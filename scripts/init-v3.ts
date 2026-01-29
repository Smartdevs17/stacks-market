
import { 
  makeContractCall, 
  broadcastTransaction, 
  uintCV
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

async function initV3() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY missing");
    return;
  }

  const txOptions = {
    contractAddress: 'ST1PQ24CH0EKEDT2R3S6A7D9D99N6B0X7FR05624W',
    contractName: 'marketplace-v3',
    functionName: 'create-auction',
    functionArgs: [
        uintCV(1),    // ID
        uintCV(1000), // Start Price
        uintCV(500),  // Reserve Price
        uintCV(100),  // Duration
        uintCV(5)     // Decay Rate
    ],
    senderKey: privateKey,
    network: STACKS_TESTNET,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    console.log('Marketplace V3 Init Broadcast:', result.txid);
  } catch (e) {
    console.error('Init failed:', e);
  }
}

initV3();
