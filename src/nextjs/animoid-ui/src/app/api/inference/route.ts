import { uploadFileWeb3 } from '@/lib/ipfs'
import { runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';
import { fetchFileFromIPFS } from '@/lib/ipfs';

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const cid = await uploadFileWeb3(file);
  const inference = await runLlavaInference(cid.toString(), file.name, file.type);
  console.log(inference);
  //const inferenceJson = JSON.parse(inference);
  const result = await fetchFileFromIPFS(inference.url, "outputs/response.json");
  return NextResponse.json({ status: "success" , message: "we got inference", results: result});
}