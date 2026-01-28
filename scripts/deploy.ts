import { 
  makeContractDeploy, 
  broadcastTransaction, 
  fetchFeeEstimate
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function deploy() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in .env");
  }

  const network = STACKS_TESTNET;
  const contractName = 'marketplace';
  const codeBody = readFileSync(join(__dirname, '../contracts/marketplace.clar'), 'utf8');

  console.log(`Deploying ${contractName}...`);

  const txOptions = {
    contractName,
    codeBody,
    senderKey: privateKey,
    network,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const fee = await fetchFeeEstimate({ transaction, network });
    console.log(`Estimated fee: ${fee}`);

    const signedTx = await makeContractDeploy({
      ...txOptions,
      fee,
    });

    const result = await broadcastTransaction({ transaction: signedTx, network });

    if ('txid' in result) {
      console.log('Deployment Broadcasted Successfully!');
      console.log('Transaction ID:', result.txid);
      console.log(`Explorer: https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);
    } else {
      console.error('Broadcast Error:', result);
    }
  } catch (error) {
    console.error('Deployment Failed:', error);
  }
}

deploy();
