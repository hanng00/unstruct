import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import z from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DDBExtractionRepository } from "./repositories/extraction-repository";

const RequestSchema = z.object({
  fileId: z.string(),
  dataModelId: z.string(),
  pivotOn: z.string().optional(),
});

const repo = new DDBExtractionRepository();

// POST - /unstruct/extractions
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const body = JSON.parse(event.body || "{}");
    const input = RequestSchema.parse(body);

    // Create extraction
    const extraction = await repo.createExtraction(
      input.fileId,
      input.dataModelId,
      user.id,
      input.pivotOn
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ extraction }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
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
