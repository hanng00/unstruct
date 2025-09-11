import { getEnvOrThrow } from "@/utils/env";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true }
});

// Standardized DynamoDB item interface with 4 GSIs
interface DynamoDBItem {
  PK: string;   // Primary partition key
  SK: string;   // Primary sort key
  GSI1PK: string;  // USER#userId -> ENTITY#entityId
  GSI1SK: string;  // Entity type + ID
  GSI2PK: string;  // ENTITY#status -> ENTITY#timestamp
  GSI2SK: string;  // Timestamp for ordering
  GSI3PK: string;  // WS#workspaceId -> ENTITY#entityId
  GSI3SK: string;  // Entity type + ID
  GSI4PK: string;  // ENTITY#type#value -> ENTITY#id
  GSI4SK: string;  // Entity ID
  entityType: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
}

// Abstract base repository with pure DynamoDB operations
export abstract class BaseRepository {
  protected readonly tableName = getEnvOrThrow("DYNAMODB_TABLE");
  protected readonly client = docClient;

  // Pure DynamoDB operations - no business logic
  protected async putItem(item: DynamoDBItem): Promise<void> {
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
  }

  protected async getItem(pk: string, sk: string): Promise<DynamoDBItem | null> {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk },
    }));
    return result.Item as DynamoDBItem || null;
  }

  protected async queryItems(
    indexName: string,
    pk: string,
    skCondition?: string,
    skValues?: Record<string, any>
  ): Promise<DynamoDBItem[]> {
    const params: any = {
      TableName: this.tableName,
      IndexName: indexName,
      KeyConditionExpression: `GSI${indexName.slice(-1)}PK = :pk`,
      ExpressionAttributeValues: { ":pk": pk },
    };

    if (skCondition) {
      params.KeyConditionExpression += ` AND ${skCondition}`;
      Object.assign(params.ExpressionAttributeValues, skValues);
    }

    const result = await this.client.send(new QueryCommand(params));
    return (result.Items || []) as DynamoDBItem[];
  }

  protected async updateItem(
    pk: string,
    sk: string,
    updateExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>
  ): Promise<DynamoDBItem | null> {
    const result = await this.client.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    }));
    return result.Attributes as DynamoDBItem || null;
  }

  protected async deleteItem(pk: string, sk: string): Promise<void> {
    await this.client.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk },
    }));
  }
}

// Generic entity repository with standardized GSI patterns
export abstract class EntityRepository<T> extends BaseRepository {
  protected abstract readonly entityType: string;

  // Generate standardized keys for all entities
  protected generateKeys(
    id: string,
    userId: string,
    workspaceId?: string,
    status?: string,
    additionalKeys?: Partial<DynamoDBItem>
  ): DynamoDBItem {
    const timestamp = new Date().toISOString();
    
    return {
      PK: `${this.entityType}#${id}`,
      SK: this.generateSortKey(id, status, timestamp),
      GSI1PK: `USER#${userId}`,
      GSI1SK: `${this.entityType}#${id}`,
      GSI2PK: status ? `${this.entityType}#${status}` : `${this.entityType}#active`,
      GSI2SK: `${this.entityType}#${timestamp}`,
      GSI3PK: workspaceId ? `WS#${workspaceId}` : `USER#${userId}`,
      GSI3SK: `${this.entityType}#${id}`,
      GSI4PK: `${this.entityType}#id#${id}`,
      GSI4SK: id,
      entityType: this.entityType,
      data: {},
      createdAt: timestamp,
      updatedAt: timestamp,
      ...additionalKeys,
    };
  }

  // Override in subclasses for entity-specific SK patterns
  protected generateSortKey(id: string, status?: string, timestamp?: string): string {
    return `META#`;
  }

  // Generic CRUD operations
  async create(data: T & { id: string; userId: string }, additionalKeys?: Partial<DynamoDBItem>): Promise<T> {
    const keys = this.generateKeys(data.id, data.userId, additionalKeys?.GSI3PK?.replace('WS#', ''), additionalKeys?.GSI2PK?.split('#')[1], additionalKeys);
    
    const item: DynamoDBItem = {
      ...keys,
      data,
      ...additionalKeys,
    };

    await this.putItem(item);
    return data;
  }

  async get(id: string): Promise<T | null> {
    const item = await this.getItem(`${this.entityType}#${id}`, this.generateSortKey(id));
    return item?.data as T || null;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), { "#data": "data" });

    const expressionAttributeValues = Object.entries(updates)
      .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), { ":updatedAt": new Date().toISOString() });

    const result = await this.updateItem(
      `${this.entityType}#${id}`,
      this.generateSortKey(id),
      `SET ${updateExpression}, updatedAt = :updatedAt`,
      expressionAttributeNames,
      expressionAttributeValues
    );

    return result?.data as T || null;
  }

  async delete(id: string): Promise<void> {
    await this.deleteItem(`${this.entityType}#${id}`, this.generateSortKey(id));
  }

  // Standardized query methods
  async queryByUser(userId: string): Promise<T[]> {
    const items = await this.queryItems(
      "GSI1",
      `USER#${userId}`,
      "begins_with(GSI1SK, :sk)",
      { ":sk": `${this.entityType}#` }
    );
    return items.map(item => item.data as T);
  }

  async queryByWorkspace(workspaceId: string): Promise<T[]> {
    const items = await this.queryItems(
      "GSI3",
      `WS#${workspaceId}`,
      "begins_with(GSI3SK, :sk)",
      { ":sk": `${this.entityType}#` }
    );
    return items.map(item => item.data as T);
  }

  async queryByStatus(status: string): Promise<T[]> {
    const items = await this.queryItems(
      "GSI2",
      `${this.entityType}#${status}`
    );
    return items.map(item => item.data as T);
  }

  async queryByAttribute(attributeType: string, value: string): Promise<T[]> {
    const items = await this.queryItems(
      "GSI4",
      `${this.entityType}#${attributeType}#${value}`
    );
    return items.map(item => item.data as T);
  }
}

// Specialized record repository for hierarchical data
export class RecordRepository extends BaseRepository {
  async createRecord<T>(extractionId: string, recordId: string, data: T, rowIndex: number, status: string = "pending"): Promise<T> {
    const timestamp = new Date().toISOString();
    const item: DynamoDBItem = {
      PK: `EXTRACTION#${extractionId}`,
      SK: `ROW#${rowIndex}#${status}`,
      GSI1PK: `EXTRACTION#${extractionId}`,
      GSI1SK: `RECORD#${recordId}`,
      GSI2PK: `RECORD#${status}`,
      GSI2SK: `RECORD#${timestamp}`,
      GSI3PK: `EXTRACTION#${extractionId}`,
      GSI3SK: `RECORD#${recordId}`,
      GSI4PK: `RECORD#id#${recordId}`,
      GSI4SK: recordId,
      entityType: "RECORD",
      data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.putItem(item);
    return data;
  }

  async getRecords<T>(extractionId: string): Promise<T[]> {
    const items = await this.queryItems(
      "GSI3",
      `EXTRACTION#${extractionId}`,
      "begins_with(GSI3SK, :sk)",
      { ":sk": "RECORD#" }
    );
    return items.map(item => item.data as T);
  }

  async updateRecord<T>(extractionId: string, recordId: string, updates: Partial<T>): Promise<T | null> {
    // First get the current record to find its SK
    const currentRecord = await this.getItem(`EXTRACTION#${extractionId}`, `ROW#${updates.rowIndex || 0}#${updates.status || "pending"}`);
    if (!currentRecord) return null;

    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), { "#data": "data" });

    const expressionAttributeValues = Object.entries(updates)
      .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), { ":updatedAt": new Date().toISOString() });

    const result = await this.updateItem(
      `EXTRACTION#${extractionId}`,
      currentRecord.SK,
      `SET ${updateExpression}, updatedAt = :updatedAt`,
      expressionAttributeNames,
      expressionAttributeValues
    );

    return result?.data as T || null;
  }

  async deleteRecord(extractionId: string, recordId: string): Promise<void> {
    // This would need to find the record first to get its SK
    // For now, we'll implement a simple approach
    await this.deleteItem(`EXTRACTION#${extractionId}`, `ROW#0#pending`);
  }
}