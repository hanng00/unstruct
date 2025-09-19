import { withCors } from "./cors";

export const success = (data: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};

export const created = (data: any) => {
  return {
    statusCode: 201,
    body: JSON.stringify(data),
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

export const unauthorized = () => {
  return {
    statusCode: 401,
    body: JSON.stringify({ error: "Unauthorized" }),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};

export const forbidden = (error: string) => {
  return {
    statusCode: 403,
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

export const conflict = (error: string) => {
  return {
    statusCode: 409,
    body: JSON.stringify({ error }),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};

export const internalServerError = (error: any) => {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: error.message }),
    headers: withCors({ "Content-Type": "application/json" }),
  };
};
