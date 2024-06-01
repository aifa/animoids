import CustomConnect from "@/components/wallet/Connect";
import Connect from "@/components/wallet/Connect";
import Head from "next/head";
import Link from "next/link";

export default function Header() {
    return (
        <>
      <header className="w-full bg-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">       
           <Link href="#" className="flex items-center" prefetch={false}>
          <ScanIcon className="h-16 w-8 mr-2" />
          <span className="text-lg font-bold">PXL - Deepfake detection</span>
          </Link>
          </h1>
            <CustomConnect />
        </div>
      </header>
      </>
    )
};

function ScanIcon(props: any) {
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
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  )
}
