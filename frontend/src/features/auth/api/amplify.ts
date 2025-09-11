import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  signOut as amplifySignOut,
  confirmSignIn as amplifyConfirmSignIn,
} from "aws-amplify/auth";

export interface SignInParams {
  email: string;
  password: string;
}

export type SignInNextStep = {
  signInStep:
    | "DONE"
    | "CONFIRM_SIGN_IN_WITH_SMS_CODE"
    | "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
    | "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
    | string;
};

export interface SignUpParams {
  email: string;
  password: string;
}

export interface ConfirmSignUpParams {
  email: string;
  confirmationCode: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface ConfirmResetPasswordParams {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

export type ResetPasswordNextStep = {
  resetPasswordStep: "CONFIRM_RESET_PASSWORD_WITH_CODE" | "DONE";
  codeDeliveryDetails?: {
    deliveryMedium?: string;
    destination?: string;
    attributeName?: string;
  };
};

export async function signIn({ email, password }: SignInParams): Promise<SignInNextStep> {
  const output = await amplifySignIn({ username: email, password });
  return output.nextStep as SignInNextStep;
}

export async function signUp({ email, password }: SignUpParams): Promise<void> {
  await amplifySignUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function signOut(): Promise<void> {
  await amplifySignOut();
}

export async function confirmSignUp({
  email,
  confirmationCode,
}: ConfirmSignUpParams): Promise<void> {
  await amplifyConfirmSignUp({
    username: email,
    confirmationCode,
  });
}

export interface ConfirmNewPasswordParams {
  newPassword: string;
}

export async function confirmNewPassword({
  newPassword,
}: ConfirmNewPasswordParams): Promise<void> {
  await amplifyConfirmSignIn({
    challengeResponse: newPassword,
  });
}

export async function resetPassword({
  email,
}: ResetPasswordParams): Promise<ResetPasswordNextStep> {
  const output = await amplifyResetPassword({ username: email });
  return output.nextStep as ResetPasswordNextStep;
}

export async function confirmResetPassword({
  email,
  confirmationCode,
  newPassword,
}: ConfirmResetPasswordParams): Promise<void> {
  await amplifyConfirmResetPassword({
    username: email,
    confirmationCode,
    newPassword,
  });
}
