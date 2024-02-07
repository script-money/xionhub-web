"use client";
import "~/styles/globals.css";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

export const hubContractAddress =
  "xion1dcldjxd56xekpx05efjg2wfzx3pa4s26pgrhfcca0z3k7u8h3jeq70sjnf";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`system-ui font-sans`}>
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
