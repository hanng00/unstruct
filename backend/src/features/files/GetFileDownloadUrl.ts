import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { withCors } from "../../utils/cors";
import { badRequest, unauthorized } from "../../utils/response";
import { getUserFromEvent } from "../auth";
import { DDBFileRepository } from "./repositories/file-repository";

const ResponseSchema = z.object({
  url: z.string(),
});

const fileRepository = new DDBFileRepository();

// GET - /unstruct/files/{fileId}/download-url
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

    const bucket = process.env.S3_BUCKET_NAME ?? process.env.S3_BUCKET ?? "";
    if (!bucket) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing S3 bucket env" }),
        headers: withCors({ "Content-Type": "application/json" }),
      };
    }

    const s3Client = new S3Client({ region: process.env.AWS_REGION });
    const command = new GetObjectCommand({ Bucket: bucket, Key: result.file.s3Key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const responseBody = ResponseSchema.parse({ url });
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


