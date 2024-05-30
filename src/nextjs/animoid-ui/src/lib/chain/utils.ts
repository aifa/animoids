import { ethers } from 'ethers';


export const getContract = (address: string, abi: any, signer: any) => {
  return new ethers.Contract(address, abi, signer);
};