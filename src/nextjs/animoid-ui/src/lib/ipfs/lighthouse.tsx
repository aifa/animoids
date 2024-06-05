import lighthouse from "@lighthouse-web3/sdk"

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
