import { useQuery, UseQueryOptions } from "react-query";
import useAuthenticatedFetch from "../hooks/useAuthenticatedFetch";
import { SubmissionComments } from "../model";

/**
 * useSubmissionComments wraps useQuery to fetch the list of comments associated
 * with a given submission.
 */
export const useSubmissionComments = (
  submissionId: number,
  options?: UseQueryOptions<SubmissionComments>
) => {
  const authFetch = useAuthenticatedFetch();

  return useQuery<SubmissionComments>(
    ["submissionComments", submissionId],
    async () => {
      const response = await authFetch(
        `/api/submissions/${submissionId}/comments`
      );
      if (!response.ok) {
        throw new Error("Error fetching submission comments.");
      }
      return (await response.json()) as SubmissionComments;
    },
    options
  );
};

export default useSubmissionComments;
