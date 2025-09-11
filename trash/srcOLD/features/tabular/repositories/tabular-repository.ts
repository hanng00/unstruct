import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getEnvOrThrow } from "../../../utils/env";
import { Extraction, TabularView, TabularViewSchema } from "../models/tabular-view";

const tableName = getEnvOrThrow("DYNAMODB_TABLE");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });

export class TabularRepository {
  constructor(private client: DynamoDBDocumentClient = ddb) {}

  async createView(view: TabularView) {
    const v = TabularViewSchema.parse(view);
    // Write both the main record and reverse index for user lookups
    await this.client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: [
            { PutRequest: { Item: { PK: `TV#${v.id}`, SK: `META#`, userId: v.userId, tvData: v } } },
            { PutRequest: { Item: { PK: `USER#${v.userId}`, SK: `TV#${v.id}`, tvId: v.id, tvData: v } } },
          ],
        },
      })
    );
    return { success: true } as const;
  }

  async listViews(userId: string) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":sk": "TV#" },
      })
    );
    const views = (res.Items || []).map((i) => i.tvData as TabularView);
    return { success: true, views } as const;
  }

  async getView(tvId: string) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: { ":pk": `TV#${tvId}`, ":sk": "META#" },
      })
    );
    const item = res.Items?.[0];
    if (!item) return { success: false, error: "Not found" } as const;
    return { success: true, view: item.tvData as TabularView } as const;
  }

  async listExtractions(tabularViewId: string, limit = 50, startKey?: Record<string, unknown>) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: { ":pk": `TV#${tabularViewId}`, ":sk": "EX#" },
        Limit: limit,
        ExclusiveStartKey: startKey,
        ScanIndexForward: false,
      })
    );
    const extractions = (res.Items || []) as any[];
    return { success: true, extractions: extractions as unknown as Extraction[], lastEvaluatedKey: res.LastEvaluatedKey } as const;
  }

  async queueExtractionsForFiles(params: { tabularViewId: string; userId: string; fileIds: string[]; dataModel: any }) {
    const nowIso = new Date().toISOString();
    // Write queued rows; SQS enqueue happens in API handler to include message content
    const requests = params.fileIds.map((fileId) => ({
      PutRequest: {
        Item: {
          PK: `TV#${params.tabularViewId}`,
          SK: `EX#${fileId}`, // Use deterministic sort key without timestamp
          id: `ext_${params.tabularViewId}_${fileId}_${Date.now()}`, // unique extraction ID
          userId: params.userId,
          fileId,
          dataModelId: params.dataModel?.id || "default",
          tabularViewId: params.tabularViewId,
          status: "queued",
          data: {},
          schemaVersion: params.dataModel?.version ?? 1,
          createdAt: nowIso,
          updatedAt: nowIso,
          GSI1PK: `FILE#${fileId}`,
          GSI1SK: `TV#${params.tabularViewId}`,
        },
      },
    }));

    // Dynamo limits 25 per batch
    const chunks: typeof requests[] = [];
    for (let i = 0; i < requests.length; i += 25) chunks.push(requests.slice(i, i + 25));
    for (const chunk of chunks) {
      await this.client.send(new BatchWriteCommand({ RequestItems: { [tableName]: chunk } }));
    }
    return { success: true } as const;
  }

  async getExtraction(tabularViewId: string, fileId: string) {
    const res = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: { ":pk": `TV#${tabularViewId}`, ":sk": `EX#${fileId}` },
      })
    );
    const item = res.Items?.[0];
    if (!item) return null;
    return item as unknown as Extraction;
  }

  async updateExtractionData(tabularViewId: string, fileId: string, data?: Record<string, unknown>) {
    const nowIso = new Date().toISOString();
    
    // Get the existing extraction to preserve other fields
    const existingExtraction = await this.getExtraction(tabularViewId, fileId);
    if (!existingExtraction) {
      throw new Error("Extraction not found");
    }

    const updatedExtraction = {
      ...existingExtraction,
      data: data || existingExtraction.data,
      updatedAt: nowIso,
    };

    await this.client.send(
      new PutCommand({
        TableName: tableName,
        Item: updatedExtraction,
      })
    );

    return updatedExtraction;
  }
}


