import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { badRequest, notFound, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { ExtractionSchema } from "./models/extraction";
import { DDBExtractionRepository } from "./repositories/extraction-repository";

const extractionRepository = new DDBExtractionRepository();

const ResponseSchema = z.object({ extraction: ExtractionSchema });

// GET - /unstruct/extractions/{id}
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const extractionId = event.pathParameters?.id || event.pathParameters?.extractionId;
    if (!extractionId) return badRequest("'id' is required");

    const extraction = await extractionRepository.getExtraction(extractionId);
    if (!extraction) return notFound("Extraction not found");

    // Ensure the user has access to the extraction
    if (extraction.userId !== user.id) return unauthorized();

    const body = ResponseSchema.parse({ extraction });
    return { statusCode: 200, body: JSON.stringify(body), headers: withCors({ "Content-Type": "application/json" }) };
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: e.message,
        auth: event.requestContext.authorizer || {},
      }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};
