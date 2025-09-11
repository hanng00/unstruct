import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ExtractionRepository } from "@/features/extraction/repositories/extraction-repository";
import { CreateExtractionSchema } from "@/features/extraction/models/extraction";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const extractionRepository = new ExtractionRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createExtraction(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getExtraction(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateExtractionStatus(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteExtraction(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("Extraction handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createExtraction(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateExtractionSchema.parse(body);
  
  const extractionId = crypto.randomUUID();
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  
  const extraction = await extractionRepository.createExtraction({
    id: extractionId,
    userId,
    ...validatedInput,
  });

  return createResponse(201, extraction, corsHeaders);
}

async function getExtraction(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const extractionId = event.pathParameters?.extractionId;
  if (!extractionId) {
    return createResponse(400, { error: "Extraction ID is required" }, corsHeaders);
  }

  const extraction = await extractionRepository.getExtraction(extractionId);
  if (!extraction) {
    return createResponse(404, { error: "Extraction not found" }, corsHeaders);
  }

  return createResponse(200, extraction, corsHeaders);
}

async function updateExtractionStatus(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const extractionId = event.pathParameters?.extractionId;
  if (!extractionId) {
    return createResponse(400, { error: "Extraction ID is required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const { status, errorMessage } = body;
  
  if (!status) {
    return createResponse(400, { error: "Status is required" }, corsHeaders);
  }

  const extraction = await extractionRepository.updateExtractionStatus(extractionId, status, errorMessage);
  if (!extraction) {
    return createResponse(404, { error: "Extraction not found" }, corsHeaders);
  }

  return createResponse(200, extraction, corsHeaders);
}

async function deleteExtraction(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const extractionId = event.pathParameters?.extractionId;
  if (!extractionId) {
    return createResponse(400, { error: "Extraction ID is required" }, corsHeaders);
  }

  await extractionRepository.deleteExtraction(extractionId);
  return createResponse(204, {}, corsHeaders);
}
