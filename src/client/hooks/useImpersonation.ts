import { useCallback } from "react";
import useAuthTokenState from "../hooks/useAuthTokenState";

/**
 * useImpersonation returns a function which can be called with a user's
 * username in order to impersonate that user.
 */
export const useImpersonation = () => {
  const [, setToken] = useAuthTokenState();

  return useCallback(
    (username: string) => {
      const impersonate = async (username: string) => {
        const response = await fetch("/api/tokens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });
        if (!response.ok) {
          console.error("Failed to get token.");
          return;
        }
        const { token } = await response.json();
        setToken(token);
      };

      impersonate(username);
    },
    [setToken]
  );
};

export default useImpersonation;
