import { uploadFileWeb3 } from '@/lib/ipfs'
import { runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const outputFile = new File([buffer], file.name, { type: file.type, lastModified: file.lastModified});

  const output = await uploadFileWeb3(outputFile);
  const inference = await runLlavaInference(output.toString());
  console.log(inference);
  return NextResponse.json({ status: "success" , message: "File uploaded successfully", file: file.name , type: file.type, output: output, inference: inference});
}