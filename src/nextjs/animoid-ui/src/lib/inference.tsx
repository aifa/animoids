import { runVideoScanner } from "./chain/coophive/onchain_utils";

export const runLlavaInference = async (dirCid: string) => {

    console.log("Running Llava Inference on CID: ", dirCid);

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
    try{
        return await runVideoScanner(videoFolderCid);
    }
    catch  (error: any) {
        console.error(`Error: ${error.message}`);
        return error;
    }
}