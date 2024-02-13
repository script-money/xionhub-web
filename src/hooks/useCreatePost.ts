import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { extractErrorName } from "~/lib/utils";

export function useCreatePost(client: any, account: any) {
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreatePost = useCallback(
    async (title: string, content: string) => {
      if (!client || !account || account.bech32Address === "") {
        console.error("Not logged in");
        return;
      }

      try {
        setLoading(true);
        const post_id = uuidv4();
        const data = await client.execute(
          account.bech32Address,
          XIONHUB_ADDRESS,
          {
            create_post: {
              post_id,
              title,
              content,
            },
          },
          "auto",
        );
        console.log("Create Post:", data); // 5 seconds later, the post will be created
        setTxHash(data.transactionHash);
      } catch (error) {
        const errorMessage = extractErrorName(error as Error);
        setError(errorMessage ?? "unknown error");
      } finally {
        setLoading(false);
      }
    },
    [client, account],
  );

  return { handleCreatePost, txHash, error, loading };
}
