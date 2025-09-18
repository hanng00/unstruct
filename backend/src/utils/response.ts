import { withCors } from "./cors";

export const unauthorized = () => {
  return {
    statusCode: 401,
    body: JSON.stringify({ error: "Unauthorized" }),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};

export const badRequest = (error: string) => {
  return {
    statusCode: 400,
    body: JSON.stringify({ error }),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};

export const notFound = (error: string) => {
  return {
    statusCode: 404,
    body: JSON.stringify({ error }),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};

export const success = (data: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};