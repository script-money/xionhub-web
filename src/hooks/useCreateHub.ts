import { useCallback, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { extractErrorName } from "~/lib/utils";

export const useCreateHub = (client: any, account: any) => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateHub = useCallback(
    async (hubName: string) => {
      if (!client || account.bech32Address === "") {
        setError("Not login");
        return;
      }

      try {
        setLoading(true);
        const data = await client.execute(
          account.bech32Address,
          XIONHUB_ADDRESS,
          {
            create_hub: {
              hub_name: hubName,
              need_pay: { amount: "0", denom: "uxion" },
            },
          },
          "auto",
        );
        console.log("Create Hub:", data);
      } catch (error) {
        const errorMessage = extractErrorName(error as Error);
        setError(errorMessage ?? "unknown error");
      } finally {
        setLoading(false);
      }
    },
    [client, account, XIONHUB_ADDRESS],
  );

  return { handleCreateHub, error, loading };
};
