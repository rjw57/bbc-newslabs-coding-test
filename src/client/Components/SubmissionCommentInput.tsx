import React, { MouseEvent, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Tooltip from "@mui/material/Tooltip";
import SendIcon from "@mui/icons-material/Send";
import useCreateComment from "../hooks/useCreateComment";

interface Props {
  submissionId: number;
}

export const SubmissionCommentInput = ({ submissionId }: Props) => {
  const [text, setText] = useState("");
  const { isLoading, mutate: createComment } = useCreateComment();

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setText("");
    createComment({ submissionId, text });
  };

  return (
    <Box sx={{ display: "flex" }} component="form">
      <Input
        sx={{ flexGrow: 1 }}
        placeholder="Add comment..."
        onChange={(e) => {
          setText(e.target.value);
        }}
        value={text}
      />
      <IconButton
        aria-label="submit"
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading || text === ""}
      >
        <Tooltip title="Submit">
          <SendIcon />
        </Tooltip>
      </IconButton>
    </Box>
  );
};

export default SubmissionCommentInput;
