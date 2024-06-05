import { ethers } from 'ethers';
import DfVideoScannerABI from './abis/DfVideoScanner.json';
import CoopHiveOnChainJobCreatorABI from './abis/CoopHiveOnChainJobCreator.json';
import CoopHiveTokenABI from './abis/CoopHiveToken.json';

export const runVideoScanner = async (cid:string) => {
 // the private key of the person with tokens
 const privateKey = process.env.NEXT_PRIVATE_COOPHIVE_KEY;
 const url = process.env.NEXT_COOPHIVE_URL;
const jobCreatorAddress = process.env.NEXT_COOPHIVE_JOB_CREATOR_ADDRESS;

if (!jobCreatorAddress) {
  console.error(`NEXT_COOPHIVE_JOB_CREATOR_ADDRESS env variable is required`)
  throw new Error(`NEXT_COOPHIVE_JOB_CREATOR_ADDRESS env variable is required`)
}

const dfScannerAddress = '0x5fabacCA5Aff8C3952ccbe7964841a2f7803Fdd0';

 if(!privateKey) {
   console.error(`NEXT_PRIVATE_COOPHIVE_KEY env variable is required`)
   throw new Error(`NEXT_PRIVATE_COOPHIVE_KEY env variable is required`)
 }
 //create a new ethers Json RPC provider
const provider = new ethers.JsonRpcProvider(url)
const wallet = new ethers.Wallet(privateKey).connect(provider)


const dfContract = new ethers.Contract(dfScannerAddress, DfVideoScannerABI.abi, wallet);
const jobCreator = new ethers.Contract(jobCreatorAddress, CoopHiveOnChainJobCreatorABI.abi, wallet);

const tokenAddress  = await jobCreator.getTokenAddress();
const tokenContract = new ethers.Contract(tokenAddress, CoopHiveTokenABI.abi, wallet);
const requiredDeposit = await jobCreator.getRequiredDeposit();
const controllerAddress = await jobCreator.getControllerAddress();

console.log(`requiredDeposit: ${requiredDeposit}`)
console.log(`tokenAddress: ${tokenAddress}`)
const escrowPaid = await tokenContract.approve(controllerAddress, requiredDeposit);

console.log(escrowPaid)
const runjobTx = await dfContract.runVideoScanner(cid);
const receipt = await runjobTx.wait()
if(!receipt) throw new Error(`no receipt`)

 console.log(`submitted job: ${runjobTx.hash}`)
 
 let jobID = 0

 receipt.logs.forEach((log: any) => {
   const logs = dfContract.interface.parseLog(log as any)
   if(!logs) return
   jobID = Number(logs.args[0])
 })

 console.log(`Job ID: ${jobID}`)
 console.log('--------------------------------------------')
 console.log(`Waiting for job to be completed...`)

 let result = ''
 let i:number = 0;
 while(!result && i < 300) {
   result = await dfContract.getJobResult(jobID)
   if(!result) {
    // Use JavaScript to wait or sleep for 1000 milliseconds
    await new Promise(resolve => setTimeout(resolve, 1000));
    i++;
   }
   console.log(`waiting for job result: ${new Date().toLocaleString()}`)
 }
 return result;
}