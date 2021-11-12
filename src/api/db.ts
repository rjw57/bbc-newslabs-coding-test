import Knex from "knex";
import path from "path";
import { randomUUID } from "crypto";

const knex = Knex({
  client: "sqlite3",
  connection: {
    filename: path.resolve(__dirname, "../../sql/dev.db"),
  },
  useNullAsDefault: true,
});

export interface Submission {
  id: number;
  title: string;
  text: string;
  location?: string;
  username: string;
  comment_count: number;
  created_at: string;
}

type NewSubmission = Omit<
  Submission,
  "id" | "created_at" | "username" | "comment_count"
>;

export interface User {
  username: string;
  id: number;
  description: string;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}

type NewComment = Omit<Comment, "id" | "username" | "created_at">;

export async function getUsersAndRoles(): Promise<User[]> {
  return await knex
    .from("users")
    .select("username", "created_at", "users.id", "role_id", "description")
    .leftJoin("roles", "roles.id", "=", "users.role_id");
}

// If userId is defined, only submissions from the passed user are returned.
// Otherwise all submissions are returned.
export async function getSubmissionsAndUsers({
  userId,
  includingLocation,
}: { userId?: number; includingLocation?: boolean } = {}): Promise<
  Submission[]
> {
  let query = knex
    .from("submissions")
    .select(
      ...[
        "submissions.id",
        "title",
        "submissions.text",
        "submissions.created_at",
        "submissions.user_id",
        "username",
        knex.count("comments.id").as("comment_count"),
        ...(includingLocation ? ["location"] : []),
      ]
    )
    .leftJoin("users", "users.id", "=", "submissions.user_id")
    .leftJoin("comments", "comments.submission_id", "=", "submissions.id")
    .groupBy("submissions.id");
  if (userId) {
    query = query.where("users.id", "=", userId);
  }
  return await query;
}

export async function getSubmissionAndUser(
  id: string,
  { includingLocation }: { includingLocation?: boolean } = {}
): Promise<Submission> {
  return (
    await knex
      .from("submissions")
      .select(
        ...[
          "submissions.id",
          "title",
          "submissions.text",
          "submissions.created_at",
          "submissions.user_id",
          "username",
          ...(includingLocation ? ["location"] : []),
        ]
      )
      .leftJoin("users", "users.id", "=", "submissions.user_id")
      .where("submissions.id", id)
  )[0];
}

export async function getSubmissionComments(id: number): Promise<Comment[]> {
  return await knex
    .from("comments")
    .select("comments.id", "text", "comments.created_at", "user_id", "username")
    .leftJoin("users", "users.id", "=", "comments.user_id")
    .where("submission_id", "=", id)
    .orderBy("comments.created_at", "asc");
}

export async function createComment(
  submission_id: number,
  comment: NewComment
) {
  return await knex.table("comments").insert({ submission_id, ...comment });
}

// Create a new token for the user with the passed username. Returns undefined
// if there is no such user. If a token already exists for the passed user, it
// is returned.
export async function createToken(username: string) {
  const existingUser = await knex
    .from("users")
    .select("users.id", "tokens.token")
    .leftJoin("tokens", "tokens.user_id", "=", "users.id")
    .where("users.username", "=", username)
    .first();

  // If there is no user, return undefined.
  if (!existingUser) {
    return;
  }

  // If the user has a token, return it.
  if (existingUser.token) {
    return existingUser.token;
  }

  // Otherwise, create a new one.
  const token = randomUUID();
  await knex.table("tokens").insert({ token, user_id: existingUser.id });
  return token;
}

// Given a token, return the matching user or undefined if there is no user with
// a matching token.
export async function userFromToken(token: string) {
  const user: User | undefined = await knex
    .table("users")
    .first("username", "users.created_at", "users.id", "role_id", "description")
    .leftJoin("tokens", "tokens.user_id", "=", "users.id")
    .leftJoin("roles", "roles.id", "=", "users.role_id")
    .where("tokens.token", token);
  return user;
}

// Create a new submission returning an object matching the return value from
// getSubmissionsAndUsers.
export async function createSubmission(
  user_id: number,
  submission: NewSubmission
) {
  const { title, text, location } = submission;
  const [id] = await knex
    .table("submissions")
    .insert({ title, text, location, user_id });
  return await getSubmissionAndUser(`${id}`);
}

// Tear down any open database connections. Usually you will not need to call
// this function explicitly but it can be useful in, e.g., test suites to ensure
// that no dangling connections are left open.
export function tearDownConnection() {
  knex.destroy();
}
