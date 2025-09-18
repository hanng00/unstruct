import { APIGatewayProxyEvent } from "aws-lambda";
import { User } from "./types";

type CognitoClaims = {
  sub: string;
  email: string;
  email_verified: string;
  "cognito:groups": string;
  "cognito:username": string;
  "custom:sharetribeId": string;
  "custom:userType": string;
  iss: string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: string;
  exp: string;
  iat: string;
  jti: string;
};

/**
 * Returns the user ID and email from the event.
 * Returns null if the user is not authenticated.
 */
export const getUserFromEvent = (event: APIGatewayProxyEvent): User | null => {
  const authorizer = event.requestContext?.authorizer || null;
  if (!authorizer) return null;

  const claims: CognitoClaims | null = authorizer?.claims || null;
  if (!claims) return null;

  return {
    id: claims.sub,
    email: claims.email,
    groups: claims["cognito:groups"].split(","),
    sharetribeId: claims["custom:sharetribeId"] ?? undefined,
    userType: claims["custom:userType"] ?? undefined,
  };
};
