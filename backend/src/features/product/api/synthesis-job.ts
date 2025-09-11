import { CreateSynthesisJobSchema } from "@/features/product/models/synthesis-job";
import { SynthesisJobRepository } from "@/features/product/repositories/synthesis-job-repository";
import { corsHeaders } from "@/utils/cors";
import { createResponse } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const synthesisJobRepository = new SynthesisJobRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "POST") {
      return await createSynthesisJob(event);
    }
    
    if (event.httpMethod === "GET") {
      return await getSynthesisJob(event);
    }

    if (event.httpMethod === "PUT") {
      return await updateSynthesisJobStatus(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteSynthesisJob(event);
    }

    return createResponse(405, { error: "Method not allowed" }, corsHeaders);
  } catch (error) {
    console.error("Synthesis job handler error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};

async function createSynthesisJob(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const validatedInput = CreateSynthesisJobSchema.parse(body);
  
  const jobId = crypto.randomUUID();
  const userId = event.requestContext.authorizer?.userId || "anonymous";
  
  const synthesisJob = await synthesisJobRepository.createSynthesisJob({
    id: jobId,
    userId,
    ...validatedInput,
  });

  return createResponse(201, synthesisJob, corsHeaders);
}

async function getSynthesisJob(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const jobId = event.pathParameters?.jobId;
  if (!jobId) {
    return createResponse(400, { error: "Synthesis job ID is required" }, corsHeaders);
  }

  const synthesisJob = await synthesisJobRepository.getSynthesisJob(jobId);
  if (!synthesisJob) {
    return createResponse(404, { error: "Synthesis job not found" }, corsHeaders);
  }

  return createResponse(200, synthesisJob, corsHeaders);
}

async function updateSynthesisJobStatus(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const jobId = event.pathParameters?.jobId;
  if (!jobId) {
    return createResponse(400, { error: "Synthesis job ID is required" }, corsHeaders);
  }

  const body = JSON.parse(event.body || "{}");
  const { status } = body;
  
  if (!status) {
    return createResponse(400, { error: "Status is required" }, corsHeaders);
  }

  const synthesisJob = await synthesisJobRepository.updateSynthesisJobStatus(jobId, status);
  if (!synthesisJob) {
    return createResponse(404, { error: "Synthesis job not found" }, corsHeaders);
  }

  return createResponse(200, synthesisJob, corsHeaders);
}

async function deleteSynthesisJob(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const jobId = event.pathParameters?.jobId;
  if (!jobId) {
    return createResponse(400, { error: "Synthesis job ID is required" }, corsHeaders);
  }

  await synthesisJobRepository.deleteSynthesisJob(jobId);
  return createResponse(204, {}, corsHeaders);
}
