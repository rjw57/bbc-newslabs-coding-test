import { Router } from "express";
import { getUsersAndRoles } from "../db";
import handleError from "../lib/handleError";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const user = await getUsersAndRoles();
    res.json(user);
  } catch (error) {
    handleError(res, error as Error);
  }
});

// Return the current signed in user or the anonymous user.
router.get("/users/me", async (req, res) => {
  const { user } = res.locals;
  res.json({ ...user, isAnonymous: !user });
});

export default router;
