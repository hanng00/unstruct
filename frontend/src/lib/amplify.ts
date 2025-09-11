import { Amplify } from "aws-amplify";
import { getCognitoUserPoolClientId, getCognitoUserPoolId } from "./constants";

const userPoolId = getCognitoUserPoolId();
const userPoolClientId = getCognitoUserPoolClientId();
if (userPoolId && userPoolClientId) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: "code",
        loginWith: { email: true },
      },
    },
  });
}
