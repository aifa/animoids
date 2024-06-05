import lighthouse from "@lighthouse-web3/sdk"

import * as Client from '@web3-storage/w3up-client'
import { AnyLink, Block, Capabilities, Delegation } from "@web3-storage/w3up-client/types";
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import * as Signer from '@ucanto/principal/ed25519'
import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'

/**
 * Uploads a file to IPFS using the Lighthouse API, wraps it into a directory and returns the CID of the directory.
 * Uses IPVS V0. file format for compatibility with lilypad/bachalau ipfs input format.
 * @param file 
 * @returns 
 */


export const uploadQWithDirWrap = async(file: File) =>{

    const outputFile:File = new File([await file.arrayBuffer()], "upload/"+file.name, { type: file.type });

    const output = await lighthouse.uploadBuffer(outputFile, `${process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY}`)

    if (output.data) {
      const delimeter = '{"Name":"upload","Hash":"';
    
      //split the result string by the delimeter
      const parts = output.data.split(delimeter);
      console.log("Parts:"+parts);
      const filePart= parts[0];
      // Find the starting position of the desired substring
      const dirStartPos = output.data.indexOf(delimeter);

      // Extract the substring from the starting position to the end
      const dirPart = output.data.substring(dirStartPos);
      console.log("Substring:"+dirPart);
      console.log('JSON:', JSON.parse(dirPart));
      const dirCid = JSON.parse(dirPart);

      if (dirCid) {
        const uploadHash = dirCid.Hash;
        console.log(`Upload Hash: ${uploadHash}`);
        return uploadHash;
      }
    } else {
      console.error('Error uploading file.');
    }
    return null;
  }

  export const uploadQWithDirWrapAPICall = async(file: File) =>{
      const url = 'https://node.lighthouse.storage/api/v0/add';
      console.log("Uploading file to IPFS using Lighthouse API...");
      const formData2 = new FormData();
      formData2.append('file', new File([await file.arrayBuffer()], "upload/"+file.name, { type: file.type }));
      const output = await fetch(url, {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PRIVATE_LIGHTHOUSE_API_KEY}`
        },
        body: formData2
      });
      const data = await output.text();
      if (data) {
        const delimeter = '{"Name":"upload","Hash":"';
        
        //split the result string by the delimeter
        const parts = data.split(delimeter);
        console.log("Parts:"+parts);
        const filePart= parts[0];
        // Find the starting position of the desired substring
        const dirStartPos = data.indexOf(delimeter);
  
        // Extract the substring from the starting position to the end
        const dirPart = data.substring(dirStartPos);
        //console.log("Substring:"+dirPart);
        //console.log('JSON:', JSON.parse(dirPart));
        const dirCid = JSON.parse(dirPart);
  
        if (dirCid) {
          const uploadHash = dirCid.Hash;
          console.log(`Upload Hash: ${uploadHash}`);
          return uploadHash;
        }
      } else {
        console.error('Error uploading file.');
      }
      return null;
  }


  export const uploadBufferwithWrap = async(buffer: Buffer, name: string, fType: string) =>{

    const outputFile:File = new File([buffer], "upload/"+name, { type: fType});

    const apikey = process.env.NEXT_PRIVATE_LIGHTHOUSE_API_KEY;
    if (!apikey) throw Error("Missing NEXT_PRIVATE_LIGHTHOUSE_API_KEY in .env")
      
    const output = await lighthouse.uploadBuffer(outputFile, `${process.env.NEXT_PRIVATE_LIGHTHOUSE_API_KEY}`)

    if (output.data) {
      const delimeter = '{"Name":"upload","Hash":"';
      
      //split the result string by the delimeter
      const parts = output.data.split(delimeter);
      //console.log("Parts:"+parts);
      const filePart= parts[0];
      // Find the starting position of the desired substring
      const dirStartPos = output.data.indexOf(delimeter);

      // Extract the substring from the starting position to the end
      const dirPart = output.data.substring(dirStartPos);
      //console.log("Substring:"+dirPart);
      //console.log('JSON:', JSON.parse(dirPart));
      const dirCid = JSON.parse(dirPart);

      if (dirCid) {
        const uploadHash = dirCid.Hash;
        console.log(`Upload Hash: ${uploadHash}`);
        return uploadHash;
      }
    } else {
      console.error('Error uploading file.');
    }
    return null;
  }

export const uploadFileWeb3 = async(file: File):Promise<AnyLink> =>{
  console.log("Uploading file to IPFS using Web3.Storage...");
  
  const files = [
    file
  ]

  const web3key = process.env.NEXT_PRIVATE_WEB3_STORAGE_KEY;
  if (!web3key) throw Error("Missing NEXT_PRIVATE_WEB3_STORAGE_KEY in .env")
  
  const web3delegationProof = process.env.NEXT_PRIVATE_WEB3_STORAGE_PROOF;
  if (!web3delegationProof) throw Error("Missing NEXT_PRIVATE_WEB3_STORAGE_PROOF in .env")

  const principal = Signer.parse(web3key)
  const store = new StoreMemory()
  const client = await Client.create({ principal, store })
  // Add proof that this agent has been delegated capabilities on the space
  const proof: Delegation<Capabilities> = await parseProof(web3delegationProof) // Explicitly type the proof variable
  const space = await client.addSpace(proof)
  await client.setCurrentSpace(space.did())

  return await client.uploadFile(file);
}

export async function downloadFromIPFS(cid: string): Promise<string> {
  const url = `https://ipfs.io/ipfs/${cid}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch content from IPFS. Status: ${response.status}`);
  }

  const content = await response.text();
  return content;
}

export async function fetchFileContents(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Fetch error:', error);
  }
  return new Blob();
}


export async function fetchFileFromIPFS(cid:string, filePath:string) {
  // Initialize IPFS
  const url = 'https://ipfs.io/ipfs/';

  // Construct the full path to the file in IPFS
  const fullPath = url+`${cid}/${filePath}`;

  const response = await fetchWithRetry(fullPath, {}, 20, 1000);

  if (!response.ok) {
    throw new Error(`Failed to fetch content from IPFS. Status: ${response.status}`);
  }
  return await response;
}

export async function fetchUrlFromIPFS(url:string, filePath:string) {
  // Construct the full path to the file in IPFS
  const fullPath = url+"/"+`${filePath}`;
  const response = await fetchWithRetry(fullPath, {}, 20, 1000);
  if (!response.ok) {
    throw new Error(`Failed to fetch content from IPFS. Status: ${response.status}`);
  }
  return await response;
}

export async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number, delay: number = 1000): Promise<Response> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      console.log(`Attempt ${attempts + 1}: Fetching ${url}`);
      const response = await fetch(url, options);
      if (response.status === 200) {
        return response;
      } else {
        console.log(`Attempt ${attempts + 1} failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.log(`Attempt ${attempts + 1} encountered an error: ${error.message}`);
    }

    attempts++;
    if (attempts < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

export function getWeb3StorageUrl(cid: string): string {
  return `https://${cid}.ipfs.w3s.link`;
}

export function getIpfsUrl(dirId: string, filePath: string): string {
  console.log(`https://ipfs.io/ipfs/${dirId}/${filePath}`);
  return `https://ipfs.io/ipfs/${dirId}/${filePath}`;
}

/** @param {string} data Base64 encoded CAR file */
async function parseProof (data: string): Promise< Delegation<Capabilities>> {
  const blocks: Block<unknown, number, number, 1>[] = [];
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
  for await (const block of reader.blocks()) {
    blocks.push(block as Block<unknown, number, number, 1>);
  }
  return importDAG(blocks);
}