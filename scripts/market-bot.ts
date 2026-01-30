
import { 
  makeContractCall, 
  broadcastTransaction, 
  uintCV
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { SWARM_CONFIG } from './swarm-config';
import * as dotenv from 'dotenv';

dotenv.config();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runMarketBot() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY missing");
    return;
  }

  console.log(`Starting Market Bot Swarm... Target: ${SWARM_CONFIG.ITERATIONS} txs`);

  for (let i = 0; i < SWARM_CONFIG.ITERATIONS; i++) {
    console.log(`[Bot] Iteration ${i + 1}/${SWARM_CONFIG.ITERATIONS}`);

    // In a real swarm, we'd target multiple auctions or place bids.
    // For V3 Dutch, we call 'buy-dutch-auction'. 
    // Note: If already sold, this fails, but generates a TX (failed status), which still counts as a commit/interaction attempt on-chain or at least for script activity.
    // To be cleaner, we might want a 'log-view' or a public read-write function that is always success.
    // Let's assume we want to just create *traffic*. Failed txs count for stress testing.
    
    const txOptions = {
        contractAddress: 'SP9AS5B36MKC0FVF4DE75A1EBPANXQ14AEH98BH0',
        contractName: SWARM_CONFIG.MARKET_CONTRACT,
        functionName: 'buy-dutch-auction',
        functionArgs: [uintCV(SWARM_CONFIG.AUCTION_ID)],
        senderKey: privateKey,
        network: STACKS_TESTNET,
        anchorBlockOnly: true,
        fee: 100,
    };

    try {
        const transaction = await makeContractCall(txOptions);
        const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
        console.log(`   -> Market Interaction Broadcast: ${result.txid}`);
    } catch (e) {
        console.error(`   -> Failed:`, e); 
    }
    
    await sleep(SWARM_CONFIG.DELAY_MS);
  }
}

runMarketBot();
