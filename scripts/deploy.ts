import { 
  makeContractDeploy, 
  broadcastTransaction, 
  estimateContractDeploy 
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function deploy() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in .env");
  }

  const network = new StacksTestnet();
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
    const feeEstimate = await estimateContractDeploy(txOptions);
    console.log(`Estimated fee: ${feeEstimate}`);

    const transaction = await makeContractDeploy({
      ...txOptions,
      fee: feeEstimate,
    });

    const result = await broadcastTransaction({ transaction, network });

    if (result.error) {
      console.error('Broadcast Error:', result.error);
      if (result.reason) console.error('Reason:', result.reason);
    } else {
      console.log('Deployment Broadcasted Successfully!');
      console.log('Transaction ID:', result.txid);
      console.log(`Explorer: https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);
    }
  } catch (error) {
    console.error('Deployment Failed:', error);
  }
}

deploy();
