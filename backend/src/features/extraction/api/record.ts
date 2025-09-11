import { CreateRecordSchema, UpdateRecordSchema } from "@/features/extraction/models/record";
import { RecordRepository } from "@/features/extraction/repositories/record-repository";
import { corsHeaders } from "@/utils/cors";
import { createResponse } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const recordRepository = new RecordRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createRecord(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getRecord(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateRecord(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteRecord(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("Record handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createRecord(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateRecordSchema.parse(body);
  
  const recordId = crypto.randomUUID();
  
    const record = await recordRepository.createRecordEntity({
    id: recordId,
    ...validatedInput,
  });

  return createResponse(201, record, corsHeaders);
}

async function getRecord(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const extractionId = event.pathParameters?.extractionId;
  const recordId = event.pathParameters?.recordId;
  
  if (!extractionId || !recordId) {
    return createResponse(400, { error: "Extraction ID and Record ID are required" }, corsHeaders);
  }

  const record = await recordRepository.getRecord(extractionId, recordId);
  if (!record) {
    return createResponse(404, { error: "Record not found" }, corsHeaders);
  }

  return createResponse(200, record, corsHeaders);
}

async function updateRecord(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const extractionId = event.pathParameters?.extractionId;
  const recordId = event.pathParameters?.recordId;
  
  if (!extractionId || !recordId) {
    return createResponse(400, { error: "Extraction ID and Record ID are required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const validatedInput = UpdateRecordSchema.parse(body);
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  
  const record = await recordRepository.updateRecordEntity(extractionId, recordId, {
    ...validatedInput,
    approvedBy: userId,
  });
  
  if (!record) {
    return createResponse(404, { error: "Record not found" }, corsHeaders);
  }

  return createResponse(200, record, corsHeaders);
}

async function deleteRecord(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const extractionId = event.pathParameters?.extractionId;
  const recordId = event.pathParameters?.recordId;
  
  if (!extractionId || !recordId) {
    return createResponse(400, { error: "Extraction ID and Record ID are required" }, corsHeaders);
  }

  await recordRepository.deleteRecord(extractionId, recordId);
  return createResponse(204, {}, corsHeaders);
}
