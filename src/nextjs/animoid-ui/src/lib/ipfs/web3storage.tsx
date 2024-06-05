import { StoreMemory } from '@web3-storage/access/stores/store-memory'
import * as Signer from '@ucanto/principal/ed25519'
import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'
import { AnyLink, Block, Capabilities, Delegation } from "@web3-storage/w3up-client/types"
import * as Client from '@web3-storage/w3up-client'

const web3StorageClient = setWeb3StorageClient();

async function setWeb3StorageClient() {
    const web3key = process.env.NEXT_PRIVATE_WEB3_STORAGE_KEY;
    if (!web3key) throw Error("Missing NEXT_PRIVATE_WEB3_STORAGE_KEY in .env")
    
    const web3delegationProof = process.env.NEXT_PRIVATE_WEB3_STORAGE_PROOF;
    if (!web3delegationProof) throw Error("Missing NEXT_PRIVATE_WEB3_STORAGE_PROOF in .env")

    const principal = Signer.parse(web3key)
    const store = new StoreMemory();
    const client = await Client.create({ principal, store})
    // Add proof that this agent has been delegated capabilities on the space
    const proof: Delegation<Capabilities> = await parseProof(web3delegationProof) // Explicitly type the proof variable
    const space = await client.addSpace(proof)
    client.setCurrentSpace(space.did())

    return client;
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

export const uploadFile = async(file: File):Promise<AnyLink> =>{
    console.log("Uploading file to IPFS using Web3.Storage...");
    
    const files = [
      file
    ]
    const localClient = await web3StorageClient;
    return await localClient.uploadFile(file);
  }