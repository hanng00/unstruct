import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FileRepository } from "@/features/file/repositories/file-repository";
import { CreateFileSchema } from "@/features/file/models/file";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const fileRepository = new FileRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createFile(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getFile(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateFileStatus(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteFile(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("File handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createFile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateFileSchema.parse(body);
  
  const fileId = crypto.randomUUID();
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  const workspaceId = event.pathParameters?.workspaceId;
  
  if (!workspaceId) {
    return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
  }
  
  const file = await fileRepository.createFile({
    id: fileId,
    userId,
    workspaceId,
    ...validatedInput,
  });

  return createResponse(201, file, corsHeaders);
}

async function getFile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const fileId = event.pathParameters?.fileId;
  if (!fileId) {
    return createResponse(400, { error: "File ID is required" }, corsHeaders);
  }

  const file = await fileRepository.getFile(fileId);
  if (!file) {
    return createResponse(404, { error: "File not found" }, corsHeaders);
  }

  return createResponse(200, file, corsHeaders);
}

async function updateFileStatus(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const fileId = event.pathParameters?.fileId;
  if (!fileId) {
    return createResponse(400, { error: "File ID is required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const { status } = body;
  
  if (!status) {
    return createResponse(400, { error: "Status is required" }, corsHeaders);
  }

  const file = await fileRepository.updateFileStatus(fileId, status);
  if (!file) {
    return createResponse(404, { error: "File not found" }, corsHeaders);
  }

  return createResponse(200, file, corsHeaders);
}

async function deleteFile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const fileId = event.pathParameters?.fileId;
  if (!fileId) {
    return createResponse(400, { error: "File ID is required" }, corsHeaders);
  }

  await fileRepository.deleteFile(fileId);
  return createResponse(204, {}, corsHeaders);
}
