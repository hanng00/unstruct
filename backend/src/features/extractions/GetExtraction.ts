import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import {
  badRequest,
  internalServerError,
  notFound,
  success,
  unauthorized,
} from "../../utils/response";
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

    const extractionId =
      event.pathParameters?.id || event.pathParameters?.extractionId;
    if (!extractionId) return badRequest("'id' is required");

    const extraction = await extractionRepository.getExtraction(extractionId);
    if (!extraction) return notFound("Extraction not found");

    // Ensure the user has access to the extraction
    if (extraction.userId !== user.id) return unauthorized();

    const body = ResponseSchema.parse({ extraction });
    return success(body);
  } catch (e: any) {
    return internalServerError(e.message);
  }
};
