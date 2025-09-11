import { Authenticator } from "@aws-amplify/ui-react";
import "@/lib/amplify";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
};
