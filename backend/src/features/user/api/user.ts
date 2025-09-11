import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { UserRepository } from "@/features/user/repositories/user-repository";
import { CreateUserSchema } from "@/features/user/models/user";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const userRepository = new UserRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createUser(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getUser(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("User handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateUserSchema.parse(body);
  
  const userId = crypto.randomUUID();
  const user = await userRepository.createUser({
    id: userId,
    userId,
    ...validatedInput,
  });

  return createResponse(201, user, corsHeaders);
}

async function getUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.pathParameters?.userId;
  if (!userId) {
    return createResponse(400, { error: "User ID is required" }, corsHeaders);
  }

  const user = await userRepository.getUser(userId);
  if (!user) {
    return createResponse(404, { error: "User not found" }, corsHeaders);
  }

  return createResponse(200, user, corsHeaders);
}
