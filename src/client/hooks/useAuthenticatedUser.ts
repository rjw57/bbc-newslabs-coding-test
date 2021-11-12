import { useQuery, UseQueryOptions } from "react-query";
import { User } from "../model";
import useAuthenticatedFetch from "../hooks/useAuthenticatedFetch";

type AuthenticatedUser = Partial<User> & { isAnonymous: boolean };

/**
 * useAuthenticatedUser wraps useQuery to query information on the current user.
 */
export const useAuthenticatedUser = (
  options?: UseQueryOptions<AuthenticatedUser>
) => {
  const authFetch = useAuthenticatedFetch();

  return useQuery<AuthenticatedUser>(
    ["authenticatedUser"],
    async () => {
      const response = await authFetch("/api/users/me");
      if (!response.ok) {
        throw new Error("Error fetching authenticated user.");
      }
      return (await response.json()) as AuthenticatedUser;
    },
    options
  );
};

export default useAuthenticatedUser;
