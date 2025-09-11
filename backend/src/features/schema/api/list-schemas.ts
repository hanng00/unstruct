import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SchemaRepository } from "@/features/schema/repositories/schema-repository";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const schemaRepository = new SchemaRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.userId || "anonymous";
    const schemas = await schemaRepository.getSchemasByUser(userId);
    
    return createResponse(200, { schemas }, corsHeaders);
  } catch (error) {
    console.error("List schemas handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
