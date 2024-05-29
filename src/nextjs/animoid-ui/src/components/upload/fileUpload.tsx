'use client'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CardContent, CardFooter, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JSX, SVGProps, useState } from "react"
import axios from 'axios';
import { uploadFileToIpfs } from "@/lib/upload"

function FileIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file.');
      return;
    }
    try {
      /*
      
      const res = await uploadFileToIpfs(file)
      if (res.data.Hash) {
        setMessage(`File uploaded successfully: ${res.data.Hash}`);
      } else {
        setMessage('Error uploading file.');
      }*/
      const cid:string = await uploadFileToIpfs(file);
      const formData = new FormData();
      formData.append('cid', cid);
      const test = fetch('/api/inference', {
        method: 'POST',
        body: formData,
      });
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }


  };

  return (
    <Card className="w-[350px]">
      <CardContent className="p-6 space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center">
          <FileIcon className="w-12 h-12" />
          <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
          <span className="text-xs text-gray-500">PDF, image, video, or audio</span>
        </div>
        <div className="space-y-2 text-sm">
          <Label className="text-sm font-medium" htmlFor="file">
            File
          </Label>
          <Input  accept="image/*,video/*" id="file" placeholder="File" type="file" onChange={handleFileChange} />
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" onClick={handleSubmit}>Upload</Button>
      </CardFooter>
    </Card>
  )
}