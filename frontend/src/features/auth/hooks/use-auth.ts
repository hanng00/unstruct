import { useAuthenticator } from "@aws-amplify/ui-react";

export const useAuth = () => {
  const { user, authStatus, isPending, signOut } = useAuthenticator((ctx) => [
    ctx.user,
    ctx.authStatus,
    ctx.isPending,
  ]);

  return {
    user,
    isLoading: authStatus === "configuring" || Boolean(isPending),
    isAuthenticated: authStatus === "authenticated",
    signOut,
  };
};
