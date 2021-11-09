import express from "express";
import users from "./routes/users";
import submissions from "./routes/submissions";
import tokens from "./routes/tokens";

const api = express();

const port = 8080;

api.get("/status", (req, res) => {
  res.json({ api: "ok" });
});

// Use JSON middleware to make API JSON handling easier.
api.use(express.json());

api.use(users);
api.use(submissions);
api.use(tokens);

if (process.env["NODE_ENV"] === "production") {
  api.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}

export default api;
