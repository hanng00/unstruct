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

    const records = await recordRepository.getRecordsByExtraction(extractionId);
    return createResponse(200, { records }, corsHeaders);
  } catch (error) {
    console.error("List records handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
