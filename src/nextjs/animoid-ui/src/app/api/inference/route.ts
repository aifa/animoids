import { runDeepFakeVideoDetection, runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';
import { fetchFileFromIPFS, fetchUrlFromIPFS } from '@/lib/ipfs';
import { pause } from '@/lib/utils';

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const dirCid = formData.get("cid") as string;
  const fileNae = formData.get("fileName") as string;
  const fileType = formData.get("fileType") as string;

  console.log(`fileType: ${fileType}`);
  const isImage = fileType.includes("image");
  const isVideo = fileType.includes("video");

  if (isImage) { 
    const lavaResults = await runLlavaInference(dirCid);
    console.log(lavaResults);
    try{
      await pause(5000);
      try{
        await fetchUrlFromIPFS(lavaResults.url, "");
      }catch(e){}
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
      // pause here to let ipfs settle 
      await pause(5000);
      //call twice to avoid retrieval errors
      try{
        await fetchFileFromIPFS(cid, "");
      }catch(e){}

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