import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getEnvOrThrow } from "@/utils/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createResponse } from "@/utils/response";
import { corsHeaders } from "@/utils/cors";

const s3 = new S3Client({});
const bucketName = getEnvOrThrow("S3_BUCKET_NAME");

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { workspaceId, filename, mimeType } = event.queryStringParameters || {};
    
    if (!workspaceId || !filename || !mimeType) {
      return createResponse(400, { error: "workspaceId, filename, and mimeType are required" }, corsHeaders);
    }

    // Generate a unique S3 key
    const fileId = crypto.randomUUID();
    const s3Key = `uploads/${workspaceId}/${fileId}/${filename}`;

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: mimeType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return createResponse(200, {
      presignedUrl,
      fileId,
      s3Key,
      expiresIn: 3600,
    }, corsHeaders);
  } catch (error) {
    console.error("Get presigned URL error:", error);
    return createResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
