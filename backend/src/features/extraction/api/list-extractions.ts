import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ExtractionRepository } from "@/features/extraction/repositories/extraction-repository";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const extractionRepository = new ExtractionRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) {
      return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
    }

    const extractions = await extractionRepository.getExtractionsByWorkspace(workspaceId);
    return createResponse(200, { extractions }, corsHeaders);
  } catch (error) {
    console.error("List extractions handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
