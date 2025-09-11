import { ExtractionRepository } from "@/features/extraction/repositories/extraction-repository";
import { RecordRepository } from "@/features/extraction/repositories/record-repository";
import { FileRepository } from "@/features/file/repositories/file-repository";
import { getEnvOrThrow } from "@/utils/env";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const extractionRepository = new ExtractionRepository();
const recordRepository = new RecordRepository();
const fileRepository = new FileRepository();

const bucketName = getEnvOrThrow("S3_BUCKET_NAME");

export const handler = async (event: any): Promise<any> => {
  try {
    const failures: { itemIdentifier: string }[] = [];

    await Promise.all(
      event.Records.map(async (record: any) => {
        try {
          const message = JSON.parse(record.body);
          const { extractionId, fileId, workspaceId, schemaId, userId } = message;

          // Get file reference
          const file = await fileRepository.getFile(fileId);
          if (!file) {
            throw new Error("File not found");
          }

          // Download file from S3
          const s3Response = await s3.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: file.s3Key,
            })
          );

          const body = await s3Response.Body?.transformToByteArray();
          if (!body) {
            throw new Error("Empty file content");
          }

          // Mock extraction - generate sample records based on schema
          const mockRecords = generateMockRecords(schemaId, file.filename, body.byteLength);
          
          // Create records
          for (let i = 0; i < mockRecords.length; i++) {
            const recordId = crypto.randomUUID();
            await recordRepository.createRecordEntity({
              id: recordId,
              extractionId,
              rowIndex: i,
              data: mockRecords[i],
            });
          }

          // Update extraction status
          await extractionRepository.updateExtractionStatus(extractionId, "completed");
          await extractionRepository.updateExtractionCounts(extractionId, mockRecords.length, 0);

        } catch (error) {
          console.error("Processing error:", error);
          failures.push({ itemIdentifier: record.messageId });
        }
      })
    );

    return { batchItemFailures: failures };
  } catch (error) {
    console.error("Handler error:", error);
    return { batchItemFailures: [] };
  }
};

function generateMockRecords(schemaId: string, filename: string, fileSize: number): Record<string, unknown>[] {
  // Generate 3-10 mock records
  const recordCount = Math.floor(Math.random() * 8) + 3;
  const records: Record<string, unknown>[] = [];

  for (let i = 0; i < recordCount; i++) {
    records.push({
      id: crypto.randomUUID(),
      title: `Product ${i + 1} from ${filename}`,
      description: `Sample product description ${i + 1}`,
      price: Math.floor(Math.random() * 1000) + 10,
      category: ["Electronics", "Clothing", "Books", "Home"][Math.floor(Math.random() * 4)],
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      fileSize,
      fileName: filename,
    });
  }

  return records;
}
