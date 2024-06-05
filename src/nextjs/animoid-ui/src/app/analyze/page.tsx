'use client'
import Title from "@/components/ui/title";
import FileUpload from "@/components/upload/fileUpload";

export const maxDuration = 300

export default function Analyze() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 mt-4 justify-center">
            <Title />
            <FileUpload />
        </div>
    </main>
  )
}