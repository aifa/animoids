export const runLlavaInference = async (imageFolderCid: string) => {

    console.log("Running Llava Inference on CID: ", imageFolderCid);
    const response = await fetch(`http://js-cli-wrapper.lilypad.tech`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json"
            },
            body: JSON.stringify({
                "pk": `${process.env.NEXT_PRIVATE_LILYPAD_KEY}`,
                "module": "github.com/aifa/lilypad-module-ollama-pipeline:v0.0.14",
                "inputs": "-i Prompt='Describe what do you see in this picture. On a scale from 0 to 1, can you tell if this has been generated or modified by AI?' -i imgCid='"+`${imageFolderCid}`+"'",
                 "opts": { "stream": false}
            })
        }
    );
    const data = await response.json();
    return data;

}

export const runDeepFakeVideoDetection = async (videoFolderCid: string) => {

}