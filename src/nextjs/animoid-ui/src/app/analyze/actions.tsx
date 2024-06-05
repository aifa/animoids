'use server'

import { submitAgentRequest } from "@/lib/chain/galadriel/openAiVision_agent";
import { imagePrompt, videoPlaceHolder, videoPrompt } from "@/lib/chain/galadriel/prompts";
import { runDeepFakeVideoDetection, runLlavaInference } from "@/lib/inference";
import { uploadQWithDirWrapAPICall } from "@/lib/ipfs/lighthouse";
import { fetchFileFromIPFS, fetchUrlFromIPFS, getWeb3StorageUrl } from "@/lib/ipfs/utils";
import { uploadFile } from "@/lib/ipfs/web3storage";
import { NextResponse } from "next/server";

export const config = {
  maxDuration: 300,
};
 

export default async function invokeDetection(formData: FormData) {

  const file = formData.get("file") as File;
  const fileType = formData.get("fileType") as string;
  const dirCid = await uploadQWithDirWrapAPICall(file);
  const v1Cid = await uploadFile(file);
  console.log(v1Cid.toString());
  return await runDetection(dirCid, v1Cid.toString(), fileType);

}

const runDetection = async (dirCid:string, v1Cid:string, fileType:string) => {
    const isImage = fileType.includes("image"); 
    const isVideo = fileType.includes("video");
  
    const GTP4OnlyFlag = process.env.GPT4_ONLY;
    if (!GTP4OnlyFlag) {
      console.error("Missing GTP4_ONLY in .env");
      return NextResponse.json({ status: 500, message: "Internal Server Error" });
    }
  
    if (isImage) { 
      try{
  
        let llavaAssessment: any= { response: ""};
  
          if (GTP4OnlyFlag==="false") {
              llavaAssessment = await runImageScan(dirCid);
          }
  
          const agentAsssessment = await submitAgentRequest(getWeb3StorageUrl(v1Cid), imagePrompt(llavaAssessment.response));
  
        return NextResponse.json({ status: 200 , message: agentAsssessment, results: agentAsssessment});
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        return NextResponse.json({ status: 500, message: error.message });
      }
      
    } else if (isVideo) {
      if (GTP4OnlyFlag==="true") {
        return NextResponse.json({ status: 200 , message: "Video processing is not available at the moment"});
      }
      
      const cid = await runDeepFakeVideoDetection(dirCid);
      console.log(cid);
      try{
        const result = await fetchFileFromIPFS(cid, "outputs/results.csv");
        const assessment = await result.text();
        console.log(assessment);
        const agentAsssessment = await submitAgentRequest(videoPlaceHolder, videoPrompt(assessment));
  
        return NextResponse.json({ status: 200 , message: agentAsssessment, results: result});
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        return NextResponse.json({ status: 500, message: error.message });
      }
    }
  }
  
async function runImageScan(dirCid: string): Promise<any> {
    const lavaResults = await runLlavaInference(dirCid);
    console.log(lavaResults);
  
     
      let assessment: Record<string, any> = {response: ""};
      try{
          const result = await fetchUrlFromIPFS(lavaResults.url, "outputs/response.json");
          assessment = await result.json();
          console.log(assessment);
        }catch(e:any){
          console.error(`Error: ${e.message}`);
        }
        return assessment;
  }