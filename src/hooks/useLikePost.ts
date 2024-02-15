import { useCallback, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { extractErrorName } from "~/lib/utils";

export function useLikePost(postId: string, client: any, account: any) {
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLikePost = useCallback(async () => {
    if (!client || !account || account.bech32Address === "") {
      setError("Not logged in");
      return;
    }
    setLoading(true);
    try {
      const data = await client.execute(
        account.bech32Address,
        XIONHUB_ADDRESS,
        {
          like_post: {
            post_id: postId,
          },
        },
        "auto",
      );
      console.log("Like Post:", data);
      setTxHash(data.transactionHash);
      setError("");
      setLiked(true);
    } catch (error) {
      const errorMessage = extractErrorName(error as Error);
      setError(errorMessage ?? "unknown error");
    } finally {
      setLoading(false); // Reset confirming state after the action is completed or failed
    }
  }, [client, account, postId]);

  return { handleLikePost, txHash, liked, error, loading };
}
