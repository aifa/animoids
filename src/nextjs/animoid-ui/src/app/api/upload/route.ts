import { uploadFilePathToIpfs, uploadFileToIpfs } from '@/lib/upload'
import { NextResponse } from 'next/server';
import fs from "node:fs/promises";

export async function POST(
  req: Request
) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const outputFile = new File([buffer], file.name, { type: file.type });

  const output = await uploadFileToIpfs(outputFile);
  return NextResponse.json({ status: "success" , message: "File uploaded successfully", file: file.name , type: file.type, output: output.data });
}