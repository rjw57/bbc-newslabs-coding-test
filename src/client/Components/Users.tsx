import * as React from "react";
import { Box, Button, Toolbar, Typography } from "@mui/material";
import useUsers from "../hooks/useUsers";
import { useImpersonation } from "../hooks/useImpersonation";

export function Users() {
  const impersonateUser = useImpersonation();
  const { isLoading, data: users } = useUsers();

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {!isLoading && users ? (
        users.map((user) => {
          return (
            <Typography paragraph key={"user-" + user.id}>
              <Button
                sx={{ mr: 2 }}
                onClick={() => impersonateUser(user.username)}
                variant="outlined"
                data-impersonation-target={user.username}
              >
                Impersonate
              </Button>
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
