import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FileRepository } from "@/features/file/repositories/file-repository";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const fileRepository = new FileRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) {
      return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
    }

    const files = await fileRepository.getFilesByWorkspace(workspaceId);
    return createResponse(200, { files }, corsHeaders);
  } catch (error) {
    console.error("List files handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
