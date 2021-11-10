import React from "react";
import Typography from "@mui/material/Typography";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";

// Show the current logged in user's username or "Anonymous user" if there is no
// user.
export const CurrentUser = () => {
  const { data: user } = useAuthenticatedUser();
  return (
    <Typography component="span">
      {user?.isAnonymous ? "Anonymous user" : user?.username}
    </Typography>
  );
};

export default CurrentUser;
