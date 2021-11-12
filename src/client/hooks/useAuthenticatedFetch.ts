import { useCallback } from "react";
import useAuthTokenState from "../hooks/useAuthTokenState";

/**
 * useAuthenticatedFetch returns a wrapper around fetch() which is
 * pre-authenticated for the current user.
 */
export const useAuthenticatedFetch = () => {
  const [token] = useAuthTokenState();
  return useCallback<typeof fetch>(
    (url, init) => {
      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;
      return fetch(url, {
        ...init,
        headers: { ...init?.headers, ...authHeaders },
      });
    },
    [token]
  );
};

export default useAuthenticatedFetch;
