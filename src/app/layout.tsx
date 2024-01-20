"use client";
import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

import "@burnt-labs/abstraxion/styles.css";
import "@burnt-labs/ui/styles.css";

export const hubContractAddress =
  "xion1lwg7ka24j9dflaysfw9qe5gwlz7zgknsdp5gndl3lqx52eqlq4nsnlraql";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <AbstraxionProvider
          config={{
            contracts: [hubContractAddress],
          }}
        >
          {children}
        </AbstraxionProvider>
      </body>
    </html>
  );
}
