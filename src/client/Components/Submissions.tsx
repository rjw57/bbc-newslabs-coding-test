import React, { useEffect } from "react";
import { Box, Grid, Toolbar, Typography } from "@mui/material";
import { Submission } from "../model";
import SubmissionCard from "./SubmissionCard";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import useSubmissions from "../hooks/useSubmissions";

export function Submissions() {
  const { data: user } = useAuthenticatedUser();
  const { error, data: submissions, isLoading } = useSubmissions();

  // Log any errors which occur when fetching.
  useEffect(() => {
    error && console.error(error);
  }, [error]);

  function createSubmissionsCard(submission: Submission): JSX.Element {
    return (
      <Grid key={submission.id} item md={3}>
        {SubmissionCard(submission)}
      </Grid>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      {(!user || user.isAnonymous) && (
        <Typography sx={{ color: "error.main" }}>
          Sign in to view submissions.
        </Typography>
      )}
      <Grid container spacing={3}>
        {isLoading ? (
          <Typography>LOADING</Typography>
        ) : (
          (submissions || []).map(createSubmissionsCard)
        )}
      </Grid>
    </Box>
  );
}
