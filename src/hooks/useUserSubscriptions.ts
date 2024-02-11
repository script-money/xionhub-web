import { useState, useCallback } from "react";

export function useUserSubscriptions(
  user: string,
  page: number,
  size: number,
  client: any,
) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubscriptions = useCallback(async () => {
    if (!client || !user) {
      setError("Client or user not provided");
      return;
    }

    setLoading(true);
    try {
      const data = await client.queryUserSubscriptions({ user, page, size });
      setSubscriptions(data.subscriptions);
    } catch (e) {
      setError("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }, [client, user, page, size]);

  return { subscriptions, loading, error, fetchSubscriptions };
}
