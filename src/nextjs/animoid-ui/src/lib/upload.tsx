import lighthouse from "@lighthouse-web3/sdk"
import { create } from '@web3-storage/w3up-client'

export const uploadFileToIpfs = async(file: File) =>{
    // Push file to lighthouse node
    // Both file and folder are supported by upload function
    // Third parameter is for multiple files, if multiple files are to be uploaded at once make it true
    // Fourth parameter is the deal parameters, default null
    //const formData = await request.formData();
    //const file = formData.get('file')
    console.log(file);
    //const outputFile:File = new File([file], "upload/"+file.name, { type: file.type });
    const buffer = Buffer.from(await file.arrayBuffer());
    //const buffer = new Uint8Array(arrayBuffer);
    //const outputFile = new File([buffer], file.name, { type: file.type, lastModified: file.lastModified});

    const output = await lighthouse.uploadBuffer(buffer, `${process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY}`)
    console.log('File Status:', output)
    /*
      output:
        data: {
          Name: "filename.txt",
          Size: 88000,
          Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
        }
      Note: Hash in response is CID.
    */
    if (output.data) {
        const fileUrl = `https://ipfs.io/ipfs/${output.data.Hash}`;
        console.log(`File uploaded successfully: ${fileUrl}`);
      } else {
        console.error('Error uploading file.');
      }
      console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash)

      return output;
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