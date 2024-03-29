"use client";
import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Bounce, ToastContainer } from "react-toastify";

import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import { XIONHUB_ADDRESS } from "~/constant";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`system-ui font-sans`}>
        <ToastContainer transition={Bounce} />
        <AbstraxionProvider
          config={{
            contracts: [XIONHUB_ADDRESS],
            rpcUrl: "https://xion-testnet-rpc.polkachu.com/",
          }}
        >
          {children}
        </AbstraxionProvider>
      </body>
    </html>
  );
}
