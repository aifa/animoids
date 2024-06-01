import { uploadFileWeb3 } from '@/lib/ipfs'
import { runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';
import { submitAgentRequest } from '@/lib/chain/galadriel/openAiVision_agent';
import { videoPlaceHolder, videoPrompt } from '@/lib/chain/galadriel/prompts';

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const outputFile = new File([buffer], file.name, { type: file.type, lastModified: file.lastModified});

  const output = await uploadFileWeb3(outputFile);

  const assessment = "filename,label zxvgazoudy.mp4,0.989";
  const responce = await submitAgentRequest( videoPlaceHolder, videoPrompt(assessment));

  //const inference = await runLlavaInference(output.toString());
  //console.log(inference);
  return NextResponse.json({ status: "success" , message: "File uploaded successfully", file: file.name , type: file.type, output: output});
}