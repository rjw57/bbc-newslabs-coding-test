import * as React from "react";
import { Link as LinkRouter } from "react-router-dom";
import { AppBar, Toolbar, Typography, Link } from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import CurrentUser from "./CurrentUser";

export const Header = () => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        <Link
          component={LinkRouter}
          underline="hover"
          to="/"
          color="#fff"
          noWrap
        >
          News Labs I/O <ScienceIcon />
        </Link>
      </Typography>
      <Typography>
        <CurrentUser />
      </Typography>
    </Toolbar>
  </AppBar>
);
