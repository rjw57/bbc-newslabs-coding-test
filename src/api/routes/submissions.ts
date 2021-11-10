import { Router } from "express";
import { getSubmissionsAndUsers, getSubmissionAndUser } from "../db";
import handleError from "../lib/handleError";

const router = Router();

router.get("/submissions", async (req, res) => {
  // We require authentication.
  const { user } = res.locals;
  if (!user) {
    handleAuthRequired(res);
    return;
  }

  const { description, id: userId } = user;
  try {
    // journalists get all submissions
    const submission = await getSubmissionsAndUsers({
      userId: description === "journalist" ? undefined : userId,
    });
    res.json(submission);
  } catch (error) {
    handleError(res, error as Error);
  }
});

router.get("/submissions/:id", async (req, res) => {
  // We require authentication.
  const { user } = res.locals;
  if (!user) {
    handleAuthRequired(res);
    return;
  }

  const { description, username } = user;
  const submissionId = req.params["id"];
  try {
    const submission = await getSubmissionAndUser(submissionId);
    if (!submission) {
      res.status(404).json({ message: "Not Found" });
      return;
    }

    // If the user is not a journalist, they must be the submitter.
    if (description !== "journalist" && submission.username !== username) {
      // There is a divergence of thought about whether 403 or 404 is better
      // here. Since the ids are clearly sequential, the "existance leak"
      // by returning 403 is minimal.
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.json(submission);
  } catch (error) {
    handleError(res, error as Error);
  }
});

export default router;
