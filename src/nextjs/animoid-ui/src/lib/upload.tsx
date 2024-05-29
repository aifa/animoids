import lighthouse from "@lighthouse-web3/sdk"
import { create } from '@web3-storage/w3up-client'

export const uploadFileToIpfs = async(file: File) =>{

    const outputFile:File = new File([file], "/upload/"+file.name, { type: file.type });
    const output = await lighthouse.uploadBuffer(outputFile, `${process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY}`)
    console.log('File Status:', output.data)
    if (output.data) {
      
      // Find the starting position of the desired substring
      const startPos = output.data.indexOf('{"Name":"upload","Hash":"');

      // Extract the substring from the starting position to the end
      const result = output.data.substring(startPos);
      console.log("Substring:"+result);
      console.log('JSON:', JSON.parse(result));
      const cid = JSON.parse(result);

      if (cid) {
        const uploadHash = cid.Hash;
        console.log(`Upload Hash: ${uploadHash}`);
        return uploadHash;
      }
    } else {
      console.error('Error uploading file.');
    }
    return null;
  }

export const uploadFileWeb3 = async(file: File) =>{
  const client = await create();
  const myAccount = await client.login('antonis@typesystem.xyz')
  await client.setCurrentSpace('did:key:z6MkfTRbM5M3a7Ant6vK8JcBos21ai6pW2RiMVFUvXe6vCZF') 
  const files = [
    file
  ]
   
  const directoryCid = await client.uploadDirectory(files)
  console.log(directoryCid)
  return directoryCid;
}