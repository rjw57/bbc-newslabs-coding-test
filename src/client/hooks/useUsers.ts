import { User } from "../model";
import { useQuery } from "react-query";

/**
 * useUsers wraps useQuery to return the list of users viewable by the
 * authenticated user.
 */
export const useUsers = () => {
  return useQuery<User[]>("users", async () => {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error("Error fetching users");
    }
    return await response.json();
  });
};

export default useUsers;
