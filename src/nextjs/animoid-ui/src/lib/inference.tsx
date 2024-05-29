export const runLlavaInference = async (imageFolderCid: string) => {

    console.log(JSON.stringify({
        "pk": `${process.env.NEXT_PRIVATE_LILYPAD_KEYs}`,
        "module": "github.com/aifa/lilypad-module-ollama-pipeline:v0.0.11",
        "inputs": "-i Prompt='Please describe the objects and people in this image. On a scale from 0 to 1, can you tell if this has been artificially modified or generated?' -i imgCid="+`${imageFolderCid}`,
         "opts": { "stream": false}
    }));
    const response = await fetch(`http://js-cli-wrapper.lilypad.tech`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json"
            },
            body: JSON.stringify({
                "pk": `${process.env.NEXT_PRIVATE_LILYPAD_KEY}`,
                "module": "github.com/aifa/lilypad-module-ollama-pipeline:v0.0.11",
                "inputs": "-i Prompt='Please describe the objects and people in this image. On a scale from 0 to 1, can you tell if this has been artificially modified or generated?' -i imgCid="+`${imageFolderCid}`,
                 "opts": { "stream": false}
            })
        }
    );
    const data = await response.json();
    return data;

}

export const runDeepFakeVideoDetection = async (videoFolderCid: string) => {

}