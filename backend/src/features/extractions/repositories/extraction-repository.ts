import { getEnvOrThrow } from "@/utils/env";
import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { Extraction, ExtractionSchema } from "../models/extraction";

export interface IExtractionRepository {
  createExtraction: (
    fileId: string,
    dataModelId: string,
    userId: string,
    pivotOn?: string
  ) => Promise<Extraction>;
  getExtraction: (id: string) => Promise<Extraction | null>;
  getExtractionsByFile: (fileId: string) => Promise<Extraction[]>;
  updateExtraction: (
    id: string,
    updates: Partial<Extraction>
  ) => Promise<Extraction | null>;
  tryTransition: (
    id: string,
    fromStatus: Extraction["status"],
    toStatus: Extraction["status"]
  ) => Promise<boolean>;
  finish: (
    id: string,
    updates: Partial<Extraction>
  ) => Promise<Extraction | null>;
}

const tableName = getEnvOrThrow("DYNAMODB_TABLE");
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export class DDBExtractionRepository implements IExtractionRepository {
  constructor(private dynamoDb: DynamoDBDocumentClient = ddbClient) {}

  async createExtraction(
    fileId: string,
    dataModelId: string,
    userId: string,
    pivotOn?: string
  ): Promise<Extraction> {
    const extraction: Extraction = {
      id: crypto.randomUUID(),
      fileId,
      dataModelId,
      userId,
      status: "queued",
      pivotOn,
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          PK: `FILE#${extraction.fileId}`,
          SK: `EXTRACTION#${extraction.id}`,
          status: extraction.status,
          extractionData: extraction,
          createdAt: extraction.createdAt,
          updatedAt: extraction.updatedAt,
        },
      })
    );

    return extraction;
  }

  async getExtraction(id: string): Promise<Extraction | null> {
    const result = await this.dynamoDb.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "ReverseLookup",
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: {
          ":sk": `EXTRACTION#${id}`,
        },
        Limit: 1,
      })
    );

    const item = result.Items?.[0];
    if (!item) return null;

    const extraction: Extraction = ExtractionSchema.parse(item.extractionData);
    return extraction;
  }

  async getExtractionsByFile(fileId: string): Promise<Extraction[]> {
    const result = await this.dynamoDb.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `FILE#${fileId}`,
          ":sk": "EXTRACTION#",
        },
      })
    );

    return (
      result.Items?.map((item) =>
        ExtractionSchema.parse(item.extractionData)
      ) || []
    );
  }

  async updateExtraction(
    id: string,
    updates: Partial<Extraction>
  ): Promise<Extraction | null> {
    const extraction = await this.getExtraction(id);
    if (!extraction) return null;
    const updatedExtraction = { ...extraction, ...updates };
    // Rewrite the same item shape (PK/SK + status + extractionData + timestamps)
    await this.dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          PK: `FILE#${updatedExtraction.fileId}`,
          SK: `EXTRACTION#${updatedExtraction.id}`,
          status: updatedExtraction.status,
          extractionData: updatedExtraction,
          createdAt: updatedExtraction.createdAt,
          updatedAt: updatedExtraction.updatedAt,
        },
      })
    );
    return updatedExtraction;
  }

  async tryTransition(
    id: string,
    fromStatus: Extraction["status"],
    toStatus: Extraction["status"]
  ): Promise<boolean> {
    const extraction = await this.getExtraction(id);
    if (!extraction) return false;

    try {
      const now = new Date().toISOString();
      await this.dynamoDb.send(
        new UpdateCommand({
          TableName: tableName,
          Key: {
            PK: `FILE#${extraction.fileId}`,
            SK: `EXTRACTION#${extraction.id}`,
          },
          UpdateExpression: "SET #status = :to, updatedAt = :now, extractionData.#status = :to, extractionData.updatedAt = :now",
          ConditionExpression: "#status = :from",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":from": fromStatus,
            ":to": toStatus,
            ":now": now,
          },
        })
      );
      return true;
    } catch (err: unknown) {
      if (err instanceof ConditionalCheckFailedException) {
        return false;
      }
      throw err;
    }
  }

  async finish(
    id: string,
    updates: Partial<Extraction>
  ): Promise<Extraction | null> {
    const extraction = await this.getExtraction(id);
    if (!extraction) return null;

    const now = new Date().toISOString();
    const updatedExtraction: Extraction = {
      ...extraction,
      ...updates,
      updatedAt: now,
    } as Extraction;

    await this.dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          PK: `FILE#${updatedExtraction.fileId}`,
          SK: `EXTRACTION#${updatedExtraction.id}`,
          status: updatedExtraction.status,
          extractionData: updatedExtraction,
          createdAt: updatedExtraction.createdAt,
          updatedAt: updatedExtraction.updatedAt,
        },
      })
    );

    return updatedExtraction;
  }
}
