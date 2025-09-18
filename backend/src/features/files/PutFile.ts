import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DDBFileRepository } from "./repositories/file-repository";

const RequestSchema = z.object({
  status: z.enum(["completed"]),
});

const fileRepository = new DDBFileRepository();

// PUT - /unstruct/files/{fileId}
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    const fileId = event.pathParameters?.fileId;
    if (!fileId) return badRequest("'fileId' is required");

    const body = JSON.parse(event.body || "{}");
    const request = RequestSchema.parse(body);

    const result = await fileRepository.updateFileStatus(
      user.id,
      fileId,
      request.status
    );
    if (!result.success) throw result.error;

    return {
      statusCode: 201,
      body: JSON.stringify({ success: true }),
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
