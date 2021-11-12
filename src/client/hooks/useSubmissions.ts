import { useQuery, UseQueryOptions } from "react-query";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import useAuthenticatedFetch from "../hooks/useAuthenticatedFetch";
import { Submission } from "../model";

/**
 * useSubmissions wraps useQuery to query for a list of submissions viewable by
 * the current authenticated user. If there is no authenticated user, the list
 * is empty.
 */
export const useSubmissions = (options?: UseQueryOptions<Submission[]>) => {
  const { data: user } = useAuthenticatedUser();
  const authFetch = useAuthenticatedFetch();

  return useQuery<Submission[]>(
    ["submissions"],
    async () => {
      // The anonymous user sees no submissions.
      if (user?.isAnonymous) {
        return [];
      }

      // Fetch the list of submissions visible to the user.
      const response = await authFetch("/api/submissions");
      if (!response.ok) {
        throw new Error("Error fetching submissions.");
      }
      return (await response.json()) as Submission[];
    },
    {
      ...options,

      // Query is disabled if we don't have a signed in user yet or if the
      // passed in options disable it.
      enabled: !!user && options?.enabled !== false,
    }
  );
};

export default useSubmissions;
