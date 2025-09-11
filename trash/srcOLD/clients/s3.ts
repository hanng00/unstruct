import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface GetPresignedUrlArgs {
  key: string;
  contentType: string;
}

export interface IS3Service {
  getPresignedUrl(args: GetPresignedUrlArgs): Promise<string>;
}

export class S3Service implements IS3Service {
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
}
