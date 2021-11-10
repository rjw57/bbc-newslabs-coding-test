import React, {
  ComponentProps,
  createContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "react-query";

const useTokenState = () => useState<string | undefined>();

type Context = ReturnType<typeof useTokenState>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const AuthTokenContext = createContext<Context>([undefined, () => {}]);

type Props = Omit<ComponentProps<typeof AuthTokenContext.Provider>, "value">;

// Provider which exposes the authentication token state to its children.
export const AuthTokenProvider = (props: Props) => {
  const [token, setToken] = useTokenState();

  // If the token changes, clear the query cache refresh everything to ensure
  // that we don't have any lingering results from a previous user.
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.resetQueries();
    queryClient.clear();
  }, [queryClient, token]);

  return <AuthTokenContext.Provider value={[token, setToken]} {...props} />;
};

export default AuthTokenProvider;
