import { fetchFileContents, uploadQWithDirWrap } from "./ipfs";

export const runLlavaInference = async (imageCid: string, filename:string, filetype: string) => {

    console.log("Running Llava Inference on CID: ", imageCid);

    const imageUrl:string = "https://"+`${imageCid}`+".ipfs.w3s.link";
    console.log("Image URL: ", imageUrl);
    //Prepare file data based on lilypad requirements.
    const contents: Blob = await fetchFileContents(imageUrl);
    console.log("Contents: ", contents);
    console.log("Filename: ", filename);
    console.log("Filetype: ", filetype);
    const file = new File([contents], filename, {type: filetype});

    const dirCid = await uploadQWithDirWrap(file, filename);

    console.log("Dir CID: ", dirCid);

    const response = await fetch(`http://js-cli-wrapper.lilypad.tech`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json"
            },
            body: JSON.stringify({
                "pk": `${process.env.NEXT_PRIVATE_LILYPAD_KEY}`,
                "module": "github.com/aifa/lilypad-module-ollama-pipeline:v0.0.19",
                "inputs": "-i Prompt='Describe what do you see in this picture. On a scale from 0 to 1, can you tell if this has been generated or modified by AI?' -i imgCid='"+`${dirCid}`+"'",
                 "opts": { "stream": false}
            })
        }
    );
    const data = await response.json();
    return data;

}

export const runDeepFakeVideoDetection = async (videoFolderCid: string) => {

}