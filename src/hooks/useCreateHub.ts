import { useCallback, useRef, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { extractErrorName } from "~/utils";

export function useCreateHub(client: any, account: any) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleCreateHub = useCallback(async () => {
    if (!client || account.bech32Address === "") {
      console.log("Not login");
      return;
    }
    if (!nameInputRef.current?.value) {
      console.error("Hub Name is empty");
      return;
    }

    try {
      const data = await client.execute(
        account.bech32Address,
        XIONHUB_ADDRESS,
        {
          create_hub: {
            hub_name: nameInputRef.current.value,
            need_pay: { amount: "0", denom: "uxion" },
          },
        },
        "auto",
      );
      console.log("Create Hub:", data);
    } catch (error) {
      const errorMessage = extractErrorName(error as Error);
      setError(errorMessage ?? "unknown error");
    }
  }, [client, account, XIONHUB_ADDRESS]);

  return { nameInputRef, handleCreateHub, error };
}
