import * as React from "react";
import { Box, Toolbar, Typography } from "@mui/material";
import useUsers from "../hooks/useUsers";

export function Users() {
  const { isLoading, data: users } = useUsers();

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {!isLoading && users ? (
        users.map((user) => {
          return (
            <Typography paragraph key={"user-" + user.id}>
              {user.username}: {user.description} ({user.created_at})
            </Typography>
          );
        })
      ) : (
        <Typography>LOADING</Typography>
      )}
    </Box>
  );
}
