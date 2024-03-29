import { useCallback, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { Address } from "~/interface";
import { extractErrorName } from "~/lib/utils";

export function useSubscribeToHub(client: any, account: any) {
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");

  const handleSubscribeToHub = useCallback(
    async (hubAddress: Address) => {
      if (!client || !account || account.bech32Address === "") {
        setError("Not logged in");
        return;
      }

      try {
        setLoading(true);
        const data = await client.execute(
          account.bech32Address,
          XIONHUB_ADDRESS,
          {
            subscribe_hub: {
              hub_addr: hubAddress,
            },
          },
          "auto",
        );
        console.log("Subscribe to Hub:", data);
        setTxHash(data.transactionHash);
        setError("");
        setSubscribed(true);
      } catch (error) {
        const errorMessage = extractErrorName(error as Error);
        setError(errorMessage ?? "unknown error");
      } finally {
        setLoading(false);
      }
    },
    [client, account],
  );

  return { handleSubscribeToHub, txHash, subscribed, error, loading };
}
