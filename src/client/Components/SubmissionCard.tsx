import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Submission } from "../model";
import SubmissionCommentInput from "./SubmissionCommentInput";
import SubmissionComments from "./SubmissionComments";

export default function SubmissionCard(submission: Submission) {
  return (
    <Card variant="outlined">
      <CardContent>
        <p style={{ fontWeight: "bold" }}>{submission.title}</p>
        <p>{submission.text}</p>
        <p style={{ fontStyle: "italic" }}>{submission.username}</p>
        <p>{submission.created_at}</p>
        {submission.comment_count === 0 ? (
          <Typography
            sx={{ color: "text.secondary" }}
            variant="body2"
            gutterBottom
          >
            No comments
          </Typography>
        ) : (
          <SubmissionComments submissionId={submission.id} />
        )}
        <SubmissionCommentInput submissionId={submission.id} />
      </CardContent>
    </Card>
  );
}
