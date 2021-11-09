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

interface Submission {
  id: number;
  title: string;
  text: string;
  username: string;
  created_at: string;
}

interface User {
  username: string;
  id: number;
  description: string;
  created_at: string;
}

export async function getUsersAndRoles(): Promise<User[]> {
  return await knex
    .from("users")
    .select("username", "created_at", "users.id", "role_id", "description")
    .leftJoin("roles", "roles.id", "=", "users.role_id");
}

export async function getSubmissionsAndUsers(): Promise<Submission[]> {
  return await knex
    .from("submissions")
    .select(
      "submissions.id",
      "title",
      "text",
      "submissions.created_at",
      "user_id",
      "username"
    )
    .leftJoin("users", "users.id", "=", "submissions.user_id");
}

export async function getSubmissionAndUser(id: string): Promise<Submission> {
  return (
    await knex
      .from("submissions")
      .select(
        "submissions.id",
        "title",
        "text",
        "submissions.created_at",
        "user_id",
        "username"
      )
      .leftJoin("users", "users.id", "=", "submissions.user_id")
      .where("submissions.id", id)
  )[0];
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

// Tear down any open database connections. Usually you will not need to call
// this function explicitly but it can be useful in, e.g., test suites to ensure
// that no dangling connections are left open.
export function tearDownConnection() {
  knex.destroy();
}
