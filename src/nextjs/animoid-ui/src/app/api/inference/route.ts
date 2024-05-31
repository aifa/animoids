import { runDeepFakeVideoDetection, runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';
import { fetchFileFromIPFS, fetchUrlFromIPFS, fetchWithRetry, uploadBufferwithWrap, uploadFileWeb3, uploadQWithDirWrap, uploadQWithDirWrapAPICall } from '@/lib/ipfs';

export async function POST(
  req: Request
) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  //const dirCid = formData.get("cid") as string;
  const fileType = formData.get("fileType") as string;

  const isImage = fileType.includes("image");
  const isVideo = fileType.includes("video");


  const dirCid = await uploadQWithDirWrapAPICall(file);
  console.log(dirCid);
  if (isImage) { 
    const lavaResults = await runLlavaInference(dirCid);
    console.log(lavaResults);
    try{
      const result = await fetchUrlFromIPFS(lavaResults.url, "outputs/response.json");
      const assessment = await result.text();
      console.log(assessment);
      return NextResponse.json({ status: "success" , message: assessment, results: result});
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
      return NextResponse.json({ status: "success" , message: assessment, results: result});
    }catch (error: any) {
      console.error(`Error: ${error.message}`);
      return NextResponse.json({ status: "error", message: error.message });
    }
  }

}