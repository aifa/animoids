'use server'

import { submitAgentRequest } from "@/lib/chain/galadriel/openAiVision_agent";
import { imagePrompt, videoPlaceHolder, videoPrompt } from "@/lib/chain/galadriel/prompts";
import { runDFVideoDetection, runDfImageDetection } from "@/lib/dfDetection";
import { uploadQWithDirWrapAPICall } from "@/lib/ipfs/lighthouse";
import { issValidCIDv0, fetchUrlWithRetries, getIpfsGatewayUrl, getWeb3StorageUrl } from "@/lib/ipfs/utils";
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
 * First scan of the image. Returns an ipfs link to the results
 * @param dirCid 
 * @param fileType 
 * @returns 
 */
const firstScan = async (dirCid:string, fileType:string): Promise<string> => {
    const isImage = fileType.includes("image"); 
    const isVideo = fileType.includes("video");

    const GTP4OnlyFlag = process.env.GPT4_ONLY;
    if (!GTP4OnlyFlag) {
      console.error("Missing GTP4_ONLY in .env");
      throw new Error("Missing GTP4_ONLY in .env");
    }
    if (GTP4OnlyFlag == "true") return "Firts scan bypassed..."

    if (isImage) { 
      try{
        const lavaResults = await runDfImageDetection(dirCid);
        console.log(lavaResults);
        if (!lavaResults || !issValidCIDv0(lavaResults.cid)) throw new Error("Failed to get results from firts scan");
        return lavaResults.url+"/outputs/response.json";
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        throw new Error(`Error: ${error.message}`);
      }
    } else if (isVideo) {
      const cid = await runDFVideoDetection(dirCid);
      if (!cid || !issValidCIDv0(cid)) throw new Error("Failed to get results from firts scan...");
      console.log(cid);
      return getIpfsGatewayUrl(cid, "outputs/results.csv");
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
        let llavaAssessment:string = "";
        if (GTP4OnlyFlag == "true") {
        }else{
          llavaAssessment = await getImageDetectionResults(resultsUrl);
        }
        const agentAsssessment = await submitAgentRequest(getWeb3StorageUrl(v1Cid), imagePrompt(llavaAssessment));
        return agentAsssessment;
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        return `Error: ${error.message}`;
      }
    } else if (isVideo) {
      if (GTP4OnlyFlag == "true") return "Video processing currently disabled."
      try{
        const result = await fetchUrlWithRetries(resultsUrl);
        if (!result?.ok) throw new Error("Failed to fetch results.");
        const assessment = await result.text();
        const agentAsssessment = await submitAgentRequest(videoPlaceHolder, videoPrompt(assessment));
        return agentAsssessment;
      }catch (error: any) {
        console.error(`Error: ${error.message}`);
        return `Error: ${error.message}`;
      }
    }
    return "Unsupported file type";
  }

  /* Returns the Json holding the results from Llava inference   
  * @param resultsUrl : the ipfs url of the results of the first pass.
  *  @returns : the texrt response from the llm.
  */
async function getImageDetectionResults(resultsUrl: string): Promise<string> {
     
    let assessment: Record<string, any> = {response: ""};
    if (!resultsUrl) return "No results to analyse.";

    try{
        const result = await fetchUrlWithRetries(resultsUrl);
        if (result?.ok) assessment = await result.json();
        console.log(assessment);
      }catch(e:any){
        console.error(`Error: ${e.message}`);
        assessment.response = `Error: ${e.message}`;
      }
      return assessment.response;
  }