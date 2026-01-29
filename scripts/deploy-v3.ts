
import { 
  makeContractDeploy, 
  broadcastTransaction, 
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function deployV3() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY missing");
    return;
  }

  const contractPath = path.join(__dirname, '../contracts/marketplace-v3.clar');
  const codeBody = fs.readFileSync(contractPath, 'utf8');

  const txOptions = {
    contractName: 'marketplace-v3',
    codeBody,
    senderKey: privateKey,
    network: STACKS_TESTNET,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    console.log('Marketplace V3 Broadcast:', result.txid);
  } catch (e) {
    console.error('Broadcast failed:', e);
  }
}

deployV3();
