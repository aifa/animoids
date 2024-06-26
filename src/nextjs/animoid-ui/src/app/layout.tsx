import type { Metadata } from "next";
import { Inter as FontSans} from "next/font/google";
import "./globals.css";
import Header from "./head";
export const metadata: Metadata = {
  title: "PXL",
  description: "Deepfake detection and analysis tool",
};

import { cn } from "@/lib/utils"
import { Web3Modal } from "@/components/wallet/web3modal";
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body  className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable )} >
          <Web3Modal>
            <Header />
            {children }
          </Web3Modal>
      </body>
    </html>
  );
}
