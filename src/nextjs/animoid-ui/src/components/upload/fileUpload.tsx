'use client'
import { Input } from "@/components/ui/input"
import { CardContent, CardFooter, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { uploadQWithDirWrap } from "@/lib/ipfs"
import Image from "next/image"


export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string | ArrayBuffer | null>('');
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | ArrayBuffer | null>(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<any>('');
  const [isProcessing, setIsProcessing] = useState(false)
  const [processResult, setProcessResult] = useState<string>("")


    const handleFileSelection = (selectedFile: File) => {
      setFile(selectedFile);
      if (selectedFile && selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result);
          setVideoPreview(null);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile && selectedFile.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setVideoPreview(reader.result);
          setImagePreview(null);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setImagePreview(null);
        setVideoPreview(null);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFile = e.target.files[0];
        handleFileSelection(selectedFile);
      }
    };
   
  const handleClearFile = (e: React.MouseEvent<HTMLButtonElement>) => { 
    e.preventDefault();
    setFile(null)
    setImagePreview(null)
    setVideoPreview(null)
  }
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const selectedFile = e.dataTransfer.files[0];
      handleFileSelection(selectedFile);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessResult("")
    if (!file) {
      setMessage('Please select a file.');
      setIsProcessing(false);
      return;
    }
    await submitFile(file);
    setIsProcessing(false);
  };

  const submitFile = async (file: File) => {
    try {
      //const cid = await uploadQWithDirWrap(file);

      const formData = new FormData();
      //formData.append('cid', cid);
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);


      const result = await fetch('/api/inference', {
        method: 'POST',
        body: formData,
        headers: {
        }
      });
      await result.json().then((data) => {
        setProcessResult(data.message);
      });
    } catch (error: any) {
      setProcessResult(`Error: ${error.message}`);
    }
    setIsProcessing(false);
  }
  const handleDismissResult = () => {
    setProcessResult("")
  }

  return (
    <div className="grid gap-4">
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription>Drag and drop or click to upload an image or video.</CardDescription>
      </CardHeader>      
      <CardContent>
      <div className="grid gap-4">
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-12 flex justify-center items-center"
            onDragEnter={preventDefault}
            onDragOver={preventDefault}
            onDragLeave={preventDefault}
            onDrop={handleDrop}
          >
            <label htmlFor="file-upload" className="flex flex-col items-center space-y-2 cursor-pointer">
              {file ? (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500">{file.name}</p>
                  <Button variant="ghost" size="sm" onClick={handleClearFile}>
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <UploadIcon className="w-8 h-8 text-gray-500" />
                  <p className="text-gray-500">Drop file here or click to upload</p>
                </>
              )}
            </label>
            <Input  accept="image/*,video/*" id="file-upload" type="file" onChange={handleFileChange} className="hidden"/>
          </div>
          <div className="space-y-2 text-sm">
            
          </div>
          <div className="grid grid-cols-1 gap-4">
            {imagePreview && (
              <div className="relative aspect-square overflow-hidden rounded-lg mx-auto">
                <Image src={imagePreview.toString()} alt="Uploaded Image" width={400} height={400} className="object-cover" />
              </div>
            )}
            {videoPreview && (
              <div className="relative aspect-video overflow-hidden rounded-lg mx-auto">
                <video src={videoPreview.toString()} controls className="w-full h-full object-cover" />
              </div>
            )}
          </div>     
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
      <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing ? <div className="animate-pulse">Analysing</div> : "Submit"}
        </Button>
      </CardFooter>
    </Card>
    {processResult && (
      <Card className="w-full max-w-3xl mx-auto relative">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          </CardHeader>
        <CardContent>
          <p className="text-gray-500">{processResult}</p>
        </CardContent>
        <CardFooter  className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleDismissResult}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 hidden"
              >
              <CrossIcon className="w-4 h-4 rotate-45 mr-2" />
            </Button>
          </CardFooter>
      </Card>
    )}
    </div>
  )
}

function UploadIcon(props:any) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

function XIcon(props: any) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function CrossIcon(props: any) {
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
      <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
    </svg>
  )
}