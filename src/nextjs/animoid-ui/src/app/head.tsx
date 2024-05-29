import CustomConnect from "@/components/wallet/Connect";
import Connect from "@/components/wallet/Connect";
import Head from "next/head";

export default function Header() {
    return (
        <>
     <Head>
        <title>Simple Web Page</title>
      </Head>

      <header className="w-full bg-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Header</h1>
            <CustomConnect />
        </div>
      </header>
      </>
    )
};