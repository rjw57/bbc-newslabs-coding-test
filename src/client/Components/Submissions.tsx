import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Toolbar, Typography } from "@mui/material";
import { Submission } from "../model";
import SubmissionCard from "./SubmissionCard";
import CreateSubmissionDialog from "./CreateSubmissionDialog";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import useSubmissions from "../hooks/useSubmissions";

export function Submissions() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: user } = useAuthenticatedUser();
  const { error, data: submissions, isLoading } = useSubmissions();

  // Log any errors which occur when fetching.
  useEffect(() => {
    error && console.error(error);
  }, [error]);

  const handleCreateDialogClose = () => {
    setShowCreateDialog(false);
  };

  function createSubmissionsCard(submission: Submission): JSX.Element {
    return (
      <Grid key={submission.id} item md={3}>
        {SubmissionCard(submission)}
      </Grid>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar /> {/* For spacing */}
      {user?.description === "public" && (
        <Box sx={{ pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowCreateDialog(true);
            }}
          >
            Create new submission
          </Button>
        </Box>
      )}
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
      <CreateSubmissionDialog
        open={showCreateDialog}
        onClose={handleCreateDialogClose}
      />
    </Box>
  );
}
