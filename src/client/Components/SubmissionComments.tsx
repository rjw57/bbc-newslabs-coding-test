import React from "react";
import Typography from "@mui/material/Typography";
import useSubmissionComments from "../hooks/useSubmissionComments";

interface Props {
  submissionId: number;
}

export const SubmissionComments = ({ submissionId }: Props) => {
  const { data } = useSubmissionComments(submissionId);
  return (
    <>
      {(data?.comments || []).map(({ username, text }, idx) => (
        <Typography key={idx} variant="body2">
          <strong>{username}:</strong> {text}
        </Typography>
      ))}
    </>
  );
};

export default SubmissionComments;
