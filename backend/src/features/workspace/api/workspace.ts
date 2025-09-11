import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { WorkspaceRepository } from "@/features/workspace/repositories/workspace-repository";
import { CreateWorkspaceSchema } from "@/features/workspace/models/workspace";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const workspaceRepository = new WorkspaceRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createWorkspace(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getWorkspace(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateWorkspace(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteWorkspace(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("Workspace handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createWorkspace(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateWorkspaceSchema.parse(body);
  
  const workspaceId = crypto.randomUUID();
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  
  const workspace = await workspaceRepository.createWorkspace({
    id: workspaceId,
    userId,
    ...validatedInput,
  });

  return createResponse(201, workspace, corsHeaders);
}

async function getWorkspace(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const workspaceId = event.pathParameters?.workspaceId;
  if (!workspaceId) {
    return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
  }

  const workspace = await workspaceRepository.getWorkspace(workspaceId);
  if (!workspace) {
    return createResponse(404, { error: "Workspace not found" }, corsHeaders);
  }

  return createResponse(200, workspace, corsHeaders);
}

async function updateWorkspace(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const workspaceId = event.pathParameters?.workspaceId;
  if (!workspaceId) {
    return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const workspace = await workspaceRepository.updateWorkspace(workspaceId, body);
  
  if (!workspace) {
    return createResponse(404, { error: "Workspace not found" }, corsHeaders);
  }

  return createResponse(200, workspace, corsHeaders);
}

async function deleteWorkspace(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const workspaceId = event.pathParameters?.workspaceId;
  if (!workspaceId) {
    return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
  }

  await workspaceRepository.deleteWorkspace(workspaceId);
  return createResponse(204, {}, corsHeaders);
}
