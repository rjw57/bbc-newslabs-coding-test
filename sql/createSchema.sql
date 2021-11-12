DROP INDEX IF EXISTS comments_submission_id_created_at_idx;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS tokens;

CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role_id INTEGER NOT NULL,
  FOREIGN KEY(role_id) REFERENCES role(id)
);

CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES user(id)
);

CREATE TABLE tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES user(id)
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  submission_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(submission_id) REFERENCES submissions(id)
);

CREATE INDEX comments_submission_id_created_at_idx
  ON comments(submission_id, created_at);
