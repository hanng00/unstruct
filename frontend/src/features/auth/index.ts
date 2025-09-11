export { AuthProvider } from "./AuthProvider";
export { ProtectedRoute } from "./components/ProtectedRoute";
export { SignInForm } from "./components/SignInForm";
export { UserMenu } from "./components/UserMenu";
export { signInSchema } from "./schemas/signin";
export type { SignInFormData } from "./schemas/signin";

// API functions
export {
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
} from "./api/amplify";

export type {
  SignInParams,
  SignUpParams,
  ConfirmSignUpParams,
  ResetPasswordParams,
  ConfirmResetPasswordParams,
} from "./api/amplify";
