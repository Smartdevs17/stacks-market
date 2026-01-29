
import { 
  makeContractDeploy, 
  broadcastTransaction, 
  fetchCallReadOnlyFunction as callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function deployV2() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY missing");
    return;
  }

  const contractPath = path.join(__dirname, '../contracts/marketplace-v2.clar');
  const codeBody = fs.readFileSync(contractPath, 'utf8');

  const txOptions = {
    contractName: 'marketplace-v2',
    codeBody,
    senderKey: privateKey,
    network: STACKS_TESTNET,
    anchorBlockOnly: true,
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    console.log('Marketplace V2 Deploy Broadcasted:', result);
    
    console.log('Deployment pending. Contract will be available at: ST1PQ24CH0EKEDT2R3S6A7D9D99N6B0X7FR05624W.marketplace-v2');
    
  } catch (e) {
    console.error('Failed to deploy v2:', e);
  }
}

deployV2();
