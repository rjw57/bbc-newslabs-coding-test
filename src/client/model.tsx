export interface Submission {
  id: number;
  title: string;
  text: string;
  username: string;
  location?: string;
  created_at: string;
  comment_count: number;
}

export interface User {
  username: string;
  id: number;
  description: string;
  created_at: string;
}

export interface SubmissionComments {
  id: number;
  comments: {
    username: string;
    user_id: number;
    text: string;
  }[];
}
