"use client";
import "~/styles/globals.css";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

import "@burnt-labs/abstraxion/styles.css";
import "@burnt-labs/ui/styles.css";

export const hubContractAddress =
  "xion1lwg7ka24j9dflaysfw9qe5gwlz7zgknsdp5gndl3lqx52eqlq4nsnlraql";

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
