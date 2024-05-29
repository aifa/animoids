import { uploadFileWeb3 } from '@/lib/upload'
import { runLlavaInference } from '@/lib/inference'
import { NextResponse } from 'next/server';

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const cid = formData.get("cid") as string;

  const inference = await runLlavaInference(cid);
  console.log(inference);
  return NextResponse.json({ status: "success" , message: "we got inference", inference: inference});
}