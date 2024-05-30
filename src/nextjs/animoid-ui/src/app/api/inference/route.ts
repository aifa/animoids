import { runDeepFakeVideoDetection, runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';
import { fetchFileFromIPFS } from '@/lib/ipfs';

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const dirCid = formData.get("cid") as string;
  const fileNae = formData.get("fileName") as string;
  const fileType = formData.get("fileType") as string;

  console.log(`fileType: ${fileType}`);
  if (fileType.includes("image")) {
    const inference = await runLlavaInference(dirCid);
    console.log(inference);
    try{
      const result = await fetchFileFromIPFS(inference.cid, "outputs/response.json");
      return NextResponse.json({ status: "success" , message: "we got inference", results: result});
    }catch (error: any) {
      console.error(`Error: ${error.message}`);
      return NextResponse.json({ status: "error", message: error.message });
    }
    
  }else if (fileType.includes("video")) {
    const result = await runDeepFakeVideoDetection(dirCid);
    console.log(result);
    return NextResponse.json({ status: "success" , message: "we got inference", results: result});
  }

}