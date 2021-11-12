import React, { ComponentProps, useState, ChangeEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import useCreateSubmission from "../hooks/useCreateSubmission";

interface Props
  extends Omit<ComponentProps<typeof Dialog>, "children" | "onClose"> {
  // Extend onClose to support other methods of closing the dialog.
  onClose?: (
    event: object,
    reason: "escapeKeyDown" | "backdropClick" | "cancel" | "create"
  ) => void;
}

export const CreateSubmissionDialog = ({ onClose, ...props }: Props) => {
  // In-flight submission
  const [submission, setSubmission] = useState({ text: "", title: "" });

  // Mutation hook
  const { mutate: createSubmission, isLoading: isMutating } =
    useCreateSubmission({
      onSuccess: () => {
        // Clear submission and call close event handler.
        setSubmission({ text: "", title: "" });
        onClose && onClose({}, "create");
      },
    });

  // A flag indicating if the in-flight submission is complete.
  const isSubmissionValid = submission.text !== "" && submission.title !== "";

  // Handle clicks on the cancel button.
  const handleCancel = (e: object) => {
    // Clear submission and call event handler.
    setSubmission({ text: "", title: "" });
    onClose && onClose(e, "cancel");
  };

  // Handle clicks on the create button.
  const handleCreate = () => {
    // This should not be possible but someone might be fiddling with
    // DevTools...
    if (!isSubmissionValid) {
      return;
    }

    // Kick off mutation.
    createSubmission(submission);
  };

  return (
    <Dialog onClose={onClose} {...props}>
      <DialogTitle>Create a new submission</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="Title"
          type="text"
          fullWidth
          variant="standard"
          value={submission.title}
          onInput={(e: ChangeEvent<HTMLInputElement>) => {
            setSubmission((prev) => ({ ...prev, title: e.target.value }));
          }}
        />
        <TextField
          multiline
          margin="dense"
          id="text"
          label="Description"
          type="text"
          fullWidth
          variant="standard"
          minRows={3}
          value={submission.text}
          onInput={(e: ChangeEvent<HTMLInputElement>) => {
            setSubmission((prev) => ({ ...prev, text: e.target.value }));
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!isSubmissionValid || isMutating}
          onClick={handleCreate}
        >
          Create
        </Button>
        <Button color="inherit" onClick={handleCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSubmissionDialog;
