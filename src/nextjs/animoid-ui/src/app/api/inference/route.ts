import { runDeepFakeVideoDetection, runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';
import { fetchFileFromIPFS, fetchUrlFromIPFS, fetchWithRetry, getWeb3StorageUrl, uploadBufferwithWrap, uploadFileWeb3, uploadQWithDirWrap, uploadQWithDirWrapAPICall } from '@/lib/ipfs';
import { submitAgentRequest } from '@/lib/chain/galadriel/openAiVision_agent';
import { imagePrompt, videoPlaceHolder, videoPrompt } from '@/lib/chain/galadriel/prompts';

export async function POST(
  req: Request
) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const fileType = formData.get("fileType") as string;
  const isImage = fileType.includes("image");
  const isVideo = fileType.includes("video");

  //Cid of wrapper directory of the file. Bachalau related ipfs inputs need to be wrapped in a directory.
  const dirCid = await uploadQWithDirWrapAPICall(file);
  //v1 Cid of the file , uploaded on web3.storage
  const v1Cid = await uploadFileWeb3(file);

  console.log(dirCid);
  if (isImage) { 
    const lavaResults = await runLlavaInference(dirCid);
    console.log(lavaResults);
    try{
      let assessment = "";
      try{
          const result = await fetchUrlFromIPFS(lavaResults.url, "outputs/response.json");
          assessment = await result.text();
          console.log(assessment);
        }catch(e:any){
          console.error(`Error: ${e.message}`);
        }
        const agentAsssessment = await submitAgentRequest(getWeb3StorageUrl(v1Cid.toString()), imagePrompt(assessment));

      return NextResponse.json({ status: "success" , message: agentAsssessment, results: agentAsssessment});
    }catch (error: any) {
      console.error(`Error: ${error.message}`);
      return NextResponse.json({ status: "error", message: error.message });
    }
    
  } else if (isVideo) {
    const cid = await runDeepFakeVideoDetection(dirCid);
    console.log(cid);
    try{
      const result = await fetchFileFromIPFS(cid, "outputs/results.csv");
      const assessment = await result.text();
      console.log(assessment);
      const agentAsssessment = await submitAgentRequest(videoPlaceHolder, videoPrompt(assessment));

      return NextResponse.json({ status: "success" , message: agentAsssessment, results: result});
    }catch (error: any) {
      console.error(`Error: ${error.message}`);
      return NextResponse.json({ status: "error", message: error.message });
    }
  }

}