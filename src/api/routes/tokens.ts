import { Router } from "express";
import { createToken } from "../db";
import handleError from "../lib/handleError";

const router = Router();

// POST to /tokens to create an impersonation token.
router.post("/tokens", async (req, res) => {
  const username = req.body.username;
  if (!username) {
    handleError(res, new Error("username: field required"));
    return;
  }
  try {
    const token = await createToken(`${username}`);
    if (!token) {
      res.status(400).json({
        message: "No such user",
      });
    } else {
      res.status(201).json({ token });
    }
  } catch (error) {
    console.error("Error creating token:", error);
    handleError(res, error as Error);
  }
});

export default router;
