import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SQSBatchResponse, SQSHandler } from "aws-lambda";
import { getEnvOrThrow } from "../../utils/env";
import { getSchemaKeys, validateAndShape } from "./utils/schema";

const tableName = getEnvOrThrow("DYNAMODB_TABLE");
const bucketName = getEnvOrThrow("S3_BUCKET_NAME");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
const s3 = new S3Client({});

type ExtractionMessage = {
  tvId: string;
  userId: string;
  fileId: string;
  dataModel: { id: string; schemaJson: unknown; version: number } | null;
};

/**
 * Generate mock values for different field types based on field name patterns
 */
function generateMockValueForKey(key: string): unknown {
  const lowerKey = key.toLowerCase();
  
  // Generate realistic mock data based on field name patterns
  if (lowerKey.includes('amount') || lowerKey.includes('price') || lowerKey.includes('cost')) {
    return Math.round(Math.random() * 10000 * 100) / 100; // Random amount up to $10,000
  }
  
  if (lowerKey.includes('date')) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  if (lowerKey.includes('name') || lowerKey.includes('title')) {
    const names = ['John Doe', 'Jane Smith', 'Acme Corp', 'Tech Solutions Inc', 'Global Enterprises'];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  if (lowerKey.includes('email')) {
    const domains = ['gmail.com', 'company.com', 'example.org'];
    const user = Math.random().toString(36).substring(2, 8);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${user}@${domain}`;
  }
  
  if (lowerKey.includes('phone')) {
    return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
  
  if (lowerKey.includes('address')) {
    const streets = ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston'];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    return `${street}, ${city}, NY 10001`;
  }
  
  if (lowerKey.includes('status')) {
    const statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
  
  if (lowerKey.includes('category') || lowerKey.includes('type')) {
    const categories = ['Business', 'Personal', 'Finance', 'Legal', 'Medical'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  if (lowerKey.includes('description') || lowerKey.includes('notes')) {
    const descriptions = [
      'Important document requiring review',
      'Standard processing document',
      'Urgent matter requiring immediate attention',
      'Routine document for filing',
      'Confidential information'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  // Default to a string value
  return `Mock ${key} value ${Math.floor(Math.random() * 1000)}`;
}

export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const failures: { itemIdentifier: string }[] = [];

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const message: ExtractionMessage = JSON.parse(record.body);

        // 1) Fetch file reference to obtain s3Key and ownership if needed
        // We store file refs under USER partition; simple GetItem
        const fileItem = await ddb.send(
          new GetCommand({
            TableName: tableName,
            Key: { PK: `USER#${message.userId}`, SK: `FILE#${message.fileId}` },
          })
        );
        const fileData = fileItem.Item?.fileData as { s3Key?: string; filename?: string } | undefined;
        if (!fileData?.s3Key) throw new Error("Missing s3Key on file");

        // 2) Download file (buffer)
        const s3Res = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: fileData.s3Key }));
        const body = await s3Res.Body?.transformToByteArray();
        if (!body) throw new Error("Empty S3 body");

        // 3) Mock extraction: simulate extracting structured data from file content
        // For now, we'll generate mock data based on the data model schema
        const keys: string[] = message.dataModel ? getSchemaKeys(message.dataModel.schemaJson) : [];
        
        // Generate mock extracted data based on schema keys
        const mockExtractedData: Record<string, unknown> = {
          fileSize: body.byteLength,
          fileName: fileData.filename || 'unknown',
          extractedAt: new Date().toISOString(),
        };

        // Add mock data for each schema field
        for (const key of keys) {
          mockExtractedData[key] = generateMockValueForKey(key);
        }

        // Validate and shape the data according to the schema
        const validatedData = message.dataModel ? validateAndShape(message.dataModel.schemaJson, mockExtractedData) : mockExtractedData;

        const nowIso = new Date().toISOString();
        const sk = `EX#${message.fileId}`; // Use deterministic sort key without timestamp
        const extractionId = `ext_${message.tvId}_${message.fileId}_${Date.now()}`;

        // 4) Update existing queued extraction or create new one
        await ddb.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              PK: `TV#${message.tvId}`,
              SK: sk,
              id: extractionId,
              userId: message.userId,
              fileId: message.fileId,
              dataModelId: message.dataModel?.id || "default",
              tabularViewId: message.tvId,
              status: "completed",
              data: validatedData,
              schemaVersion: message.dataModel?.version ?? 1,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          })
        );
      } catch (err) {
        failures.push({ itemIdentifier: record.messageId });
      }
    })
  );

  return { batchItemFailures: failures };
};


