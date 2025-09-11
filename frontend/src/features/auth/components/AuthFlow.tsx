"use client";

import { SignInForm } from "./SignInForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { ForceChangePasswordForm } from "./ForceChangePasswordForm";
import { useAuthFlow } from "../hooks/use-auth-flow";

export function AuthFlow() {
  const { step, email, goToSignIn, completeAuthentication } = useAuthFlow();

  if (step === "reset") {
    return (
      <ResetPasswordForm
        initialEmail={email}
        onBack={goToSignIn}
        onCompleted={goToSignIn}
      />
    );
  }

  if (step === "forceChange") {
    return <ForceChangePasswordForm onDone={completeAuthentication} />;
  }

  return <SignInForm />;
}


