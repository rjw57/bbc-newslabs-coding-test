import { useMutation, UseMutationOptions, useQueryClient } from "react-query";
import useAuthenticatedFetch from "../hooks/useAuthenticatedFetch";
import { Submission } from "../model";

interface NewSubmission {
  title: string;
  text: string;
}

/**
 * useCreateSubmission wraps useMutation to create a new submission as the
 * current user.
 *
 * The 'submissions' query is invalidated so that consumers of the submission
 * list get the new submission. The new submission is added to the query cache.
 */
export const useCreateSubmission = (
  options: UseMutationOptions<Submission, Error, NewSubmission> = {}
) => {
  // Current query client (aka cache of submissions)
  const queryClient = useQueryClient();

  // Authenticated fetch wrapper.
  const authFetch = useAuthenticatedFetch();

  // A mutation to set the new submission.
  return useMutation(
    async (newSubmission: NewSubmission) => {
      const response = await authFetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubmission),
      });
      if (!response.ok) {
        throw new Error("Error creating submission");
      }
      return await response.json();
    },
    {
      ...options,

      onSuccess: (submission: Submission, ...args) => {
        // Invalidate any submission lists and update any cached submission.
        queryClient.invalidateQueries("submissions");
        queryClient.setQueryData(["submission", submission.id], submission);

        // Call any success handler we may have been passed.
        options.onSuccess && options.onSuccess(submission, ...args);
      },
    }
  );
};

export default useCreateSubmission;
