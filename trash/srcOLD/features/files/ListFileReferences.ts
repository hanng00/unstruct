import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { FileReferenceSchema } from "./models/file-reference";
import { DDBFileRepository } from "./repositories/file-repository";

const ResponseSchema = z.object({
  fileReferences: FileReferenceSchema.array(),
});

const fileRepository = new DDBFileRepository();

// GET - /unstruct/file-references
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    // List all file references for the user
    const result = await fileRepository.listFiles(user.id);

    if (!result.success) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: result.error || "Failed to list file references",
        }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }

    const responseBody = ResponseSchema.parse({
      fileReferences: result.files || [],
    });

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
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
