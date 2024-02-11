import { useCallback, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { Address } from "~/interface";
import { extractErrorName } from "~/utils";

export function useSubscribeToHub(
  hubAddress: Address,
  client: any,
  account: any,
) {
  const [error, setError] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubscribeToHub = useCallback(async () => {
    if (!client || !account || account.bech32Address === "") {
      console.error("Not logged in");
      return;
    }

    try {
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
      setSubscribed(true);
    } catch (error) {
      const errorMessage = extractErrorName(error as Error);
      setError(errorMessage ?? "unknown error");
    }
  }, [client, account, hubAddress]);

  return { handleSubscribeToHub, subscribed, error };
}
