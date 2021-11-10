import ReactDOM from "react-dom";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import { Users } from "./Components/Users";
import { Home } from "./Components/Home";
import { Submissions } from "./Components/Submissions";
import { Header } from "./Components/Header";
import { Navigation } from "./Components/Navigation";
import { theme } from "./theme";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <Header />
            <Navigation />
            <Switch>
              <Route path="/users">
                <Users />
              </Route>
              <Route path="/submissions">
                <Submissions />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Box>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
