import { 
  makeContractCall, 
  broadcastTransaction, 
  uintCV,
  stringAsciiCV,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runAllVersionsBot() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY missing");
    return;
  }

  const address = 'SP9AS5B36MKC0FVF4DE75A1EBPANXQ14AEH98BH0';
  
  const contracts = [
    { name: 'marketplace', version: 'V1' },
    { name: 'marketplace-v3', version: 'V3' },
  ];

  console.log(`🛒 Starting Multi-Version Market Bot...`);
  console.log(`Target: ${contracts.length} contracts x 30 txs = 60 total transactions\n`);

  let totalSuccess = 0;

  for (const contract of contracts) {
    console.log(`\n📦 Interacting with ${contract.name} (${contract.version})...`);
    
    for (let i = 0; i < 30; i++) {
      let retries = 3;
      while (retries > 0) {
        try {
          const txOptions = {
            contractAddress: address,
            contractName: contract.name,
            functionName: 'list-item',
            functionArgs: [
              stringAsciiCV(`item-${Date.now()}-${i}`),
              uintCV(1000)
            ],
            senderKey: privateKey,
            network: STACKS_TESTNET,
            anchorMode: 1,
            fee: 200,
          };

          const transaction = await makeContractCall(txOptions);
          const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
          console.log(`  ✅ [${contract.version}] TX ${i+1}/30: ${result.txid}`);
          totalSuccess++;
          break;
        } catch (e: any) {
          retries--;
          if (e.message?.includes('fetch failed') || e.message?.includes('timeout')) {
            if (retries > 0) {
              await sleep(3000);
            }
          } else {
            console.log(`  ⚠️ [${contract.version}] TX ${i+1}/30: ${e.message?.substring(0, 50)}`);
            break;
          }
        }
      }
      await sleep(2000);
    }
  }
  
  console.log(`\n🎉 Multi-Version Market Bot Complete: ${totalSuccess} successful transactions`);
}

runAllVersionsBot();
