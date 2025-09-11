import { SynthesisJobRepository } from "@/features/product/repositories/synthesis-job-repository";
import { corsHeaders } from "@/utils/cors";
import { createResponse } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const synthesisJobRepository = new SynthesisJobRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) {
      return createResponse(400, { error: "Workspace ID is required" }, corsHeaders);
    }

    const synthesisJobs = await synthesisJobRepository.getSynthesisJobsByWorkspace(workspaceId);
    return createResponse(200, { synthesisJobs }, corsHeaders);
  } catch (error) {
    console.error("List synthesis jobs handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
