import { useState, useCallback } from "react";
import { Address } from "~/interface";

export function useHubPosts(
  userAddr: Address, // Changed type to string to match the Rust interface
  hubAddr: Address, // Changed type to string to match the Rust interface
  page: number, // Added pagination parameters
  size: number, // Added pagination parameters
  client: any,
) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    if (!client) {
      setError("Client not provided");
      return;
    }

    setLoading(true);
    try {
      // Updated to include userAddr, hubAddr, page, and size in the query
      const data = await client.queryHubPosts({
        user_addr: userAddr,
        hub_addr: hubAddr,
        page,
        size,
      });
      setPosts(data.posts);
    } catch (e) {
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [client, userAddr, hubAddr, page, size]); // Added dependencies to the useCallback hook

  return { posts, loading, error, fetchPosts };
}
