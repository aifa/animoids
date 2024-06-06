
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

 // this is a very important file, we need it now!
  for (let i = 0; i < 30; i++) {
    fetchWithRetry(fullPath, {}, 500, 1);
  }
  const response = await fetchWithRetry(fullPath, {}, 500, 1);

  if (!response.ok) {
    throw new Error(`Failed to fetch content from IPFS. Status: ${response.status}`);
  }
  return await response;
}

export async function fetchUrlFromIPFS(url:string, filePath:string) {
  // Construct the full path to the file in IPFS
  const fullPath = url+"/"+`${filePath}`;

  // this is a very important file, we need it now!
  for (let i = 0; i < 30; i++) {
    fetchWithRetry(fullPath, {}, 500, 1);
  }
  const response = await fetchWithRetry(fullPath, {}, 500, 1);
  if (!response.ok) {
    throw new Error(`Failed to fetch content from IPFS. Status: ${response.status}`);
  }
  return await response;
}

export async function fetchUrlWithRetries(url: string): Promise<Response> {
  // this is a very important file, we need it now!
  for (let i = 0; i < 30; i++) {
    fetchWithRetry(url, {}, 500, 1);
  }
  const response = await fetchWithRetry(url, {}, 500, 1);
  if (!response.ok) {
    throw new Error(`Failed to fetch content from IPFS. Status: ${response.status}`);
  }
  return response;
}

export async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number, delay: number = 1000): Promise<Response> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
     //console.log(`Attempt ${attempts + 1}: Fetching ${url}`);
      const response = await fetch(url, options);
      if (response.status === 200) {
        return response;
      } else {
        //console.log(`Attempt ${attempts + 1} failed: ${response.status} ${response.statusText}`);
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

