import { Request, Response, NextFunction } from "express";
import { userFromToken } from "../db";

// Express middleware which validates tokens passed via the Authorization
// header. If the token is invalid a 403 response is returned.
//
// The authenticated user object is set as locals.user on the response object.
const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization") || "";
  if (authHeader !== "") {
    const [authType, token] = authHeader.split(" ");
    if (authType !== "Bearer") {
      res.status(403).send("Bad authorization header");
      return;
    }
    res.locals.user = await userFromToken(token);
    if (!res.locals.user) {
      res.status(403).send("Bad token");
      return;
    }
  }
  next();
};

// Helper function to set response indicating that authentication is required.
export const handleAuthRequired = (res: Response) => {
  res
    .status(401)
    .set({
      "WWW-Authenticate": "Bearer",
    })
    .json({
      message: "Authentication required.",
    });
};

export default auth;
