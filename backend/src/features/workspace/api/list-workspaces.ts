import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { WorkspaceRepository } from "@/features/workspace/repositories/workspace-repository";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const workspaceRepository = new WorkspaceRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.userId || "anonymous";
    const workspaces = await workspaceRepository.getWorkspacesByUser(userId);
    
    return createResponse(200, { workspaces }, corsHeaders);
  } catch (error) {
    console.error("List workspaces handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
