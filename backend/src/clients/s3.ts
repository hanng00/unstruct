import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { pipeline } from "stream";
import { promisify } from "util";

interface GetPresignedUrlArgs {
  key: string;
  contentType: string;
}

export interface IStorageService {
  getPresignedUrl(args: GetPresignedUrlArgs): Promise<string>;
  downloadFile(key: string, outputPath: string): Promise<void>;
}

export class S3Service implements IStorageService {
  constructor(
    private readonly s3Client: S3Client = new S3Client({
      region: process.env.AWS_REGION,
    }),
    private readonly bucketName: string = process.env.S3_BUCKET_NAME ?? ""
  ) {}

  async getPresignedUrl(args: GetPresignedUrlArgs) {
    const { key, contentType } = args;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return url;
  }

  async downloadFile(key: string, outputPath: string) {
    const ensureDir = dirname(outputPath);
    await mkdir(ensureDir, { recursive: true });

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const result = await this.s3Client.send(command);
    const bodyStream = result.Body;
    if (!bodyStream) {
      throw new Error("Empty S3 object body");
    }

    const streamPipeline = promisify(pipeline);
    await streamPipeline(bodyStream as NodeJS.ReadableStream, createWriteStream(outputPath));
  }
}
