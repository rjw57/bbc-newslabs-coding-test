import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Submission } from "../model";
import SubmissionCommentInput from "./SubmissionCommentInput";
import SubmissionComments from "./SubmissionComments";

const mapUrlFromLocation = (location: string) => {
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/@?api=1&map_action=map&zoom=12&center=${encodedLocation}`;
};

export default function SubmissionCard(submission: Submission) {
  return (
    <Card variant="outlined">
      <CardContent>
        <p style={{ fontWeight: "bold" }}>{submission.title}</p>
        <p>{submission.text}</p>
        <p style={{ fontStyle: "italic" }}>{submission.username}</p>
        <p>{submission.created_at}</p>
        {submission.location && (
          <p>
            <Link
              href={mapUrlFromLocation(submission.location)}
              target="_blank"
            >
              location
            </Link>
          </p>
        )}
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
