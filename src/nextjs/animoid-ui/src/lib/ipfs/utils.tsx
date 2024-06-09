import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { base32 } from 'multiformats/bases/base32';

/**
 * Fetches an IPFS URL with retries
 * @param url
 * throws error if the fetch fails.
 * */
export async function fetchUrlWithRetries(url: string): Promise<Response | undefined> {
  
    try{//initiate some fecthes in parallel to the main loop.
        fetchWithRetry(url, {}, 20, 0);
    }catch(e){}
    console.log(`Fetching ${url}`);
    try{
      const response = await fetchWithRetry(url, {}, 600, 1000);
      if (response.ok) { //return only if the fetch is successful.
        return response;
      }
    }catch(e:any){
      console.error(`Failed to fetch content from IPFS. Error: ${e.message}`);
      return undefined;
    }
}

/**
 * 
 * @param url 
 * @param options 
 * @param maxRetries 
 * @param delay 
 * @returns response Promise only in case a fetch is successful.
 * throws error if all retries fail to fetch. a result.
 */
export async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number, delay: number = 1000): Promise<Response> {
  let attempts = 0;

  if (url === undefined || url ===""){
    throw new Error("Undefined URL");
  }
  while (attempts < maxRetries) {
    try {
     console.log(`Attempt ${attempts + 1}: Fetching ${url}`);
      const response = await fetch(url, options);
      if (response.status === 200) { // return only if the fetch is successful.
        return response;
      } else {
        console.log(`Attempt ${attempts + 1} failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {// catch all errors to finish all the retries.
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

export function getIpfsGatewayUrl(dirId: string, filePath: string): string {
  console.log(`https://ipfs.io/ipfs/${dirId}/${filePath}`);
  return `https://ipfs.io/ipfs/${dirId}/${filePath}`;
}

// Function to check if a string contains a valid IPFS CID v0
export function containsValidCIDv0(input: string): boolean {
  try {
    const cid = CID.parse(input, base58btc);
    return cid.version === 0;
  } catch (error) {
    return false;
  }
}

// Function to check if a string contains a valid IPFS CID v1
export function containsValidCIDv1(input: string): boolean {
  try {
    const cid = CID.parse(input, base32);
    return cid.version === 1;
  } catch (error) {
    return false;
  }
}