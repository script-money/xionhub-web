import { useCallback, useState } from "react";
import { XIONHUB_ADDRESS } from "~/constant";
import { extractErrorName } from "~/utils";

export function useLikePost(postId: string, client: any, account: any) {
  const [error, setError] = useState<string>("");
  const [liked, setLiked] = useState<boolean>(false);

  const handleLikePost = useCallback(async () => {
    if (!client || !account || account.bech32Address === "") {
      console.error("Not logged in");
      return;
    }

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
      setLiked(true);
    } catch (error) {
      const errorMessage = extractErrorName(error as Error);
      setError(errorMessage ?? "unknown error");
    }
  }, [client, account, postId]);

  return { handleLikePost, liked, error };
}
