import { useState, useCallback } from "react";

export function usePostLikes(postId: string, client: any) {
  const [likes, setLikes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchLikes = useCallback(async () => {
    if (!client) {
      setError("Client not provided");
      return;
    }

    try {
      const data = await client.queryPostLikes(postId);
      setLikes(data.likes);
    } catch (e) {
      setError("Failed to fetch likes");
    }
  }, [client, postId]);

  return { likes, error, fetchLikes };
}
