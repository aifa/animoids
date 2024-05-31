import { ethers } from 'ethers';
import DfVideoScannerABI from './abis/DfVideoScanner.json';
import CoopHiveOnChainJobCreatorABI from './abis/CoopHiveOnChainJobCreator.json';
import CoopHiveTokenABI from './abis/CoopHiveToken.json';
import { pause } from '@/lib/utils';

export const runVideoScanner = async (cid:string) => {
 // the private key of the person with tokens
 const privateKey = process.env.NEXT_PRIVATE_COOPHIVE_KEY;
 const url = process.env.NEXT_COOPHIVE_URL;

 const dfScannerAddress = '0x5fabacCA5Aff8C3952ccbe7964841a2f7803Fdd0';
 const jobCreatorAddress = '0x7c9fc08E744B17692Dc32628407016D1CBE0a44D';
 if(!privateKey) {
   console.error(`NEXT_PRIVATE_COOPHIVE_KEY env variable is required`)
   process.exit(1)
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

 while(!result) {
   result = await dfContract.getJobResult(jobID)
   if(!result) {
    // Use JavaScript to wait or sleep for 1000 milliseconds
    await new Promise(resolve => setTimeout(resolve, 1000));
   }
   console.log(`waiting for job result: ${new Date().toLocaleString()}`)
 }
 return result;
}