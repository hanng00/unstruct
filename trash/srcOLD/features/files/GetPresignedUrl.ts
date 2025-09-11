import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { S3Service } from "../../clients/s3";
import { withCors } from "../../utils/cors";
import { unauthorized } from "../../utils/response";
import { generateS3Key } from "../../utils/s3-key";
import { getUserFromEvent } from "../auth";
import { FileReference } from "./models/file-reference";
import { DDBFileRepository } from "./repositories/file-repository";

const QueryRequestSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.string().transform((val) => Number(val)),
});

const ResponseSchema = z.object({
  fileId: z.string(),
  presignedUrl: z.string(),
});

const s3 = new S3Service();
const fileRepository = new DDBFileRepository();

// GET - /unstruct/get-presigned-url
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const qs = event.queryStringParameters;
    const query = QueryRequestSchema.parse(qs);

    const user = getUserFromEvent(event);
    if (!user) return unauthorized();

    // generate a file id and a presigned url
    const fileId = uuidv4();
    const key = generateS3Key(user.id, query.filename, fileId);
    const presignedUrl = await s3.getPresignedUrl({
      key,
      contentType: query.mimeType,
    });

    const fileReference: FileReference = {
      id: fileId,
      userId: user.id,
      filename: query.filename,
      mimeType: query.mimeType,
      size: query.size,
      status: "pending",
      createdAt: new Date().toISOString(),
      s3Key: key,
    };

    // save the file reference to the database
    await fileRepository.initFile(user.id, fileReference);

    const responseBody = ResponseSchema.parse({
      fileId: fileId,
      presignedUrl,
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
