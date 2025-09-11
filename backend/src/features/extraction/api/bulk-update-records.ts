import { RecordRepository } from "@/features/extraction/repositories/record-repository";
import { corsHeaders } from "@/utils/cors";
import { createResponse } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const recordRepository = new RecordRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const extractionId = event.pathParameters?.extractionId;
    if (!extractionId) {
      return createResponse(400, { error: "Extraction ID is required" }, corsHeaders);
    }

    const body = JSON.parse(event.body || "{}");
    const { recordIds, status } = body;
    
    if (!recordIds || !Array.isArray(recordIds) || !status) {
      return createResponse(400, { error: "Record IDs array and status are required" }, corsHeaders);
    }

    const userId = event.requestContext.authorizer?.userId || "anonymous";
    
    await recordRepository.bulkUpdateRecordStatus(extractionId, recordIds, status, userId);
    
    return createResponse(200, { message: "Records updated successfully" }, corsHeaders);
  } catch (error) {
    console.error("Bulk update records handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
