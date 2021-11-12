import { useMutation, UseMutationOptions, useQueryClient } from "react-query";
import useAuthenticatedFetch from "../hooks/useAuthenticatedFetch";
import { SubmissionComments } from "../model";

interface NewComment {
  submissionId: number;
  text: string;
}

/**
 * useCreateComment wraps useMutation to create a new comment on an existing
 * submission as the current user.
 *
 * The 'submissions' and 'submissionComments' queries are invalidated and
 * updated as appropriate.
 */
export const useCreateComment = (
  options: UseMutationOptions<SubmissionComments, Error, NewComment> = {}
) => {
  // Current query client.
  const queryClient = useQueryClient();

  // Authenticated fetch wrapper.
  const authFetch = useAuthenticatedFetch();

  // A mutation to create comments.
  return useMutation(
    async ({ submissionId, text }: NewComment) => {
      const response = await authFetch(
        `/api/submissions/${submissionId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );
      if (!response.ok) {
        throw new Error("Error creating comment");
      }
      return await response.json();
    },
    {
      ...options,

      onSuccess: (submissionComments, ...args) => {
        // Invalidate any submission lists and update any cached submission
        // comments.
        queryClient.invalidateQueries("submissions");
        queryClient.setQueryData(
          ["submissionComments", submissionComments.id],
          submissionComments
        );

        // Call any success handler we may have been passed.
        options.onSuccess && options.onSuccess(submissionComments, ...args);
      },
    }
  );
};

export default useCreateComment;
