import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SchemaRepository } from "@/features/schema/repositories/schema-repository";
import { CreateSchemaSchema } from "@/features/schema/models/schema";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const schemaRepository = new SchemaRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createSchema(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getSchema(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateSchema(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteSchema(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("Schema handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createSchema(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateSchemaSchema.parse(body);
  
  const schemaId = crypto.randomUUID();
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  
  const schema = await schemaRepository.createSchema({
    id: schemaId,
    userId,
    ...validatedInput,
  });

  return createResponse(201, schema, corsHeaders);
}

async function getSchema(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const schemaId = event.pathParameters?.schemaId;
  if (!schemaId) {
    return createResponse(400, { error: "Schema ID is required" }, corsHeaders);
  }

  const schema = await schemaRepository.getSchema(schemaId);
  if (!schema) {
    return createResponse(404, { error: "Schema not found" }, corsHeaders);
  }

  return createResponse(200, schema, corsHeaders);
}

async function updateSchema(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const schemaId = event.pathParameters?.schemaId;
  if (!schemaId) {
    return createResponse(400, { error: "Schema ID is required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const schema = await schemaRepository.updateSchema(schemaId, body);
  
  if (!schema) {
    return createResponse(404, { error: "Schema not found" }, corsHeaders);
  }

  return createResponse(200, schema, corsHeaders);
}

async function deleteSchema(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const schemaId = event.pathParameters?.schemaId;
  if (!schemaId) {
    return createResponse(400, { error: "Schema ID is required" }, corsHeaders);
  }

  await schemaRepository.deleteSchema(schemaId);
  return createResponse(204, {}, corsHeaders);
}
