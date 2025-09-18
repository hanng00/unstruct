import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { FileReferenceSchema } from "./models/file-reference";
import { DDBFileRepository } from "./repositories/file-repository";

const ResponseSchema = z.object({
  fileReference: FileReferenceSchema,
});

const fileRepository = new DDBFileRepository();

// GET - /unstruct/files/{fileId}
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const fileId = event.pathParameters?.fileId;
    if (!fileId) return badRequest("'fileId' is required");

    const result = await fileRepository.getFile(user.id, fileId);
    if (!result.success || !result.file) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: result.error || "File not found" }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }

    const responseBody = ResponseSchema.parse({ fileReference: result.file });
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message, auth: event.requestContext.authorizer || {} }),
      headers: withCors({ "Content-Type": "application/json" }),
    };
  }
};


