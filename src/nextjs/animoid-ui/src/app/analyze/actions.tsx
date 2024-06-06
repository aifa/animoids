'use server'

import { submitAgentRequest } from "@/lib/chain/galadriel/openAiVision_agent";
import { imagePrompt, videoPlaceHolder, videoPrompt } from "@/lib/chain/galadriel/prompts";
import { runDeepFakeVideoDetection, runLlavaInference } from "@/lib/inference";
import { uploadQWithDirWrapAPICall } from "@/lib/ipfs/lighthouse";
import { fetchFileFromIPFS, fetchUrlFromIPFS, fetchUrlWithRetries, getIpfsUrl, getWeb3StorageUrl } from "@/lib/ipfs/utils";
import { uploadFile } from "@/lib/ipfs/web3storage";

/**
 * Store file in v1 and v0 formats and start first model pass.
 * @param formData 
 * @returns : [v1Cid, resultsCid]: The vi CID of the file and the CID of the results of the first pass.
 */
export default async function startScanning(formData: FormData): Promise<[string, string]> {

  const file = formData.get("file") as File;
  const fileType = formData.get("fileType") as string;
  const dirCid = await uploadQWithDirWrapAPICall(file);
  const v1Cid = await uploadFile(file);
  console.log(v1Cid.toString());
  return [v1Cid.toString(), await firstScan(dirCid, fileType)];

}

/**
 * 
 * @param formData start second scan - gpt4o
 * @returns 
 */
export async function startSecondScan(formData: FormData): Promise<string> {
  const v1cID = formData.get("v1cID") as string;
  const fileType = formData.get("fileType") as string;
  const resultsUrl = formData.get("resultsUrl") as string;
  console.log("starting second scan()");
  return await secondScan(v1cID, resultsUrl, fileType);
}

/**
 * Girst scan of the image. Returns an ipfs link to the results
 * @param dirCid 
 * @param fileType 
 * @returns 
 */
const firstScan = async (dirCid:string, fileType:string): Promise<string> => {
    const isImage = fileType.includes("image"); 
    const isVideo = fileType.includes("video");

    if (isImage) { 
      try{
        const lavaResults = await runLlavaInference(dirCid);
        console.log(lavaResults);
        console.log(lavaResults.ipfscid+"/outputs/response.json");
        return lavaResults.ipfscid+"/outputs/response.json";
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        throw new Error(`Error: ${error.message}`);
      }
    } else if (isVideo) {
      const cid = await runDeepFakeVideoDetection(dirCid);
      console.log(cid);
      return getIpfsUrl(cid, "outputs/results.csv");
    }else
    throw new Error("Unsupported file type");
}
/**
 * Second pass, tries to read the results of the first pass and summarise or run second analysis.
 * @param v1Cid Sec
 * @param resultsUrl 
 * @param fileType 
 * @returns 
 */
const secondScan = async (v1Cid:string, resultsUrl: string,  fileType:string): Promise<string> => {
    const isImage = fileType.includes("image"); 
    const isVideo = fileType.includes("video");
     
    const GTP4OnlyFlag = process.env.GPT4_ONLY;
    if (!GTP4OnlyFlag) {
      console.error("Missing GTP4_ONLY in .env");
      throw new Error("Missing GTP4_ONLY in .env");
    }
  
    if (isImage) { 
      try{

        const llavaAssessment:string = await getLlavaResults(resultsUrl);
        const agentAsssessment = await submitAgentRequest(getWeb3StorageUrl(v1Cid), imagePrompt(llavaAssessment));
  
        return agentAsssessment;
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        throw new Error(`Error: ${error.message}`);
      }
      
    } else if (isVideo) {
      
      try{
        const result = await fetchUrlWithRetries(resultsUrl);
        const assessment = await result.text();
        const agentAsssessment = await submitAgentRequest(videoPlaceHolder, videoPrompt(assessment));
        return agentAsssessment;
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw new Error("Unsupported file type");
  }
  
async function getLlavaResults(resultsUrl: string): Promise<string> {
     
    let assessment: Record<string, any> = {response: ""};
    try{
        const result = await fetchUrlWithRetries(resultsUrl);
        assessment = await result.json();
        console.log(assessment);
      }catch(e:any){
        console.error(`Error: ${e.message}`);
      }
      return assessment.response;
  }