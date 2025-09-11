import { APIGatewayProxyResult } from "aws-lambda";

export function createResponse(statusCode: number, body: any, headers?: Record<string, string>): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}
