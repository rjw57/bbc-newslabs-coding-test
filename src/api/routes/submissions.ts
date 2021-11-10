import { Router } from "express";
import {
  Submission,
  User,
  createComment,
  createSubmission,
  getSubmissionAndUser,
  getSubmissionComments,
  getSubmissionsAndUsers,
} from "../db";
import handleError from "../lib/handleError";
import { handleAuthRequired } from "../middleware/auth";
import locateIP from "../locateIP";

const router = Router();

// Utility function to test if a given user can see a submission.
const userCanViewSubmission = (user: User, submission: Submission) => {
  const { description, username } = user;

  // If the user is not a journalist, they must be the submitter.
  if (description !== "journalist" && submission.username !== username) {
    return false;
  }

  return true;
};

router.get("/submissions", async (req, res) => {
  // We require authentication.
  const { user } = res.locals;
  if (!user) {
    handleAuthRequired(res);
    return;
  }

  const { description, id: userId } = user;
  try {
    // journalists get all submissions and their locations
    const submission = await getSubmissionsAndUsers({
      userId: description === "journalist" ? undefined : userId,
      includingLocation: description === "journalist",
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
  const { description } = user;

  const submissionId = req.params["id"];
  try {
    const submission = await getSubmissionAndUser(submissionId, {
      // Journalists get location.
      includingLocation: description === "journalist",
    });
    if (!submission) {
      res.status(404).json({ message: "Not Found" });
      return;
    }

    if (!userCanViewSubmission(user, submission)) {
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

router.post("/submissions", async (req, res) => {
  // We require authentication.
  const { user } = res.locals;
  if (!user) {
    handleAuthRequired(res);
    return;
  }

  // The user must be a member of the public.
  const { id: userId, description } = user;
  if (description !== "public") {
    res.status(403).json({ message: "Forbidden" });
  }

  // Extract and verify body.
  const { title, text } = req.body;
  if (!title || typeof title !== "string") {
    res.status(400).json({ message: "Bad or missing title" });
    return;
  }
  if (!text || typeof text !== "string") {
    res.status(400).json({ message: "Bad or missing text" });
    return;
  }

  // Convert IP to location using GeoIP service.
  const location = locateIP(req.ip);

  // Create submission.
  const response = await createSubmission(userId, { title, text, location });
  res.status(201).json(response);
});

router.get("/submissions/:id/comments", async (req, res) => {
  // We require authentication.
  const { user } = res.locals;
  if (!user) {
    handleAuthRequired(res);
    return;
  }

  const submissionId = req.params["id"];
  try {
    const submission = await getSubmissionAndUser(submissionId);
    if (!submission) {
      res.status(404).json({ message: "Not Found" });
      return;
    }

    if (!userCanViewSubmission(user, submission)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.json({
      id: submission.id,
      comments: await getSubmissionComments(submission.id),
    });
  } catch (error) {
    handleError(res, error as Error);
  }
});

router.post("/submissions/:id/comments", async (req, res) => {
  // We require authentication.
  const { user } = res.locals;
  if (!user) {
    handleAuthRequired(res);
    return;
  }

  const submissionId = req.params["id"];
  try {
    const submission = await getSubmissionAndUser(submissionId);
    if (!submission) {
      res.status(404).json({ message: "Not Found" });
      return;
    }

    if (!userCanViewSubmission(user, submission)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    // Extract and verify body.
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ message: "Bad or missing text" });
      return;
    }

    await createComment(submission.id, { user_id: user.id, text });
    res.status(201).json({
      id: submission.id,
      comments: await getSubmissionComments(submission.id),
    });
  } catch (error) {
    handleError(res, error as Error);
  }
});

export default router;
