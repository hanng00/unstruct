import { withCors } from "@/utils/cors";
import { badRequest, notFound, unauthorized } from "@/utils/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getUserFromEvent } from "../auth";
import { ExtractionSchema } from "../extractions/models/extraction";
import { DDBExtractionRepository } from "../extractions/repositories/extraction-repository";

const ResponseSchema = z.object({
  extractions: ExtractionSchema.array(),
});

const extractionRepository = new DDBExtractionRepository();

// GET - /unstruct/files/{fileId}/extractions
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const fileId = event.pathParameters?.fileId;
    if (!fileId) return badRequest("'fileId' is required");

    const extractions = await extractionRepository.getExtractionsByFile(fileId);
    if (!extractions) return notFound("Extractions not found");

    const responseBody = ResponseSchema.parse({
      extractions,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
        auth: event.requestContext.authorizer || {},
      }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};
