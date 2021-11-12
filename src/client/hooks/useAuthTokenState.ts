import { useContext } from "react";
import { AuthTokenContext } from "../providers/AuthTokenProvider";

/**
 * useAuthTokenState wraps useContext to return the current authentication token
 * and a setter function in the style of useState().
 */
export const useAuthTokenState = () => useContext(AuthTokenContext);

export default useAuthTokenState;
