export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
if (!BACKEND_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_API_URL is not defined. Please check your environment variables."
  );
}

export const getBackendApiUrl = (): string => {
  const id = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!id) {
    throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not set");
  }
  return id;
};

export const getCognitoUserPoolId = (): string => {
  const id = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  if (!id) {
    throw new Error("NEXT_PUBLIC_COGNITO_USER_POOL_ID is not set");
  }
  return id;
};

export const getCognitoUserPoolClientId = (): string => {
  const id = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
  if (!id) {
    throw new Error("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID is not set");
  }
  return id;
};

export const REDIRECT_AFTER_SIGN_IN = "/tabular";